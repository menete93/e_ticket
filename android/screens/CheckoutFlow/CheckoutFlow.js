import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTicketCheckout } from './../../hooks/useTicketCheckout';
import { TicketSelector } from './../../screens/TicketSelector/TicketSelector';
import { PriceSummary } from './../../screens/PriceSummary/PriceSummary';
import { MpesaPaymentModal } from './../../screens/MpesaPaymentModal/MpesaPaymentModal';
import { SuccessModal } from './../../screens/SuccessModal/SuccessModal';
import styles from './styles';

export const CheckoutFlow = ({ eventId, eventName, user }) => {
  const {
    loading,
    error,
    priceCalculation,
    currentSale,
    step,
    calculatePrice,
    createCheckout,
    initiateMpesaPayment,
    confirmPayment,
    resetCheckout,
    setStep,
  } = useTicketCheckout();

  const [selectedTickets, setSelectedTickets] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    email: user?.email || '',
    name: user?.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : '',
    phone: '',
  });

  useEffect(() => {
    const hasTickets = Object.values(selectedTickets).some(qty => qty > 0);
    if (hasTickets && user?.id) {
      const ticketQuantities = {};
      Object.entries(selectedTickets).forEach(([ticketId, qty]) => {
        if (qty > 0) {
          ticketQuantities[ticketId] = qty;
        }
      });

      calculatePrice({
        userId: user.id,
        eventId,
        email: buyerInfo.email,
        ticketQuantities,
      });
    }
  }, [selectedTickets, eventId, user.id, buyerInfo.email, calculatePrice]);

  const handleApplyCoupon = async code => {
    setCouponCode(code);
    const hasTickets = Object.values(selectedTickets).some(qty => qty > 0);
    if (hasTickets && user?.id) {
      const ticketQuantities = {};
      Object.entries(selectedTickets).forEach(([ticketId, qty]) => {
        if (qty > 0) {
          ticketQuantities[ticketId] = qty;
        }
      });

      await calculatePrice({
        userId: user.id,
        eventId,
        email: buyerInfo.email,
        ticketQuantities,
        couponCode: code,
      });
    }
  };

  const handleProceedToCheckout = async () => {
    if (!priceCalculation || !user) return;

    const ticketEntry = Object.entries(selectedTickets).find(
      ([_, qty]) => qty > 0,
    );
    if (!ticketEntry) return;

    const [ticketId, quantity] = ticketEntry;

    try {
      await createCheckout({
        ticketId: parseInt(ticketId),
        quantity,
        couponCode: couponCode || undefined,
        buyerEmail: buyerInfo.email,
        buyerName: buyerInfo.name,
        buyerPhone: buyerInfo.phone,
        paymentMethod: 'MPESA',
        userId: user.id,
        expectedTotalAmount: priceCalculation.total,
      });

      setShowMpesaModal(true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a venda');
    }
  };

  const handleMpesaPayment = async phoneNumber => {
    if (!currentSale) return;

    try {
      const checkoutRequestId = await initiateMpesaPayment(
        currentSale.transactionId,
        phoneNumber,
        currentSale.totalAmount,
      );

      await confirmPayment(
        currentSale.transactionId,
        'MPESA',
        checkoutRequestId,
      );

      setShowMpesaModal(false);
      setShowSuccessModal(true);
      setStep('success');
    } catch (error) {
      Alert.alert(
        'Erro no Pagamento',
        error.message || 'Falha ao processar pagamento',
      );
    }
  };

  if (step === 'success' && showSuccessModal && currentSale) {
    return (
      <SuccessModal
        isOpen={showSuccessModal}
        sale={currentSale}
        onClose={() => {
          setShowSuccessModal(false);
          resetCheckout();
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finalizar Compra - {eventName}</Text>
        <View style={styles.stepIndicator}>
          <View
            style={[
              styles.step,
              step === 'selection' && styles.stepActive,
              (step === 'payment' || step === 'success') &&
                styles.stepCompleted,
            ]}
          >
            <Text
              style={[
                styles.stepText,
                (step === 'selection' ||
                  step === 'payment' ||
                  step === 'success') &&
                  styles.stepTextActive,
              ]}
            >
              1. Selecionar
            </Text>
          </View>
          <View
            style={[
              styles.step,
              step === 'payment' && styles.stepActive,
              step === 'success' && styles.stepCompleted,
            ]}
          >
            <Text
              style={[
                styles.stepText,
                (step === 'payment' || step === 'success') &&
                  styles.stepTextActive,
              ]}
            >
              2. Pagamento
            </Text>
          </View>
          <View style={[styles.step, step === 'success' && styles.stepActive]}>
            <Text
              style={[
                styles.stepText,
                step === 'success' && styles.stepTextActive,
              ]}
            >
              3. Confirmação
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.leftColumn}>
          <TicketSelector
            eventId={eventId}
            onSelectionChange={setSelectedTickets}
            disabled={step !== 'selection'}
          />

          {step === 'selection' &&
            Object.values(selectedTickets).some(qty => qty > 0) && (
              <View style={styles.buyerInfoSection}>
                <Text style={styles.sectionTitle}>
                  Informações do Comprador
                </Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nome Completo *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={buyerInfo.name}
                    onChangeText={text =>
                      setBuyerInfo({ ...buyerInfo, name: text })
                    }
                    placeholder="Digite seu nome completo"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Email *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={buyerInfo.email}
                    onChangeText={text =>
                      setBuyerInfo({ ...buyerInfo, email: text })
                    }
                    placeholder="seu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Telefone (M-Pesa) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="84XXXXXXX"
                    value={buyerInfo.phone}
                    onChangeText={text =>
                      setBuyerInfo({
                        ...buyerInfo,
                        phone: text.replace(/\D/g, ''),
                      })
                    }
                    keyboardType="phone-pad"
                  />
                  <Text style={styles.helperText}>
                    Número usado para receber a solicitação de pagamento M-Pesa
                  </Text>
                </View>
              </View>
            )}
        </View>

        <View style={styles.rightColumn}>
          {priceCalculation && (
            <PriceSummary
              priceCalculation={priceCalculation}
              onApplyCoupon={handleApplyCoupon}
              loading={loading}
            />
          )}
        </View>
      </View>

      {step === 'selection' &&
        priceCalculation &&
        priceCalculation.total > 0 && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={handleProceedToCheckout}
              disabled={
                loading ||
                !buyerInfo.email ||
                !buyerInfo.name ||
                !buyerInfo.phone
              }
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.proceedButtonText}>
                  Continuar para Pagamento - {priceCalculation.total} MT
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

      {showMpesaModal && currentSale && (
        <MpesaPaymentModal
          isOpen={showMpesaModal}
          sale={currentSale}
          buyerPhone={buyerInfo.phone}
          onClose={() => setShowMpesaModal(false)}
          onConfirmPayment={handleMpesaPayment}
          loading={loading}
        />
      )}

      {error && (
        <View style={styles.errorToast}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.errorClose}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};
