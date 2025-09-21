# Sistema de Gestión Operacional para Empresas de Limpieza

Un sistema completo de gestión operacional diseñado específicamente para empresas de limpieza, que permite administrar clientes, empleados, servicios y horarios de trabajo de manera eficiente.

## Características Principales

- **Gestión de Clientes**: Registro y administración completa de información de clientes
- **Gestión de Empleados**: Control de personal con información de contacto, posiciones y tarifas
- **Catálogo de Servicios**: Administración de servicios con precios y duraciones estimadas
- **Programación de Trabajos**: Sistema de agenda para asignar trabajos a empleados
- **API RESTful**: Interfaz de programación completa para integración con otros sistemas

## Tecnologías Utilizadas

- **Backend**: Python 3.x con Flask
- **Base de Datos**: SQLite (SQLAlchemy ORM)
- **API**: RESTful con JSON
- **Migraciones**: Flask-Migrate

## Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/alexisbanda/operations-management-system.git
   cd operations-management-system
   ```

2. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Inicializar la base de datos**:
   ```bash
   python3 -c "
   from app import create_app, db
   app = create_app()
   with app.app_context():
       db.create_all()
   "
   ```

5. **Ejecutar la aplicación**:
   ```bash
   python3 run.py
   ```

La aplicación estará disponible en `http://127.0.0.1:5000`

## Estructura del Proyecto

```
operations-management-system/
├── app/
│   ├── __init__.py          # Configuración principal de Flask
│   ├── models/              # Modelos de datos
│   │   ├── client.py        # Modelo de clientes
│   │   ├── employee.py      # Modelo de empleados
│   │   ├── service.py       # Modelo de servicios
│   │   └── schedule.py      # Modelo de horarios/programación
│   └── routes/              # Rutas de la API
│       ├── main.py          # Rutas principales
│       ├── clients.py       # API de clientes
│       ├── employees.py     # API de empleados
│       ├── services.py      # API de servicios
│       └── schedules.py     # API de programación
├── requirements.txt         # Dependencias Python
├── run.py                  # Punto de entrada de la aplicación
├── .env.example           # Ejemplo de configuración
└── README.md              # Documentación

```

## API Endpoints

### Endpoint Principal
- `GET /` - Información general del sistema
- `GET /health` - Estado del sistema

### Clientes (`/api/clients`)
- `GET /api/clients` - Listar todos los clientes
- `GET /api/clients/<id>` - Obtener cliente específico
- `POST /api/clients` - Crear nuevo cliente
- `PUT /api/clients/<id>` - Actualizar cliente
- `DELETE /api/clients/<id>` - Eliminar cliente

### Empleados (`/api/employees`)
- `GET /api/employees` - Listar todos los empleados
- `GET /api/employees/<id>` - Obtener empleado específico
- `POST /api/employees` - Crear nuevo empleado
- `PUT /api/employees/<id>` - Actualizar empleado
- `DELETE /api/employees/<id>` - Eliminar empleado

### Servicios (`/api/services`)
- `GET /api/services` - Listar todos los servicios
- `GET /api/services/<id>` - Obtener servicio específico
- `POST /api/services` - Crear nuevo servicio
- `PUT /api/services/<id>` - Actualizar servicio
- `DELETE /api/services/<id>` - Eliminar servicio

### Programación (`/api/schedules`)
- `GET /api/schedules` - Listar todas las programaciones
- `GET /api/schedules/<id>` - Obtener programación específica
- `POST /api/schedules` - Crear nueva programación
- `PUT /api/schedules/<id>` - Actualizar programación
- `DELETE /api/schedules/<id>` - Eliminar programación
- `GET /api/schedules/employee/<employee_id>` - Programaciones por empleado
- `GET /api/schedules/client/<client_id>` - Programaciones por cliente

## Ejemplos de Uso

### Crear un Cliente
```bash
curl -X POST http://127.0.0.1:5000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel Central Plaza",
    "email": "contacto@hotelcentral.com",
    "phone": "+1-555-0123",
    "address": "Calle Principal 123, Centro, Ciudad"
  }'
```

### Crear un Empleado
```bash
curl -X POST http://127.0.0.1:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María González",
    "email": "maria.gonzalez@limpiezas.com",
    "phone": "+1-555-0456",
    "position": "cleaner",
    "hourly_rate": 15.50
  }'
```

### Crear un Servicio
```bash
curl -X POST http://127.0.0.1:5000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Limpieza General de Oficinas",
    "description": "Limpieza completa de espacios de oficina",
    "base_price": 120.00,
    "estimated_duration": 180
  }'
```

### Programar un Trabajo
```bash
curl -X POST http://127.0.0.1:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "employee_id": 1,
    "service_id": 1,
    "scheduled_date": "2024-01-15T00:00:00",
    "start_time": "09:00",
    "end_time": "12:00",
    "notes": "Primera limpieza del mes"
  }'
```

## Modelos de Datos

### Cliente (Client)
- `id`: Identificador único
- `name`: Nombre del cliente
- `email`: Correo electrónico
- `phone`: Número de teléfono
- `address`: Dirección
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

### Empleado (Employee)
- `id`: Identificador único
- `name`: Nombre del empleado
- `email`: Correo electrónico
- `phone`: Número de teléfono
- `position`: Posición (cleaner, supervisor, manager)
- `hourly_rate`: Tarifa por hora
- `is_active`: Estado activo/inactivo
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

### Servicio (Service)
- `id`: Identificador único
- `name`: Nombre del servicio
- `description`: Descripción del servicio
- `base_price`: Precio base
- `estimated_duration`: Duración estimada en minutos
- `is_active`: Estado activo/inactivo
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

### Programación (Schedule)
- `id`: Identificador único
- `client_id`: Referencia al cliente
- `employee_id`: Referencia al empleado
- `service_id`: Referencia al servicio
- `scheduled_date`: Fecha programada
- `start_time`: Hora de inicio
- `end_time`: Hora de finalización
- `status`: Estado (scheduled, in_progress, completed, cancelled)
- `notes`: Notas adicionales
- `actual_duration`: Duración real en minutos
- `final_price`: Precio final
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

## Estados de Programación

- `scheduled`: Programado
- `in_progress`: En progreso
- `completed`: Completado
- `cancelled`: Cancelado

## Posiciones de Empleados

- `cleaner`: Limpiador/a
- `supervisor`: Supervisor/a
- `manager`: Gerente

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte, contactar a través de los issues del repositorio en GitHub.