import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { PlusIcon, PencilIcon, TrashIcon, PhoneIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import InputMask from 'react-input-mask';

const Tenants = () => {
  const { tenants, addTenant, updateTenant, deleteTenant, contracts, darkMode } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    cpf: '',
    rg: '',
    profession: '',
    income: '',
    notes: ''
  });

  const handleOpenModal = (tenant = null) => {
    if (tenant) {
      setCurrentTenant(tenant);
      setFormData({
        firstName: tenant.firstName || '',
        lastName: tenant.lastName || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        cpf: tenant.cpf || '',
        rg: tenant.rg || '',
        profession: tenant.profession || '',
        income: tenant.income ? tenant.income.toString() : '',
        notes: tenant.notes || ''
      });
    } else {
      setCurrentTenant(null);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        cpf: '',
        rg: '',
        profession: '',
        income: '',
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
      const tenantData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        cpf: formData.cpf.trim(),
        rg: formData.rg.trim(),
        profession: formData.profession.trim(),
        income: formData.income ? parseFloat(formData.income) : undefined,
        notes: formData.notes.trim()
      };
      
      if (currentTenant) {
        await updateTenant(currentTenant._id, tenantData);
      } else {
        await addTenant(tenantData);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar inquilino:', error);
    }
  };

  const handleDelete = async (id) => {
    // Verificar se o inquilino tem contratos ativos
    const hasActiveContracts = contracts.some(c => 
      c.tenantId === id && (c.status === 'Ativo' || c.status === 'Pendente')
    );
    
    if (hasActiveContracts) {
      alert('Este inquilino possui contratos ativos. Encerre todos os contratos antes de excluir o inquilino.');
      return;
    }
    
    if (window.confirm('Tem certeza que deseja excluir este inquilino?')) {
      try {
        await deleteTenant(id);
      } catch (error) {
        console.error('Erro ao excluir inquilino:', error);
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Obter contratos ativos para cada inquilino
  const getTenantContracts = (tenantId) => {
    return contracts.filter(c => c.tenantId === tenantId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inquilinos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Inquilino
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => {
          const tenantContracts = getTenantContracts(tenant._id);
          const activeContracts = tenantContracts.filter(c => 
            c.status === 'Ativo' || c.status === 'Pendente'
          );
          
          return (
            <div 
              key={tenant._id} 
              className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg">
                    {tenant.firstName.charAt(0)}{tenant.lastName.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold">{tenant.firstName} {tenant.lastName}</h2>
                    {tenant.profession && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{tenant.profession}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {tenant.phone && (
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>{tenant.phone}</span>
                    </div>
                  )}
                  
                  {tenant.email && (
                    <div className="flex items-center text-sm">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>{tenant.email}</span>
                    </div>
                  )}
                  
                  {tenant.cpf && (
                    <div className="flex items-center text-sm">
                      <UserCircleIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span>CPF: {tenant.cpf}</span>
                    </div>
                  )}
                  
                  {tenant.income && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium">Renda: {formatCurrency(tenant.income)}</span>
                    </div>
                  )}
                </div>
                
                <div className={`text-sm p-2 rounded ${activeContracts.length > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {activeContracts.length > 0 
                    ? `${activeContracts.length} contrato${activeContracts.length > 1 ? 's' : ''} ativo${activeContracts.length > 1 ? 's' : ''}` 
                    : 'Sem contratos ativos'}
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleOpenModal(tenant)}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tenant._id)}
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

      {tenants.length === 0 && (
        <div className={`p-8 text-center rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <p className="text-gray-500 dark:text-gray-400">Nenhum inquilino cadastrado.</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Adicionar Primeiro Inquilino
          </button>
        </div>
      )}

      {/* Modal para Adicionar/Editar Inquilino */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-xl font-semibold mb-4">
              {currentTenant ? 'Editar Inquilino' : 'Novo Inquilino'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome*
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="Nome"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sobrenome*
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="Sobrenome"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone*
                  </label>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={formData.phone}
                    onChange={handleChange}
                    name="phone"
                    required
                  >
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        type="tel"
                        className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        placeholder="(00) 00000-0000"
                      />
                    )}
                  </InputMask>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CPF
                  </label>
                  <InputMask
                    mask="999.999.999-99"
                    value={formData.cpf}
                    onChange={handleChange}
                    name="cpf"
                  >
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        type="text"
                        className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        placeholder="000.000.000-00"
                      />
                    )}
                  </InputMask>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    RG
                  </label>
                  <input
                    type="text"
                    name="rg"
                    value={formData.rg}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="00.000.000-0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profissão
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="Profissão"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Renda Mensal (R$)
                  </label>
                  <input
                    type="number"
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
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
                  placeholder="Observações adicionais sobre o inquilino"
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

export default Tenants;