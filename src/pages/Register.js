import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    company: ''
  });
  const [error, setError] = useState('');
  const [passwordStrengthMessage, setPasswordStrengthMessage] = useState('');
  const { register, authenticated, loading } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate('/dashboard');
    }
  }, [authenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Atualizar mensagem de força da senha quando o campo de senha é alterado
    if (name === 'password') {
      updatePasswordStrength(value);
    }
  };

  // Validação de força da senha
  const updatePasswordStrength = (password) => {
    let message = '';
    let isValid = true;

    // Requisitos
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    // Verificar cada requisito
    if (!hasMinLength) {
      message += '• Mínimo de 8 caracteres\n';
      isValid = false;
    }
    if (!hasUpperCase) {
      message += '• Pelo menos uma letra maiúscula\n';
      isValid = false;
    }
    if (!hasLowerCase) {
      message += '• Pelo menos uma letra minúscula\n';
      isValid = false;
    }
    if (!hasNumber) {
      message += '• Pelo menos um número\n';
      isValid = false;
    }
    if (!hasSymbol) {
      message += '• Pelo menos um símbolo\n';
      isValid = false;
    }

    // Se tudo estiver correto
    if (isValid) {
      message = 'Senha forte ✓';
    } else {
      message = 'Sua senha precisa ter:\n' + message;
    }

    setPasswordStrengthMessage(message);
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const { name, email, password, passwordConfirm, company } = formData;
    
    if (!name || !email || !password || !passwordConfirm || !company) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, informe um email válido.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('As senhas não correspondem.');
      return;
    }

    // Validar a força da senha
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (!(hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol)) {
      setError('A senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, uma minúscula, um número e um símbolo.');
      return;
    }

    try {
      const success = await register({
        name,
        email,
        password,
        company
      });
      
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Erro ao criar conta. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Crie sua conta</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gerenciamento Imobiliário
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Nome</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nome completo"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="company" className="sr-only">Imobiliária</label>
              <input
                id="company"
                name="company"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nome da Imobiliária"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="passwordConfirm" className="sr-only">Confirmar Senha</label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirmar Senha"
                value={formData.passwordConfirm}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {formData.password && (
            <div className={`text-sm ${passwordStrengthMessage.includes('✓') ? 'text-green-600' : 'text-amber-600'}`}>
              <pre className="whitespace-pre-line">{passwordStrengthMessage}</pre>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Criar Conta
            </button>
          </div>

          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;