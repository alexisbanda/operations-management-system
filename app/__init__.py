from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///operations_management.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Import models
    from app.models import client, employee, service, schedule
    
    # Register blueprints
    from app.routes import main, clients, employees, services, schedules
    app.register_blueprint(main.bp)
    app.register_blueprint(clients.bp)
    app.register_blueprint(employees.bp)
    app.register_blueprint(services.bp)
    app.register_blueprint(schedules.bp)
    
    return app