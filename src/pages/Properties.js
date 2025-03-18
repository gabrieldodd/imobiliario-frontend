import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import InputMask from 'react-input-mask';
import { formatCurrency, formatCPF, convertToFloat, formatDate, formatDateForInput } from '../utils/formatters';

const Properties = () => {
  const { properties, addProperty, updateProperty, deleteProperty, propertyTypes, darkMode } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    cep: '',
    type: '',
    price: '',
    size: '',
    bedrooms: '',
    bathrooms: '',
    description: ''
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      setCurrentProperty(null);
      setFormData({
        title: '',
        address: '',
        cep: '',
        type: propertyTypes.length > 0 ? propertyTypes[0].name : '',
        price: '',
        size: '',
        bedrooms: '',
        bathrooms: '',
        description: ''
      });
    }
  }, [isModalOpen, propertyTypes]);

  const handleOpenModal = (property = null) => {
    if (property) {
      setCurrentProperty(property);
      setFormData({
        title: property.title || '',
        address: property.address || '',
        cep: property.cep || '',
        type: property.type || (propertyTypes.length > 0 ? propertyTypes[0].name : ''),
        price: property.price ? property.price.toString().replace('.', ',') : '',
        size: property.size ? property.size.toString() : '',
        bedrooms: property.bedrooms ? property.bedrooms.toString() : '',
        bathrooms: property.bathrooms ? property.bathrooms.toString() : '',
        description: property.description || ''
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
      // Função para converter valor com vírgula (R$ brasileiro) para float
      const convertToFloat = (value) => {
        if (!value) return 0;
        return parseFloat(value.replace(/\./g, '').replace(',', '.'));
      };
      
      const propertyData = {
        title: formData.title.trim(),
        address: formData.address.trim(),
        cep: formData.cep.trim(),
        type: formData.type,
        price: convertToFloat(formData.price),
        size: formData.size ? parseFloat(formData.size) : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        description: formData.description.trim()
      };
      
      if (currentProperty) {
        await updateProperty(currentProperty._id, propertyData);
      } else {
        await addProperty(propertyData);
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        await deleteProperty(id);
      } catch (error) {
        console.error('Erro ao excluir propriedade:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponível': return 'bg-green-100 text-green-800';
      case 'Alugado': return 'bg-blue-100 text-blue-800';
      case 'Manutenção': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Imóveis</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Imóvel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div 
            key={property._id} 
            className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="bg-gray-200 h-48 flex items-center justify-center">
              <span className="text-gray-500">Foto do Imóvel</span>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold">{property.title}</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{property.address}</p>
              {property.cep && (
                <p className="text-sm text-gray-500 dark:text-gray-400">CEP: {property.cep}</p>
              )}
              
              <div className="mt-3 flex justify-between">
                <div>
                  <p className="font-medium">{formatCurrency(property.price)}/mês</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{property.type}</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {property.size && <p>{property.size} m²</p>}
                  <div className="flex space-x-2">
                    {property.bedrooms && <p>{property.bedrooms} quartos</p>}
                    {property.bathrooms && <p>{property.bathrooms} banheiros</p>}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleOpenModal(property)}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(property._id)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className={`p-8 text-center rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <p className="text-gray-500 dark:text-gray-400">Nenhum imóvel cadastrado.</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Adicionar Primeiro Imóvel
          </button>
        </div>
      )}

      {/* Modal para Adicionar/Editar Imóvel */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <h2 className="text-xl font-semibold mb-4">
              {currentProperty ? 'Editar Imóvel' : 'Novo Imóvel'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="Título do imóvel"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo*
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  >
                    {propertyTypes.map(type => (
                      <option key={type._id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Endereço*
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="Endereço completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CEP
                  </label>
                  <InputMask
                    mask="99999-999"
                    value={formData.cep}
                    onChange={handleChange}
                    name="cep"
                  >
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        type="text"
                        className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        placeholder="00000-000"
                      />
                    )}
                  </InputMask>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor do Aluguel (R$)*
                  </label>
                  <InputMask
                    mask="9{1,10},99"
                    maskChar={null}
                    value={formData.price}
                    onChange={handleChange}
                    name="price"
                    required
                  >
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        type="text"
                        className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        placeholder="0,00"
                      />
                    )}
                  </InputMask>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    min="0"
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quartos
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    min="0"
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Banheiros
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    min="0"
                    className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  placeholder="Descrição do imóvel"
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

export default Properties;