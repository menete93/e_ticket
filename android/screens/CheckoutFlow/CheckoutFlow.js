// components/checkout/CheckoutFlow.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTicketCheckout } from './../../hooks/useTicketCheckout';
import { PriceSummary } from './../../screens/PriceSummary/PriceSummary';
import { MpesaPaymentModal } from './../../screens/MpesaPaymentModal/MpesaPaymentModal';
import { SuccessModal } from './../../screens/SuccessModal/SuccessModal';
import { useRoute } from '@react-navigation/native';
import styles from './styles';

const CheckoutFlow = () => {
  const route = useRoute();
  const {
    eventId,
    eventName,
    user,
    selectedTickets: initialSelectedTickets,
    quantities: initialQuantities,
    priceCalculation: initialPriceCalculation,
    couponCode: initialCouponCode,
  } = route.params || {};

  // ==================== ESTADOS ====================
  const [selectedTickets] = useState(initialSelectedTickets || []);
  const [quantities] = useState(initialQuantities || {});
  const [couponCode, setCouponCode] = useState(initialCouponCode || '');
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState({
    email: user?.email || '',
    name: user?.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : '',
    phone: '',
  });

  // ==================== HOOKS ====================
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

  // ==================== FUNÇÕES AUXILIARES ====================
  const formatPrice = price => `${price.toFixed(2)} MT`;
  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const finalPriceCalculation = priceCalculation || initialPriceCalculation;
  const finalPrice = finalPriceCalculation?.finalPrice || 0;

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!initialPriceCalculation && Object.keys(quantities).length > 0) {
      performPriceCalculation();
    }
  }, [initialPriceCalculation, performPriceCalculation, quantities]);

  // ==================== FUNÇÕES DE NEGÓCIO ====================
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const performPriceCalculation = async () => {
    if (Object.keys(quantities).length === 0) return;

    try {
      await calculatePrice({
        userId: user?.id,
        eventId,
        email: buyerInfo.email,
        ticketQuantities: quantities,
        couponCode: couponCode || undefined,
      });
    } catch (error) {
      console.error('Erro ao calcular preço:', error);
    }
  };

  const handleApplyCoupon = async code => {
    setCouponCode(code);
    try {
      await calculatePrice({
        userId: user?.id,
        eventId,
        email: buyerInfo.email,
        ticketQuantities: quantities,
        couponCode: code || undefined,
      });
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!finalPriceCalculation) return;

    const ticketEntry = Object.entries(quantities).find(([_, qty]) => qty > 0);
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
        expectedTotalAmount: finalPriceCalculation.finalPrice,
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

  const isFormValid = () => {
    return buyerInfo.email && buyerInfo.name && buyerInfo.phone;
  };

  // ==================== RENDERIZAÇÃO CONDICIONAL ====================
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

  // ==================== RENDER PRINCIPAL ====================
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar Compra</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Evento */}
        <View style={styles.eventSection}>
          <Text style={styles.eventName}>{eventName}</Text>
          <View style={styles.eventBadge}>
            <Icon name="ticket" size={14} color="#4F46E5" />
            <Text style={styles.eventBadgeText}>{totalTickets} ingressos</Text>
          </View>
        </View>

        {/* Step Progress */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressStep,
              step === 'selection' && styles.progressStepActive,
            ]}
          >
            <View
              style={[
                styles.progressCircle,
                step === 'selection' && styles.progressCircleActive,
              ]}
            >
              {step === 'selection' ? (
                <Text style={styles.progressNumber}>1</Text>
              ) : (
                <Icon name="check" size={16} color="#fff" />
              )}
            </View>
            <Text
              style={[
                styles.progressLabel,
                step === 'selection' && styles.progressLabelActive,
              ]}
            >
              Dados
            </Text>
          </View>
          <View style={styles.progressLine} />
          <View
            style={[
              styles.progressStep,
              step === 'payment' && styles.progressStepActive,
            ]}
          >
            <View
              style={[
                styles.progressCircle,
                step === 'payment' && styles.progressCircleActive,
              ]}
            >
              {step === 'payment' ? (
                <Text style={styles.progressNumber}>2</Text>
              ) : step === 'success' ? (
                <Icon name="check" size={16} color="#fff" />
              ) : (
                <Text style={styles.progressNumber}>2</Text>
              )}
            </View>
            <Text
              style={[
                styles.progressLabel,
                step === 'payment' && styles.progressLabelActive,
              ]}
            >
              Pagamento
            </Text>
          </View>
          <View style={styles.progressLine} />
          <View
            style={[
              styles.progressStep,
              step === 'success' && styles.progressStepActive,
            ]}
          >
            <View
              style={[
                styles.progressCircle,
                step === 'success' && styles.progressCircleActive,
              ]}
            >
              <Text style={styles.progressNumber}>3</Text>
            </View>
            <Text
              style={[
                styles.progressLabel,
                step === 'success' && styles.progressLabelActive,
              ]}
            >
              Confirmação
            </Text>
          </View>
        </View>

        {/* Seção: Seus Ingressos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="ticket" size={22} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Seus ingressos</Text>
          </View>

          {selectedTickets.map((ticket, index) => {
            const quantity = quantities[ticket.id] || 0;
            if (quantity === 0) return null;

            return (
              <View key={index} style={styles.ticketCard}>
                <View style={styles.ticketCardHeader}>
                  <Text style={styles.ticketCardName}>{ticket.name}</Text>
                  <Text style={styles.ticketCardQuantity}>x{quantity}</Text>
                </View>
                <Text style={styles.ticketCardDescription}>
                  {ticket.description || 'Ingresso para o evento'}
                </Text>
                <View style={styles.ticketCardFooter}>
                  <Text style={styles.ticketCardPrice}>
                    {formatPrice(ticket.price)} cada
                  </Text>
                  <Text style={styles.ticketCardSubtotal}>
                    {formatPrice(ticket.price * quantity)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Seção: Dados do Comprador */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="account" size={22} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Dados do comprador</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome completo</Text>
            <TextInput
              style={styles.input}
              value={buyerInfo.name}
              onChangeText={text => setBuyerInfo({ ...buyerInfo, name: text })}
              placeholder="Digite seu nome completo"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={buyerInfo.email}
              onChangeText={text => setBuyerInfo({ ...buyerInfo, email: text })}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefone (M-Pesa)</Text>
            <TextInput
              style={styles.input}
              placeholder="84XXXXXXX"
              value={buyerInfo.phone}
              onChangeText={text =>
                setBuyerInfo({
                  ...buyerInfo,
                  phone: text.replace(/\D/g, ''),
                })
              }
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHelper}>
              Número usado para receber o pedido de pagamento M-Pesa
            </Text>
          </View>
        </View>

        {/* Resumo e Total */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(finalPriceCalculation?.subtotal || 0)}
            </Text>
          </View>

          {finalPriceCalculation?.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.discountLabel}>Desconto</Text>
              <Text style={styles.discountValue}>
                - {formatPrice(finalPriceCalculation.discount)}
              </Text>
            </View>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalValue}>{formatPrice(finalPrice)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão fixo no final */}
      {step === 'selection' && finalPrice > 0 && (
        <View style={styles.fixedButton}>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              (!isFormValid() || loading) && styles.checkoutButtonDisabled,
            ]}
            onPress={handleProceedToCheckout}
            disabled={!isFormValid() || loading}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.checkoutGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.checkoutButtonText}>Continuar</Text>
                  <Text style={styles.checkoutButtonPrice}>
                    {formatPrice(finalPrice)}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Modais */}
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

      {/* Toast de Erro */}
      {error && (
        <View style={styles.errorToast}>
          <Icon name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.errorToastText}>{error}</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.errorToastClose}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CheckoutFlow;
