// hooks/usePayment.js
import { useState } from 'react';
import * as paymentService from '../services/paymentService';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // eslint-disable-next-line no-undef
  const processPayment = useCallback(async data => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.initiatePayment({
        reservationId: data.reservationId,
        paymentMethodCode: data.paymentMethodCode,
        phoneNumber: data.phoneNumber,
        cardData: data.cardData,
      });
      return result;
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
    processPayment,
  };
};
