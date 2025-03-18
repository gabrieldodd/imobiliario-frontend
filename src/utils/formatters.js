/**
 * Funções utilitárias para formatação de dados
 */

/**
 * Formata um valor numérico para o formato de moeda brasileira (R$)
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado como moeda
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formata um CPF adicionando pontos e traço
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} - CPF formatado
 */
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  
  // Se já estiver formatado, apenas retorna
  if (cpf.includes('.') || cpf.includes('-')) return cpf;
  
  // Remove caracteres não numéricos
  const numericCPF = cpf.replace(/\D/g, '');
  
  if (numericCPF.length !== 11) return cpf; // Retorna como está se não tiver 11 dígitos
  
  return numericCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata um número de telefone adicionando parênteses e hífen
 * @param {string} phone - Telefone a ser formatado
 * @returns {string} - Telefone formatado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Se já estiver formatado, apenas retorna
  if (phone.includes('(') || phone.includes(')')) return phone;
  
  // Remove caracteres não numéricos
  const numericPhone = phone.replace(/\D/g, '');
  
  if (numericPhone.length === 11) {
    return numericPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numericPhone.length === 10) {
    return numericPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone; // Retorna como está se não se encaixar nos padrões
};

/**
 * Formata um CEP adicionando hífen
 * @param {string} cep - CEP a ser formatado
 * @returns {string} - CEP formatado
 */
export const formatCEP = (cep) => {
  if (!cep) return '';
  
  // Se já estiver formatado, apenas retorna
  if (cep.includes('-')) return cep;
  
  // Remove caracteres não numéricos
  const numericCEP = cep.replace(/\D/g, '');
  
  if (numericCEP.length !== 8) return cep; // Retorna como está se não tiver 8 dígitos
  
  return numericCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Formata uma data para o padrão brasileiro (DD/MM/YYYY)
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} - Data formatada
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
};

/**
 * Formata uma data para o formato de input HTML (YYYY-MM-DD)
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} - Data formatada para input HTML
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString().split('T')[0];
};

/**
 * Converte um valor com formato brasileiro (com vírgula) para float
 * @param {string} value - Valor no formato brasileiro
 * @returns {number} - Valor convertido para float
 */
export const convertToFloat = (value) => {
  if (!value) return 0;
  
  // Remove R$ e outros caracteres não numéricos, exceto vírgula e ponto
  const cleanValue = value.replace(/[^\d,.]/g, '');
  
  // Substitui pontos por nada (remove separador de milhar) e vírgula por ponto (para o parseFloat)
  return parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
};