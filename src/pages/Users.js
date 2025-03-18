import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { PlusIcon, PencilIcon, KeyIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import InputMask from 'react-input-mask';

const Users = () => {
  const { user: currentUser, darkMode } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentUser_id, setCurrentUser_id] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Obter token do localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Autenticação necessária');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar usuários');
      }
      
      setUsers(data.data);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Falha ao carregar usuários. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setCurrentUser_id(user._id);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'user'
      });
    } else {
      setCurrentUser_id(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenPasswordModal = (user_id) => {
    setCurrentUser_id(user_id);
    setPasswordData({
      password: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    // Requisitos
    const hasMinLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    return {
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol,
      message: !hasMinLength ? 'A senha deve ter pelo menos 6 caracteres' :
               !hasUpperCase ? 'A senha deve conter pelo menos uma letra maiúscula' :
               !hasLowerCase ? 'A senha deve conter pelo menos uma letra minúscula' :
               !hasNumber ? 'A senha deve conter pelo menos um número' :
               !hasSymbol ? 'A senha deve conter pelo menos um símbolo' : ''
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos
    if (!formData.name || !formData.email || (!currentUser_id && !formData.password)) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, informe um email válido');
      return;
    }
    
    // Validar senha para novos usuários
    if (!currentUser_id) {
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não correspondem');
        return;
      }
      
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message);
        return;
      }
    }
    
    try {
      setError('');
      // Obter token do localStorage
      const token = localStorage.getItem('token');
      
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      // Adicionar senha apenas para novos usuários
      if (!currentUser_id) {
        userData.password = formData.password;
      }
      
      const url = currentUser_id 
        ? `${process.env.REACT_APP_API_URL}/auth/users/${currentUser_id}`
        : `${process.env.REACT_APP_API_URL}/auth/users`;
      
      const method = currentUser_id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar usuário');
      }
      
      // Atualizar lista de usuários
      await fetchUsers();
      
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.message || 'Falha ao salvar usuário. Por favor, tente novamente.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validar campos
    if (!passwordData.password || !passwordData.confirmPassword) {
      setPasswordError('Por favor, preencha todos os campos');
      return;
    }
    
    // Validar se senhas são iguais
    if (passwordData.password !== passwordData.confirmPassword) {
      setPasswordError('As senhas não correspondem');
      return;
    }
    
    // Validar requisitos de senha
    const passwordValidation = validatePassword(passwordData.password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }
    
    try {
      setPasswordError('');
      // Obter token do localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/users/${currentUser_id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: passwordData.password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha');
      }
      
      setIsPasswordModalOpen(false);
      alert('Senha redefinida com sucesso!');
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      setPasswordError(err.message || 'Falha ao redefinir senha. Por favor, tente novamente.');
    }
  };

  const handleToggleStatus = async (user_id) => {
    try {
      // Obter token do localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/users/${user_id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar status do usuário');
      }
      
      // Atualizar lista de usuários
      await fetchUsers();
    } catch (err) {
      console.error('Erro ao alterar status do usuário:', err);
      setError(err.message || 'Falha ao alterar status do usuário. Por favor, tente novamente.');
    }
  };

  // Verificar se o usuário atual é admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Usuário
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div className={`p-8 text-center rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <p className="text-gray-500 dark:text-gray-400">Nenhum usuário cadastrado além de você.</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Adicionar Primeiro Usuário
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg`}>
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <tr>
                    <th className="py-3 px-4 text-left">Nome</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Função</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr 
                      key={user._id} 
                      className={`border-t border-gray-200 dark:border-gray-700 ${
                        user._id === currentUser.id ? 'bg-blue-50 dark:bg-blue-900' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-bold text-sm mr-3">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-medium">{user.name}</span>
                          {user._id === currentUser.id && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded-full">
                              Você
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full"
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleOpenPasswordModal(user._id)}
                            className="p-1 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-gray-700 rounded-full"
                            title="Redefinir senha"
                            disabled={user._id === currentUser.id}
                          >
                            <KeyIcon className="h-5 w-5" />
                          </button>
                          {user._id !== currentUser.id && (
                            <button
                              onClick={() => handleToggleStatus(user._id)}
                              className={`p-1 ${
                                user.active 
                                  ? 'text-red-600 hover:bg-red-100' 
                                  : 'text-green-600 hover:bg-green-100'
                                } dark:hover:bg-gray-700 rounded-full`}
                              title={user.active ? 'Desativar' : 'Ativar'}
                            >
                              {user.active ? (
                                <XCircleIcon className="h-5 w-5" />
                              ) : (
                                <CheckCircleIcon className="h-5 w-5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal para Adicionar/Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <h2 className="text-xl font-semibold mb-4">
              {currentUser_id ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Nome completo"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Função
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              {!currentUser_id && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Senha*
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!currentUser_id}
                      className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirmar Senha*
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!currentUser_id}
                      className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="Confirme a senha"
                    />
                  </div>
                  
                  <div className="mb-4 text-xs text-gray-600 dark:text-gray-400">
                    <p>A senha deve conter:</p>
                    <ul className="list-disc list-inside pl-2">
                      <li>Pelo menos 6 caracteres</li>
                      <li>Pelo menos uma letra maiúscula</li>
                      <li>Pelo menos uma letra minúscula</li>
                      <li>Pelo menos um número</li>
                      <li>Pelo menos um caractere especial</li>
                    </ul>
                  </div>
                </>
              )}
              
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

      {/* Modal para Redefinir Senha */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <h2 className="text-xl font-semibold mb-4">
              Redefinir Senha
            </h2>
            
            {passwordError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
                {passwordError}
              </div>
            )}
            
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nova Senha*
                </label>
                <input
                  type="password"
                  name="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  required
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar Nova Senha*
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Confirme a senha"
                />
              </div>
              
              <div className="mb-4 text-xs text-gray-600 dark:text-gray-400">
                <p>A senha deve conter:</p>
                <ul className="list-disc list-inside pl-2">
                  <li>Pelo menos 6 caracteres</li>
                  <li>Pelo menos uma letra maiúscula</li>
                  <li>Pelo menos uma letra minúscula</li>
                  <li>Pelo menos um número</li>
                  <li>Pelo menos um caractere especial</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
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

export default Users;