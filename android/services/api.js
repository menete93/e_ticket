import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = axios.create({
  baseURL: 'http://10.0.2.2:8085/api', // coloque o endpoint da sua API
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const api = axios.create({
  baseURL: 'http://10.0.2.2:8085/e-ticket', // coloque o endpoint da sua API
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Intercepta as requisições e adiciona o token automaticamente
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api, auth };
