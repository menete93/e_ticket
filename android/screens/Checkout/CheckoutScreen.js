// screens/checkout/CheckoutScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import PriceBreakdown from '../../components/PriceBreakdown';
import styles from './style';

export default function CheckoutScreen({ route, navigation }) {
  const { user } = useAuth();
  const { event, selectedTickets, quantities, priceCalculation, couponCode } =
    route.params;

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);

  // Dados do comprador
  const [buyerInfo, setBuyerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: '',
  });

  // Método de pagamento
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const paymentMethods = [
    { id: 'CARD', name: 'Cartão de Crédito', icon: 'credit-card' },
    { id: 'MPESA', name: 'M-Pesa', icon: 'cellphone' },
    { id: 'BANK_TRANSFER', name: 'Transferência Bancária', icon: 'bank' },
  ];

  // Erros de validação
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!buyerInfo.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!buyerInfo.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(buyerInfo.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!buyerInfo.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (paymentMethod === 'CARD' && !buyerInfo.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório para pagamento com cartão';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      // Preparar dados da venda
      const saleData = {
        ticketId: selectedTickets[0].id, // Por enquanto, apenas um tipo de ticket
        quantity: Object.values(quantities).reduce((a, b) => a + b, 0),
        couponCode: couponCode || null,
        buyerEmail: buyerInfo.email,
        buyerName: buyerInfo.name,
        buyerPhone: buyerInfo.phone,
        paymentMethod: paymentMethod,
        userId: user?.id,
        expectedTotalAmount: priceCalculation?.finalPrice,
      };

      console.log('📦 Enviando venda:', saleData);

      // Chamar API de checkout
      const response = await ticketService.checkout(saleData);

      setPurchaseResult(response);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro no checkout:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          'Não foi possível processar o pagamento',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Navegar de volta para a lista de eventos ou para a tela de ingressos comprados
    navigation.navigate('Events');
  };

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar Compra</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumo do Pedido */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋 Resumo do Pedido</Text>

          {selectedTickets.map(ticket => (
            <View key={ticket.id} style={styles.summaryItem}>
              <Text style={styles.summaryItemName}>{ticket.ticketName}</Text>
              <Text style={styles.summaryItemQuantity}>
                x{quantities[ticket.id]}
              </Text>
              <Text style={styles.summaryItemPrice}>
                R$ {(ticket.basePrice * quantities[ticket.id]).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.summaryDivider} />

          {/* Price Breakdown Component */}
          <PriceBreakdown calculation={priceCalculation} />
        </View>

        {/* Dados do Comprador */}
        <View style={styles.inputCard}>
          <Text style={styles.sectionTitle}>👤 Dados do Comprador</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Digite seu nome completo"
              value={buyerInfo.name}
              onChangeText={text => {
                setBuyerInfo({ ...buyerInfo, name: text });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={buyerInfo.email}
              onChangeText={text => {
                setBuyerInfo({ ...buyerInfo, email: text });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="(84) 12345-6789"
              keyboardType="phone-pad"
              value={buyerInfo.phone}
              onChangeText={text => {
                setBuyerInfo({ ...buyerInfo, phone: text });
                if (errors.phone) setErrors({ ...errors, phone: null });
              }}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          {paymentMethod === 'CARD' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF *</Text>
              <TextInput
                style={[styles.input, errors.cpf && styles.inputError]}
                placeholder="000.000.000-00"
                keyboardType="numeric"
                value={buyerInfo.cpf}
                onChangeText={text => {
                  setBuyerInfo({ ...buyerInfo, cpf: text });
                  if (errors.cpf) setErrors({ ...errors, cpf: null });
                }}
              />
              {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}
            </View>
          )}
        </View>

        {/* Método de Pagamento */}
        <View style={styles.paymentMethods}>
          <Text style={styles.sectionTitle}>💳 Método de Pagamento</Text>

          {paymentMethods.map((method, index) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                index === paymentMethods.length - 1 && styles.paymentOptionLast,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Icon
                name={
                  paymentMethod === method.id
                    ? 'radiobox-marked'
                    : 'radiobox-blank'
                }
                size={20}
                color={paymentMethod === method.id ? '#6366F1' : '#9CA3AF'}
              />
              <Icon name={method.icon} size={20} color="#4B5563" />
              <Text
                style={[
                  styles.paymentOptionText,
                  paymentMethod === method.id && styles.paymentOptionSelected,
                ]}
              >
                {method.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Espaço para o footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer com total e botão */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total a pagar</Text>
          <Text style={styles.footerTotalValue}>
            R$ {priceCalculation?.finalPrice?.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#9CA3AF', '#6B7280'] : ['#6366F1', '#8B5CF6']}
            style={styles.checkoutGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.checkoutButtonText}>Confirmar e Pagar</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modal de Sucesso */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.modalIcon}
            >
              <Icon name="check" size={40} color="#FFFFFF" />
            </LinearGradient>

            <Text style={styles.modalTitle}>Compra realizada com sucesso!</Text>

            <Text style={styles.modalText}>
              {totalTickets} ingresso(s) para {event.name}
            </Text>

            {purchaseResult && (
              <>
                <Text style={styles.modalTransactionId}>
                  Transação: {purchaseResult.transactionId}
                </Text>
                <Text style={styles.modalText}>
                  Enviamos os ingressos para {buyerInfo.email}
                </Text>
              </>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleModalClose}
            >
              <Text style={styles.modalButtonText}>Ver meus ingressos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
