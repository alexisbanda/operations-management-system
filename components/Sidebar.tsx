import React from 'react';
import { User, UserRole } from '../types';
import { DashboardIcon, PlannerIcon, ReportsIcon, ConfigIcon, LogoutIcon } from './icons';

interface SidebarProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
      isActive
        ? 'bg-brand-secondary text-white shadow-md'
        : 'text-white hover:bg-brand-secondary/50'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ user, currentPage, onNavigate, onLogout, isOpen, setOpen }) => {
  return (
    <>
      <aside 
        className={`w-64 bg-brand-primary text-white flex flex-col h-screen fixed z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-brand-secondary/30">
          <h1 className="text-2xl font-bold text-center text-accent">SGO</h1>
          <p className="text-center text-sm text-brand-light mt-1">Gestión de Operaciones</p>
        </div>
        <nav className="flex-1 p-4">
          <ul>
            {user.role !== UserRole.WORKER && (
              <NavItem
                icon={<DashboardIcon />}
                label="Dashboard"
                isActive={currentPage === 'dashboard'}
                onClick={() => onNavigate('dashboard')}
              />
            )}
            <NavItem
              icon={<PlannerIcon />}
              label="Planificador"
              isActive={currentPage === 'planner'}
              onClick={() => onNavigate('planner')}
            />
            <NavItem
              icon={<ReportsIcon />}
              label="Reportes"
              isActive={currentPage === 'reports'}
              onClick={() => onNavigate('reports')}
            />
            {user.role === UserRole.ADMIN && (
              <NavItem
                icon={<ConfigIcon />}
                label="Configuración"
                isActive={currentPage === 'config'}
                onClick={() => onNavigate('config')}
              />
            )}
          </ul>
        </nav>
        <div className="p-4 border-t border-brand-secondary/30">
           <div className="text-center mb-4">
               <p className="font-semibold text-white">{user.email}</p>
               <p className="text-xs text-brand-light capitalize">{user.role}</p>
           </div>
           <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-3 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-colors duration-200"
            >
              <LogoutIcon />
              <span className="ml-3 font-medium">Cerrar Sesión</span>
           </button>
        </div>
      </aside>
      {isOpen && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden"></div>}
    </>
  );
};