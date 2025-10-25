import axios from 'axios';
import { Alert } from 'react-native';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // URL da sua API Spring Boot
});

export const getTickets = () => api.get('/tickets');
export const getTicketById = id => api.get(`/tickets/${id}`);
export const createTicket = data => api.post('/tickets', data);
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data);
export const deleteTicket = id => api.delete(`/tickets/${id}`);

/**
 * Função para criar uma categoria no backend
 * @param {Object} data - { name: string, description: string }
 * @returns {Promise<Object>} resposta da API
 */
export const createCategory = async data => {
  try {
    const response = await axios.post(api, data);
    if (response.status === 201 || response.status === 200) {
      return response.data;
    } else {
      throw new Error('Falha ao criar a categoria');
    }
  } catch (error) {
    console.log('Erro no categoryService:', error.message);
    Alert.alert('Erro', 'Não foi possível criar a categoria.');
    throw error;
  }
};
