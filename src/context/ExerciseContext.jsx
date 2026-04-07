import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ExerciseContext = createContext();

export const ExerciseProvider = ({ children }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchExercises();
    } else {
      setExercises([]);
      setSelectedExercise(null);
    }
  }, [user]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setExercises(data || []);
      if (data && data.length > 0) {
        setSelectedExercise(data[0]);
      } else {
        setSelectedExercise(null);
      }
    } catch (err) {
      console.error("Error fetching exercises:", err);
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async (exercise) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert({ ...exercise, user_id: user.id })
        .select();

      if (error) throw error;
      setExercises([...exercises, ...data]);
    } catch (err) {
      console.error("Error adding exercise:", err);
    }
  };

  const removeExercise = async (id) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setExercises(exercises.filter(ex => ex.id !== id));
      if (selectedExercise?.id === id) {
        setSelectedExercise(exercises.find(ex => ex.id !== id) || null);
      }
    } catch (err) {
      console.error("Error removing exercise:", err);
    }
  };

  const selectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  return (
    <ExerciseContext.Provider value={{ 
      exercises, 
      selectedExercise, 
      addExercise, 
      removeExercise, 
      selectExercise,
      loading,
      refreshExercises: fetchExercises
    }}>
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExercises = () => useContext(ExerciseContext);
