import React from 'react';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

const MenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-20 flex items-center">
      <button
        onClick={onToggleSidebar}
        className="text-gray-500 hover:text-gray-700 focus:outline-none md:hidden mr-4"
        aria-label="Abrir menú"
      >
        <MenuIcon />
      </button>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </header>
  );
};