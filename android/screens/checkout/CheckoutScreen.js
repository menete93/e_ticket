// screens/checkout/CheckoutScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTicketCheckout } from '../../hooks/useTicketCheckout';
import styles from './styles';

// Métodos de pagamento com logos e cores
const paymentMethods = [
  {
    id: 'MPESA',
    name: 'M-Pesa',
    logo: require('./../../../assets/images/mpesa-logo.png'),
    description: 'Pague com seu M-Pesa',
    colors: ['#4B0082', '#6A0DAD'],
    backgroundColor: '#6A0DAD10',
    allowedPrefixes: ['84', '85'],
    phoneMask: '84XXXXXXX ou 85XXXXXXX',
    flowType: 'SYNCHRONOUS',
  },
  {
    id: 'EMOLA',
    name: 'eMola',
    logo: require('./../../../assets/images/emola-logo.png'),
    description: 'Pague com sua carteira eMola',
    colors: ['#E85D04', '#DC2F02'],
    backgroundColor: '#E85D0410',
    allowedPrefixes: ['86', '87'],
    phoneMask: '86XXXXXXX ou 87XXXXXXX',
    flowType: 'SYNCHRONOUS',
  },
  {
    id: 'CARD',
    name: 'Cartão de Crédito',
    logo: require('./../../../assets/images/card-logo.png'),
    description: 'Visa, Mastercard, American Express',
    colors: ['#1E3A8A', '#3B82F6'],
    backgroundColor: '#1E3A8A10',
    allowedPrefixes: [],
    phoneMask: null,
    flowType: 'SYNCHRONOUS',
  },
];

export default function CheckoutScreen({ route, navigation }) {
  const {
    event,
    selectedTickets,
    quantities,
    priceCalculation,
    couponCode,
    user,
  } = route.params;

  const [buyerInfo, setBuyerInfo] = useState({
    email: user?.email || '',
    name: user?.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : '',
  });
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const { createReservation } = useTicketCheckout();

  const finalPrice = priceCalculation?.finalPrice || 0;
  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleCreateReservation = async () => {
    if (!buyerInfo.name || !buyerInfo.email) {
      Alert.alert('Atenção', 'Preencha todos os dados do comprador');
      return;
    }

    if (!selectedMethod) {
      Alert.alert('Atenção', 'Selecione um método de pagamento');
      return;
    }

    setLoading(true);
    try {
      const reservation = await createReservation({
        ticketId: selectedTickets[0]?.id,
        quantity: totalTickets,
        couponCode: couponCode,
        buyerName: buyerInfo.name,
        buyerEmail: buyerInfo.email,
        paymentMethod: selectedMethod.id,
        userId: user?.id,
        eventId: event.id,
        expectedTotalAmount: finalPrice,
      });

      navigation.replace('ReservationCreated', {
        reservation,
        paymentMethod: selectedMethod.id,
        reservationCode: reservation.reservationCode, // ← PRECISA TER!
        buyerInfo,
        event,
        amount: finalPrice,
      });
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível criar a reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.eventCard}>
          <Text style={styles.eventName}>{event.name}</Text>
          <View style={styles.eventMeta}>
            <Icon name="calendar" size={14} color="#6B7280" />
            <Text style={styles.eventDate}>
              {new Date(event.eventDate).toLocaleDateString('pt-BR')}
            </Text>
            <Icon
              name="ticket"
              size={14}
              color="#6B7280"
              style={{ marginLeft: 12 }}
            />
            <Text style={styles.eventTickets}>{totalTickets} ingresso(s)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do comprador</Text>

          <View style={styles.inputGroup}>
            <Icon
              name="account"
              size={20}
              color="#4F46E5"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#9CA3AF"
              value={buyerInfo.name}
              onChangeText={text => setBuyerInfo({ ...buyerInfo, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon
              name="email"
              size={20}
              color="#4F46E5"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#9CA3AF"
              value={buyerInfo.email}
              onChangeText={text => setBuyerInfo({ ...buyerInfo, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pagamento</Text>

          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                selectedMethod?.id === method.id && styles.paymentCardSelected,
                { backgroundColor: method.backgroundColor },
              ]}
              onPress={() => setSelectedMethod(method)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={method.colors}
                style={styles.paymentLogoContainer}
              >
                <Image
                  source={method.logo}
                  style={styles.paymentLogo}
                  resizeMode="contain"
                />
              </LinearGradient>

              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{method.name}</Text>
                <Text style={styles.paymentDescription}>
                  {method.description}
                </Text>
              </View>

              {selectedMethod?.id === method.id ? (
                <LinearGradient
                  colors={method.colors}
                  style={styles.checkmarkBadge}
                >
                  <Icon name="check" size={16} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={styles.radioCircle} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do pedido</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {priceCalculation?.subtotal?.toFixed(2)} MT
            </Text>
          </View>

          {priceCalculation?.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.discountLabel}>Desconto</Text>
              <Text style={styles.discountValue}>
                - {priceCalculation.discount.toFixed(2)} MT
              </Text>
            </View>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.totalBadge}
            >
              <Text style={styles.totalValue}>{finalPrice.toFixed(2)} MT</Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!buyerInfo.name || !buyerInfo.email || !selectedMethod) &&
              styles.disabledButton,
          ]}
          onPress={handleCreateReservation}
          disabled={
            loading || !buyerInfo.name || !buyerInfo.email || !selectedMethod
          }
        >
          <LinearGradient
            colors={selectedMethod?.colors || ['#4F46E5', '#7C3AED']}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.continueText}>Reservar e continuar</Text>
                <Icon name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
