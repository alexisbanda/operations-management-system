import React, { useState, useMemo } from 'react';
import { BuildingIcon, ClientIcon, ConfigIcon, UnitIcon, UsersIcon } from '../components/icons';
import { Client, Building, Unit, Employee, SystemConfig, Team } from '../types';
import * as api from '../services/api';
import { Modal } from '../components/Modal';

// --- FORM COMPONENTS ---

const ClientForm: React.FC<{ item: Partial<Client> | null; onSave: (data: any) => void; onCancel: () => void; }> = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        contact_info: item?.contact_info || '',
        phone: item?.phone || '',
        email: item?.email || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Información de Contacto</label>
                <input type="text" name="contact_info" value={formData.contact_info} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
            </div>
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary">Guardar</button>
            </div>
        </form>
    );
};

const BuildingForm: React.FC<{ item: Partial<Building> | null; clients: Client[]; onSave: (data: any) => void; onCancel: () => void; }> = ({ item, clients, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        address: item?.address || '',
        client_ids: item?.client_ids || [],
        access_code: item?.access_code || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => (option as HTMLOptionElement).value);
        setFormData(prev => ({ ...prev, client_ids: selectedOptions }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Edificio</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Código de Acceso</label>
                <input type="text" name="access_code" value={formData.access_code} onChange={handleChange} placeholder="Código para acceder al edificio" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Clientes Asociados</label>
                <select multiple name="client_ids" value={formData.client_ids} onChange={handleClientChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 h-32 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary">
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </div>
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary">Guardar</button>
            </div>
        </form>
    );
};

const UnitForm: React.FC<{ item: Partial<Unit> | null; buildings: Building[]; onSave: (data: any) => void; onCancel: () => void; }> = ({ item, buildings, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name_identifier: item?.name_identifier || '',
        building_id: item?.building_id || '',
        square_meters: item?.square_meters || 0,
        room_count: item?.room_count || 0,
        bathroom_count: item?.bathroom_count || 0,
        floor_type: item?.floor_type || '',
        has_large_windows: item?.has_large_windows || false,
        fixed_price: item?.fixed_price || 0,
        access_code: item?.access_code || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: type === 'number' ? parseFloat(value) : value });
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Identificador</label>
                    <input type="text" name="name_identifier" value={formData.name_identifier} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Edificio</label>
                    <select name="building_id" value={formData.building_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary">
                        <option value="">Seleccione un edificio</option>
                        {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Metros Cuadrados (m²)</label>
                    <input type="number" name="square_meters" value={formData.square_meters} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">N° Habitaciones</label>
                    <input type="number" name="room_count" value={formData.room_count} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">N° Baños</label>
                    <input type="number" name="bathroom_count" value={formData.bathroom_count} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Piso</label>
                    <input type="text" name="floor_type" value={formData.floor_type} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Precio Fijo ($)</label>
                    <input type="number" step="0.01" name="fixed_price" value={formData.fixed_price} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Código de Acceso</label>
                    <input type="text" name="access_code" value={formData.access_code} onChange={handleChange} placeholder="Código para acceder a la unidad" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div className="flex items-center pt-6">
                    <input type="checkbox" name="has_large_windows" checked={formData.has_large_windows} onChange={handleChange} className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-secondary" />
                    <label className="ml-2 block text-sm text-gray-900">Tiene ventanales grandes</label>
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary">Guardar</button>
            </div>
        </form>
    );
};

const EmployeeForm: React.FC<{ item: Partial<Employee> | null; onSave: (data: any) => void; onCancel: () => void; }> = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: item?.name || '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Empleado</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
            </div>
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary">Guardar</button>
            </div>
        </form>
    );
};

const TeamForm: React.FC<{ item: Partial<Team> | null; employees: Employee[]; onSave: (data: any) => void; onCancel: () => void; }> = ({ item, employees, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        employee_ids: item?.employee_ids || [],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => (option as HTMLOptionElement).value);
        setFormData(prev => ({ ...prev, employee_ids: selectedOptions }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.employee_ids.length < 2) {
            alert('Un equipo debe tener al menos 2 empleados.');
            return;
        }
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Equipo</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Miembros del Equipo</label>
                <select multiple name="employee_ids" value={formData.employee_ids} onChange={handleEmployeeChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 h-40 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary">
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Seleccione 2 o más empleados (mantenga Ctrl o Cmd para selección múltiple).</p>
            </div>
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary">Guardar</button>
            </div>
        </form>
    );
};


// --- CRUD SECTION ---

const CrudSection: React.FC<{ 
    title: string; 
    data: any[]; 
    columns: { key: string, label: string }[];
    onAdd: () => void;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
}> = ({ title, data, columns, onAdd, onEdit, onDelete }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
                <button onClick={onAdd} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors">
                    + Agregar
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {columns.map(col => <th key={col.key} scope="col" className="px-6 py-3 whitespace-nowrap">{col.label}</th>)}
                             <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                {columns.map(col => <td key={col.key} className="px-6 py-4 whitespace-nowrap">{item[col.key]}</td>)}
                                <td className="px-6 py-4 space-x-4 text-right whitespace-nowrap">
                                    <button onClick={() => onEdit(item)} className="font-medium text-brand-secondary hover:underline">Editar</button>
                                    <button onClick={() => onDelete(item.id)} className="font-medium text-red-600 hover:underline">Borrar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const EstimationSettings: React.FC<{config: SystemConfig, onSave: (config: SystemConfig) => void}> = ({ config, onSave }) => {
    const [formState, setFormState] = useState(config);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: parseFloat(e.target.value) });
    };

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Parámetros de Estimación</h3>
            <div className="bg-white shadow-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Minutos por Metro Cuadrado</label>
                    <input type="number" name="minutes_per_sq_meter" value={formState.minutes_per_sq_meter} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Minutos por Habitación</label>
                    <input type="number" name="minutes_per_room" value={formState.minutes_per_room} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Minutos por Baño</label>
                    <input type="number" name="minutes_per_bathroom" value={formState.minutes_per_bathroom} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Minutos extra por Ventanales Grandes</label>
                    <input type="number" name="minutes_for_windows" value={formState.minutes_for_windows} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Costo por Hora de Empleado ($)</label>
                    <input type="number" name="employee_hourly_cost" value={formState.employee_hourly_cost} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button onClick={() => onSave(formState)} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
};

const DangerZone: React.FC<{ onSeed: () => Promise<void> }> = ({ onSeed }) => {
    const [loading, setLoading] = useState(false);

    const handleSeedClick = async () => {
        if (window.confirm('¿Está seguro? Esto cargará datos de prueba en la base de datos y podría sobrescribir información existente.')) {
            setLoading(true);
            try {
                await onSeed();
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="mt-12 p-6 bg-red-50 border-2 border-dashed border-red-300 rounded-lg">
            <h3 className="text-xl font-semibold text-red-800">Zona de Peligro</h3>
            <p className="text-red-600 mt-2 text-sm">
                Las siguientes acciones son destructivas y no se pueden deshacer.
            </p>
            <div className="mt-4">
                <button onClick={handleSeedClick} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400">
                    {loading ? 'Cargando datos...' : 'Cargar Datos de Prueba'}
                </button>
            </div>
        </div>
    );
};

const TABS = [
    { id: 'engine', label: 'Motor Estimación', icon: <ConfigIcon /> },
    { id: 'clients', label: 'Clientes', icon: <ClientIcon /> },
    { id: 'buildings', label: 'Edificios', icon: <BuildingIcon /> },
    { id: 'units', label: 'Unidades', icon: <UnitIcon /> },
    { id: 'employees', label: 'Empleados', icon: <UsersIcon /> },
    { id: 'teams', label: 'Equipos', icon: <UsersIcon /> },
];

type CrudableEntity = Client | Building | Unit | Employee | Team;

interface ConfigurationProps {
    clients: Client[];
    buildings: Building[];
    units: Unit[];
    employees: Employee[];
    teams: Team[];
    config: SystemConfig;
    onSaveConfig: (config: SystemConfig) => void;
    onAddItem: (type: string, item: Omit<CrudableEntity, 'id'>) => Promise<void>;
    onUpdateItem: (type: string, id: string, updates: Partial<CrudableEntity>) => Promise<void>;
    onDeleteItem: (type: string, id: string) => Promise<void>;
}

export const Configuration: React.FC<ConfigurationProps> = (props) => {
    const { clients, buildings, units, employees, teams, config, onSaveConfig, onAddItem, onUpdateItem, onDeleteItem } = props;
    const [activeTab, setActiveTab] = useState('engine');
    const [isSeeding, setIsSeeding] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const teamsWithMemberNames = useMemo(() => {
        return teams.map(team => ({
            ...team,
            memberNames: team.employee_ids
                .map(id => employees.find(e => e.id === id)?.name)
                .filter(Boolean)
                .join(', '),
        }))
    }, [teams, employees]);

    const unitsWithDetails = useMemo(() => {
        return units.map(unit => {
            const building = buildings.find(b => b.id === unit.building_id);
            const buildingName = building?.name || 'N/A';
            
            const clientNames = building?.client_ids
                .map(clientId => clients.find(c => c.id === clientId)?.name)
                .filter(Boolean)
                .join(', ') || 'N/A';

            return {
                ...unit,
                buildingName,
                clientNames,
            };
        });
    }, [units, buildings, clients]);

    const handleOpenModal = (item: any = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data: any) => {
        if (editingItem?.id) {
            await onUpdateItem(activeTab, editingItem.id, data);
        } else {
            await onAddItem(activeTab, data);
        }
        handleCloseModal();
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este elemento?')) {
            await onDeleteItem(activeTab, id);
        }
    };

    const handleSeedDatabase = async () => {
        setIsSeeding(true);
        try {
            await api.seedDatabase();
            alert('¡Datos de prueba cargados con éxito! La página se recargará para mostrar los cambios.');
            window.location.reload();
        } catch (error) {
            console.error("Failed to seed database", error);
            alert('Ocurrió un error al cargar los datos de prueba. Revise la consola.');
        } finally {
            setIsSeeding(false);
        }
    };

    const renderModalContent = () => {
        switch (activeTab) {
            case 'clients':
                return <ClientForm item={editingItem} onSave={handleSave} onCancel={handleCloseModal} />;
            case 'buildings':
                return <BuildingForm item={editingItem} clients={clients} onSave={handleSave} onCancel={handleCloseModal} />;
            case 'units':
                return <UnitForm item={editingItem} buildings={buildings} onSave={handleSave} onCancel={handleCloseModal} />;
            case 'employees':
                return <EmployeeForm item={editingItem} onSave={handleSave} onCancel={handleCloseModal} />;
            case 'teams':
                return <TeamForm item={editingItem} employees={employees} onSave={handleSave} onCancel={handleCloseModal} />;
            default:
                return null;
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'engine':
                return <EstimationSettings config={config} onSave={onSaveConfig} />;
            case 'clients':
                return <CrudSection title="Clientes" data={clients} columns={[{ key: 'name', label: 'Nombre' }, { key: 'contact_info', label: 'Contacto' }, { key: 'phone', label: 'Teléfono' }, { key: 'email', label: 'Email' }]} onAdd={handleOpenModal} onEdit={handleOpenModal} onDelete={handleDelete} />;
            case 'buildings':
                return <CrudSection title="Edificios" data={buildings} columns={[{ key: 'name', label: 'Nombre' }, { key: 'address', label: 'Dirección' }, { key: 'access_code', label: 'Código Acceso' }]} onAdd={handleOpenModal} onEdit={handleOpenModal} onDelete={handleDelete} />;
            case 'units':
                return <CrudSection 
                            title="Unidades" 
                            data={unitsWithDetails} 
                            columns={[
                                { key: 'name_identifier', label: 'Identificador' }, 
                                { key: 'buildingName', label: 'Edificio' },
                                { key: 'clientNames', label: 'Cliente(s)' },
                                { key: 'square_meters', label: 'm²' }, 
                                { key: 'fixed_price', label: 'Precio Fijo' },
                                { key: 'access_code', label: 'Código Acceso' }
                            ]} 
                            onAdd={handleOpenModal} 
                            onEdit={handleOpenModal} 
                            onDelete={handleDelete} 
                        />;
            case 'employees':
                return <CrudSection title="Empleados" data={employees} columns={[{ key: 'name', label: 'Nombre' }]} onAdd={handleOpenModal} onEdit={handleOpenModal} onDelete={handleDelete} />;
            case 'teams':
                return <CrudSection title="Equipos" data={teamsWithMemberNames} columns={[{ key: 'name', label: 'Nombre Equipo' }, { key: 'memberNames', label: 'Miembros' }]} onAdd={handleOpenModal} onEdit={handleOpenModal} onDelete={handleDelete} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-brand-primary text-brand-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <div className="w-5 h-5">{tab.icon}</div>
                                <span className="ml-2">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            {renderContent()}
            {activeTab === 'engine' && <DangerZone onSeed={handleSeedDatabase} />}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`${editingItem ? 'Editar' : 'Agregar'} ${TABS.find(t => t.id === activeTab)?.label || ''}`}>
                {renderModalContent()}
            </Modal>
        </div>
    );
};