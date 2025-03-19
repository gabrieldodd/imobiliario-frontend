import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { 
    propertyTypes, 
    addPropertyType, 
    updatePropertyType, 
    deletePropertyType, 
    fetchPropertyTypes,
    darkMode, 
    toggleDarkMode 
  } = useContext(AppContext);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [typeName, setTypeName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Sincronizar tipos de imóveis ao entrar na página
  useEffect(() => {
    syncPropertyTypes();
  }, []);

  const syncPropertyTypes = async () => {
    try {
      setIsSyncing(true);
      await fetchPropertyTypes();
      setIsSyncing(false);
    } catch (error) {
      console.error('Erro ao sincronizar tipos de imóveis:', error);
      setIsSyncing(false);
    }
  };

  const handleOpenModal = (type = null) => {
    if (type) {
      setCurrentType(type);
      setTypeName(type.name);
    } else {
      setTypeName('');
      setCurrentType(null);
    }
    setFormError(''); // Limpar mensagens de erro anteriores
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); // Limpar mensagens de erro
    
    // Validar o nome do tipo antes de enviar
    if (!typeName || typeName.trim() === '') {
      setFormError('Por favor, informe um nome para o tipo de imóvel');
      return;
    }
    
    try {
      if (currentType) {
        await updatePropertyType(currentType._id, { name: typeName });
      } else {
        await addPropertyType({ name: typeName });
      }
      
      setIsModalOpen(false);
      setTypeName('');
    } catch (error) {
      console.error('Erro ao salvar tipo de imóvel:', error);
      // O toast será exibido pelo contexto, mas também mostramos o erro no formulário
      setFormError(error.message || 'Erro ao salvar tipo de imóvel. Por favor, tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este tipo de imóvel?')) {
      try {
        await deletePropertyType(id);
      } catch (error) {
        console.error('Erro ao excluir tipo de imóvel:', error);
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ajustes</h1>
      
      <div className={`rounded-lg shadow-md p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-lg font-medium mb-4">Aparência</h2>
        
        <div className="flex items-center justify-between">
          <span>Modo Escuro</span>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>
      
      <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Tipos de Imóveis</h2>
          <div className="flex space-x-2">
            <button
              onClick={syncPropertyTypes}
              className={`px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm rounded-md flex items-center ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Sincronizar com o servidor"
              disabled={isSyncing}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="ml-1">Atualizar</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Adicionar
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          {propertyTypes.map((type) => (
            <div 
              key={type._id} 
              className={`flex items-center justify-between p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <span>{type.name}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(type)}
                  className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-600 rounded-full"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(type._id)}
                  className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-gray-600 rounded-full"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {propertyTypes.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Nenhum tipo de imóvel cadastrado.
          </p>
        )}
      </div>
      
      {/* Modal para Adicionar/Editar Tipo de Imóvel */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <h2 className="text-xl font-semibold mb-4">
              {currentType ? 'Editar Tipo de Imóvel' : 'Novo Tipo de Imóvel'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md text-sm">
                  {formError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Tipo
                </label>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  required
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Ex: Apartamento, Casa, Comercial..."
                />
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

export default Settings;