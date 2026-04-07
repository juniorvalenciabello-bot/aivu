import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSessions();
    } else {
      setSessions([]);
    }
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const addSession = async (sessionData) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ ...sessionData, user_id: user.id })
        .select();

      if (error) {
        window.alert("Error de Supabase: " + error.message);
        throw error;
      }
      if (data && data.length > 0) {
        setSessions(prev => [data[0], ...prev]);
        window.alert("¡Sesión Guardada en la Nube con Éxito!");
      }
    } catch (err) {
      console.error("Error adding session:", err);
    }
  };

  const deleteSession = async (id) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  return (
    <SessionContext.Provider value={{ sessions, addSession, deleteSession, loading, fetchSessions }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessions = () => useContext(SessionContext);
