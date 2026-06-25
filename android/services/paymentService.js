import { api } from './api';

// Criar transação de pagamento
export const createPaymentTransaction = async data => {
  const response = await api.post('/payment/mpesa/transaction/create', {
    saleId: data.saleId,
    eventId: data.eventId,
    userId: data.userId,
    amount: data.amount,
    payerPhone: data.phoneNumber,
    payerEmail: data.email,
    payerName: data.name,
    paymentMethodCode: 'MPESA',
  });
  return response.data;
};

// Iniciar pagamento M-Pesa - A RESPOSTA JÁ É O RESULTADO FINAL
export const initiateMpesaPayment = async data => {
  const response = await api.post('/payment/mpesa/initiate', {
    reservationCode: data.reservationCode,
    saleId: data.saleId,
    phoneNumber: data.phoneNumber,
  });
  return response.data; // ← JÁ TEM O RESULTADO DO PAGAMENTO!
};

// Obter status da transação
export const getPaymentStatus = async reservationCode => {
  const response = await api.get(
    `/payment/transactions/${reservationCode}/status`,
  );
  return response.data;
};

// Cancelar transação
export const cancelTransaction = async (reservationCode, reason) => {
  const response = await api.post(
    `/payment/transactions/${reservationCode}/cancel`,
    { reason },
  );
  return response.data;
};

export const initiatePayment = async data => {
  const response = await api.post(
    `/payment/${data.paymentMethodCode.toLowerCase()}/initiate`,
    {
      reservationId: data.reservationId,
      phoneNumber: data.phoneNumber,
      paymentMethodCode: data.paymentMethodCode,
    },
  );
  return response.data;
};

export const getReservationStatus = async reservationId => {
  const response = await api.get(
    `/payment/reservations/${reservationId}/status`,
  );
  return response.data;
};

export const getUserReservations = async () => {
  const response = await api.get('/payment/reservations');
  return response.data;
};
