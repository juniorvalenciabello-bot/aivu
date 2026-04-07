import React, { useState } from 'react';
import CameraView from './components/CameraView';
import FeedbackPanel from './components/FeedbackPanel';
import SessionHistory from './components/SessionHistory';
import ExerciseLibrary from './components/ExerciseLibrary';
import Config from './components/Config';
import Login from './components/Login';
import { useAuth } from './context/AuthContext';
import { useExercises } from './context/ExerciseContext';
import { Layout, History, Settings, Bell, Search, Activity, Dumbbell, LogOut, HelpCircle } from 'lucide-react';
import './App.css';

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const { selectedExercise } = useExercises();
  const [activeTab, setActiveTab] = useState('monitor');
  const [sessionActive, setSessionActive] = useState(false);

  if (authLoading) return <div className="loading-screen glass">Cargando aivU...</div>;
  if (!user) return <Login />;

  const renderContent = () => {
    switch (activeTab) {
      case 'monitor':
        return (
          <>
            <div className="grid-left">
              <div className="welcome-banner glass">
                <h1>{selectedExercise?.name || 'Inicia'} <span className="neon-text">Entrenamiento</span></h1>
                <p>{selectedExercise?.description || 'Selecciona un ejercicio de tu biblioteca para comenzar el análisis inteligente.'}</p>
                <div className="banner-actions">
                  {!sessionActive ? (
                    <button className="neon-btn" onClick={() => setSessionActive(true)}>Comenzar Sesión</button>
                  ) : (
                    <button className="neon-btn danger" onClick={() => setSessionActive(false)}>Detener Sesión</button>
                  )}
                </div>
              </div>
              <CameraView active={sessionActive} />
            </div>
            <div className="grid-right">
              <FeedbackPanel active={sessionActive} exercise={selectedExercise} />
            </div>
          </>
        );
      case 'library':
        return <ExerciseLibrary />;
      case 'history':
        return <SessionHistory />;
      case 'config':
        return <Config />;
      default:
        return <p>Sección en construcción</p>;
    }
  };

  return (
    <div className="app-container">
      <div className="mesh-bg"></div>
      
      <nav className="sidebar glass">
        <div className="sidebar-top">
          <div className="logo" onClick={() => setActiveTab('monitor')}>
            <div className="logo-icon">
              <Activity size={28} color="var(--accent-cyan)" />
            </div>
            <span>aivU</span>
          </div>
          
          <div className="nav-links">
            <button 
              className={`nav-item ${activeTab === 'monitor' ? 'active' : ''}`}
              onClick={() => setActiveTab('monitor')}
              title="Monitor"
            >
              <Layout size={24} />
            </button>
            <button 
              className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => setActiveTab('library')}
              title="Biblioteca"
            >
              <Dumbbell size={24} />
            </button>
            <button 
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
              title="Historial"
            >
              <History size={24} />
            </button>
          </div>
        </div>

        <div className="sidebar-bottom">
          <button 
            className={`nav-item ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
            title="Ajustes"
          >
            <Settings size={24} />
          </button>
          <button className="nav-item" title="Cerrar Sesión" onClick={logout}>
            <LogOut size={24} />
          </button>
          <div className="user-profile">
            <div className="avatar" title={user.name}>{user.avatar}</div>
          </div>
        </div>
      </nav>
      
      <main className="content">
        <header className="top-bar">
          <div className="search-box glass">
            <Search size={18} color="var(--text-dim)" />
            <input type="text" placeholder="Buscar ejercicios o sesiones..." />
          </div>
          <div className="system-status">
            <div className="status-indicator">
              <div className="status-dot online"></div>
              <span>Sistema Online</span>
            </div>
            <button className="nav-item"><Bell size={20} /></button>
          </div>
        </header>

        <section className="dashboard-grid full-height">
          {renderContent()}
        </section>
      </main>

      <style jsx>{`
        .sidebar { justify-content: space-between; }
        .sidebar-top, .sidebar-bottom { display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .sidebar-bottom { margin-bottom: 24px; padding-top: 24px; border-top: 1px solid var(--glass-border); width: 100%; }
        .loading-screen { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--accent-cyan); font-weight: 800; background: var(--bg-primary); }
        .dashboard-grid.full-height { display: flex; flex-direction: row; gap: 24px; }
        .full-height > .grid-left { flex-grow: 1; }
        .system-status { display: flex; align-items: center; gap: 16px; }
        .status-indicator { display: flex; align-items: center; gap: 8px; background: rgba(0, 242, 255, 0.05); padding: 8px 16px; border-radius: 30px; border: 1px solid rgba(0, 242, 255, 0.1); color: var(--accent-cyan); font-size: 0.85rem; font-weight: 700; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-cyan); box-shadow: 0 0 10px var(--accent-cyan); }
        .banner-actions { margin-top: 24px; display: flex; gap: 16px; }
        .neon-btn.danger { border-color: var(--accent-danger); color: var(--accent-danger); }
        .neon-btn.danger:hover { background: var(--accent-danger); color: white; box-shadow: 0 0 15px var(--accent-danger); }
      `}</style>
    </div>
  );
}

export default App;
