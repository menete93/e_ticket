// hooks/useTicketCheckout.js
import { useState, useCallback } from 'react';
import * as ticketService from '../../android/services/ticketService';

export const useTicketCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [priceCalculation, setPriceCalculation] = useState(null);
  const [currentSale, setCurrentSale] = useState(null);
  const [mpesaResponse, setMpesaResponse] = useState(null);
  const [step, setStep] = useState('selection'); // selection, payment, success
  const [paymentStatus, setPaymentStatus] = useState('pending');

  // Calcular preço com estratégias e cupom
  const calculatePrice = useCallback(async data => {
    setLoading(true);
    setError(null);
    try {
      const result = await ticketService.calculatePrice(data);
      setPriceCalculation(result);
      return result;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Erro ao calcular preço';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Finalizar compra (checkout)
  const createCheckout = useCallback(async data => {
    setLoading(true);
    setError(null);
    try {
      const result = await ticketService.checkout(data);
      setCurrentSale(result);
      setStep('payment');
      return result;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Erro ao finalizar compra';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Iniciar pagamento M-Pesa
  const initiateMpesaPayment = useCallback(
    async (transactionReference, customerMSISDN, amount) => {
      setLoading(true);
      setPaymentStatus('processing');
      setError(null);

      try {
        const result = await ticketService.mpesaStkPush({
          transactionReference,
          customerMSISDN,
          amount,
          entityCode: 'MOZBUY2024',
        });

        setMpesaResponse(result);

        // Verifica se a requisição foi bem sucedida
        if (result.ResponseCode === '0' || result.success) {
          // Retorna o ID da transação para referência
          return result.CheckoutRequestID || result.transactionReference;
        } else {
          setPaymentStatus('failed');
          throw new Error(
            result.ResponseDescription || 'Erro ao iniciar pagamento',
          );
        }
      } catch (err) {
        setPaymentStatus('failed');
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          'Erro ao processar pagamento M-Pesa';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Confirmar pagamento no backend
  const confirmPayment = useCallback(
    async (transactionId, paymentMethod, paymentReference) => {
      setLoading(true);
      setError(null);
      try {
        const result = await ticketService.processPayment(
          transactionId,
          paymentMethod,
          paymentReference,
        );
        setCurrentSale(result);
        if (result.status === 'PAID') {
          setStep('success');
          setPaymentStatus('success');
        }
        return result;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          'Erro ao confirmar pagamento';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Buscar venda por transação
  const fetchSaleByTransaction = useCallback(async transactionId => {
    setLoading(true);
    setError(null);
    try {
      const result = await ticketService.getSaleByTransaction(transactionId);
      setCurrentSale(result);
      return result;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Erro ao buscar venda';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancelar venda
  const cancelCurrentSale = useCallback(async (transactionId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ticketService.cancelSale(transactionId, reason);
      setCurrentSale(result);
      setStep('selection');
      return result;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Erro ao cancelar venda';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Resetar todo o estado
  const resetCheckout = useCallback(() => {
    setPriceCalculation(null);
    setCurrentSale(null);
    setMpesaResponse(null);
    setStep('selection');
    setPaymentStatus('pending');
    setError(null);
  }, []);

  return {
    // Estados
    loading,
    error,
    priceCalculation,
    currentSale,
    mpesaResponse,
    step,
    paymentStatus,
    // Ações
    calculatePrice,
    createCheckout,
    initiateMpesaPayment,
    confirmPayment,
    fetchSaleByTransaction,
    cancelCurrentSale,
    resetCheckout,
    setStep,
    setPaymentStatus,
  };
};
