from flask import Blueprint, jsonify
import json
import os

diseases_bp = Blueprint('diseases', __name__)

def load_diseases_data():
    """Load diseases data from JSON file"""
    try:
        data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'diseases.json')
        with open(data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading diseases data: {e}")
        return {'diseases': []}

@diseases_bp.route('/', methods=['GET'])
def get_all_diseases():
    """
    Get all diseases.
    Optional query params:
    - category: filter by category (malignant, pre-malignant, benign)
    - search: search by name
    """
    from flask import request
    
    data = load_diseases_data()
    diseases = data.get('diseases', [])
    
    # Filter by category if provided
    category = request.args.get('category')
    if category:
        diseases = [d for d in diseases if d.get('category') == category]
    
    # Search by name if provided
    search = request.args.get('search', '').lower()
    if search:
        diseases = [d for d in diseases if search in d.get('name', '').lower() or search in d.get('scientificName', '').lower()]
    
    return jsonify({'diseases': diseases}), 200

@diseases_bp.route('/<disease_id>', methods=['GET'])
def get_disease_by_id(disease_id):
    """Get specific disease by ID"""
    data = load_diseases_data()
    diseases = data.get('diseases', [])
    
    disease = next((d for d in diseases if d.get('id') == disease_id), None)
    
    if disease:
        return jsonify(disease), 200
    else:
        return jsonify({'error': 'Disease not found'}), 404
