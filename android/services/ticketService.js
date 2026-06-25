// services/ticket.service.js
import { api } from './api';

// ==================== TICKETS ====================
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

export const updateTicket = (id, data) => api.put(`/ticket/${id}`, data);

export const deleteTicket = id => api.delete(`/ticket/${id}`);

// ==================== CHECKOUT & SALES ====================
export const calculatePrice = async data => {
  try {
    const response = await api.post('/api/v1/tickets/calculate-price', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao calcular preço:', error);
    throw error;
  }
};

// services/ticketService.js
export const checkout = async data => {
  // 🔥 LOG ANTES DE ENVIAR
  console.log('🚀 ==== ENVIANDO REQUEST ====');
  console.log('📦 Dados completos:', JSON.stringify(data, null, 2));
  console.log('📦 paymentMethod:', data.paymentMethod);
  console.log('📦 ticketId:', data.ticketId);
  console.log('📦 quantity:', data.quantity);
  console.log('📦 expectedTotalAmount:', data.expectedTotalAmount);
  console.log('============================');

  const response = await api.post('/api/v1/tickets/checkout', {
    ticketId: data.ticketId,
    quantity: data.quantity,
    couponCode: data.couponCode,
    buyerName: data.buyerName,
    buyerEmail: data.buyerEmail,
    paymentMethod: data.paymentMethod,
    userId: data.userId,
    eventId: data.eventId,
    expectedTotalAmount: data.expectedTotalAmount,
  });

  // 🔥 LOG DEPOIS DE RECEBER RESPOSTA
  console.log('✅ ==== RESPOSTA RECEBIDA ====');
  console.log('Resposta:', JSON.stringify(response.data, null, 2));
  console.log('==============================');

  return response.data;
};

export const getSaleByTransaction = async transactionId => {
  const response = await api.get(`/api/v1/tickets/sale/${transactionId}`);
  return response.data;
};

export const getUserSales = async userId => {
  const response = await api.get(`/api/v1/tickets/user/${userId}/sales`);
  return response.data;
};

export const processPayment = async (
  transactionId,
  paymentMethod,
  paymentReference,
) => {
  const response = await api.post(
    `/api/v1/tickets/sale/${transactionId}/process-payment`,
    null,
    {
      params: { paymentMethod, paymentReference },
    },
  );
  return response.data;
};

export const cancelSale = async (transactionId, reason) => {
  const response = await api.post(
    `/api/v1/tickets/sale/${transactionId}/cancel`,
    null,
    {
      params: { reason },
    },
  );
  return response.data;
};

export const calculateWithCoupon = async (ticketId, quantity, couponCode) => {
  const response = await api.get('/api/v1/tickets/calculate-with-coupon', {
    params: { ticketId, quantity, couponCode },
  });
  return response.data;
};

// ==================== M-PESA PAYMENT ====================
export const mpesaStkPush = async paymentData => {
  // Ajustado conforme os parâmetros do seu backend M-Pesa
  const response = await api.post('/payments/mpesa/stkpush', {
    transactionReference: paymentData.transactionReference,
    customerMSISDN: paymentData.customerMSISDN,
    amount: paymentData.amount,
    entityCode: paymentData.entityCode || 'MOZBUY2024', // Código da entidade/empresa
  });
  return response.data;
};

export const checkMpesaPaymentStatus = async transactionReference => {
  const response = await api.get(
    `/payments/mpesa/status/${transactionReference}`,
  );
  return response.data;
};

export const batchUpdateTickets = async (
  eventId,
  updates,
  globalChangeReason,
) => {
  console.log('🔵 Atualizando múltiplos tickets:');
  console.log('eventId:', eventId);
  console.log('updates:', updates);

  const data = {
    eventId: eventId,
    tickets: updates.map(update => ({
      ticketId: update.ticketId,
      totalQuantity: update.totalQuantity,
      changeReason: update.changeReason || globalChangeReason,
    })),
    globalChangeReason: globalChangeReason || 'Ajuste em lote pelo organizador',
  };

  const response = await api.put(
    `/ticket/event/${eventId}/tickets/batch`,
    data,
  );
  return response.data;
};
