#!/usr/bin/env python3
"""
Script para cargar datos de ejemplo en el sistema de gestión operacional.
Utiliza la API REST para crear clientes, empleados, servicios y programaciones de muestra.
"""

import requests
import json
from datetime import datetime, timedelta

# Configuración de la API
BASE_URL = "http://127.0.0.1:5000/api"
HEADERS = {"Content-Type": "application/json"}

def create_clients():
    """Crear clientes de ejemplo"""
    clients = [
        {
            "name": "Hotel Central Plaza",
            "email": "contacto@hotelcentral.com",
            "phone": "+1-555-0123",
            "address": "Calle Principal 123, Centro, Ciudad"
        },
        {
            "name": "Oficinas Torre Empresarial",
            "email": "admin@torreempresarial.com",
            "phone": "+1-555-0234",
            "address": "Avenida Corporativa 456, Piso 12, Ciudad"
        },
        {
            "name": "Centro Médico San Rafael",
            "email": "servicios@sanrafael.med",
            "phone": "+1-555-0345",
            "address": "Boulevard Salud 789, Zona Médica, Ciudad"
        }
    ]
    
    created_clients = []
    for client in clients:
        response = requests.post(f"{BASE_URL}/clients", headers=HEADERS, json=client)
        if response.status_code == 201:
            created_clients.append(response.json())
            print(f"✓ Cliente creado: {client['name']}")
        else:
            print(f"✗ Error creando cliente {client['name']}: {response.text}")
    
    return created_clients

def create_employees():
    """Crear empleados de ejemplo"""
    employees = [
        {
            "name": "María González",
            "email": "maria.gonzalez@limpiezas.com",
            "phone": "+1-555-1001",
            "position": "cleaner",
            "hourly_rate": 15.50
        },
        {
            "name": "Carlos Rodríguez",
            "email": "carlos.rodriguez@limpiezas.com",
            "phone": "+1-555-1002",
            "position": "cleaner",
            "hourly_rate": 16.00
        },
        {
            "name": "Ana López",
            "email": "ana.lopez@limpiezas.com",
            "phone": "+1-555-1003",
            "position": "supervisor",
            "hourly_rate": 22.00
        },
        {
            "name": "Pedro Martínez",
            "email": "pedro.martinez@limpiezas.com",
            "phone": "+1-555-1004",
            "position": "manager",
            "hourly_rate": 28.00
        }
    ]
    
    created_employees = []
    for employee in employees:
        response = requests.post(f"{BASE_URL}/employees", headers=HEADERS, json=employee)
        if response.status_code == 201:
            created_employees.append(response.json())
            print(f"✓ Empleado creado: {employee['name']}")
        else:
            print(f"✗ Error creando empleado {employee['name']}: {response.text}")
    
    return created_employees

def create_services():
    """Crear servicios de ejemplo"""
    services = [
        {
            "name": "Limpieza General de Oficinas",
            "description": "Limpieza completa de espacios de oficina incluyendo pisos, ventanas, baños y escritorios",
            "base_price": 120.00,
            "estimated_duration": 180
        },
        {
            "name": "Limpieza Profunda de Habitaciones de Hotel",
            "description": "Limpieza exhaustiva de habitaciones incluyendo cambio de ropa de cama, limpieza de baño y aspirado",
            "base_price": 45.00,
            "estimated_duration": 60
        },
        {
            "name": "Limpieza Especializada de Áreas Médicas",
            "description": "Limpieza y desinfección especializada para centros médicos con productos certificados",
            "base_price": 200.00,
            "estimated_duration": 240
        },
        {
            "name": "Mantenimiento de Áreas Comunes",
            "description": "Limpieza de vestíbulos, escaleras, ascensores y áreas de reunión",
            "base_price": 80.00,
            "estimated_duration": 120
        },
        {
            "name": "Limpieza de Ventanas Exteriores",
            "description": "Lavado profesional de ventanas exteriores en edificios de hasta 3 pisos",
            "base_price": 150.00,
            "estimated_duration": 300
        }
    ]
    
    created_services = []
    for service in services:
        response = requests.post(f"{BASE_URL}/services", headers=HEADERS, json=service)
        if response.status_code == 201:
            created_services.append(response.json())
            print(f"✓ Servicio creado: {service['name']}")
        else:
            print(f"✗ Error creando servicio {service['name']}: {response.text}")
    
    return created_services

def create_schedules(clients, employees, services):
    """Crear programaciones de ejemplo"""
    if not clients or not employees or not services:
        print("✗ No se pueden crear programaciones sin clientes, empleados y servicios")
        return []
    
    # Fecha base para las programaciones (próxima semana)
    base_date = datetime.now() + timedelta(days=7)
    
    schedules = [
        {
            "client_id": clients[0]["id"],  # Hotel Central Plaza
            "employee_id": employees[0]["id"],  # María González
            "service_id": services[1]["id"],  # Limpieza de Habitaciones
            "scheduled_date": (base_date + timedelta(days=0)).strftime("%Y-%m-%dT00:00:00"),
            "start_time": "08:00",
            "end_time": "12:00",
            "notes": "Limpieza semanal de habitaciones del piso 3"
        },
        {
            "client_id": clients[1]["id"],  # Torre Empresarial
            "employee_id": employees[1]["id"],  # Carlos Rodríguez
            "service_id": services[0]["id"],  # Limpieza de Oficinas
            "scheduled_date": (base_date + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00"),
            "start_time": "18:00",
            "end_time": "21:00",
            "notes": "Limpieza nocturna de oficinas - pisos 10-12"
        },
        {
            "client_id": clients[2]["id"],  # Centro Médico
            "employee_id": employees[2]["id"],  # Ana López (supervisor)
            "service_id": services[2]["id"],  # Limpieza Médica
            "scheduled_date": (base_date + timedelta(days=2)).strftime("%Y-%m-%dT00:00:00"),
            "start_time": "06:00",
            "end_time": "10:00",
            "notes": "Limpieza especializada de quirófanos - supervisión requerida"
        },
        {
            "client_id": clients[0]["id"],  # Hotel Central Plaza
            "employee_id": employees[0]["id"],  # María González
            "service_id": services[3]["id"],  # Áreas Comunes
            "scheduled_date": (base_date + timedelta(days=3)).strftime("%Y-%m-%dT00:00:00"),
            "start_time": "14:00",
            "end_time": "16:00",
            "notes": "Mantenimiento semanal de vestíbulo y áreas comunes"
        },
        {
            "client_id": clients[1]["id"],  # Torre Empresarial
            "employee_id": employees[3]["id"],  # Pedro Martínez (manager)
            "service_id": services[4]["id"],  # Ventanas Exteriores
            "scheduled_date": (base_date + timedelta(days=5)).strftime("%Y-%m-%dT00:00:00"),
            "start_time": "09:00",
            "end_time": "14:00",
            "notes": "Limpieza mensual de ventanas exteriores - requiere supervisión de gerencia"
        }
    ]
    
    created_schedules = []
    for schedule in schedules:
        response = requests.post(f"{BASE_URL}/schedules", headers=HEADERS, json=schedule)
        if response.status_code == 201:
            created_schedules.append(response.json())
            print(f"✓ Programación creada: Cliente {schedule['client_id']} - {schedule['scheduled_date']}")
        else:
            print(f"✗ Error creando programación: {response.text}")
    
    return created_schedules

def main():
    """Función principal para cargar datos de ejemplo"""
    print("🧹 Cargando datos de ejemplo para el Sistema de Gestión Operacional...")
    print("=" * 70)
    
    # Verificar que el servidor esté disponible
    try:
        response = requests.get("http://127.0.0.1:5000/health")
        if response.status_code != 200:
            print("✗ El servidor no está disponible. Asegúrate de que la aplicación esté ejecutándose.")
            return
    except requests.ConnectionError:
        print("✗ No se puede conectar al servidor. Asegúrate de que la aplicación esté ejecutándose en http://127.0.0.1:5000")
        return
    
    print("✓ Servidor disponible")
    print()
    
    # Crear datos de ejemplo
    print("📋 Creando clientes...")
    clients = create_clients()
    print()
    
    print("👥 Creando empleados...")
    employees = create_employees()
    print()
    
    print("🛠️ Creando servicios...")
    services = create_services()
    print()
    
    print("📅 Creando programaciones...")
    schedules = create_schedules(clients, employees, services)
    print()
    
    # Resumen
    print("=" * 70)
    print("📊 RESUMEN DE DATOS CREADOS:")
    print(f"   • Clientes: {len(clients)}")
    print(f"   • Empleados: {len(employees)}")
    print(f"   • Servicios: {len(services)}")
    print(f"   • Programaciones: {len(schedules)}")
    print()
    print("✅ Datos de ejemplo cargados exitosamente!")
    print("🌐 Puedes explorar los datos en: http://127.0.0.1:5000")

if __name__ == "__main__":
    main()