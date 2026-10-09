from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
import bcrypt
import datetime
from functools import wraps
from pydantic import ValidationError
from api.db import init_db
from models.schemas import UserSchema
import jwt as pyjwt
from api.mailer import send_reset_email
from api.limiter import limiter

auth_bp = Blueprint('auth', __name__)

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get('role') != 'admin':
                return jsonify({'error': 'Administration privileges required'}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def get_users_collection():
    db = init_db()
    return db['users']

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    username = data.get('username', '')
    # Security: public signup MUST always assign the standard 'user' role
    role = 'user'

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    users_col = get_users_collection()
    if users_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
    
    # Check if user exists
    if users_col.find_one({'email': email}):
        return jsonify({'error': 'User already exists'}), 400
    
    # Check if username is taken (if provided)
    if username and users_col.find_one({'username': username}):
        return jsonify({'error': 'Username already taken'}), 400

    # Validate via Schema
    try:
        validated_user = UserSchema(email=email, password=password, username=username, role=role)
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'details': e.errors()}), 400

    # Hash password
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user_dict = validated_user.model_dump(mode='json')
    user_dict['password'] = hashed_pw.decode('utf-8')
    
    users_col.insert_one(user_dict)
    
    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    users_col = get_users_collection()
    if users_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
    user = users_col.find_one({'email': email})

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        # Update last_login
        users_col.update_one(
            {'email': user['email']},
            {'$set': {'last_login': datetime.datetime.utcnow()}}
        )

        # Create JWTs
        claims = {'role': user['role'], 'username': user.get('username', '')}
        access_token = create_access_token(identity=user['email'], additional_claims=claims)
        refresh_token = create_refresh_token(identity=user['email'], additional_claims=claims)
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'role': user['role'],
            'email': user['email'],
            'username': user.get('username', '')
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    claims = get_jwt()
    # Exclude standard claims
    additional_claims = {k: v for k, v in claims.items() if k in ['role', 'username']}
    access_token = create_access_token(identity=identity, additional_claims=additional_claims)
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_email = get_jwt_identity()
    users_col = get_users_collection()
    if users_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
    user = users_col.find_one({'email': current_user_email})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({
        'email': user['email'],
        'role': user['role'],
        'username': user.get('username', '')
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
@limiter.limit("5 per minute")
def forgot_password():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
        
    users_col = get_users_collection()
    user = users_col.find_one({'email': email})
    
    # Always return 200 to prevent email enumeration attacks
    if not user:
        return jsonify({'message': 'If the email exists, a reset link has been sent.'}), 200
        
    # Generate a temporary reset token (valid for 15 mins)
    reset_token = create_access_token(
        identity=user['email'], 
        additional_claims={'reset_password': True},
        expires_delta=datetime.timedelta(minutes=15)
    )
    
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    send_reset_email(email, reset_link)
    
    return jsonify({'message': 'If the email exists, a reset link has been sent.'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400
        
    try:
        from flask import current_app
        # Decode the token manually using PyJWT to bypass standard request verification
        decoded = pyjwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
        
        # Verify it's a reset token
        if not decoded.get('reset_password'):
            return jsonify({'error': 'Invalid token type'}), 400
            
        email = decoded.get('sub') # JWT identity is stored in 'sub' claim
        
        users_col = get_users_collection()
        user = users_col.find_one({'email': email})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Hash new password
        hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        # Update user
        users_col.update_one(
            {'email': email},
            {'$set': {'password': hashed_pw.decode('utf-8')}}
        )
        
        return jsonify({'message': 'Password has been reset successfully.'}), 200
        
    except pyjwt.ExpiredSignatureError:
        return jsonify({'error': 'Reset token has expired. Please request a new one.'}), 400
    except pyjwt.InvalidTokenError:
        return jsonify({'error': 'Invalid reset token.'}), 400

