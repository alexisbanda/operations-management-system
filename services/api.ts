import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { CleaningJob, SystemConfig, User, JobRecurrence } from '../types';
import { mockClients, mockBuildings, mockUnits, mockEmployees, mockTeams, mockCleaningJobs } from './mockApi';

// --- Funciones de Firestore ---

// Helper para convertir las fechas de string (JSON) a objetos Date
const parseJobDates = (job: any): CleaningJob => ({
    ...job,
    // Firestore guarda Timestamps, los convertimos a Date
    job_date: job.job_date.toDate(),
});

/**
 * Obtiene el perfil de un usuario desde la colección 'users' en Firestore.
 * @param uid El ID de usuario de Firebase Authentication.
 * @returns El objeto User o null si no se encuentra.
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
};

export const getCleaningJobs = async (): Promise<CleaningJob[]> => {
    const snapshot = await getDocs(collection(db, 'jobs'));
    return snapshot.docs.map(doc => parseJobDates({ id: doc.id, ...doc.data() }));
};

export const addCleaningJob = async (jobData: Omit<CleaningJob, 'id' | 'estimated_hours'>): Promise<CleaningJob> => {
    // La estimación de horas ahora se haría en el cliente (menos seguro)
    // Por simplicidad, la omitimos aquí. Se puede añadir la lógica del mockApi.
    const docRef = await addDoc(collection(db, 'jobs'), jobData);
    return { ...jobData, id: docRef.id, estimated_hours: 0 }; // Devolvemos un objeto completo
};

export const updateCleaningJob = async (jobId: string, updates: Partial<CleaningJob>): Promise<CleaningJob> => {
    // Filter out undefined values to prevent Firestore errors
    const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, cleanUpdates);
    // Devolvemos un objeto combinado para actualizar el estado local
    return { id: jobId, ...updates } as CleaningJob;
};

export const deleteCleaningJob = async (jobId: string): Promise<{ success: true }> => {
    await deleteDoc(doc(db, 'jobs', jobId));
    return { success: true };
};

// Helper function to generate dates based on recurrence
const generateRecurrentDates = (startDate: Date, endDate: Date, recurrence: JobRecurrence): Date[] => {
    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        dates.push(new Date(current));

        switch (recurrence) {
            case JobRecurrence.DAILY:
                current.setDate(current.getDate() + 1);
                break;
            case JobRecurrence.WEEKLY:
                current.setDate(current.getDate() + 7);
                break;
            case JobRecurrence.BIWEEKLY:
                current.setDate(current.getDate() + 14);
                break;
            case JobRecurrence.MONTHLY:
                current.setMonth(current.getMonth() + 1);
                break;
            default:
                return dates; // Should not reach here for recurrent jobs
        }
    }

    return dates;
};

// Function to create multiple recurrent jobs
export const addRecurrentCleaningJobs = async (jobData: Omit<CleaningJob, 'id' | 'estimated_hours'>): Promise<CleaningJob[]> => {
    const { recurrence, recurrence_end_date, ...baseJobData } = jobData;
    
    if (!recurrence || recurrence === JobRecurrence.NONE || !recurrence_end_date) {
        // Single job, use existing function
        const singleJob = await addCleaningJob(baseJobData);
        return [singleJob];
    }

    // Generate group ID for this series of recurrent jobs
    const recurrence_group_id = `recurrent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate all dates for the recurrence
    const dates = generateRecurrentDates(jobData.job_date, recurrence_end_date, recurrence);
    
    // Create batch to add all jobs at once
    const batch = writeBatch(db);
    const jobsToCreate: CleaningJob[] = [];
    
    dates.forEach(date => {
        const jobRef = doc(collection(db, 'jobs'));
        const jobWithRecurrence = {
            ...baseJobData,
            job_date: date,
            recurrence,
            recurrence_end_date,
            recurrence_group_id,
            estimated_hours: 0 // Will be calculated if needed
        };
        
        batch.set(jobRef, jobWithRecurrence);
        jobsToCreate.push({ id: jobRef.id, ...jobWithRecurrence } as CleaningJob);
    });
    
    // Commit the batch
    await batch.commit();
    
    return jobsToCreate;
};

export const getSystemConfig = async (): Promise<SystemConfig> => {
    // Obtenemos la configuración desde un único documento en la colección 'settings'.
    const configDocRef = doc(db, 'settings', 'main');
    const docSnap = await getDoc(configDocRef);

    if (docSnap.exists()) {
        return docSnap.data() as SystemConfig;
    } else {
        console.warn(
            "Documento de configuración ('settings/main') no encontrado. " +
            "Se usarán valores por defecto. Guarde la configuración desde la página de administración para crear el documento."
        );
        // Devolvemos una configuración por defecto para evitar que la app se bloquee.
        return {
            minutes_per_sq_meter: 0.5,
            minutes_per_room: 15,
            minutes_per_bathroom: 25,
            minutes_for_windows: 30,
            employee_hourly_cost: 20,
        };
    }
};
export const saveSystemConfig = async (config: SystemConfig): Promise<SystemConfig> => {
    // Guardamos la configuración en el mismo documento. setDoc lo creará si no existe o lo sobrescribirá.
    const configDocRef = doc(db, 'settings', 'main');
    await setDoc(configDocRef, config);
    return config;
};

/**
 * Carga los datos de prueba (mock data) en la base de datos de Firestore.
 * Utiliza los IDs predefinidos para mantener las relaciones.
 * ¡ADVERTENCIA: Esto sobrescribirá los documentos existentes con los mismos IDs!
 */
export const seedDatabase = async () => {
    const collectionsToSeed: { [key: string]: any[] } = {
        clients: mockClients,
        buildings: mockBuildings,
        units: mockUnits,
        employees: mockEmployees,
        teams: mockTeams,
        jobs: mockCleaningJobs,
    };

    const batch = writeBatch(db);

    for (const [collectionName, data] of Object.entries(collectionsToSeed)) {
        for (const item of data) {
            const docRef = doc(db, collectionName, item.id);
            batch.set(docRef, item);
        }
    }
    await batch.commit();
};
// --- Generic CRUD API Service Factory ---

const createCrudApiService = <T extends { id: string }>(resource: string) => ({
    getAll: async (): Promise<T[]> => {
        const snapshot = await getDocs(collection(db, resource));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    },
    add: async (item: Omit<T, 'id'>): Promise<T> => {
        const docRef = await addDoc(collection(db, resource), item as DocumentData);
        return { id: docRef.id, ...item } as T;
    },
    update: async (id: string, updates: Partial<T>): Promise<T> => {
        const docRef = doc(db, resource, id);
        await updateDoc(docRef, updates as DocumentData);
        return { id, ...updates } as T;
    },
    delete: async (id: string): Promise<{ success: true }> => {
        await deleteDoc(doc(db, resource, id));
        return { success: true };
    },
});

export const clientApi = createCrudApiService('clients');
export const buildingApi = createCrudApiService('buildings');
export const unitApi = createCrudApiService('units');
export const employeeApi = createCrudApiService('employees');
export const teamApi = createCrudApiService('teams');