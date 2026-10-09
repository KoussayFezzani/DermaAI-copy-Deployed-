from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import bcrypt
from api.db import init_db

user_bp = Blueprint('user', __name__)

def get_users_collection():
    db = init_db()
    return db['users']

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile information"""
    current_user_email = get_jwt_identity()
    users_col = get_users_collection()
    if users_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
    
    user = users_col.find_one({'email': current_user_email})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get preferences
    preferences = user.get('preferences', {'darkMode': False})
    
    return jsonify({
        'email': user['email'],
        'username': user.get('username', ''),
        'role': user['role'],
        'preferences': preferences
    }), 200

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user's username"""
    current_user_email = get_jwt_identity()
    data = request.json
    username = data.get('username', '').strip()
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    
    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    
    users_col = get_users_collection()
    if users_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
    
    # Check if username is already taken by another user
    existing_user = users_col.find_one({'username': username})
    if existing_user and existing_user['email'] != current_user_email:
        return jsonify({'error': 'Username already taken'}), 400
    
    # Update username
    result = users_col.update_one(
        {'email': current_user_email},
        {'$set': {'username': username}}
    )
    
    if result.modified_count == 0 and result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'message': 'Username updated successfully', 'username': username}), 200

@user_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user's password"""
    current_user_email = get_jwt_identity()
    data = request.json
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    if not old_password or not new_password:
        return jsonify({'error': 'Old password and new password are required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    users_col = get_users_collection()
    if users_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
    user = users_col.find_one({'email': current_user_email})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify old password
    if not bcrypt.checkpw(old_password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Hash new password
    hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    
    # Update password
    users_col.update_one(
        {'email': current_user_email},
        {'$set': {'password': hashed_pw.decode('utf-8')}}
    )
    
    return jsonify({'message': 'Password changed successfully'}), 200

@user_bp.route('/change-email', methods=['POST'])
@jwt_required()
def change_email():
    """Change user's email"""
    current_user_email = get_jwt_identity()
    data = request.json
    new_email = data.get('new_email', '').strip()
    password = data.get('password')
    
    if not new_email or not password:
        return jsonify({'error': 'New email and password are required'}), 400
    
    # Basic email validation
    if '@' not in new_email or '.' not in new_email:
        return jsonify({'error': 'Invalid email format'}), 400
    
    users_col = get_users_collection()
    if users_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
    user = users_col.find_one({'email': current_user_email})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify password
    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({'error': 'Password is incorrect'}), 401
    
    # Check if new email is already in use
    existing_user = users_col.find_one({'email': new_email})
    if existing_user:
        return jsonify({'error': 'Email already in use'}), 400
    
    # Update email
    users_col.update_one(
        {'email': current_user_email},
        {'$set': {'email': new_email}}
    )
    
    return jsonify({'message': 'Email changed successfully', 'email': new_email}), 200

@user_bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    """Get user preferences"""
    current_user_email = get_jwt_identity()
    users_col = get_users_collection()
    if users_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
    
    user = users_col.find_one({'email': current_user_email})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    preferences = user.get('preferences', {'darkMode': False})
    return jsonify(preferences), 200

@user_bp.route('/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Update user preferences"""
    current_user_email = get_jwt_identity()
    data = request.json
    
    users_col = get_users_collection()
    
    # Update preferences
    result = users_col.update_one(
        {'email': current_user_email},
        {'$set': {'preferences': data}}
    )
    
    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'message': 'Preferences updated successfully', 'preferences': data}), 200

@user_bp.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Delete user account"""
    current_user_email = get_jwt_identity()
    users_col = get_users_collection()
    if users_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
    
    result = users_col.delete_one({'email': current_user_email})
    if result.deleted_count == 1:
        return jsonify({'message': 'Account deleted successfully'}), 200
    else:
        return jsonify({'error': 'User not found'}), 404
