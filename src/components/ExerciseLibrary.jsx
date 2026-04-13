import React, { useState } from 'react';
import { useExercises } from '../context/ExerciseContext';
import { Plus, Trash2, Award, Info, ChevronRight, Search, Activity, Dumbbell } from 'lucide-react';
import './ExerciseLibrary.css';

const ExerciseLibrary = () => {
  const { exercises, addExercise, removeExercise, selectExercise, selectedExercise, loading } = useExercises();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newExercise, setNewExercise] = useState({
    name: '',
    target_joint: 'ELBOW',
    min_angle: 45,
    max_angle: 150,
    target_reps: 10,
    type: 'ARM',
    description: ''
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    await addExercise(newExercise);
    setShowAddForm(false);
    setNewExercise({ name: '', target_joint: 'ELBOW', min_angle: 45, max_angle: 150, target_reps: 10, type: 'ARM', description: '' });
  };

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="library-container">
      <div className="library-header">
        <div className="header-text">
          <h1>Biblioteca <span className="neon-text">Cloud</span></h1>
          <p>Tus ejercicios se sincronizan automáticamente en todos tus dispositivos.</p>
        </div>
        <button className="neon-btn" onClick={() => setShowAddForm(true)}>
          <Plus size={20} /> Añadir Ejercicio
        </button>
      </div>

      <div className="search-bar glass">
        <Search size={20} color="var(--text-dim)" />
        <input 
          type="text" 
          placeholder="Buscar ejercicios sincronizados..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <div className="loading-spinner">Sincronizando con Supabase...</div>}

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal glass">
            <h2>Configurar Nuevo <span className="neon-text">Ejercicio</span></h2>
            <form onSubmit={handleAdd} className="add-form">
              <div className="input-field">
                <label>Nombre del Ejercicio</label>
                <input 
                  type="text" 
                  placeholder="Ej: Press Militar"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                  required 
                />
              </div>
              <div className="input-row">
                <div className="input-field">
                  <label>Articulación Objetivo</label>
                  <select 
                    value={newExercise.target_joint}
                    onChange={(e) => setNewExercise({...newExercise, target_joint: e.target.value})}
                  >
                    <option value="ELBOW">Codo (Brazo)</option>
                    <option value="SHOULDER">Hombro</option>
                    <option value="KNEE">Rodilla (Pierna)</option>
                    <option value="HIP">Cadera</option>
                  </select>
                </div>
                <div className="input-field">
                  <label>Tipo</label>
                  <select 
                    value={newExercise.type}
                    onChange={(e) => setNewExercise({...newExercise, type: e.target.value})}
                  >
                    <option value="ARM">Brazo</option>
                    <option value="LEG">Pierna</option>
                    <option value="CHEST">Pecho</option>
                    <option value="BACK">Espalda</option>
                  </select>
                </div>
              </div>
              <div className="input-row">
                <div className="input-field">
                  <label>Ángulo Mínimo (°)</label>
                  <input 
                    type="number" 
                    value={newExercise.min_angle}
                    onChange={(e) => setNewExercise({...newExercise, min_angle: parseInt(e.target.value)})}
                  />
                </div>
                <div className="input-field">
                  <label>Ángulo Máximo (°)</label>
                  <input 
                    type="number" 
                    value={newExercise.max_angle}
                    onChange={(e) => setNewExercise({...newExercise, max_angle: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="input-row">
                <div className="input-field" style={{ width: '100%' }}>
                  <label>Meta de Repeticiones</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="Ej: 10"
                    value={newExercise.target_reps}
                    onChange={(e) => setNewExercise({...newExercise, target_reps: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="modal-buttons">
                <button type="button" className="nav-item" onClick={() => setShowAddForm(false)}>Cancelar</button>
                <button type="submit" className="neon-btn">Crear en la Nube</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="exercise-grid">
        {filteredExercises.map(ex => (
          <div 
            key={ex.id} 
            className={`exercise-card glass ${selectedExercise?.id === ex.id ? 'selected' : ''}`}
            onClick={() => selectExercise(ex)}
          >
            <div className="card-top">
              <div className="exercise-icon">
                {ex.type === 'LEG' ? <Dumbbell size={24} color="var(--accent-purple)" /> : <Activity size={24} color="var(--accent-cyan)" />}
              </div>
              <div className="exercise-info">
                <h3>{ex.name}</h3>
                <span className="type-tag">{ex.type}</span>
              </div>
              <button 
                className="delete-btn" 
                onClick={(e) => { e.stopPropagation(); removeExercise(ex.id); }}
                title="Quitar de la Nube"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="card-details">
              <div className="joint-info">
                <Award size={16} color="var(--accent-cyan)" />
                <span>Rango: {ex.min_angle || ex.minAngle}° - {ex.max_angle || ex.maxAngle}°</span>
              </div>
              <div className="joint-info">
                <Info size={16} color="var(--text-dim)" />
                <span>Base: {ex.target_joint || ex.targetJoint}</span>
              </div>
              <div className="joint-info">
                <Activity size={16} color="var(--accent-purple)" />
                <span>Meta: {ex.target_reps || 10} reps</span>
              </div>
            </div>
            {selectedExercise?.id === ex.id && (
              <div className="selected-indicator">
                <ChevronRight size={20} color="white" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .loading-spinner {
          color: var(--accent-cyan);
          margin-bottom: 24px;
          font-weight: 600;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ExerciseLibrary;
