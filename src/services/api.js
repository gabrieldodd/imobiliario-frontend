// Adicione este novo serviço ao arquivo src/services/api.js

// Serviços de gerenciamento de usuários
export const userService = {
  getAll: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/auth/users/${id}`);
    return response.data;
  },
  
  create: async (userData) => {
    const response = await api.post('/auth/users', userData);
    return response.data;
  },
  
  update: async (id, userData) => {
    const response = await api.put(`/auth/users/${id}`, userData);
    return response.data;
  },
  
  resetPassword: async (id, password) => {
    const response = await api.put(`/auth/users/${id}/reset-password`, { password });
    return response.data;
  },
  
  toggleStatus: async (id) => {
    const response = await api.put(`/auth/users/${id}/toggle-status`);
    return response.data;
  },
};