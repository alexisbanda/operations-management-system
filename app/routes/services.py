from flask import Blueprint, request, jsonify
from app import db
from app.models.service import Service

bp = Blueprint('services', __name__, url_prefix='/api/services')

@bp.route('', methods=['GET'])
def get_services():
    services = Service.query.all()
    return jsonify([service.to_dict() for service in services])

@bp.route('/<int:id>', methods=['GET'])
def get_service(id):
    service = Service.query.get_or_404(id)
    return jsonify(service.to_dict())

@bp.route('', methods=['POST'])
def create_service():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'base_price', 'estimated_duration']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    service = Service(
        name=data['name'],
        description=data.get('description'),
        base_price=float(data['base_price']),
        estimated_duration=int(data['estimated_duration']),
        is_active=data.get('is_active', True)
    )
    
    try:
        db.session.add(service)
        db.session.commit()
        return jsonify(service.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create service'}), 500

@bp.route('/<int:id>', methods=['PUT'])
def update_service(id):
    service = Service.query.get_or_404(id)
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data:
        service.name = data['name']
    if 'description' in data:
        service.description = data['description']
    if 'base_price' in data:
        service.base_price = float(data['base_price'])
    if 'estimated_duration' in data:
        service.estimated_duration = int(data['estimated_duration'])
    if 'is_active' in data:
        service.is_active = data['is_active']
    
    try:
        db.session.commit()
        return jsonify(service.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update service'}), 500

@bp.route('/<int:id>', methods=['DELETE'])
def delete_service(id):
    service = Service.query.get_or_404(id)
    
    try:
        db.session.delete(service)
        db.session.commit()
        return jsonify({'message': 'Service deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete service'}), 500