from flask import Blueprint, jsonify

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return jsonify({
        'message': 'Sistema de Gestión Operacional para Empresas de Limpieza',
        'version': '1.0.0',
        'endpoints': {
            'clients': '/api/clients',
            'employees': '/api/employees', 
            'services': '/api/services',
            'schedules': '/api/schedules'
        }
    })

@bp.route('/health')
def health():
    return jsonify({'status': 'healthy'})