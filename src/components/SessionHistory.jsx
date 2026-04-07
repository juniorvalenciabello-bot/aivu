import React from 'react';
import { useSessions } from '../context/SessionContext';
import { Clock, Calendar, ChevronRight, BarChart3, Trash2 } from 'lucide-react';
import './SessionHistory.css';

const SessionHistory = () => {
  const { sessions, deleteSession, loading } = useSessions();

  // Calcular estadísticas globales
  const totalMinutes = sessions.reduce((acc, curr) => acc + Math.floor(curr.duration_seconds / 60), 0);
  const avgAccuracy = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, curr) => acc + curr.average_accuracy, 0) / sessions.length) 
    : 0;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Historial de <span className="neon-text">Sesiones</span></h1>
        <p>Tus entrenamientos se están sincronizando con Supabase en tiempo real.</p>
      </div>

      <div className="stats-summary-grid">
        <div className="stat-summary-card glass">
          <BarChart3 size={32} color="var(--accent-cyan)" />
          <div className="stat-content">
            <span className="stat-label">Precisión Promedio</span>
            <span className="stat-value">{avgAccuracy}%</span>
          </div>
        </div>
        <div className="stat-summary-card glass">
          <Clock size={32} color="var(--accent-purple)" />
          <div className="stat-content">
            <span className="stat-label">Tiempo Total</span>
            <span className="stat-value">{totalMinutes} min</span>
          </div>
        </div>
      </div>

      <div className="session-list">
        {loading && <p style={{ color: 'var(--accent-cyan)' }}>Sincronizando historial...</p>}
        {!loading && sessions.length === 0 && (
          <div className="glass" style={{ padding: '24px', textAlign: 'center', borderRadius: '16px' }}>
            Aún no tienes entrenamientos guardados. ¡Empieza en el monitor!
          </div>
        )}
        {sessions.map(session => (
          <div key={session.id} className="session-card glass">
            <div className="session-main">
              <div className="session-date-icon">
                <Calendar size={20} color="var(--accent-cyan)" />
              </div>
              <div className="session-details">
                <h3>{session.exercise_name} ({session.reps_completed} Reps)</h3>
                <div className="session-meta">
                  <span><Clock size={14} /> {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s</span>
                  <span><Calendar size={14} /> {formatDate(session.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="session-stats">
              <div className="accuracy-badge">
                <span className="accuracy-label">Precisión</span>
                <span className="accuracy-value">{session.average_accuracy}%</span>
              </div>
              <button className="nav-item" onClick={() => deleteSession(session.id)}>
                <Trash2 size={18} color="var(--accent-danger)" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionHistory;
