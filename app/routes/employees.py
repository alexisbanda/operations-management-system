from flask import Blueprint, request, jsonify
from app import db
from app.models.employee import Employee

bp = Blueprint('employees', __name__, url_prefix='/api/employees')

@bp.route('', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    return jsonify([employee.to_dict() for employee in employees])

@bp.route('/<int:id>', methods=['GET'])
def get_employee(id):
    employee = Employee.query.get_or_404(id)
    return jsonify(employee.to_dict())

@bp.route('', methods=['POST'])
def create_employee():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'phone', 'position', 'hourly_rate']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    employee = Employee(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        position=data['position'],
        hourly_rate=float(data['hourly_rate']),
        is_active=data.get('is_active', True)
    )
    
    try:
        db.session.add(employee)
        db.session.commit()
        return jsonify(employee.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create employee'}), 500

@bp.route('/<int:id>', methods=['PUT'])
def update_employee(id):
    employee = Employee.query.get_or_404(id)
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data:
        employee.name = data['name']
    if 'email' in data:
        employee.email = data['email']
    if 'phone' in data:
        employee.phone = data['phone']
    if 'position' in data:
        employee.position = data['position']
    if 'hourly_rate' in data:
        employee.hourly_rate = float(data['hourly_rate'])
    if 'is_active' in data:
        employee.is_active = data['is_active']
    
    try:
        db.session.commit()
        return jsonify(employee.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update employee'}), 500

@bp.route('/<int:id>', methods=['DELETE'])
def delete_employee(id):
    employee = Employee.query.get_or_404(id)
    
    try:
        db.session.delete(employee)
        db.session.commit()
        return jsonify({'message': 'Employee deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete employee'}), 500