import React, { useState, useMemo, useEffect } from 'react';
import { CleaningJob, Unit, Employee, SystemConfig, JobStatus, Team, Building, User, UserRole } from '../types';
import { Modal } from '../components/Modal';

interface PlannerProps {
  jobs: CleaningJob[];
  units: Unit[];
  employees: Employee[];
  teams: Team[];
  buildings: Building[];
  config: SystemConfig;
  onAddJob: (jobData: Omit<CleaningJob, 'id' | 'estimated_hours'>) => Promise<boolean>;
  onUpdateJob: (jobId: string, updates: Partial<CleaningJob>) => Promise<boolean>;
  onDeleteJob: (jobId: string) => Promise<boolean>;
  currentUser: User | null;
}


const JobForm: React.FC<{
    job: Partial<CleaningJob> | null;
    units: Unit[];
    employees: Employee[];
    teams: Team[];
    onSave: (data: any) => void;
    onCancel: () => void;
    currentUser: User | null;
}> = ({ job, units, employees, teams, onSave, onCancel, currentUser }) => {
    
    const formatDateForInput = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const getDefaultDateTime = () => {
        const now = new Date();
        // Default to 9 AM on the current day
        now.setHours(9, 0, 0, 0);
        return now;
    };

    const [formData, setFormData] = useState({
        unit_id: job?.unit_id || '',
        job_date: job?.job_date ? formatDateForInput(job.job_date) : formatDateForInput(getDefaultDateTime()),
        assigned_team: job?.assigned_team || [],
        notes: job?.notes || '',
        status: job?.status || JobStatus.SCHEDULED,
        actual_hours: job?.actual_hours || undefined,
        invoiced_price: job?.invoiced_price || undefined,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions);
        const newAssignedTeamIds = new Set<string>();

        selectedOptions.forEach(option => {
            const value = (option as HTMLOptionElement).value;
            if (value.startsWith('team-')) {
                const teamId = value.replace('team-', '');
                const team = teams.find(t => t.id === teamId);
                if (team) {
                    team.employee_ids.forEach(empId => newAssignedTeamIds.add(empId));
                }
            } else {
                newAssignedTeamIds.add(value);
            }
        });
        
        setFormData(prev => ({ ...prev, assigned_team: Array.from(newAssignedTeamIds) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const parsedHours = parseFloat(String(formData.actual_hours));
        const parsedPrice = parseFloat(String(formData.invoiced_price));

        const dataToSave = {
            ...formData,
            job_date: new Date(formData.job_date), // Convert string back to Date object
            actual_hours: isNaN(parsedHours) ? null : parsedHours,
            invoiced_price: isNaN(parsedPrice) ? null : parsedPrice,
        };
        onSave(dataToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {currentUser?.role !== UserRole.WORKER && (
                <>
                    <div>
                        <label htmlFor="unit_id" className="block text-sm font-medium text-gray-700">Unidad</label>
                        <select id="unit_id" name="unit_id" value={formData.unit_id} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary">
                            <option value="">Seleccione una unidad</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>{unit.name_identifier}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="job_date" className="block text-sm font-medium text-gray-700">Fecha y Hora del Servicio</label>
                        <input type="datetime-local" id="job_date" name="job_date" value={formData.job_date} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                    </div>
                    <div>
                        <label htmlFor="assigned_team" className="block text-sm font-medium text-gray-700">Equipo Asignado</label>
                        <select 
                            id="assigned_team" 
                            name="assigned_team" 
                            multiple 
                            value={formData.assigned_team} 
                            onChange={handleAssignmentChange} 
                            required 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary h-40"
                        >
                            <optgroup label="Equipos">
                                {teams.map(team => (
                                    <option key={`team-${team.id}`} value={`team-${team.id}`}>{team.name}</option>
                                ))}
                            </optgroup>
                            <optgroup label="Empleados Individuales">
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                </>
            )}
            {currentUser?.role === UserRole.WORKER && job?.id && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">Información del Trabajo</h4>
                    <p><strong>Unidad:</strong> {units.find(u => u.id === formData.unit_id)?.name_identifier}</p>
                    <p><strong>Fecha:</strong> {new Date(formData.job_date).toLocaleString()}</p>
                    <p><strong>Estado:</strong> {formData.status}</p>
                </div>
            )}
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea 
                    id="notes" 
                    name="notes" 
                    rows={3} 
                    value={formData.notes} 
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"
                    placeholder="Añadir comentarios o detalles específicos del servicio..."
                />
            </div>
            {job?.id && currentUser?.role !== UserRole.WORKER && (
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary">
                        {Object.values(JobStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            )}
             {job?.id && formData.status === JobStatus.COMPLETED && currentUser?.role !== UserRole.WORKER && (
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                        <label htmlFor="actual_hours" className="block text-sm font-medium text-gray-700">Horas Reales</label>
                        <input type="number" step="0.1" id="actual_hours" name="actual_hours" value={formData.actual_hours ?? ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                    </div>
                    <div>
                        <label htmlFor="invoiced_price" className="block text-sm font-medium text-gray-700">Valor Facturado ($)</label>
                        <input type="number" step="0.01" id="invoiced_price" name="invoiced_price" value={formData.invoiced_price ?? ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                    </div>
                </div>
            )}
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors">
                    {currentUser?.role === UserRole.WORKER ? 'Actualizar Notas' : 'Guardar'}
                </button>
            </div>
        </form>
    );
};

const getStatusColor = (status: JobStatus): { dot: string; text: string; bg: string } => {
    switch (status) {
        case JobStatus.SCHEDULED: return { dot: 'bg-blue-500', text: 'text-blue-800', bg: 'bg-blue-100' };
        case JobStatus.COMPLETED: return { dot: 'bg-green-500', text: 'text-green-800', bg: 'bg-green-100' };
        case JobStatus.CANCELED: return { dot: 'bg-red-500', text: 'text-red-800', bg: 'bg-red-100' };
        default: return { dot: 'bg-gray-500', text: 'text-gray-800', bg: 'bg-gray-100' };
    }
};

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

type ViewMode = 'calendar' | 'list';
type FilterPeriod = 'day' | 'week' | 'month';

const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = React.useState(false);
    React.useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

export const Planner: React.FC<PlannerProps> = ({ jobs, units, employees, teams, buildings, onAddJob, onUpdateJob, onDeleteJob, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<CleaningJob | null>(null);
    const isDesktop = useMediaQuery('(min-width: 768px)');
    
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');
    
    // State for Calendar View
    const [currentDate, setCurrentDate] = useState(new Date());

    // State for List View
    const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('week');

    const handleOpenModal = (job: CleaningJob | null = null) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedJob(null);
    };

    const handleSaveJob = async (data: any) => {
        if (selectedJob?.id) {
            await onUpdateJob(selectedJob.id, data);
        } else {
            const { status, actual_hours, invoiced_price, ...jobData } = data;
            await onAddJob(jobData);
        }
        handleCloseModal();
    };

    const handleDeleteJob = async (jobId: string) => {
        const job = jobs.find(j => j.id === jobId);
        const unit = units.find(u => u.id === job?.unit_id);
        const unitName = unit?.name_identifier || 'N/A';
        const jobDate = job?.job_date ? new Date(job.job_date).toLocaleDateString() : 'N/A';

        const confirmMessage = `¿Está seguro de que desea eliminar este trabajo?\n\nUnidad: ${unitName}\nFecha: ${jobDate}\n\nEsta acción no se puede deshacer.`;
        
        if (window.confirm(confirmMessage)) {
            await onDeleteJob(jobId);
        }
    };
    
    // --- Calendar View Logic ---
    const calendarDays = useMemo(() => {
        const dayArray = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon...
        const daysInMonth = lastDayOfMonth.getDate();
    
        const jobsByDayOfMonth: { [key: number]: CleaningJob[] } = {};
        jobs.forEach(job => {
            if (job.job_date.getFullYear() === year && job.job_date.getMonth() === month) {
                const day = job.job_date.getDate();
                if (!jobsByDayOfMonth[day]) {
                    jobsByDayOfMonth[day] = [];
                }
                jobsByDayOfMonth[day].push(job);
            }
        });

        for (let i = 0; i < startDayOfWeek; i++) {
            dayArray.push({ date: new Date(year, month, i - startDayOfWeek + 1), isCurrentMonth: false, jobs: [] });
        }
    
        for (let i = 1; i <= daysInMonth; i++) {
            dayArray.push({ date: new Date(year, month, i), isCurrentMonth: true, jobs: (jobsByDayOfMonth[i] || []).sort((a,b) => a.job_date.getTime() - b.job_date.getTime()) });
        }
    
        const totalCells = Math.ceil(dayArray.length / 7) * 7;
        const remainingCells = totalCells < 42 ? 42 - dayArray.length : totalCells - dayArray.length;
        for (let i = 1; i <= remainingCells; i++) {
            dayArray.push({ date: new Date(year, month + 1, i), isCurrentMonth: false, jobs: [] });
        }
    
        return dayArray;
    }, [currentDate, jobs]);

    // --- List View Logic ---
    const groupedJobs = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        let startDate: Date;
        let endDate: Date;

        switch (filterPeriod) {
            case 'day':
                startDate = new Date(now);
                endDate = new Date(now);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'week':
            default:
                const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday is 0
                startDate = new Date(now.setDate(now.getDate() - dayOfWeek));
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                break;
        }
        endDate.setHours(23, 59, 59, 999);

        const filtered = jobs.filter(job => job.job_date >= startDate && job.job_date <= endDate);

        const groups: { [key: string]: CleaningJob[] } = {};
        filtered.forEach(job => {
            const dateKey = job.job_date.toISOString().split('T')[0];
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(job);
        });

        return Object.entries(groups)
            .map(([date, jobs]) => ({ date: new Date(date + 'T00:00:00'), jobs: jobs.sort((a,b) => a.job_date.getTime() - b.job_date.getTime()) }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [jobs, filterPeriod]);

    const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const renderHeader = () => (
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
                 <div className="p-1 bg-gray-200 rounded-lg hidden md:inline-block">
                    <button onClick={() => setViewMode('calendar')} className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'calendar' ? 'bg-white shadow' : 'text-gray-600'}`}>Calendario</button>
                    <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}>Lista</button>
                </div>
                
                {(!isDesktop || viewMode === 'list') && (
                    <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-lg">
                         {(['day', 'week', 'month'] as FilterPeriod[]).map(period => (
                            <button key={period} onClick={() => setFilterPeriod(period)} className={`px-3 py-1 text-sm font-medium rounded-md capitalize ${filterPeriod === period ? 'bg-white shadow' : 'text-gray-600'}`}>{
                                {day: 'Hoy', week: 'Semana', month: 'Mes'}[period]
                            }</button>
                        ))}
                    </div>
                )}
                 {isDesktop && viewMode === 'calendar' && (
                     <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-800 capitalize w-32 text-center">
                            {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">&lt;</button>
                        <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors">&gt;</button>
                        <button onClick={goToToday} className="px-4 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100">Hoy</button>
                    </div>
                )}
            </div>
            {currentUser?.role !== UserRole.WORKER && (
                <button onClick={() => handleOpenModal()} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors shadow-md">
                    + Agendar Servicio
                </button>
            )}
        </div>
    );

    const renderCalendarView = () => (
         <div className="flex-grow grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {WEEK_DAYS.map(day => (
                <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2 bg-gray-50">{day}</div>
            ))}
            {calendarDays.map(({ date, isCurrentMonth, jobs }, index) => {
                const isToday = isSameDay(date, new Date());
                return (
                    <div key={index} className={`relative flex flex-col p-2 min-h-[120px] ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}>
                        <span className={`text-sm font-medium ${isToday ? 'bg-brand-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>
                            {date.getDate()}
                        </span>
                         <div className="mt-1 space-y-1 flex-grow overflow-y-auto">
                            {jobs.slice(0, 2).map(job => {
                                const unit = units.find(u => u.id === job.unit_id);
                                const time = job.job_date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <div key={job.id} onClick={() => handleOpenModal(job)} className="p-1.5 rounded-md bg-brand-light hover:bg-brand-secondary hover:text-white cursor-pointer transition-colors" title={`${time} - ${unit?.name_identifier}`}>
                                         <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${getStatusColor(job.status).dot}`}></span>
                                            <p className="text-xs font-medium text-gray-700 truncate"><span className="font-bold">{time}</span> {unit?.name_identifier || 'Unidad...'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {jobs.length > 2 && (
                                 <div className="text-xs text-blue-600 font-semibold cursor-pointer p-1 hover:underline">+ {jobs.length - 2} más</div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
    
    const renderListView = () => (
        <div className="space-y-6">
            {groupedJobs.map(({ date, jobs }) => (
                <div key={date.toISOString()}>
                    <h3 className="font-semibold text-lg text-gray-700 mb-2 pb-2 border-b-2 border-brand-light">
                        {date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="space-y-4">
                        {jobs.map(job => {
                            const unit = units.find(u => u.id === job.unit_id);
                            const building = buildings.find(b => b.id === unit?.building_id);
                            const assignedEmployees = job.assigned_team.map(id => employees.find(e => e.id === id)?.name).filter(Boolean).join(', ');
                            const statusColors = getStatusColor(job.status);
                            const time = job.job_date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={job.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4" style={{borderColor: statusColors.dot.replace('bg-','').replace('-500','')}}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex-1 cursor-pointer" onClick={() => handleOpenModal(job)}>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors.bg} ${statusColors.text} mb-2 sm:mb-0 self-start`}>{job.status}</span>
                                                <div>
                                                    <p className="font-bold text-brand-primary">{unit?.name_identifier} <span className="font-mono text-sm text-gray-600 font-medium">({time})</span></p>
                                                    <p className="text-sm text-gray-500">{building?.name}</p>
                                                </div>
                                            </div>
                                            {job.notes && <p className="text-sm text-gray-600 mt-3 p-2 bg-yellow-50 rounded-md border-l-2 border-yellow-300">"{job.notes}"</p>}
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                                            <p className="font-semibold text-gray-700">Equipo Asignado:</p>
                                            <p className="text-sm text-gray-600">{assignedEmployees || 'Sin asignar'}</p>
                                            {currentUser?.role === UserRole.ADMIN && (
                                                <div className="flex gap-2 mt-3 justify-start sm:justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenModal(job);
                                                        }}
                                                        className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteJob(job.id);
                                                        }}
                                                        className="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600 transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
             {groupedJobs.length === 0 && <p className="text-center text-gray-500 py-10">No hay servicios agendados para este período.</p>}
        </div>
    );

    return (
        <div className="p-4 md:p-6 flex flex-col h-full">
            {renderHeader()}
            
            <div className="flex-grow">
                {isDesktop && viewMode === 'calendar' ? renderCalendarView() : renderListView()}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedJob ? "Editar Servicio" : "Agendar Nuevo Servicio"}>
                <JobForm job={selectedJob} units={units} employees={employees} teams={teams} onSave={handleSaveJob} onCancel={handleCloseModal} currentUser={currentUser} />
            </Modal>
        </div>
    );
};