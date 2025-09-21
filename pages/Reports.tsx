import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { CleaningJob, Unit, SystemConfig, JobStatus, Client, Building } from '../types';

interface ReportsProps {
  jobs: CleaningJob[];
  units: Unit[];
  config: SystemConfig;
  clients: Client[];
  buildings: Building[];
}

type GroupBy = 'service' | 'client' | 'building';

const COLORS = ['#0D47A1', '#1976D2', '#BBDEFB', '#FFC107', '#FFA000', '#FF6F00'];
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


export const Reports: React.FC<ReportsProps> = ({ jobs, units, config, clients, buildings }) => {
    const [groupBy, setGroupBy] = useState<GroupBy>('service');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const processedData = useMemo(() => {
        const completedJobs = jobs.filter(job => job.status === JobStatus.COMPLETED);

        let filteredJobs = completedJobs;
        if (dateRange.start && dateRange.end) {
            const startDate = new Date(dateRange.start + 'T00:00:00');
            const endDate = new Date(dateRange.end + 'T23:59:59');
            if (startDate <= endDate) {
               filteredJobs = completedJobs.filter(job => job.job_date >= startDate && job.job_date <= endDate);
            }
        }

        const enrichedJobs = filteredJobs.map(job => {
            const unit = units.find(u => u.id === job.unit_id);
            const building = buildings.find(b => b.id === unit?.building_id);
            const client = clients.find(c => building?.client_ids.includes(c.id));
            
            const revenue = (job.invoiced_price ?? unit?.fixed_price) || 0;
            const cost = (job.actual_hours || 0) * config.employee_hourly_cost;
            const profit = revenue - cost;
            
            return {
                ...job,
                unitName: unit?.name_identifier || 'N/A',
                buildingId: building?.id,
                buildingName: building?.name || 'N/A',
                clientId: client?.id,
                clientName: client?.name || 'N/A',
                revenue,
                cost,
                profit,
            };
        });

        if (groupBy === 'service') {
            return enrichedJobs.map(job => {
                 const productivity = job.estimated_hours && job.actual_hours && job.actual_hours > 0 ? ((job.estimated_hours / job.actual_hours) * 100).toFixed(0) + '%' : 'N/A';
                 return {
                    id: job.id,
                    date: job.job_date.toLocaleDateString('es-ES'),
                    unit: job.unitName,
                    revenue: job.revenue,
                    cost: job.cost,
                    profit: job.profit,
                    productivity,
                 }
            }).sort((a,b) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime());
        }
        
        const groupingKey = groupBy === 'client' ? 'clientId' : 'buildingId';
        const grouped = enrichedJobs.reduce((acc, job) => {
            const key = job[groupingKey];
            if (!key) return acc;

            if (!acc[key]) {
                acc[key] = {
                    id: key,
                    name: groupBy === 'client' ? job.clientName : job.buildingName,
                    jobCount: 0,
                    revenue: 0,
                    cost: 0,
                    total_estimated_hours: 0,
                    total_actual_hours: 0,
                };
            }
            acc[key].jobCount += 1;
            acc[key].revenue += job.revenue;
            acc[key].cost += job.cost;
            acc[key].total_estimated_hours += job.estimated_hours || 0;
            acc[key].total_actual_hours += job.actual_hours || 0;

            return acc;
        }, {} as Record<string, any>);
        
        return Object.values(grouped).map((group: any) => {
             const productivity = group.total_actual_hours > 0 ? (group.total_estimated_hours / group.total_actual_hours) * 100 : 0;
             return {
                ...group,
                profit: group.revenue - group.cost,
                productivity: productivity > 0 ? productivity.toFixed(0) + '%' : 'N/A',
             }
        }).sort((a, b) => b.profit - a.profit);

    }, [jobs, units, buildings, clients, config, dateRange, groupBy]);

    const renderChart = () => {
        if (processedData.length === 0) return null;

        if (groupBy === 'client') {
            const chartData = processedData.map(item => ({ name: item.name, value: item.revenue }));
            return (
                <div style={{ width: '100%', height: 300 }}>
                    <h4 className="text-md font-semibold text-gray-600 text-center mb-2">Distribución de Ingresos por Cliente</h4>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )
        }
        if (groupBy === 'building') {
             const chartData = processedData.map(item => ({ name: item.name, Rentabilidad: item.profit }));
            return (
                <div style={{ width: '100%', height: 300 }}>
                     <h4 className="text-md font-semibold text-gray-600 text-center mb-2">Rentabilidad por Edificio</h4>
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                            <Bar dataKey="Rentabilidad">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.Rentabilidad >= 0 ? '#4CAF50' : '#F44336'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )
        }
        return null;
    }
    
    const renderTable = () => {
        if (groupBy === 'service') {
            return (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">Fecha</th>
                                <th className="px-6 py-3 whitespace-nowrap">Unidad</th>
                                <th className="px-6 py-3 whitespace-nowrap">Ingreso</th>
                                <th className="px-6 py-3 whitespace-nowrap">Costo</th>
                                <th className="px-6 py-3 whitespace-nowrap">Rentabilidad</th>
                                <th className="px-6 py-3 whitespace-nowrap">Productividad (Est/Real)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.map(row => (
                                <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{row.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.unit}</td>
                                    <td className="px-6 py-4 text-green-600 whitespace-nowrap">${row.revenue.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-red-600 whitespace-nowrap">${row.cost.toFixed(2)}</td>
                                    <td className={`px-6 py-4 font-bold whitespace-nowrap ${row.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>${row.profit.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{row.productivity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }
        const groupTitle = groupBy === 'client' ? 'Cliente' : 'Edificio';
        return (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 whitespace-nowrap">{groupTitle}</th>
                            <th className="px-6 py-3 whitespace-nowrap">N° Servicios</th>
                            <th className="px-6 py-3 whitespace-nowrap">Ingreso Total</th>
                            <th className="px-6 py-3 whitespace-nowrap">Costo Total</th>
                            <th className="px-6 py-3 whitespace-nowrap">Rentabilidad Total</th>
                            <th className="px-6 py-3 whitespace-nowrap">Productividad Promedio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.map(row => (
                            <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{row.jobCount}</td>
                                <td className="px-6 py-4 text-green-600 whitespace-nowrap">${row.revenue.toFixed(2)}</td>
                                <td className="px-6 py-4 text-red-600 whitespace-nowrap">${row.cost.toFixed(2)}</td>
                                <td className={`px-6 py-4 font-bold whitespace-nowrap ${row.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>${row.profit.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{row.productivity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 border-b pb-4">
                    <h3 className="text-xl font-semibold text-gray-700">Reporte de Rentabilidad</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                         <label className="text-sm">Desde:</label>
                        <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} className="border border-gray-300 rounded-md shadow-sm p-2 w-full sm:w-auto" />
                        <label className="text-sm">Hasta:</label>
                        <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} className="border border-gray-300 rounded-md shadow-sm p-2 w-full sm:w-auto" />
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                     <span className="text-sm font-medium text-gray-600">Agrupar por:</span>
                     <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                        {(['service', 'client', 'building'] as GroupBy[]).map(option => (
                            <button 
                                key={option} 
                                onClick={() => setGroupBy(option)} 
                                className={`px-3 py-1 text-sm font-medium rounded-md capitalize ${groupBy === option ? 'bg-white shadow text-brand-primary' : 'text-gray-600'}`}>
                                {{service: 'Servicio', client: 'Cliente', building: 'Edificio'}[option]}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="mb-8">
                    {renderChart()}
                </div>

                <div>
                    {renderTable()}
                     {processedData.length === 0 && <p className="text-center text-gray-500 py-10">No hay datos para los filtros seleccionados.</p>}
                </div>
            </div>
        </div>
    );
};