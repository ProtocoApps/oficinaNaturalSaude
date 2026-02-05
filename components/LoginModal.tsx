import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const ADMIN_EMAIL = 'lojaoficinadasaude@gmail.com';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Registrar novo usuário
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError('Erro ao criar conta. Tente outro email.');
          return;
        }

        // Fazer login automático após cadastro
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError('Conta criada! Verifique seu email para confirmar e depois faça login.');
          setLoading(false);
          return;
        }

        // Login automático bem-sucedido após cadastro
        setError('Conta criada e login realizado com sucesso!');
        setTimeout(() => {
          setError('');
        }, 2000);

        // Se for admin, redirecionar para o dashboard
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          navigate('/admin/dashboard');
        }

        onLoginSuccess();
        onClose();
        return;
      } else {
        // Login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError('Email ou senha incorretos');
          return;
        }

        // Se for admin, redirecionar para o dashboard
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          navigate('/admin/dashboard');
        }

        onLoginSuccess();
        onClose();
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`text-sm px-3 py-2 rounded-lg ${
              error.includes('criada') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neon text-[#132210] font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Carregando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-neon hover:underline"
          >
            {isRegistering 
              ? 'Já tem uma conta? Faça login' 
              : 'Não tem uma conta? Cadastre-se'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
