import { api } from './../services/api';

export const getTickets = eventId => api.get(`/ticket/${eventId}`);

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

// Calcular preço com estratégias
export const calculatePrice = async data => {
  const response = await api.post('/tickets/calculate-price', data);
  return response.data;
};

// Finalizar compra
export const checkout = async data => {
  const response = await api.post('/tickets/checkout', data);
  return response.data;
};

// Buscar venda por transação
export const getSaleByTransaction = async transactionId => {
  const response = await api.get(`/tickets/sale/${transactionId}`);
  return response.data;
};

// Buscar vendas do usuário
export const getUserSales = async userId => {
  const response = await api.get(`/tickets/user/${userId}/sales`);
  return response.data;
};

// Calcular preço com cupom
// export const calculateWithCoupon = async (ticketId, quantity, couponCode) => {
//   const response = await api.get('/tickets/calculate-with-coupon', {
//     params: { ticketId, quantity, couponCode }
//   });
//   return response.data;
