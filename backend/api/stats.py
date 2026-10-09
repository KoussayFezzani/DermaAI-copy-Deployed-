from flask import Blueprint, jsonify
from api.db import get_db
from datetime import datetime, timedelta
import os

stats_bp = Blueprint('stats', __name__)

# Simple in-memory cache
_cache = {
    'data': None,
    'timestamp': None,
    'ttl': 300  # 5 minutes
}

def get_cached_stats():
    """Get cached statistics or None if expired"""
    if _cache['data'] is None or _cache['timestamp'] is None:
        return None
    
    if datetime.utcnow() - _cache['timestamp'] > timedelta(seconds=_cache['ttl']):
        return None
    
    return _cache['data']

def set_cached_stats(data):
    """Cache statistics data"""
    _cache['data'] = data
    _cache['timestamp'] = datetime.utcnow()

@stats_bp.route('/global', methods=['GET'])
def get_global_stats():
    """
    Get global application statistics.
    Returns total scans, accuracy, risk distribution, and top diseases.
    """
    # Check cache first
    cached = get_cached_stats()
    if cached:
        return jsonify(cached), 200
    
    try:
        db = get_db()
        
        # Get total scans from history collection
        from api.db import get_history_collection
        history_col = get_history_collection()
        if history_col is None:
             return jsonify({'error': 'Database connection failed'}), 503
        total_scans = history_col.count_documents({})
        
        # Get total users
        users_col = db['users']
        total_users = users_col.count_documents({})
        
        # Calculate risk distribution (based on confidence levels)
        # High risk: confidence > 0.8 for malignant types
        # Medium risk: confidence 0.5-0.8 or benign with high confidence
        # Low risk: confidence < 0.5
        
        malignant_types = ['Melanoma', 'Basal cell carcinoma', 'Actinic keratoses']
        
        high_risk = 0
        medium_risk = 0
        low_risk = 0
        
        for scan in history_col.find():
            diagnosis = scan.get('diagnosis', '')
            confidence = scan.get('confidence', 0)
            
            if diagnosis in malignant_types:
                if confidence > 0.8:
                    high_risk += 1
                elif confidence > 0.5:
                    medium_risk += 1
                else:
                    low_risk += 1
            else:
                if confidence > 0.8:
                    low_risk += 1
                elif confidence > 0.5:
                    medium_risk += 1
                else:
                    low_risk += 1
        
        # Calculate percentages
        total = high_risk + medium_risk + low_risk
        if total > 0:
            risk_distribution = {
                'high': round((high_risk / total) * 100, 1),
                'medium': round((medium_risk / total) * 100, 1),
                'low': round((low_risk / total) * 100, 1)
            }
        else:
            risk_distribution = {'high': 0, 'medium': 0, 'low': 0}
        
        # Get top 3 most detected diseases
        pipeline = [
            {
                '$group': {
                    '_id': '$diagnosis',
                    'count': {'$sum': 1}
                }
            },
            {
                '$sort': {'count': -1}
            },
            {
                '$limit': 3
            }
        ]
        
        top_diseases_cursor = history_col.aggregate(pipeline)
        top_diseases = [
            {'name': doc['_id'], 'count': doc['count']}
            for doc in top_diseases_cursor
        ]
        
        # Model accuracy (hardcoded for now, should come from model evaluation)
        # TODO: Load from model metrics file when available
        accuracy = float(os.getenv('MODEL_ACCURACY', '0.83'))
        
        stats_data = {
            'totalScans': total_scans,
            'accuracy': accuracy,
            'riskDistribution': risk_distribution,
            'topDiseases': top_diseases,
            'totalUsers': total_users
        }
        
        # Cache the results
        set_cached_stats(stats_data)
        
        return jsonify(stats_data), 200
        
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'error': 'Failed to fetch global statistics'}), 500
