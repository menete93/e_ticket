import axios from 'axios';
import { Alert } from 'react-native';

// Instância axios com baseURL
const api = axios.create({
  baseURL: 'http://10.0.2.2:8080/api', // Substitua pelo seu backend
});

// Função para criar categoria
export const createCategory = async data => {
  try {
    const response = await api.post('/event-categories', data);
    if (response.status === 201 || response.status === 200) {
      return response.data;
    } else {
      throw new Error('Falha ao criar a categoria');
    }
  } catch (error) {
    console.log('Erro categoryService:', error.message);
    Alert.alert('Erro', 'Não foi possível criar a categoria.');
    throw error;
  }
};
