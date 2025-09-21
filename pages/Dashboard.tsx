import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CleaningJob, Unit, SystemConfig, JobStatus, Building, Employee } from '../types';

interface DashboardProps {
  jobs: CleaningJob[];
  units: Unit[];
  buildings: Building[];
  employees: Employee[];
  config: SystemConfig;
}

const KPICard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-brand-primary mt-2">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
);

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
           someDate.getMonth() === today.getMonth() &&
           someDate.getFullYear() === today.getFullYear();
};

const getStatusColor = (status: JobStatus): string => {
    switch (status) {
        case JobStatus.SCHEDULED: return 'border-blue-500';
        case JobStatus.COMPLETED: return 'border-green-500';
        case JobStatus.CANCELED: return 'border-red-500';
        default: return 'border-gray-500';
    }
};

export const Dashboard: React.FC<DashboardProps> = ({ jobs, units, buildings, employees, config }) => {
    const completedJobs = jobs.filter(job => job.status === JobStatus.COMPLETED);
    
    const totalRevenue = completedJobs.reduce((acc, job) => {
        const unit = units.find(u => u.id === job.unit_id);
        const revenue = (job.invoiced_price ?? unit?.fixed_price) || 0;
        return acc + revenue;
    }, 0);

    const totalCost = completedJobs.reduce((acc, job) => {
        return acc + (job.actual_hours || 0) * config.employee_hourly_cost;
    }, 0);
    
    const totalProfit = totalRevenue - totalCost;

    const scheduledJobsCount = jobs.filter(j => j.status === JobStatus.SCHEDULED && j.job_date >= new Date()).length;

    const jobsLastMonth = completedJobs.filter(job => {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return job.job_date >= lastMonth;
    });

    const productivitySum = jobsLastMonth.reduce((acc, job) => {
        if (job.actual_hours && job.actual_hours > 0) {
            return acc + (job.estimated_hours / job.actual_hours);
        }
        return acc;
    }, 0);
    const averageProductivity = jobsLastMonth.length > 0 ? ((productivitySum / jobsLastMonth.length) * 100) : 0;


    const chartData = completedJobs.map(job => {
        const unit = units.find(u => u.id === job.unit_id);
        const revenue = (job.invoiced_price ?? unit?.fixed_price) || 0;
        const cost = (job.actual_hours || 0) * config.employee_hourly_cost;
        return {
            name: unit?.name_identifier || 'Unknown',
            Ingreso: revenue,
            Costo: cost,
            Rentabilidad: revenue - cost,
        }
    }).slice(-10); // Last 10 completed jobs

    const todaysJobs = jobs.filter(job => isToday(job.job_date));

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard title="Ingresos Totales" value={`$${totalRevenue.toLocaleString('es-MX')}`} description="De servicios completados" />
                <KPICard title="Rentabilidad Total" value={`$${totalProfit.toLocaleString('es-MX')}`} description="Ingresos menos costos" />
                <KPICard title="Servicios Agendados" value={scheduledJobsCount.toString()} description="Próximos servicios por realizar" />
                <KPICard title="Productividad Promedio" value={`${averageProductivity.toFixed(0)}%`} description="Últimos 30 días (Est vs Real)" />
                <KPICard title="Costo por Hora Promedio" value={`$${config.employee_hourly_cost}`} description="Configuración del sistema" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Servicios de Hoy</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[300px] sm:max-h-[400px]">
                        {todaysJobs.length > 0 ? todaysJobs.map(job => {
                            const unit = units.find(u => u.id === job.unit_id);
                            const building = buildings.find(b => b.id === unit?.building_id);
                            const assignedEmployees = job.assigned_team.map(id => employees.find(e => e.id === id)?.name).filter(Boolean).join(', ');
                            
                            return (
                                <div key={job.id} className={`p-3 rounded-md border-l-4 ${getStatusColor(job.status)} bg-gray-50`}>
                                    <p className="font-bold text-brand-primary text-sm">{unit?.name_identifier}</p>
                                    <p className="text-xs text-gray-500">{building?.name}</p>
                                    <p className="text-xs text-gray-600 mt-2">Equipo: {assignedEmployees}</p>
                                    <p className="text-xs font-semibold text-gray-700 mt-1 capitalize">{job.status}</p>
                                </div>
                            )
                        }) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No hay servicios agendados para hoy.
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Rentabilidad por Servicio (Últimos 10)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Bar dataKey="Ingreso" fill="#1976D2" />
                                <Bar dataKey="Costo" fill="#FFC107" />
                                <Bar dataKey="Rentabilidad" fill="#4CAF50" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};