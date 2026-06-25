// hooks/useTicketCheckout.js
import { useState, useCallback } from 'react';
import * as ticketService from '../services/ticketService';

export const useTicketCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReservation = useCallback(async data => {
    setLoading(true);
    setError(null);
    try {
      const result = await ticketService.checkout({
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

      return {
        id: result.id,
        reservationCode: result.transactionId,
        expiresAt: result.expiresAt || new Date(Date.now() + 30 * 60 * 1000),
        amount: result.totalAmount,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createReservation,
  };
};
