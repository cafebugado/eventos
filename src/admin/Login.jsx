import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { signIn, getSession } from '../services/authService';
import './Admin.css';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Verifica se já está autenticado
  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session) {
        navigate('/admin/dashboard');
      }
    }
    checkSession();
  }, [navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      await signIn(data.email, data.password);
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.message === 'Invalid login credentials') {
        setError('Email ou senha incorretos');
      } else {
        setError(err.message || 'Erro ao fazer login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Lock size={40} />
          </div>
          <h1>Eventos Admin</h1>
          <p>Comunidade Café Bugado - Painel de administração</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email", {
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", {
                  required: "Senha é obrigatória",
                  minLength: {
                    value: 6,
                    message: "Senha deve ter pelo menos 6 caracteres"
                  }
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="button-spinner"></span>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Acesso restrito a administradores</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
