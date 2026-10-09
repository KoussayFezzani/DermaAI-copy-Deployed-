from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
import datetime
from bson import ObjectId
from ml_integration.prediction_service import PredictionService
from api.db import get_history_collection
from api.limiter import limiter

api_bp = Blueprint('api', __name__)

from PIL import Image


# Configure upload folder (Simulating Cloud Storage)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image_file(file_storage):
    """
    Validates file extension, magic signature bytes, and PIL image integrity.
    Protects against disguised payloads, oversized or corrupted images.
    Forward-compatible with Python 3.13+ (imghdr independent).
    """
    if not allowed_file(file_storage.filename):
        return False, "Unsupported file extension. Only JPG, JPEG, and PNG are allowed."
    
    header = file_storage.read(32)
    file_storage.seek(0)
    
    # JPEG magic bytes: FF D8 FF
    # PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    is_jpeg = header.startswith(b'\xff\xd8\xff')
    is_png = header.startswith(b'\x89PNG\r\n\x1a\n')
    
    if not (is_jpeg or is_png):
        return False, "File is not a valid JPEG or PNG image (invalid magic header)."
    
    try:
        file_storage.seek(0)
        with Image.open(file_storage) as img:
            img.verify()
            if img.format not in ('JPEG', 'PNG'):
                return False, f"Unsupported internal image format: {img.format}"
        file_storage.seek(0)
    except Exception:
        file_storage.seek(0)
        return False, "Image file is corrupt or unreadable."

    return True, None


def serve_secure_upload(filename):
    """
    Serves uploaded images with authorization checks.
    Ensures users can only view their own uploaded lesion images.
    Admins can view all images for clinical audit purposes.
    """
    from flask import send_from_directory
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
    
    safe_name = secure_filename(filename)
    if safe_name != filename:
        return jsonify({'error': 'Invalid file path'}), 400

    image_path = os.path.join(UPLOAD_FOLDER, safe_name)
    if not os.path.exists(image_path):
        return jsonify({'error': 'Image not found'}), 404

    try:
        verify_jwt_in_request(optional=True)
        user_email = get_jwt_identity()
        claims = get_jwt() or {}
    except Exception:
        user_email = None
        claims = {}


    history_col = get_history_collection()
    if history_col is not None:
        relative_url = f"/uploads/{safe_name}"
        record = history_col.find_one({'image_url': relative_url})
        if record:
            owner_email = record.get('user_email')
            if owner_email:
                if not user_email or (user_email != owner_email and claims.get('role') != 'admin'):
                    return jsonify({'error': 'Access denied: unauthorized image view'}), 403

    return send_from_directory(UPLOAD_FOLDER, safe_name)

@api_bp.route('/upload-diagnosis', methods=['POST'])
@limiter.limit("15 per minute; 100 per hour")
@jwt_required(optional=True)
def upload_diagnosis():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided in request'}), 400
    
    file = request.files['image']
    if not file or file.filename == '':
        return jsonify({'error': 'No selected image file'}), 400
        
    is_valid, error_msg = validate_image_file(file)
    if not is_valid:
        return jsonify({'error': error_msg}), 400

    # 1. Save File
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(file_path)
    
    image_url = f"/uploads/{unique_filename}" 

    # 2. Prediction
    try:
        result = PredictionService.predict_and_explain(file_path)
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': 'Prediction processing failed'}), 500

    # 3. Clinical Safety: Explicit Uncertainty Handling
    # If confidence < 50%, mark as Inconclusive/Uncertain instead of falsely diagnosing 'Normal Skin'
    confidence = result['confidence']
    raw_class = result.get('raw_class')
    
    if confidence < 0.50:
        final_diagnosis = "Inconclusive / Uncertain Result (Clinical Dermoscopy Recommended)"
        is_uncertain = True
    else:
        final_diagnosis = result['diagnosis']
        is_uncertain = False

    body_part = request.form.get('body_part')
    current_user_email = get_jwt_identity()

    # 4. Save to DB
    history_col = get_history_collection()
    if history_col is not None and current_user_email:
        record = {
            'image_url': image_url,
            'body_part': body_part,
            'diagnosis': final_diagnosis,
            'confidence': confidence,
            'diagnosis_2': result.get('diagnosis_2'),
            'confidence_2': result.get('confidence_2'),
            'raw_class': raw_class,
            'is_uncertain': is_uncertain,
            'timestamp': datetime.datetime.utcnow(),
            'user_email': current_user_email
        }
        history_col.insert_one(record)

    # 5. Return Response
    response = {
        'diagnosis': final_diagnosis,
        'confidence': confidence,
        'diagnosis_2': result.get('diagnosis_2'),
        'confidence_2': result.get('confidence_2'),
        'is_uncertain': is_uncertain,
        'grad_cam_image': result.get('grad_cam_image'),
        'image_url': image_url,
        'body_part': body_part
    }
    return jsonify(response), 200


@api_bp.route('/chat-query-stream', methods=['POST'])
@limiter.limit("10 per minute; 60 per hour")
@jwt_required()
def chat_query_stream():
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({'error': 'Invalid JSON payload'}), 400

    user_query = data.get('query')
    context = data.get('context') # { diagnosis, confidence }
    lang = data.get('lang', 'en') # Default to English
    
    if not user_query or not str(user_query).strip():
        return jsonify({'error': 'Missing query'}), 400
        
    from flask import Response, stream_with_context
    from api.chat import get_chat_response_stream
    
    def generate():
        for chunk in get_chat_response_stream(user_query, context, lang):
            yield chunk
            
    res = Response(stream_with_context(generate()), mimetype='text/plain')
    res.headers['X-Accel-Buffering'] = 'no'
    res.headers['Cache-Control'] = 'no-cache'
    return res

@api_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    current_user_email = get_jwt_identity()
    history_col = get_history_collection()
    if history_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
        
    # Retrieve last 20 records for THIS user, sorted by date
    cursor = history_col.find({'user_email': current_user_email}).sort('timestamp', -1).limit(20)
    
    history = []
    for doc in cursor:
        doc['_id'] = str(doc['_id']) # ObjectId to string
        history.append(doc)
        
    return jsonify(history), 200

@api_bp.route('/history/<scan_id>', methods=['DELETE'])
@jwt_required()
def delete_scan(scan_id):
    current_user_email = get_jwt_identity()
    history_col = get_history_collection()
    if history_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
        
    try:
        # Find record first to get image path
        record = history_col.find_one({'_id': ObjectId(scan_id), 'user_email': current_user_email})
        if not record:
            return jsonify({'error': 'Record not found or access denied'}), 404
            
        # Physical File Deletion
        if 'image_url' in record:
            relative_path = record['image_url'].lstrip('/') # uploads/...
            # Convert URL path to system path
            # Assuming image_url is /uploads/... and PROJECT_ROOT/backend/uploads exists
            base_dir = os.path.dirname(os.path.dirname(__file__))
            file_to_delete = os.path.join(base_dir, relative_path)
            
            if os.path.exists(file_to_delete):
                os.remove(file_to_delete)
        
        # Database Removal
        history_col.delete_one({'_id': ObjectId(scan_id)})
        
        return jsonify({'message': 'Scan deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api_bp.route('/history', methods=['DELETE'])
@jwt_required()
def delete_history():
    current_user_email = get_jwt_identity()
    history_col = get_history_collection()
    if history_col is None:
        return jsonify({'error': 'Database connection failed'}), 503
        
    # Note: We might want to loop and delete files here too, but for safety 
    # and simplicity we'll just wipe the DB entries if mass-cleaning.
    result = history_col.delete_many({'user_email': current_user_email})
    return jsonify({'message': f'Deleted {result.deleted_count} history records'}), 200


