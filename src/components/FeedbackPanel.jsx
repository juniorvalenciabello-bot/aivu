import React, { useState, useEffect, useRef } from 'react';
import { analyzePosture, resetReps } from '../utils/postureLogic';
import { Target, Zap, ShieldCheck, ShieldAlert, Cpu, Award } from 'lucide-react';
import { useSessions } from '../context/SessionContext';
import './FeedbackPanel.css';

const FeedbackPanel = ({ active, exercise }) => {
  const { addSession } = useSessions();
  const [analysis, setAnalysis] = useState({
    angle: 0,
    confidence: 0,
    reps: 0,
    status: 'idle',
    message: 'Esperando detección...',
    progress: 0
  });

  const [repAnim, setRepAnim] = useState(false);
  
  // Guardamos referencias para cuando el componente se desmonte o pare la sesión
  const startTimeRef = useRef(null);
  const analysisRef = useRef(analysis);

  useEffect(() => {
    analysisRef.current = analysis;
  }, [analysis]);

  useEffect(() => {
    if (!active) {
      // Si venimos de una sesión activa (había un startTime)
      if (startTimeRef.current) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        // Guardar la sesión SIEMPRE, sin importar la duración
        addSession({
          exercise_name: exercise?.name || 'Ejercicio Desconocido',
          duration_seconds: duration,
          reps_completed: analysisRef.current.reps,
          average_accuracy: analysisRef.current.confidence > 0 ? analysisRef.current.confidence : 85
        });
      }
      
      resetReps();
      startTimeRef.current = null;
      return;
    }

    // Iniciar temporizador
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const handlePoseUpdate = (e) => {
      const landmarks = e.detail;
      const result = analyzePosture(landmarks, exercise);
      setAnalysis(result);
    };

    const handleRep = () => {
      setRepAnim(true);
      setTimeout(() => setRepAnim(false), 500);
      
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
        // Audio block bypass
      }
    };

    window.addEventListener('pose-update', handlePoseUpdate);
    window.addEventListener('rep-complete', handleRep);
    
    return () => {
      window.removeEventListener('pose-update', handlePoseUpdate);
      window.removeEventListener('rep-complete', handleRep);
    };
  }, [active, exercise]);

  const minAngle = exercise?.min_angle || exercise?.minAngle || 0;
  const maxAngle = exercise?.max_angle || exercise?.maxAngle || 180;
  const targetJoint = exercise?.target_joint || exercise?.targetJoint || 'Codo';

  return (
    <div className="feedback-panel glass">
      <div className="panel-header">
        <Target size={20} color="var(--accent-cyan)" />
        <h2>Analítica <span className="neon-text">Cloud</span></h2>
      </div>

      <div className="rep-counter-container">
        <div className={`rep-badge glass ${repAnim ? 'rep-pulse' : ''}`}>
          <span className="rep-label">Repeticiones</span>
          <span className="rep-value">{analysis.reps}</span>
        </div>
      </div>

      <div className="status-grid">
        <div className={`status-card glass ${analysis.status}`}>
          <div className="status-icon">
            {analysis.status === 'correct' ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
          </div>
          <div className="status-info">
            <span className="label">Postura</span>
            <span className="value">{analysis.status === 'correct' ? 'Óptima' : 'Ajustar'}</span>
          </div>
        </div>

        <div className="status-card glass confidence">
          <div className="status-icon">
            <Cpu size={32} color="var(--accent-purple)" />
          </div>
          <div className="status-info">
            <span className="label">IA Confianza</span>
            <span className="value">{analysis.confidence}%</span>
          </div>
        </div>
      </div>

      <div className="metrics-list">
        <div className="metric-item">
          <div className="metric-header">
            <span>Ángulo ({targetJoint})</span>
            <span className="metric-value">{analysis.angle}°</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${analysis.progress}%`, 
                backgroundColor: analysis.status === 'correct' ? 'var(--accent-cyan)' : 'var(--accent-danger)' 
              }}
            ></div>
          </div>
          <div className="range-indicator">
            <span>Objetivo: {minAngle}° - {maxAngle}°</span>
          </div>
        </div>
      </div>

      <div className="guidance-box glass">
        {analysis.status === 'correct' ? <Zap size={18} color="var(--accent-cyan)" /> : <ShieldAlert size={18} color="var(--accent-danger)" />}
        <p>{analysis.message}</p>
      </div>

      <style jsx>{`
        .rep-counter-container {
          display: flex;
          justify-content: center;
          margin-bottom: 8px;
        }
        .rep-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 48px;
          border-radius: 24px;
          border-color: rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .rep-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; color: var(--text-dim); }
        .rep-value { font-size: 4rem; font-weight: 900; color: var(--accent-cyan); text-shadow: var(--neon-glow-cyan); }
        .rep-pulse {
          transform: scale(1.1);
          border-color: var(--accent-cyan);
          background: rgba(0, 242, 255, 0.1);
          box-shadow: 0 0 30px rgba(0, 242, 255, 0.2);
        }
        .range-indicator { font-size: 0.7rem; color: var(--text-dim); text-align: right; margin-top: 4px; }
      `}</style>
    </div>
  );
};

export default FeedbackPanel;
