import { api } from './../services/api';

export const getTickets = () => api.get('/ticket');

export const getTicketById = id => api.get(`/ticket/${id}`);

export const createTicketsForEvent = async ticketData => {
  try {
    const response = await api.post('/ticket', ticketData);
    return response.data;
  } catch (error) {
    console.log(JSON.stringify(ticketData), 'envio a API');
    console.error(
      'Erro ao criar ticket:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

// 🔹 Atualiza ticket existente
export const updateTicket = (id, data) => api.put(`/ticket/${id}`, data);

// 🔹 Deleta ticket
export const deleteTicket = id => api.delete(`/ticket/${id}`);
