import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Activity, ArrowRight, Mail, Loader2, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signUp(email, password, { full_name: fullName });
        setIsSignUp(false); // Switch to login after signup
        setError("Usuario registrado. Por favor, inicia sesión.");
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="mesh-bg"></div>
      
      <div className="login-card glass">
        <div className="login-header">
          <div className="login-logo">
            <Activity size={48} color="var(--accent-cyan)" />
          </div>
          <h1>{isSignUp ? 'Crea tu cuenta' : 'Bienvenido a'} <span className="neon-text">aivU</span></h1>
          <p>Tu asistente inteligente de postura y sincronización 3D.</p>
        </div>

        {error && (
          <div className={`auth-error ${error.includes('registrado') ? 'success' : ''}`}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="input-group glass">
              <User size={20} color="var(--text-dim)" />
              <input 
                type="text" 
                placeholder="Nombre Completo" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group glass">
            <Mail size={20} color="var(--text-dim)" />
            <input 
              type="email" 
              placeholder="Correo Electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group glass">
            <Lock size={20} color="var(--text-dim)" />
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="neon-btn login-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Registrarme' : 'Entrar al Sistema')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} 
            <button className="link-btn neon-text" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Inicia Sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-error {
          padding: 12px;
          border-radius: 8px;
          background: rgba(255, 0, 60, 0.1);
          color: var(--accent-danger);
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255, 0, 60, 0.2);
        }
        .auth-error.success {
          background: rgba(0, 242, 255, 0.1);
          color: var(--accent-cyan);
          border-color: rgba(0, 242, 255, 0.2);
        }
        .link-btn {
          background: transparent;
          border: none;
          padding: 0;
          margin-left: 8px;
          cursor: pointer;
          font-weight: 800;
          font-family: var(--font-body);
        }
        .link-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
