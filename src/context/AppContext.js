import React, { createContext, useState, useEffect } from 'react';
import { authService, propertyService, tenantService, contractService, propertyTypeService } from '../services/api';
import { toast } from 'react-toastify';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Estados globais
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  // Estados para gerenciamento de usuários
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Verificar autenticação ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setAuthenticated(true);
          await loadInitialData();
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Carregar dados iniciais quando o usuário estiver autenticado
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Carregar tipos de imóveis
      const typesResponse = await propertyTypeService.getAll();
      setPropertyTypes(typesResponse.data || []);
      
      // Carregar imóveis
      const propertiesResponse = await propertyService.getAll();
      setProperties(propertiesResponse.data || []);
      
      // Carregar inquilinos
      const tenantsResponse = await tenantService.getAll();
      setTenants(tenantsResponse.data || []);
      
      // Carregar contratos
      const contractsResponse = await contractService.getAll();
      setContracts(contractsResponse.data || []);
      
      // Carregar usuários se for admin
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.role === 'admin') {
        await fetchUsers();
      }
      
      // Carregar preferência de tema
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(savedDarkMode);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Autenticação
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      setUser(response.user);
      setAuthenticated(true);
      await loadInitialData();
      return true;
    } catch (error) {
      console.error('Erro de login:', error);
      toast.error('Email ou senha inválidos.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      setUser(response.user);
      setAuthenticated(true);
      await loadInitialData();
      return true;
    } catch (error) {
      console.error('Erro de registro:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar conta. Por favor, tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setAuthenticated(false);
      setProperties([]);
      setTenants([]);
      setContracts([]);
      setPropertyTypes([]);
      setUsers([]);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Toggle para modo escuro
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  // Funções para gerenciar propriedades
  const addProperty = async (propertyData) => {
    try {
      const response = await propertyService.create(propertyData);
      setProperties([...properties, response.data]);
      toast.success('Imóvel adicionado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar imóvel:', error);
      toast.error(error.response?.data?.error || 'Erro ao adicionar imóvel. Por favor, tente novamente.');
      throw error;
    }
  };

  const updateProperty = async (id, updates) => {
    try {
      const response = await propertyService.update(id, updates);
      setProperties(properties.map(p => 
        p._id === id ? response.data : p
      ));
      toast.success('Imóvel atualizado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar imóvel:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar imóvel. Por favor, tente novamente.');
      throw error;
    }
  };

  const deleteProperty = async (id) => {
    try {
      // Verificar se há contratos ativos para esta propriedade
      const hasActiveContracts = contracts.some(c => 
        c.propertyId === id && (c.status === 'Ativo' || c.status === 'Pendente')
      );
      
      if (hasActiveContracts) {
        toast.error('Não é possível excluir um imóvel com contratos ativos');
        throw new Error('Não é possível excluir um imóvel com contratos ativos');
      }
      
      await propertyService.delete(id);
      setProperties(properties.filter(p => p._id !== id));
      toast.success('Imóvel excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir imóvel:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao excluir imóvel. Por favor, tente novamente.');
      throw error;
    }
  };

  // Funções para gerenciar inquilinos
  const addTenant = async (tenantData) => {
    try {
      const response = await tenantService.create(tenantData);
      setTenants([...tenants, response.data]);
      toast.success('Inquilino adicionado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar inquilino:', error);
      toast.error(error.response?.data?.error || 'Erro ao adicionar inquilino. Por favor, tente novamente.');
      throw error;
    }
  };

  const updateTenant = async (id, updates) => {
    try {
      const response = await tenantService.update(id, updates);
      setTenants(tenants.map(t => 
        t._id === id ? response.data : t
      ));
      toast.success('Inquilino atualizado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar inquilino:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar inquilino. Por favor, tente novamente.');
      throw error;
    }
  };

  const deleteTenant = async (id) => {
    try {
      // Verificar se há contratos ativos para este inquilino
      const hasActiveContracts = contracts.some(c => 
        c.tenantId === id && (c.status === 'Ativo' || c.status === 'Pendente')
      );
      
      if (hasActiveContracts) {
        toast.error('Não é possível excluir um inquilino com contratos ativos');
        throw new Error('Não é possível excluir um inquilino com contratos ativos');
      }
      
      await tenantService.delete(id);
      setTenants(tenants.filter(t => t._id !== id));
      toast.success('Inquilino excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir inquilino:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao excluir inquilino. Por favor, tente novamente.');
      throw error;
    }
  };

  // Funções para gerenciar contratos
  const addContract = async (contractData) => {
    try {
      // Validar se propriedade está disponível
      const property = properties.find(p => p._id === contractData.propertyId);
      if (!property) {
        toast.error('Imóvel não encontrado');
        throw new Error('Imóvel não encontrado');
      }
      if (property.status !== 'Disponível') {
        toast.error('Este imóvel não está disponível para locação');
        throw new Error('Este imóvel não está disponível para locação');
      }

      const response = await contractService.create(contractData);
      setContracts([...contracts, response.data]);
      
      // Atualizar status do imóvel
      await updateProperty(contractData.propertyId, { status: 'Alugado' });
      
      toast.success('Contrato adicionado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar contrato:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao adicionar contrato. Por favor, tente novamente.');
      throw error;
    }
  };

  const updateContract = async (id, updates) => {
    try {
      const contract = contracts.find(c => c._id === id);
      if (!contract) {
        toast.error('Contrato não encontrado');
        throw new Error('Contrato não encontrado');
      }

      // Se estiver mudando o status para Encerrado, atualizar o status do imóvel
      if (updates.status === 'Encerrado' && contract.status !== 'Encerrado') {
        await updateProperty(contract.propertyId, { status: 'Disponível' });
      }
      
      // Se estiver reativando um contrato encerrado, verificar disponibilidade
      if (contract.status === 'Encerrado' && updates.status === 'Ativo') {
        const property = properties.find(p => p._id === contract.propertyId);
        if (property.status !== 'Disponível') {
          toast.error('Este imóvel não está mais disponível');
          throw new Error('Este imóvel não está mais disponível');
        }
        await updateProperty(contract.propertyId, { status: 'Alugado' });
      }
      
      const response = await contractService.update(id, updates);
      setContracts(contracts.map(c => 
        c._id === id ? response.data : c
      ));
      
      toast.success('Contrato atualizado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao atualizar contrato. Por favor, tente novamente.');
      throw error;
    }
  };

  const deleteContract = async (id) => {
    try {
      const contract = contracts.find(c => c._id === id);
      if (contract && (contract.status === 'Ativo' || contract.status === 'Pendente')) {
        // Liberar imóvel se o contrato estava ativo
        await updateProperty(contract.propertyId, { status: 'Disponível' });
      }
      
      await contractService.delete(id);
      setContracts(contracts.filter(c => c._id !== id));
      toast.success('Contrato excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      toast.error(error.response?.data?.error || 'Erro ao excluir contrato. Por favor, tente novamente.');
      throw error;
    }
  };

  // Funções para gerenciar tipos de imóveis
  const addPropertyType = async (name) => {
    try {
      // Validação de entrada
      if (!name || name.trim() === '') {
        toast.error('Por favor, informe um nome para o tipo de imóvel');
        throw new Error('Nome do tipo de imóvel é obrigatório');
      }
      
      // Normalizar o nome (remover espaços extras, etc)
      const trimmedName = name.trim();
      
      // Verificar se já existe localmente
      if (propertyTypes.some(type => type.name.toLowerCase() === trimmedName.toLowerCase())) {
        toast.error('Este tipo de imóvel já existe');
        throw new Error('Este tipo de imóvel já existe');
      }
      
      // Enviando um objeto com a propriedade name
      const response = await propertyTypeService.create({ name: trimmedName });
      
      setPropertyTypes([...propertyTypes, response.data]);
      toast.success('Tipo de imóvel adicionado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar tipo de imóvel:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao adicionar tipo de imóvel. Por favor, tente novamente.');
      throw error;
    }
  };

  const updatePropertyType = async (id, name) => {
    try {
      if (!name || name.trim() === '') {
        toast.error('Por favor, informe um nome para o tipo de imóvel');
        throw new Error('Nome do tipo de imóvel é obrigatório');
      }
      
      const trimmedName = name.trim();
      
      if (propertyTypes.some(type => type.name.toLowerCase() === trimmedName.toLowerCase() && type._id !== id)) {
        toast.error('Este tipo de imóvel já existe');
        throw new Error('Este tipo de imóvel já existe');
      }
      
      // Enviando um objeto com a propriedade name
      const response = await propertyTypeService.update(id, { name: trimmedName });
      
      // Atualizar os tipos nos tipos de imóveis
      setPropertyTypes(propertyTypes.map(t => 
        t._id === id ? response.data : t
      ));
      
      // Atualizar os imóveis que usam este tipo
      const oldType = propertyTypes.find(t => t._id === id);
      if (oldType && oldType.name !== trimmedName) {
        await Promise.all(
          properties
            .filter(p => p.type === oldType.name)
            .map(p => updateProperty(p._id, { type: trimmedName }))
        );
      }
      
      toast.success('Tipo de imóvel atualizado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar tipo de imóvel:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao atualizar tipo de imóvel. Por favor, tente novamente.');
      throw error;
    }
  };

  const deletePropertyType = async (id) => {
    try {
      const typeToDelete = propertyTypes.find(t => t._id === id);
      
      if (!typeToDelete) {
        toast.error('Tipo de imóvel não encontrado');
        throw new Error('Tipo de imóvel não encontrado');
      }
      
      // Verificar se há imóveis usando este tipo
      const inUse = properties.some(p => p.type === typeToDelete.name);
      if (inUse) {
        toast.error('Não é possível excluir um tipo que está sendo usado por imóveis');
        throw new Error('Não é possível excluir um tipo que está sendo usado por imóveis');
      }
      
      await propertyTypeService.delete(id);
      setPropertyTypes(propertyTypes.filter(t => t._id !== id));
      toast.success('Tipo de imóvel excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir tipo de imóvel:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao excluir tipo de imóvel. Por favor, tente novamente.');
      throw error;
    }
  };

  // Funções para gerenciar usuários (nova funcionalidade)
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await authService.getUsers();
      setUsers(response.data || []);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error(error.response?.data?.error || 'Erro ao carregar usuários. Por favor, tente novamente.');
      return [];
    } finally {
      setUsersLoading(false);
    }
  };

  const addUser = async (userData) => {
    try {
      // Validar dados
      if (!userData.name || !userData.email || !userData.password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        throw new Error('Todos os campos são obrigatórios');
      }
      
      const response = await authService.createUser(userData);
      setUsers([...users, response.data]);
      toast.success('Usuário adicionado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao adicionar usuário. Por favor, tente novamente.');
      throw error;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const response = await authService.updateUser(id, userData);
      setUsers(users.map(u => u._id === id ? response.data : u));
      toast.success('Usuário atualizado com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao atualizar usuário. Por favor, tente novamente.');
      throw error;
    }
  };

  const resetUserPassword = async (id, password) => {
    try {
      if (!password || password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        throw new Error('Senha inválida');
      }
      
      const response = await authService.resetPassword(id, password);
      toast.success('Senha redefinida com sucesso!');
      return response.data;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao redefinir senha. Por favor, tente novamente.');
      throw error;
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      // Não permitir desativar o próprio usuário
      if (id === user.id) {
        toast.error('Não é possível desativar seu próprio usuário');
        throw new Error('Operação não permitida');
      }
      
      const response = await authService.toggleUserStatus(id);
      setUsers(users.map(u => u._id === id ? response.data : u));
      toast.success(`Usuário ${response.data.active ? 'ativado' : 'desativado'} com sucesso!`);
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao alterar status do usuário. Por favor, tente novamente.');
      throw error;
    }
  };

  // Funções de análise e relatórios
  const getOccupancyRate = () => {
    const totalProperties = properties.length;
    if (totalProperties === 0) return 0;
    
    const occupiedProperties = properties.filter(p => 
      p.status === 'Alugado' || p.status === 'Manutenção'
    ).length;
    
    return (occupiedProperties / totalProperties) * 100;
  };

  const getMonthlyRevenue = () => {
    const activeContracts = contracts.filter(c => c.status === 'Ativo');
    return activeContracts.reduce((sum, contract) => sum + parseFloat(contract.monthlyRent || 0), 0);
  };

  const getUpcomingRenewals = (daysThreshold = 30) => {
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(today.getDate() + daysThreshold);
    
    return contracts
      .filter(c => c.status === 'Ativo' && new Date(c.endDate) <= threshold)
      .map(contract => {
        const property = properties.find(p => p._id === contract.propertyId);
        const tenant = tenants.find(t => t._id === contract.tenantId);
        
        return {
          ...contract,
          propertyAddress: property ? property.address : 'Desconhecido',
          tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Desconhecido',
          daysRemaining: Math.ceil((new Date(contract.endDate) - today) / (1000 * 60 * 60 * 24))
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        authenticated,
        properties,
        tenants,
        contracts,
        propertyTypes,
        darkMode,
        login,
        register,
        logout,
        toggleDarkMode,
        addProperty,
        updateProperty,
        deleteProperty,
        addTenant,
        updateTenant,
        deleteTenant,
        addContract,
        updateContract,
        deleteContract,
        addPropertyType,
        updatePropertyType,
        deletePropertyType,
        getOccupancyRate,
        getMonthlyRevenue,
        getUpcomingRenewals,
        // Funções de gerenciamento de usuários
        users,
        usersLoading,
        fetchUsers,
        addUser,
        updateUser,
        resetUserPassword,
        toggleUserStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};