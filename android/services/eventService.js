import api from './../api/ticketApi';

// 🔹 Lista todos os eventos
export const getEvents = () => api.get('/events');

// 🔹 Busca evento por ID
export const getEventById = id => api.get(`/events/${id}`);

// 🔹 Cria um novo evento
export const createEvent = async eventData => {
  try {
    const response = await api.post('/events', eventData);
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
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);

// 🔹 Deleta evento
export const deleteEvent = id => api.delete(`/events/${id}`);
