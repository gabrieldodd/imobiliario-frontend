import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { AppContext } from '../context/AppContext';

const Sidebar = () => {
  const { darkMode, toggleDarkMode, logout, user } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <ChartBarIcon className="h-6 w-6" /> },
    { name: 'Imóveis', path: '/properties', icon: <BuildingOfficeIcon className="h-6 w-6" /> },
    { name: 'Inquilinos', path: '/tenants', icon: <UsersIcon className="h-6 w-6" /> },
    { name: 'Contratos', path: '/contracts', icon: <DocumentTextIcon className="h-6 w-6" /> },
    { name: 'Ajustes', path: '/settings', icon: <Cog6ToothIcon className="h-6 w-6" /> },
  ];

  return (
    <div className={`w-64 h-full flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="p-5 flex items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold">LocaImóveis</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={`${
                location.pathname === item.path
                  ? `${darkMode ? 'bg-gray-900 text-blue-400' : 'bg-gray-100 text-blue-600'}`
                  : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.company || 'Empresa'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={toggleDarkMode}
            className={`${
              darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
            } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 mr-3 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 mr-3 text-gray-500" />
            )}
            {darkMode ? 'Modo claro' : 'Modo escuro'}
          </button>
          
          <button
            onClick={handleLogout}
            className={`${
              darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
            } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-red-500" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;