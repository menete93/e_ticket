import { api } from './../services/api';

// 🔹 Lista todos os eventos
export const getEvents = () => api.get('/event');

// 🔹 Busca evento por ID
export const getEventById = id => api.get(`/event/${id}`);

// 🔹 Cria um novo evento
export const createEvent = async eventData => {
  try {
    const response = await api.post('/event', eventData);
    return response.data;
  } catch (error) {
    console.error(
      'Erro ao criar evento:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

// 🔹 Atualiza evento existente
export const updateEvent = (id, data) => api.put(`/event/${id}`, data);

// 🔹 Deleta evento
export const deleteEvent = id => api.delete(`/event/${id}`);
