import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const {
    properties,
    contracts,
    darkMode,
    getOccupancyRate,
    getMonthlyRevenue,
    getUpcomingRenewals
  } = useContext(AppContext);

  const [stats, setStats] = useState({
    availableProperties: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    renewals: 0
  });

  const [upcomingRenewals, setUpcomingRenewals] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);

  useEffect(() => {
    // Calcular estatísticas
    const availableCount = properties.filter(p => p.status === 'Disponível').length;
    const occupancyRate = getOccupancyRate();
    const monthlyRevenue = getMonthlyRevenue();
    const renewalsCount = getUpcomingRenewals(30).length;

    setStats({
      availableProperties: availableCount,
      occupancyRate: occupancyRate,
      monthlyRevenue: monthlyRevenue,
      renewals: renewalsCount
    });

    // Obter renovações próximas
    setUpcomingRenewals(getUpcomingRenewals(30));

    // Obter imóveis recentes (últimos 3)
    const sorted = [...properties].sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    setRecentProperties(sorted.slice(0, 3));
  }, [properties, contracts, getOccupancyRate, getMonthlyRevenue, getUpcomingRenewals]);

  const chartData = {
    labels: ['Alugados', 'Disponíveis', 'Manutenção'],
    datasets: [
      {
        data: [
          properties.filter(p => p.status === 'Alugado').length,
          properties.filter(p => p.status === 'Disponível').length,
          properties.filter(p => p.status === 'Manutenção').length
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        hoverBackgroundColor: ['#2563EB', '#059669', '#D97706']
      }
    ]
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Imóveis Disponíveis</h2>
          </div>
          <p className="mt-2 text-3xl font-semibold">{stats.availableProperties}</p>
          <p className="mt-2 text-sm text-green-500 flex items-center">
            <ArrowUpIcon className="h-4 w-4 mr-1" />
            De {properties.length} imóveis
          </p>
        </div>

        <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Ocupação</h2>
          </div>
          <p className="mt-2 text-3xl font-semibold">{stats.occupancyRate.toFixed(1)}%</p>
          <p className={`mt-2 text-sm ${stats.occupancyRate > 80 ? 'text-green-500' : 'text-yellow-500'} flex items-center`}>
            {stats.occupancyRate > 80 ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            {stats.occupancyRate > 80 ? 'Alta ocupação' : 'Oportunidade de crescimento'}
          </p>
        </div>

        <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Receita Mensal</h2>
          </div>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(stats.monthlyRevenue)}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            De {contracts.filter(c => c.status === 'Ativo').length} contratos ativos
          </p>
        </div>

        <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contratos a Renovar</h2>
          </div>
          <p className="mt-2 text-3xl font-semibold">{stats.renewals}</p>
          <p className={`mt-2 text-sm ${stats.renewals > 0 ? 'text-amber-500' : 'text-green-500'} flex items-center`}>
            {stats.renewals > 0 ? (
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            )}
            Nos próximos 30 dias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Status */}
        <div className={`lg:col-span-1 rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-lg font-medium mb-4">Status dos Imóveis</h2>
          <div className="h-64">
            <Doughnut 
              data={chartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: darkMode ? '#fff' : '#000'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Renovações Próximas */}
        <div className={`lg:col-span-2 rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Renovações Próximas</h2>
            <Link to="/contracts" className="text-blue-500 text-sm flex items-center">
              Ver todos
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {upcomingRenewals.length > 0 ? (
            <div className="space-y-4">
              {upcomingRenewals.slice(0, 3).map((renewal) => (
                <div 
                  key={renewal._id} 
                  className={`p-4 rounded-lg border-l-4 border-amber-500 ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{renewal.tenantName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{renewal.propertyAddress}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Vence em: {formatDate(renewal.endDate)}</p>
                      <p className="text-amber-500 font-medium">
                        {renewal.daysRemaining <= 0 
                          ? 'Vencido!' 
                          : renewal.daysRemaining === 1 
                            ? 'Vence amanhã!' 
                            : `Vence em ${renewal.daysRemaining} dias`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-6">
              Não há contratos para renovar nos próximos 30 dias.
            </p>
          )}
        </div>
      </div>

      {/* Imóveis Recentes */}
      <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Imóveis Recentes</h2>
          <Link to="/properties" className="text-blue-500 text-sm flex items-center">
            Ver todos
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {recentProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProperties.map((property) => (
              <div 
                key={property._id} 
                className={`rounded-lg shadow p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <div className="bg-gray-200 h-40 rounded-md flex items-center justify-center mb-3">
                  <span className="text-gray-500">Foto do Imóvel</span>
                </div>
                <h3 className="font-medium">{property.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{property.address}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-semibold">{formatCurrency(property.price)}/mês</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    property.status === 'Disponível' 
                      ? 'bg-green-100 text-green-800' 
                      : property.status === 'Alugado' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-amber-100 text-amber-800'
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            Não há imóveis cadastrados. Adicione um imóvel para começar.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;