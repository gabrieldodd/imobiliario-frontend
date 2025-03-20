import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Serviços de autenticação
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  // Novos métodos para gerenciamento de usuários
  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await api.get(`/auth/users/${id}`);
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/auth/users', userData);
    return response.data;
  },
  
  updateUser: async (id, userData) => {
    const response = await api.put(`/auth/users/${id}`, userData);
    return response.data;
  },
  
  resetPassword: async (id, password) => {
    const response = await api.put(`/auth/users/${id}/reset-password`, { password });
    return response.data;
  },
  
  toggleUserStatus: async (id) => {
    const response = await api.put(`/auth/users/${id}/toggle-status`);
    return response.data;
  }
};

// Serviços de imóveis
export const propertyService = {
  getAll: async () => {
    const response = await api.get('/properties');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
  
  create: async (propertyData) => {
    const response = await api.post('/properties', propertyData);
    return response.data;
  },
  
  update: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },
};

// Serviços de inquilinos
export const tenantService = {
  getAll: async () => {
    const response = await api.get('/tenants');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },
  
  create: async (tenantData) => {
    const response = await api.post('/tenants', tenantData);
    return response.data;
  },
  
  update: async (id, tenantData) => {
    const response = await api.put(`/tenants/${id}`, tenantData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/tenants/${id}`);
    return response.data;
  },
};

// Serviços de contratos
export const contractService = {
  getAll: async () => {
    const response = await api.get('/contracts');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },
  
  create: async (contractData) => {
    const response = await api.post('/contracts', contractData);
    return response.data;
  },
  
  update: async (id, contractData) => {
    const response = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  },
};

// Serviços de tipos de imóveis (versão corrigida)
// Implementação melhorada para o serviço de tipos de imóveis
export const propertyTypeService = {
  getAll: async (queryString = '') => {
    try {
      const response = await api.get(`/property-types${queryString}`);
      console.log('Resultado da API de tipos:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro na API getAll:', error);
      throw error;
    }
  },
  
  create: async (data) => {
    try {
      const response = await api.post('/property-types', data);
      return response.data;
    } catch (error) {
      console.error('Erro na API create:', error);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      const response = await api.put(`/property-types/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro na API update:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/property-types/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro na API delete:', error);
      throw error;
    }
  },
};