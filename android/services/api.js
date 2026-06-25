// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

let globalSignOutCallback = null;

export const registerSignOutCallback = callback => {
  globalSignOutCallback = callback;
};

const auth = axios.create({
  baseURL: 'http://10.0.2.2:8085/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

const api = axios.create({
  baseURL: 'http://10.0.2.2:8085/e-ticket',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Função auxiliar para configurar interceptadores
const configureInterceptor = instance => {
  instance.interceptors.request.use(async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
        if (globalSignOutCallback) await globalSignOutCallback();
        Alert.alert('Sessão Expirada', 'Faça login novamente.');
      }
      return Promise.reject(error);
    },
  );
};

// Configurar ambos
configureInterceptor(api);
configureInterceptor(auth);

export { api, auth };
