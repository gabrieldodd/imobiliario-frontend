// Apenas as adições à AppContext.js para suportar gerenciamento de usuários
// Adicione estas funções ao seu contexto existente

// Importações
import { userService } from '../services/api';

// Adicione estes novos estados ao AppContext
const [users, setUsers] = useState([]);
const [usersLoading, setUsersLoading] = useState(false);

// Adicione estas funções ao AppContext
const fetchUsers = async () => {
  try {
    setUsersLoading(true);
    const response = await userService.getAll();
    setUsers(response.data || []);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    toast.error('Erro ao carregar usuários. Por favor, tente novamente.');
    return [];
  } finally {
    setUsersLoading(false);
  }
};

const addUser = async (userData) => {
  try {
    const response = await userService.create(userData);
    setUsers([...users, response.data]);
    toast.success('Usuário adicionado com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    toast.error(error.response?.data?.error || 'Erro ao adicionar usuário. Por favor, tente novamente.');
    throw error;
  }
};

const updateUser = async (id, userData) => {
  try {
    const response = await userService.update(id, userData);
    setUsers(users.map(u => u._id === id ? response.data : u));
    toast.success('Usuário atualizado com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    toast.error(error.response?.data?.error || 'Erro ao atualizar usuário. Por favor, tente novamente.');
    throw error;
  }
};

const resetUserPassword = async (id, password) => {
  try {
    const response = await userService.resetPassword(id, password);
    toast.success('Senha redefinida com sucesso!');
    return response.data;
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    toast.error(error.response?.data?.error || 'Erro ao redefinir senha. Por favor, tente novamente.');
    throw error;
  }
};

const toggleUserStatus = async (id) => {
  try {
    const response = await userService.toggleStatus(id);
    setUsers(users.map(u => u._id === id ? response.data : u));
    toast.success(`Usuário ${response.data.active ? 'ativado' : 'desativado'} com sucesso!`);
    return response.data;
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    toast.error(error.response?.data?.error || 'Erro ao alterar status do usuário. Por favor, tente novamente.');
    throw error;
  }
};

// No useEffect que carrega dados iniciais, adicione:
if (authenticated && user.role === 'admin') {
  await fetchUsers();
}

// Adicione essas funções e estados ao objeto do contexto
{
  // Outros valores do contexto...
  users,
  usersLoading,
  fetchUsers,
  addUser,
  updateUser,
  resetUserPassword,
  toggleUserStatus
}