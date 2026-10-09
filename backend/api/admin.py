from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from api.db import init_db, get_history_collection
from api.auth import get_users_collection, admin_required
import bcrypt
from bson import ObjectId

admin_bp = Blueprint('admin', __name__)

import os
import datetime
from datetime import timedelta
import calendar

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required()
def get_stats():
    # Verify Admin Role
    # Verify Admin Role
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    db = init_db()
    users_col = get_users_collection()
    history_col = get_history_collection()

    # 1. Total Users
    total_users = users_col.count_documents({})

    # 2. Active Users (Last 24h)
    yesterday = datetime.datetime.utcnow() - timedelta(days=1)
    active_users = users_col.count_documents({'last_login': {'$gte': yesterday}})

    # 3. Total Scans
    total_scans = history_col.count_documents({}) if history_col is not None else 0

    # 4. System Status
    # Model Status
    model_path = os.path.join('saved_models', 'skin_lesion_model.keras')
    # Check current directory or parent (handle both running from root or backend)
    if not os.path.exists(model_path):
        model_path = os.path.join('backend', 'saved_models', 'skin_lesion_model.keras')
    
    model_status = "Loaded" if os.path.exists(model_path) else "Not Found"
    
    # DB Status (If we are here, it's likely connected, but we can check None)
    db_status = "Connected" if db is not None else "Disconnected"
    
    # Scraper Status (News scraper is on-demand, so we assume operational if network is up)
    scraper_status = "Operational"

    # 5. Diagnosis Distribution
    diagnosis_data_map = {}
    if history_col is not None:
        pipeline = [
            {"$group": {"_id": "$diagnosis", "count": {"$sum": 1}}}
        ]
        agg_result = list(history_col.aggregate(pipeline))
        for item in agg_result:
            diagnosis_name = item.get('_id', 'Unknown')
            # Shorten the label for the dashboard chart
            if diagnosis_name in ["Normal Skin (No signs of disease)", "No signs of disease, please consult your doctor for further assessment.", "Uncertain Result"]:
                diagnosis_name = "Normal / Safe Skin"
                
            count_val = item.get('count', 1)
            diagnosis_data_map[diagnosis_name] = diagnosis_data_map.get(diagnosis_name, 0) + count_val
            
    diagnosis_data = [{"name": k, "count": v} for k, v in diagnosis_data_map.items()]

    # 6. Recent Activity (Last 5 scans)
    recent_activity = []
    if history_col is not None:
        cursor = history_col.find().sort('timestamp', -1).limit(5)
        for doc in cursor:
            d_name = doc.get('diagnosis', 'Unknown')
            if d_name == "No signs of disease, please consult your doctor for further assessment.":
                d_name = "Normal Skin (No signs of disease)"
                
            recent_activity.append({
                "id": str(doc['_id']),
                "diagnosis": d_name,
                "confidence": doc.get('confidence'),
                "timestamp": doc.get('timestamp').isoformat() if doc.get('timestamp') else None
            })
            
    # 7. Weekly Activity (Last 7 days)
    weekly_activity = []
    # Fill with last 7 days (including today)
    for i in range(6, -1, -1):
        d = datetime.datetime.utcnow() - timedelta(days=i)
        day_str = d.strftime('%a') # Mon, Tue, etc.
        # Find start and end of that specific day
        start_day = d.replace(hour=0, minute=0, second=0, microsecond=0)
        end_day = d.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        count = history_col.count_documents({
            'timestamp': {'$gte': start_day, '$lte': end_day}
        }) if history_col is not None else 0
        
        weekly_activity.append({'day': day_str, 'scans': count})

    return jsonify({
        "total_users": total_users,
        "active_users": active_users,
        "total_scans": total_scans,
        "system_status": {
            "model": model_status,
            "database": db_status,
            "scraper": scraper_status
        },
        "diagnosis_distribution": diagnosis_data,
        "recent_activity": recent_activity,
        "weekly_activity": weekly_activity
    }), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required()
def get_users():
    # Verify Admin Role
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    users_col = get_users_collection()
    
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit
    
    total_users = users_col.count_documents({})
    users_cursor = users_col.find().skip(skip).limit(limit)
    
    users_list = []
    for user in users_cursor:
        # Handle creation date: Use generation_time if ObjectId, else use current time or placeholder
        obj_id = user.get('_id')
        created_at = datetime.datetime.utcnow() # Default
        if isinstance(obj_id, ObjectId):
            created_at = obj_id.generation_time
        elif user.get('created_at'):
            created_at = user.get('created_at')

        users_list.append({
            "_id": str(obj_id),
            "email": user.get('email'),
            "username": user.get('username'),
            "role": user.get('role'),
            "last_login": user.get('last_login').isoformat() if user.get('last_login') else None,
            "created_at": created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)
        })
        
    return jsonify({
        "users": users_list,
        "total_pages": (total_users + limit - 1) // limit,
        "current_page": page,
        "total_users": total_users
    }), 200

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_user(user_id):
    # Verify Admin Role
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    users_col = get_users_collection()
    
    try:
        result = users_col.delete_one({'_id': ObjectId(user_id)})
        if result.deleted_count == 1:
            return jsonify({'message': 'User deleted successfully'}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_user(user_id):
    # Verify Admin Role
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized access'}), 403

    data = request.json
    users_col = get_users_collection()
    
    update_fields = {}
    if 'username' in data:
        update_fields['username'] = data['username']
    if 'email' in data:
        update_fields['email'] = data['email']
    if 'password' in data and data['password']:
        # Hash the new password
        hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        update_fields['password'] = hashed_pw.decode('utf-8')

    if not update_fields:
        return jsonify({'message': 'No changes provided'}), 400

    try:
        result = users_col.update_one({'_id': ObjectId(user_id)}, {'$set': update_fields})
        if result.matched_count == 1:
            return jsonify({'message': 'User updated successfully'}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

import json
from bson import json_util
from flask import send_file
import io

@admin_bp.route('/backup', methods=['GET'])
@jwt_required()
@admin_required()
def backup_database():
    users_col = get_users_collection()
    history_col = get_history_collection()
    
    users_data = list(users_col.find({}))
    history_data = list(history_col.find({})) if history_col is not None else []
    
    backup = {
        'users': json.loads(json_util.dumps(users_data)),
        'history': json.loads(json_util.dumps(history_data))
    }
    
    mem_file = io.BytesIO()
    mem_file.write(json.dumps(backup).encode('utf-8'))
    mem_file.seek(0)
    
    return send_file(mem_file, as_attachment=True, download_name=f'dermaai_backup_{datetime.datetime.now().strftime("%Y%m%d")}.json', mimetype='application/json')

@admin_bp.route('/export-research', methods=['GET'])
@jwt_required()
@admin_required()
def export_research():
    history_col = get_history_collection()
    if history_col is None: return jsonify({'error': 'No history data'}), 404
    
    pipeline = [
        {'$project': {
            '_id': 0, 'user_email': 0, 'image_url': 0  # Exclude PII and local paths
        }}
    ]
    anon_data = list(history_col.aggregate(pipeline))
    
    mem_file = io.BytesIO()
    mem_file.write(json.dumps(anon_data, default=str).encode('utf-8'))
    mem_file.seek(0)
    
    return send_file(mem_file, as_attachment=True, download_name='dermaai_research_export.json', mimetype='application/json')
