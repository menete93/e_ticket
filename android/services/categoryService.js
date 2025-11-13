import axios from 'axios';
import { Alert } from 'react-native';
import { api } from './../services/api';
// Instância axios com baseURL
// const api = axios.create({
//   baseURL: 'http://10.0.2.2:8085/e-ticket', // Substitua pelo seu backend
// });

export const getTickets = () => api.get('/tickets');
export const getTicketById = id => api.get(`/tickets/${id}`);
export const createTicket = data => api.post('/tickets', data);
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data);
export const deleteTicket = id => api.delete(`/tickets/${id}`);

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

export default async function getCategories() {
  const response = await api.get('/event-categories');
  return response.data; // deve retornar um array de objetos [{ id, name }, ...]
}
