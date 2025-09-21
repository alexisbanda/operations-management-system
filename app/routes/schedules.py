from flask import Blueprint, request, jsonify
from app import db
from app.models.schedule import Schedule
from app.models.client import Client
from app.models.employee import Employee
from app.models.service import Service
from datetime import datetime, time

bp = Blueprint('schedules', __name__, url_prefix='/api/schedules')

@bp.route('', methods=['GET'])
def get_schedules():
    schedules = Schedule.query.all()
    return jsonify([schedule.to_dict() for schedule in schedules])

@bp.route('/<int:id>', methods=['GET'])
def get_schedule(id):
    schedule = Schedule.query.get_or_404(id)
    return jsonify(schedule.to_dict())

@bp.route('', methods=['POST'])
def create_schedule():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['client_id', 'employee_id', 'service_id', 'scheduled_date', 'start_time', 'end_time']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate foreign keys exist
    client = Client.query.get(data['client_id'])
    if not client:
        return jsonify({'error': 'Client not found'}), 404
    
    employee = Employee.query.get(data['employee_id'])
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404
    
    service = Service.query.get(data['service_id'])
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    
    try:
        # Parse date and time
        scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', '+00:00'))
        start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        
        schedule = Schedule(
            client_id=data['client_id'],
            employee_id=data['employee_id'],
            service_id=data['service_id'],
            scheduled_date=scheduled_date,
            start_time=start_time,
            end_time=end_time,
            status=data.get('status', 'scheduled'),
            notes=data.get('notes'),
            final_price=data.get('final_price', service.base_price)
        )
        
        db.session.add(schedule)
        db.session.commit()
        return jsonify(schedule.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': 'Invalid date/time format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create schedule'}), 500

@bp.route('/<int:id>', methods=['PUT'])
def update_schedule(id):
    schedule = Schedule.query.get_or_404(id)
    data = request.get_json()
    
    try:
        # Update fields if provided
        if 'client_id' in data:
            client = Client.query.get(data['client_id'])
            if not client:
                return jsonify({'error': 'Client not found'}), 404
            schedule.client_id = data['client_id']
        
        if 'employee_id' in data:
            employee = Employee.query.get(data['employee_id'])
            if not employee:
                return jsonify({'error': 'Employee not found'}), 404
            schedule.employee_id = data['employee_id']
        
        if 'service_id' in data:
            service = Service.query.get(data['service_id'])
            if not service:
                return jsonify({'error': 'Service not found'}), 404
            schedule.service_id = data['service_id']
        
        if 'scheduled_date' in data:
            schedule.scheduled_date = datetime.fromisoformat(data['scheduled_date'].replace('Z', '+00:00'))
        
        if 'start_time' in data:
            schedule.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        
        if 'end_time' in data:
            schedule.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        
        if 'status' in data:
            schedule.status = data['status']
        
        if 'notes' in data:
            schedule.notes = data['notes']
        
        if 'actual_duration' in data:
            schedule.actual_duration = data['actual_duration']
        
        if 'final_price' in data:
            schedule.final_price = data['final_price']
        
        db.session.commit()
        return jsonify(schedule.to_dict())
    except ValueError as e:
        return jsonify({'error': 'Invalid date/time format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update schedule'}), 500

@bp.route('/<int:id>', methods=['DELETE'])
def delete_schedule(id):
    schedule = Schedule.query.get_or_404(id)
    
    try:
        db.session.delete(schedule)
        db.session.commit()
        return jsonify({'message': 'Schedule deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete schedule'}), 500

@bp.route('/employee/<int:employee_id>', methods=['GET'])
def get_employee_schedules(employee_id):
    schedules = Schedule.query.filter_by(employee_id=employee_id).all()
    return jsonify([schedule.to_dict() for schedule in schedules])

@bp.route('/client/<int:client_id>', methods=['GET'])
def get_client_schedules(client_id):
    schedules = Schedule.query.filter_by(client_id=client_id).all()
    return jsonify([schedule.to_dict() for schedule in schedules])