import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { PlusIcon, PencilIcon, TrashIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Contracts = () => {
  const { 
    contracts, 
    addContract, 
    updateContract, 
    deleteContract, 
    properties, 
    tenants,
    darkMode 
  } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  const [formData, setFormData] = useState({
    propertyId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    deposit: '',
    paymentDay: '',
    status: 'Pendente',
    notes: ''
  });

  // Filtrar propriedades disponíveis para novos contratos
  const availableProperties = properties.filter(p => p.status === 'Disponível');

  const handleOpenModal = (contract = null) => {
    if (contract) {
      setCurrentContract(contract);
      setFormData({
        propertyId: contract.propertyId || '',
        tenantId: contract.tenantId || '',
        startDate: formatDateForInput(contract.startDate) || '',
        endDate: formatDateForInput(contract.endDate) || '',
        monthlyRent: contract.monthlyRent ? contract.monthlyRent.toString() : '',
        deposit: contract.deposit ? contract.deposit.toString() : '',
        paymentDay: contract.paymentDay ? contract.paymentDay.toString() : '',
        status: contract.status || 'Pendente',
        notes: contract.notes || ''
      });
    } else {
      // Para novo contrato, configuramos valores iniciais
      const today = new Date();
      const nextYear = new Date(today);
      nextYear.setFullYear(today.getFullYear() + 1);
      
      setCurrentContract(null);
      setFormData({
        propertyId: availableProperties.length > 0 ? availableProperties[0]._id : '',
        tenantId: tenants.length > 0 ? tenants[0]._id : '',
        startDate: formatDateForInput(today),
        endDate: formatDateForInput(nextYear),
        monthlyRent: '',
        deposit: '',
        paymentDay: '5', // Dia padrão de pagamento
        status: 'Pendente',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const contractData = {
        propertyId: formData.propertyId,
        tenantId: formData.tenantId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        monthlyRent: parseFloat(formData.monthlyRent),
        deposit: formData.deposit ? parseFloat(formData.deposit) : 0,
        paymentDay: formData.paymentDay ? parseInt(formData.paymentDay) : 5,
        status: formData.status,
        notes: formData.notes || ''
      };
      
      if (currentContract) {
        await updateContract(currentContract._id, contractData);
      } else {
        await addContract(contractData);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await deleteContract(id);
      } catch (error) {
        console.error('Erro ao excluir contrato:', error);
      }
    }
  };

  const handleEndContract = async (id) => {
    if (window.confirm('Tem certeza que deseja encerrar este contrato? O imóvel será marcado como disponível.')) {
      try {
        await updateContract(id, { status: 'Encerrado' });
      } catch (error) {
        console.error('Erro ao encerrar contrato:', error);
      }
    }
  };

  // Formatação de datas e valores
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD para input type="date"
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Obter detalhes do imóvel e inquilino
  const getPropertyDetails = (propertyId) => {
    return properties.find(p => p._id === propertyId) || { address: 'Imóvel não encontrado', title: '' };
  };

  const getTenantDetails = (tenantId) => {
    return tenants.find(t => t._id === tenantId) || { firstName: 'Inquilino', lastName: 'não encontrado' };
  };

  // Calcular dias restantes do contrato
  const getDaysRemaining = (endDateString) => {
    if (!endDateString) return null;
    
    const endDate = new Date(endDateString);
    const today = new Date();
    
    // Reset hours to compare just dates
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Pendente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Encerrado': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contratos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
          disabled={availableProperties.length === 0 || tenants.length === 0}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Contrato
        </button>
      </div>

      {/* Mensagem de aviso se não houver imóveis disponíveis ou inquilinos */}
      {(availableProperties.length === 0 || tenants.length === 0) && (
        <div className="mb-6 p-4 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <p>
              {availableProperties.length === 0 
                ? 'Não há imóveis disponíveis para criar novos contratos. Adicione um imóvel ou libere algum imóvel ocupado.' 
                : 'Não há inquilinos cadastrados. Adicione pelo menos um inquilino antes de criar um contrato.'}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {contracts.map((contract) => {
          const property = getPropertyDetails(contract.propertyId);
          const tenant = getTenantDetails(contract.tenantId);
          const daysRemaining = getDaysRemaining(contract.endDate);
          const isExpiring = contract.status === 'Ativo' && daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
          
          return (
            <div 
              key={contract._id} 
              className={`rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} ${
                isExpiring ? 'border-l-4 border-amber-500' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-lg font-semibold">{property.title || property.address}</h2>
                      <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{property.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(contract.monthlyRent)}/mês</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pagamento: dia {contract.paymentDay || 5}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inquilino</p>
                    <p className="font-medium">{tenant.firstName} {tenant.lastName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Período</p>
                    <p>{formatDate(contract.startDate)} a {formatDate(contract.endDate)}</p>
                  </div>
                </div>
                
                {isExpiring && (
                  <div className="mt-4 p-3 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded-md flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>
                      {daysRemaining === 1 
                        ? 'Contrato vence amanhã!' 
                        : `Contrato vence em ${daysRemaining} dias`}
                    </span>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end space-x-2">
                  {contract.status === 'Ativo' && (
                    <button
                      onClick={() => handleEndContract(contract._id)}
                      className="px-3 py-1 text-sm bg-amber-500 text-white rounded-md"
                    >
                      Encerrar
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenModal(contract)}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(contract._id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {contracts.length === 0 && (
        <div className={`p-8 text-center rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <p className="text-gray-500 dark:text-gray-400">Nenhum contrato cadastrado.</p>
          {availableProperties.length > 0 && tenants.length > 0 && (
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Adicionar Primeiro Contrato
            </button>
          )}
        </div>
      )}

      {/* Modal para Adicionar/Editar Contrato */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-xl font-semibold mb-4">
              {currentContract ? 'Editar Contrato' : 'Novo Contrato'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Imóvel*
                  </label>
                  <select
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleChange}
                    required
                    disabled={currentContract}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} ${currentContract ? 'opacity-75' : ''}`}
                  >
                    {currentContract ? (
                      <option value={formData.propertyId}>
                        {getPropertyDetails(formData.propertyId).address}
                      </option>
                    ) : (
                      availableProperties.map(property => (
                        <option key={property._id} value={property._id}>
                          {property.address}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Inquilino*
                  </label>
                  <select
                    name="tenantId"
                    value={formData.tenantId}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    {tenants.map(tenant => (
                      <option key={tenant._id} value={tenant._id}>
                        {tenant.firstName} {tenant.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Início*
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Término*
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor do Aluguel (R$)*
                  </label>
                  <input
                    type="number"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Caução (R$)
                  </label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dia de Pagamento
                  </label>
                  <input
                    type="number"
                    name="paymentDay"
                    value={formData.paymentDay}
                    onChange={handleChange}
                    min="1"
                    max="31"
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="Ex: 5"
                  />
                </div>
              </div>
              
              {currentContract && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Encerrado">Encerrado</option>
                  </select>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Observações adicionais sobre o contrato"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;