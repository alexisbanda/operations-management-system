import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Planner } from './pages/Planner';
import { Reports } from './pages/Reports';
import { Configuration } from './pages/Configuration';
import { User, UserRole, Client, Building, Unit, Employee, CleaningJob, SystemConfig, Team } from './types';
import * as api from './services/api';
import { LoginPage } from './pages/LoginPage';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const pageTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    planner: 'Planificador',
    reports: 'Reportes',
    config: 'Configuración del Sistema',
};

const typeNames: { [key: string]: string } = {
    clients: 'Cliente',
    buildings: 'Edificio',
    units: 'Unidad',
    employees: 'Empleado',
    teams: 'Equipo'
};

const AppContent: React.FC = () => {
    const { addToast } = useNotification();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Data states
    const [clients, setClients] = useState<Client[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [jobs, setJobs] = useState<CleaningJob[]>([]);
    const [config, setConfig] = useState<SystemConfig | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clientsData, buildingsData, unitsData, employeesData, jobsData, configData, teamsData] = await Promise.all([
                api.clientApi.getAll(),
                api.buildingApi.getAll(),
                api.unitApi.getAll(), 
                api.employeeApi.getAll(),
                api.getCleaningJobs(),
                api.getSystemConfig(),
                api.teamApi.getAll()
            ]);
            setClients(clientsData);
            setBuildings(buildingsData);
            setUnits(unitsData);
            setEmployees(employeesData);
            setJobs(jobsData);
            setConfig(configData);
            setTeams(teamsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
            addToast('Error al cargar los datos iniciales', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Listener de Firebase Auth: se ejecuta al cargar la app y cada vez que el estado de auth cambia.
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Usuario ha iniciado sesión.
                // Obtenemos su perfil desde la colección 'users' en Firestore.
                const userProfile = await api.getUserProfile(firebaseUser.uid);

                if (userProfile) {
                    // Si el perfil existe, lo establecemos como el usuario actual.
                    setCurrentUser(userProfile);
                } else {
                    // El usuario está autenticado pero no tiene un perfil en nuestra base de datos.
                    // Por seguridad, cerramos su sesión.
                    console.warn(`Usuario ${firebaseUser.email} no tiene perfil en la base de datos. Cerrando sesión.`);
                    addToast('No tienes permiso para acceder a este sistema.', 'error');
                    signOut(auth);
                }
            } else {
                // Usuario ha cerrado sesión.
                setCurrentUser(null);
            }
        });

        return () => unsubscribe(); // Limpiar el listener al desmontar el componente.
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchData();
            // Set initial page based on user role
            if (currentUser.role === UserRole.WORKER) {
                setCurrentPage('planner');
            } else {
                setCurrentPage('dashboard');
            }
        }
    }, [currentUser]);

    const handleLogout = () => {
        signOut(auth);
    }
    
    const handleSaveConfig = async (newConfig: SystemConfig) => {
        try {
            const savedConfig = await api.saveSystemConfig(newConfig);
            setConfig(savedConfig);
            addToast('Configuración guardada con éxito', 'success');
        } catch (error) {
             console.error("Failed to save config", error);
             addToast('Error al guardar la configuración', 'error');
        }
    };
    
    const handleAddNewJob = async (jobData: Omit<CleaningJob, 'id' | 'estimated_hours'>) => {
        try {
            // Use the new recurrent jobs function
            const newJobs = await api.addRecurrentCleaningJobs(jobData);
            
            // Add all new jobs to the state
            setJobs(prevJobs => [...prevJobs, ...newJobs].sort((a, b) => a.job_date.getTime() - b.job_date.getTime()));
            
            if (newJobs.length === 1) {
                addToast('Servicio agendado correctamente', 'success');
            } else {
                addToast(`${newJobs.length} servicios recurrentes agendados correctamente`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error("Failed to add new job(s)", error);
            addToast('Error al agendar el servicio', 'error');
            return false;
        }
    };

    const handleUpdateJob = async (jobId: string, updates: Partial<CleaningJob>) => {
        try {
            const updatedJob = await api.updateCleaningJob(jobId, updates);
            setJobs(prevJobs => prevJobs.map(job => job.id === jobId ? updatedJob : job));
            addToast('Servicio actualizado correctamente', 'success');
            return true;
        } catch (error) {
            console.error("Failed to update job", error);
            addToast('Error al actualizar el servicio', 'error');
            return false;
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        try {
            await api.deleteCleaningJob(jobId);
            setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
            addToast('Servicio eliminado correctamente', 'success');
            return true;
        } catch (error) {
            console.error("Failed to delete job", error);
            addToast('Error al eliminar el servicio', 'error');
            return false;
        }
    };
    
    // --- GENERIC CRUD HANDLERS ---
    const getApiForType = (type: string) => {
        switch (type) {
            case 'clients': return api.clientApi;
            case 'buildings': return api.buildingApi;
            case 'units': return api.unitApi;
            case 'employees': return api.employeeApi;
            case 'teams': return api.teamApi;
            default: throw new Error(`Invalid API type: ${type}`);
        }
    };

    const getStateSetterForType = (type: string) => {
        switch (type) {
            case 'clients': return setClients;
            case 'buildings': return setBuildings;
            case 'units': return setUnits;
            case 'employees': return setEmployees;
            case 'teams': return setTeams;
            default: throw new Error(`Invalid state type: ${type}`);
        }
    };

    const handleAddItem = async (type: string, item: any) => {
        try {
            const api = getApiForType(type);
            const newItem = await api.add(item);
            const setter = getStateSetterForType(type);
            setter((prev: any[]) => [...prev, newItem]);
            addToast(`${typeNames[type]} agregado con éxito`, 'success');
        } catch (error) {
            console.error(`Failed to add item of type ${type}`, error);
            addToast(`Error al agregar ${typeNames[type].toLowerCase()}`, 'error');
        }
    };

    const handleUpdateItem = async (type: string, id: string, updates: any) => {
        try {
            const api = getApiForType(type);
            const updatedItem = await api.update(id, updates);
            const setter = getStateSetterForType(type);
            setter((prev: any[]) => prev.map(item => item.id === id ? updatedItem : item));
            addToast(`${typeNames[type]} actualizado con éxito`, 'success');
        } catch (error) {
            console.error(`Failed to update item of type ${type}`, error);
            addToast(`Error al actualizar ${typeNames[type].toLowerCase()}`, 'error');
        }
    };

    const handleDeleteItem = async (type: string, id: string) => {
        try {
            const api = getApiForType(type);
            await api.delete(id);
            const setter = getStateSetterForType(type);
            setter((prev: any[]) => prev.filter(item => item.id !== id));
            addToast(`${typeNames[type]} eliminado con éxito`, 'success');
        } catch (error) {
            console.error(`Failed to delete item of type ${type}`, error);
            addToast(`Error al eliminar ${typeNames[type].toLowerCase()}`, 'error');
        }
    };
    
    const handleNavigate = (page: string) => {
        setCurrentPage(page);
        setSidebarOpen(false); // Close sidebar on navigation
    }

    const renderPage = () => {
        if (loading || !config) {
            return <div className="p-6 text-center text-gray-500">Cargando datos del sistema...</div>;
        }
        switch (currentPage) {
            case 'dashboard':
                if (currentUser?.role === UserRole.WORKER) {
                    return <div>Acceso denegado</div>;
                }
                return <Dashboard jobs={jobs} units={units} buildings={buildings} employees={employees} config={config} />;
            case 'planner':
                return <Planner jobs={jobs} units={units} employees={employees} teams={teams} buildings={buildings} config={config} onAddJob={handleAddNewJob} onUpdateJob={handleUpdateJob} onDeleteJob={handleDeleteJob} currentUser={currentUser} />;
            case 'reports':
                return <Reports jobs={jobs} units={units} config={config} clients={clients} buildings={buildings} currentUser={currentUser}/>;
            case 'config':
                if (currentUser?.role === UserRole.ADMIN) {
                    return <Configuration 
                                clients={clients} 
                                buildings={buildings} 
                                units={units} 
                                employees={employees}
                                teams={teams} 
                                config={config} 
                                onSaveConfig={handleSaveConfig}
                                onAddItem={handleAddItem}
                                onUpdateItem={handleUpdateItem}
                                onDeleteItem={handleDeleteItem}
                            />;
                }
                return <div>Acceso denegado</div>;
            default:
                if (currentUser?.role === UserRole.WORKER) {
                    return <Planner jobs={jobs} units={units} employees={employees} teams={teams} buildings={buildings} config={config} onAddJob={handleAddNewJob} onUpdateJob={handleUpdateJob} onDeleteJob={handleDeleteJob} currentUser={currentUser} />;
                }
                return <Dashboard jobs={jobs} units={units} buildings={buildings} employees={employees} config={config}/>;
        }
    };

    if (!currentUser) {
        return <LoginPage />;
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar user={currentUser} currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
            <main className="flex-1 flex flex-col md:ml-64">
                <Header title={pageTitles[currentPage] || 'SGO'} onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <div className="flex-1 overflow-y-auto">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <NotificationProvider>
            <AppContent />
        </NotificationProvider>
    );
};


export default App;