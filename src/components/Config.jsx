import React, { useState } from 'react';
import { Settings, Camera, Cpu, Bell, Shield, ChevronRight } from 'lucide-react';
import './Config.css';

const Config = () => {
  const [settings, setSettings] = useState({
    mirrorCamera: true,
    hdVideo: true,
    showSkeleton: true,
    aiSensitivity: 0.75,
    soundAlerts: false,
    autoSave: true
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSensitivity = (e) => {
    setSettings(prev => ({ ...prev, aiSensitivity: parseFloat(e.target.value) }));
  };

  return (
    <div className="config-container">
      <div className="config-header">
        <h1>Configuración del <span className="neon-text">Sistema</span></h1>
        <p>Personaliza tu experiencia de monitoreo y análisis de IA.</p>
      </div>

      <div className="config-grid">
        <div className="config-section glass">
          <div className="section-title">
            <Camera size={20} color="var(--accent-cyan)" />
            <h3>Hardware y Cámara</h3>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span>Espejo de Cámara</span>
              <p>Invertir horizontalmente la previsualización.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={settings.mirrorCamera} onChange={() => toggleSetting('mirrorCamera')} />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span>Alta Definición (1080p)</span>
              <p>Mejorar precisión del modelo con mayor resolución.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={settings.hdVideo} onChange={() => toggleSetting('hdVideo')} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        <div className="config-section glass">
          <div className="section-title">
            <Cpu size={20} color="var(--accent-purple)" />
            <h3>Motor de IA</h3>
          </div>
          <div className="setting-item vertical">
            <div className="setting-info">
              <span>Sensibilidad de Detección</span>
              <p>Nivel de confianza requerido para el reconocimiento.</p>
            </div>
            <div className="range-controls">
              <input 
                type="range" 
                min="0.1" 
                max="0.95" 
                step="0.05" 
                value={settings.aiSensitivity} 
                onChange={handleSensitivity}
              />
              <span className="range-value">{Math.round(settings.aiSensitivity * 100)}%</span>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span>Visualizar Esqueleto</span>
              <p>Mostrar puntos clave sobre el video.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={settings.showSkeleton} onChange={() => toggleSetting('showSkeleton')} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        <div className="config-section glass">
          <div className="section-title">
            <Bell size={20} color="var(--accent-danger)" />
            <h3>Notificaciones y Alertas</h3>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span>Alertas Sonoras</span>
              <p>Beeps audibles al detectar mala postura.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={settings.soundAlerts} onChange={() => toggleSetting('soundAlerts')} />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span>Auto-guardar Sesiones</span>
              <p>Guardar automáticamente al finalizar un ejercicio.</p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={settings.autoSave} onChange={() => toggleSetting('autoSave')} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="config-footer">
        <button className="neon-btn">Guardar Cambios</button>
        <button className="nav-item">Restablecer valores predeterminados</button>
      </div>

      <style jsx>{`
        .config-container {
          animation: fadeIn 0.4s ease-out;
        }
        .config-header {
          margin-bottom: 32px;
        }
        .config-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }
        .config-section {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--glass-border);
        }
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .setting-item.vertical {
          flex-direction: column;
          align-items: flex-start;
        }
        .setting-info span {
          display: block;
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 4px;
        }
        .setting-info p {
          color: var(--text-dim);
          font-size: 0.8rem;
        }
        .range-controls {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .range-value {
          font-family: var(--font-heading);
          font-weight: 800;
          color: var(--accent-cyan);
          min-width: 45px;
        }
        .config-footer {
          margin-top: 40px;
          display: flex;
          gap: 20px;
          align-items: center;
        }
        /* Toggle Switch */
        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .4s;
          border: 1px solid var(--glass-border);
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px; width: 16px;
          left: 4px; bottom: 3px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider {
          background-color: var(--accent-cyan);
          border-color: var(--accent-cyan);
        }
        input:checked + .slider:before {
          transform: translateX(24px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default Config;
