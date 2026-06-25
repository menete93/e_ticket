// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, api, registerSignOutCallback } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Registrar callback de logout para o interceptor
  useEffect(() => {
    registerSignOutCallback(signOut);
    return () => {
      registerSignOutCallback(null);
    };
  }, []);

  // Verifica se já existe usuário logado ao iniciar o app
  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        // Configura o token no axios
        auth.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(response) {
    try {
      const { token, user: userData } = response.data;

      // Salva no storage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Configura o axios
      auth.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Atualiza o estado
      setUser(userData);

      return true;
    } catch (error) {
      console.error('Erro no signIn:', error);
      return false;
    }
  }

  async function signOut() {
    try {
      console.log('🚪 Executando logout...');

      // Remove do storage
      await AsyncStorage.multiRemove(['token', 'user']);

      // Remove do axios
      delete auth.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['Authorization'];

      // Limpa o estado
      setUser(null);

      return true;
    } catch (error) {
      console.error('Erro no signOut:', error);
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
