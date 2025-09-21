import { Client, Building, Unit, Employee, CleaningJob, SystemConfig, JobStatus, Team } from '../types';

export let mockClients: Client[] = [
    { id: 'c1', name: 'Tech Solutions Inc.', contact_info: 'contact@techsolutions.com' },
    { id: 'c2', name: 'Global Properties', contact_info: 'manager@globalprop.net' },
];

export let mockBuildings: Building[] = [
    { id: 'b1', name: 'Edificio Quantum', address: 'Av. Principal 123', client_ids: ['c1'] },
    { id: 'b2', name: 'Torre Centinela', address: 'Calle Secundaria 456', client_ids: ['c2'] },
];

export let mockUnits: Unit[] = [
    { id: 'u1', name_identifier: 'Piso 5, Of. 501', building_id: 'b1', square_meters: 150, room_count: 5, bathroom_count: 2, floor_type: 'Alfombra', has_large_windows: true, fixed_price: 300 },
    { id: 'u2', name_identifier: 'Piso 10, Apto 10A', building_id: 'b2', square_meters: 80, room_count: 2, bathroom_count: 1, floor_type: 'Madera', has_large_windows: false, fixed_price: 150 },
    { id: 'u3', name_identifier: 'Piso 10, Apto 10B', building_id: 'b2', square_meters: 95, room_count: 3, bathroom_count: 2, floor_type: 'Porcelanato', has_large_windows: true, fixed_price: 180 },
];

export let mockEmployees: Employee[] = [
    { id: 'e1', name: 'Ana García' },
    { id: 'e2', name: 'Carlos Rodriguez' },
    { id: 'e3', name: 'Lucía Martinez' },
    { id: 'e4', name: 'Javier Fernandez' },
];

export let mockTeams: Team[] = [
    { id: 't1', name: 'Equipo Alpha', employee_ids: ['e1', 'e2'] },
    { id: 't2', name: 'Equipo Nocturno', employee_ids: ['e3', 'e4'] },
];

export let mockSystemConfig: SystemConfig = {
    minutes_per_sq_meter: 0.5,
    minutes_per_room: 15,
    minutes_per_bathroom: 25,
    minutes_for_windows: 30,
    employee_hourly_cost: 20,
};

const today = new Date();
// Helper to create dates relative to today, but at midnight (no time component)
const d = (days: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);


export let mockCleaningJobs: CleaningJob[] = [
    // --- THIS WEEK ---
    // Past
    { id: 'j10', unit_id: 'u1', job_date: d(-5), status: JobStatus.COMPLETED, estimated_hours: 4, actual_hours: 4.5, assigned_team: ['e1', 'e4'], invoiced_price: 320, notes: 'Se usaron productos especiales para la alfombra.' },
    { id: 'j11', unit_id: 'u2', job_date: d(-4), status: JobStatus.CANCELED, estimated_hours: 2.5, assigned_team: ['e2', 'e3'] },
    { id: 'j2', unit_id: 'u2', job_date: d(-2), status: JobStatus.COMPLETED, estimated_hours: 2, actual_hours: 2.5, assigned_team: ['e3'], invoiced_price: 150 },
    { id: 'j5', unit_id: 'u2', job_date: d(-1), status: JobStatus.COMPLETED, estimated_hours: 2.5, actual_hours: 2.5, assigned_team: ['e1'], invoiced_price: 160 },
    
    // Today
    { id: 'j3', unit_id: 'u3', job_date: d(0), status: JobStatus.SCHEDULED, estimated_hours: 3, assigned_team: ['e1', 'e3'], notes: 'Cliente pide empezar por los baños. Dejar la llave en recepción.' },
    { id: 'j4', unit_id: 'u1', job_date: d(0), status: JobStatus.SCHEDULED, estimated_hours: 4, assigned_team: ['e2', 'e4'] },

    // Future
    { id: 'j1', unit_id: 'u1', job_date: d(1), status: JobStatus.SCHEDULED, estimated_hours: 4.5, assigned_team: ['e1', 'e2'] },
    { id: 'j15', unit_id: 'u2', job_date: d(2), status: JobStatus.SCHEDULED, estimated_hours: 2, assigned_team: ['e2'], notes: 'Entrada por la puerta de servicio.' },
    { id: 'j6', unit_id: 'u3', job_date: d(3), status: JobStatus.SCHEDULED, estimated_hours: 3, assigned_team: ['e4'] },
    { id: 'j16', unit_id: 'u1', job_date: d(3), status: JobStatus.SCHEDULED, estimated_hours: 4, assigned_team: ['e1', 'e4'] },
    { id: 'j7', unit_id: 'u1', job_date: d(5), status: JobStatus.SCHEDULED, estimated_hours: 4.5, assigned_team: ['e1', 'e2', 'e3'] },
    
    // --- FURTHER OUT ---
    { id: 'j8', unit_id: 'u2', job_date: d(8), status: JobStatus.SCHEDULED, estimated_hours: 2, assigned_team: ['e3', 'e4'] },
    { id: 'j9', unit_id: 'u3', job_date: d(9), status: JobStatus.SCHEDULED, estimated_hours: 3, assigned_team: ['e1'] },
    { id: 'j12', unit_id: 'u3', job_date: d(20), status: JobStatus.SCHEDULED, estimated_hours: 3, assigned_team: ['e1', 'e2'] },

    // --- OTHER MONTHS ---
    { id: 'j13', unit_id: 'u1', job_date: new Date(new Date().setMonth(today.getMonth() + 1)), status: JobStatus.SCHEDULED, estimated_hours: 4, assigned_team: ['e3', 'e4'] },
    { id: 'j14', unit_id: 'u2', job_date: new Date(new Date().setMonth(today.getMonth() - 1)), status: JobStatus.COMPLETED, estimated_hours: 2, actual_hours: 2, assigned_team: ['e1', 'e3'], invoiced_price: 165 },
];

const simulateApiCall = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 500));
};

// --- API Functions ---

export const getClients = () => simulateApiCall(mockClients);
export const getBuildings = () => simulateApiCall(mockBuildings);
export const getUnits = () => simulateApiCall(mockUnits);
export const getEmployees = () => simulateApiCall(mockEmployees);
export const getSystemConfig = () => simulateApiCall(mockSystemConfig);
export const getCleaningJobs = () => simulateApiCall(mockCleaningJobs);

export const saveSystemConfig = (config: SystemConfig) => {
    mockSystemConfig = config;
    return simulateApiCall(mockSystemConfig);
};

export const addCleaningJob = (jobData: Omit<CleaningJob, 'id' | 'estimated_hours'>) => {
    const unit = mockUnits.find(u => u.id === jobData.unit_id);
    if (!unit) throw new Error("Unit not found");

    let totalMinutes = 0;
    totalMinutes += unit.square_meters * mockSystemConfig.minutes_per_sq_meter;
    totalMinutes += unit.room_count * mockSystemConfig.minutes_per_room;
    totalMinutes += unit.bathroom_count * mockSystemConfig.minutes_per_bathroom;
    if (unit.has_large_windows) {
        totalMinutes += mockSystemConfig.minutes_for_windows;
    }
    const estimated_hours = parseFloat((totalMinutes / 60).toFixed(2));

    const newJob: CleaningJob = {
        ...jobData,
        id: `j${Date.now()}`,
        estimated_hours,
    };
    mockCleaningJobs.push(newJob);
    return simulateApiCall(newJob);
};

export const updateCleaningJob = (jobId: string, updates: Partial<CleaningJob>) => {
    const jobIndex = mockCleaningJobs.findIndex(j => j.id === jobId);
    if (jobIndex === -1) throw new Error("Job not found");
    mockCleaningJobs[jobIndex] = { ...mockCleaningJobs[jobIndex], ...updates };
    return simulateApiCall(mockCleaningJobs[jobIndex]);
};

// Generic CRUD for simplicity
const createCrudOperations = <T extends { id: string },>(collection: T[]) => ({
    getAll: () => simulateApiCall([...collection]),
    add: (item: Omit<T, 'id'>) => {
        const newItem = { ...item, id: `id-${Date.now()}-${Math.random()}` } as T;
        collection.push(newItem);
        return simulateApiCall(newItem);
    },
    update: (id: string, updates: Partial<T>) => {
        const index = collection.findIndex(item => item.id === id);
        if (index === -1) throw new Error("Item not found");
        collection[index] = { ...collection[index], ...updates };
        return simulateApiCall(collection[index]);
    },
    delete: (id: string) => {
        const index = collection.findIndex(item => item.id === id);
        if (index > -1) {
            collection.splice(index, 1);
        }
        return simulateApiCall({ success: true });
    },
});

export const clientApi = createCrudOperations(mockClients);
export const buildingApi = createCrudOperations(mockBuildings);
export const unitApi = createCrudOperations(mockUnits);
export const employeeApi = createCrudOperations(mockEmployees);
export const teamApi = createCrudOperations(mockTeams);