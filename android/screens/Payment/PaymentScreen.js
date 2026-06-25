// screens/checkout/PaymentScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { initiateMpesaPayment } from './../../services/paymentService';
import { normalizePaymentMethod } from './../../utils/paymentHelpers';
import styles from './styles';

export default function PaymentScreen({ route, navigation }) {
  // ✅ Estados
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);

  // ✅ Refs para controle
  const timerRef = useRef(null);
  const isMounted = useRef(true);
  const paymentSentRef = useRef(false);

  // ==========================================
  // LOG DO OBJETO COMPLETO QUE CHEGA NO COMPONENTE
  // ==========================================
  console.log('=========================================');
  console.log('📦 PAYMENT SCREEN - PARÂMETROS RECEBIDOS');
  console.log('=========================================');
  console.log('route.params:', JSON.stringify(route?.params, null, 2));
  console.log('=========================================');

  if (route?.params) {
    console.log('📌 reservation:', route.params.reservation);
    console.log(
      '📌 reservation.reservationCode:',
      route.params.reservation?.reservationCode,
    );
    console.log(
      '📌 reservation.transactionId:',
      route.params.reservation?.transactionId,
    );
    console.log('📌 reservation.id:', route.params.reservation?.id);
    console.log('📌 paymentMethod:', route.params.paymentMethod);
    console.log('📌 buyerInfo:', route.params.buyerInfo);
    console.log('📌 event:', route.params.event?.name);
    console.log('📌 amount:', route.params.amount);
  } else {
    console.log('❌ route.params está vazio ou undefined');
  }
  console.log('=========================================');

  // ✅ Cleanup ao desmontar
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // ✅ TIMER
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          Alert.alert(
            'Reserva expirada',
            'O tempo para pagamento expirou. Faça um novo checkout.',
            [{ text: 'OK', onPress: () => navigation.popToTop() }],
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [navigation]);

  // ✅ VALIDAÇÃO DOS PARÂMETROS
  if (!route?.params) {
    console.log('❌ ERRO: route.params é undefined');
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Icon name="alert-circle" size={60} color="#EF4444" />
        <Text style={{ fontSize: 18, marginTop: 20, textAlign: 'center' }}>
          Erro ao carregar pagamento
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: '#4F46E5', fontSize: 16 }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Desestruturar os parâmetros
  const {
    reservation = {},
    paymentMethod: rawPaymentMethod = {},
    buyerInfo = {},
    event = {},
    amount = 0,
  } = route.params;

  console.log('🔍 Após desestruturação:');
  console.log('  - reservation:', reservation);
  console.log('  - reservation.reservationCode:', reservation.reservationCode);
  console.log('  - reservation.id:', reservation.id);

  // ✅ Tenta extrair reservationCode de diferentes nomes
  let extractedReservationCode = reservation.reservationCode;
  if (!extractedReservationCode && reservation.transactionId) {
    extractedReservationCode = reservation.transactionId;
    console.log(
      '🔄 Usando transactionId como reservationCode:',
      extractedReservationCode,
    );
  }
  if (!extractedReservationCode && reservation.code) {
    extractedReservationCode = reservation.code;
    console.log(
      '🔄 Usando code como reservationCode:',
      extractedReservationCode,
    );
  }

  const saleId = reservation.id;

  console.log('📊 Dados extraídos:');
  console.log('  - extractedReservationCode:', extractedReservationCode);
  console.log('  - saleId:', saleId);
  console.log('  - amount:', amount);
  console.log('=========================================');

  // ✅ Normalizar o paymentMethod
  const safePaymentMethod = normalizePaymentMethod(rawPaymentMethod);
  console.log('💳 Método de pagamento normalizado:', safePaymentMethod);

  // ✅ Atualizar cardHolder apenas quando buyerInfo mudar
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (buyerInfo?.name && isMounted.current) {
      console.log('📝 Atualizando cardHolder para:', buyerInfo.name);
      setCardHolder(buyerInfo.name);
    }
  }, [buyerInfo]);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const validatePhoneNumber = number => {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.length !== 9) return false;
    const prefix = cleanNumber.substring(0, 2);
    return safePaymentMethod.allowedPrefixes?.includes(prefix) || false;
  };

  const validateCardData = () => {
    if (!cardNumber || cardNumber.replace(/\D/g, '').length !== 16) {
      Alert.alert('Erro', 'Número de cartão inválido');
      return false;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      Alert.alert('Erro', 'Data de validade inválida (MM/AA)');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      Alert.alert('Erro', 'CVV inválido');
      return false;
    }
    if (!cardHolder) {
      Alert.alert('Erro', 'Nome no cartão é obrigatório');
      return false;
    }
    return true;
  };

  // ✅ HANDLE PAYMENT - com DTO correto para o backend
  const handlePayment = async () => {
    console.log('=========================================');
    console.log('💳 HANDLE PAYMENT INICIADO');
    console.log('=========================================');

    if (paymentSentRef.current || loading) {
      console.log(
        '⏳ Pagamento já está sendo processado (paymentSentRef ou loading true)',
      );
      return;
    }

    if (!acceptTerms) {
      console.log('❌ Termos não aceitos');
      Alert.alert('Atenção', 'Você precisa aceitar os termos e condições');
      return;
    }

    console.log('📊 Dados da reserva:');
    console.log(
      '  - reservation.reservationCode:',
      reservation.reservationCode,
    );
    console.log('  - reservation.transactionId:', reservation.transactionId);
    console.log('  - reservation.id:', reservation.id);
    console.log('  - extractedReservationCode:', extractedReservationCode);
    console.log('  - saleId:', saleId);

    const reservationCode = extractedReservationCode;
    const finalSaleId = saleId;

    console.log('🚀 PROCESSANDO PAGAMENTO:');
    console.log('  - reservationCode usado:', reservationCode);
    console.log('  - saleId usado:', finalSaleId);
    console.log('  - Método:', safePaymentMethod.id);
    console.log('=========================================');

    if (!reservationCode) {
      console.log('❌ ERRO: reservationCode não encontrado!');
      console.log(
        '  - reservation objeto completo:',
        JSON.stringify(reservation, null, 2),
      );
      Alert.alert('Erro', 'Código da reserva não encontrado');
      return;
    }

    if (!finalSaleId) {
      console.log('❌ ERRO: saleId não encontrado!');
      Alert.alert('Erro', 'ID da reserva não encontrado');
      return;
    }

    if (safePaymentMethod.id === 'MPESA' || safePaymentMethod.id === 'EMOLA') {
      console.log('📱 Processando pagamento com M-PESA/E-Mola');

      if (!phoneNumber) {
        console.log('❌ Telefone não digitado');
        Alert.alert('Atenção', 'Digite o número de telefone');
        return;
      }
      if (!validatePhoneNumber(phoneNumber)) {
        console.log('❌ Telefone inválido:', phoneNumber);
        Alert.alert(
          'Número inválido',
          `Número deve começar com ${safePaymentMethod.allowedPrefixes.join(
            ' ou ',
          )} e ter 9 dígitos`,
        );
        return;
      }

      // ✅ DTO EXATO que o backend espera
      const requestData = {
        reservationCode: reservationCode,
        saleId: finalSaleId,
        phoneNumber: phoneNumber.replace(/\D/g, ''),
      };

      console.log('📤 Enviando requisição para o backend:');
      console.log('  - URL: /payment/mpesa/initiate');
      console.log('  - Dados:', JSON.stringify(requestData, null, 2));
      console.log('=========================================');

      paymentSentRef.current = true;
      setLoading(true);

      try {
        const result = await initiateMpesaPayment(requestData);
        console.log('📥 Resposta do backend:', JSON.stringify(result, null, 2));

        if (!isMounted.current) {
          console.log('⚠️ Componente desmontado, ignorando resposta');
          return;
        }

        if (result.success) {
          console.log('✅ Pagamento realizado com sucesso!');
          console.log('📦 result completo:', JSON.stringify(result, null, 2));

          // ✅ PEGAR OS DADOS COM FALLBACKS
          const saleData = result.sale || {};

          // ✅ CRIAR UM OBJETO COM DADOS COMPLETOS
          const paymentData = {
            // ID da transação
            transactionId:
              saleData.transactionId ||
              result.transactionId ||
              reservationCode ||
              'N/A',

            // Código da reserva
            reservationCode:
              saleData.reservationCode ||
              saleData.transactionId ||
              result.transactionId ||
              reservationCode ||
              'N/A',

            // ID da venda
            id: saleData.id || finalSaleId,

            // Dados do evento (usa o que veio do backend ou o que tínhamos antes)
            eventName: saleData.eventName || event?.name || 'Evento',
            eventId: saleData.eventId || event?.id,

            // Dados do comprador
            buyerName: saleData.buyerName || buyerInfo?.name || 'Cliente',
            buyerEmail: saleData.buyerEmail || buyerInfo?.email || 'Email',

            // Valores
            quantity: saleData.quantity || 1,
            totalAmount: saleData.totalAmount || amount || 0,

            // Status
            status: saleData.status || 'PAID',
            createdAt: saleData.createdAt || new Date().toISOString(),

            // Dados extras do provedor
            providerTransactionId:
              result.providerTransactionId || saleData.providerTransactionId,
          };

          console.log(
            '📤 Dados que serão enviados:',
            JSON.stringify(paymentData, null, 2),
          );

          // ✅ NAVEGAR COM DADOS COMPLETOS
          navigation.replace('PaymentSuccess', {
            sale: paymentData,
            paymentMethod: safePaymentMethod,
            // Passa também dados extras por segurança
            transactionId: paymentData.transactionId,
            reservationCode: paymentData.reservationCode,
            event: event,
            amount: amount,
            buyerInfo: buyerInfo,
          });
        } else if (result.pending) {
          console.log('⏳ Pagamento pendente:', result.message);
          Alert.alert('Pagamento Pendente', result.message);
          paymentSentRef.current = false;
        } else {
          console.log('❌ Pagamento falhou:', result.message);
          Alert.alert('Erro no pagamento', result.message || 'Tente novamente');
          paymentSentRef.current = false;
        }
      } catch (error) {
        console.log('❌ Exceção no pagamento:');
        console.log('  - message:', error.message);
        console.log('  - response:', error.response?.data);
        console.log('  - status:', error.response?.status);

        if (isMounted.current) {
          Alert.alert('Erro', error.response?.data?.message || error.message);
          paymentSentRef.current = false;
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    } else if (safePaymentMethod.id === 'CARD') {
      console.log('💳 Processando pagamento com Cartão');
      // ... código do cartão
    } else {
      console.log('❌ Método não suportado:', safePaymentMethod.id);
      Alert.alert(
        'Erro',
        `Método de pagamento "${safePaymentMethod.id}" não é suportado`,
      );
      return;
    }
  };

  // Renderização condicional segura
  if (!safePaymentMethod) {
    console.log('❌ safePaymentMethod é null/undefined');
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // ... resto do código JSX (renderTimer, renderMpesaFields, etc.)
  const renderTimer = () => (
    <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.timerCard}>
      <Icon name="timer-sand" size={24} color="#fff" />
      <View style={styles.timerInfo}>
        <Text style={styles.timerLabel}>Tempo restante para pagar</Text>
        <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
      </View>
    </LinearGradient>
  );

  const renderMpesaFields = () => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Número do {safePaymentMethod.name}</Text>
      <View style={styles.phoneInputContainer}>
        <LinearGradient
          colors={safePaymentMethod.colors}
          style={styles.prefixBadge}
        >
          <Icon name="cellphone" size={20} color="#fff" />
        </LinearGradient>
        <TextInput
          style={styles.phoneInput}
          placeholder={safePaymentMethod.phoneMask}
          placeholderTextColor="#9CA3AF"
          value={phoneNumber}
          onChangeText={text => setPhoneNumber(text.replace(/\D/g, ''))}
          keyboardType="phone-pad"
          maxLength={9}
        />
      </View>
      <Text style={styles.helperText}>
        Números permitidos:{' '}
        {safePaymentMethod.allowedPrefixes?.join(', ') || '84, 85, 86'}
      </Text>
      <View style={styles.infoBox}>
        <Icon name="information" size={16} color="#3B82F6" />
        <Text style={styles.infoText}>
          Você receberá uma notificação no seu {safePaymentMethod.name} para
          confirmar o pagamento
        </Text>
      </View>
    </View>
  );

  const renderCardFields = () => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Dados do cartão</Text>

      <View style={styles.cardIcons}>
        <LinearGradient
          colors={['#E5E7EB', '#D1D5DB']}
          style={styles.cardIconBox}
        >
          <Icon name="credit-card" size={24} color="#4B5563" />
          <Text style={styles.cardIconText}>Visa</Text>
        </LinearGradient>
        <LinearGradient
          colors={['#E5E7EB', '#D1D5DB']}
          style={styles.cardIconBox}
        >
          <Icon name="credit-card" size={24} color="#4B5563" />
          <Text style={styles.cardIconText}>Mastercard</Text>
        </LinearGradient>
      </View>

      <View style={styles.inputContainer}>
        <Icon
          name="credit-card"
          size={20}
          color="#4F46E5"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Número do cartão"
          placeholderTextColor="#9CA3AF"
          value={cardNumber}
          onChangeText={text => {
            const cleaned = text.replace(/\D/g, '').slice(0, 16);
            const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
            setCardNumber(formatted);
          }}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.half]}>
          <Icon
            name="calendar"
            size={20}
            color="#4F46E5"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="MM/AA"
            placeholderTextColor="#9CA3AF"
            value={expiryDate}
            onChangeText={text => {
              const cleaned = text.replace(/\D/g, '');
              if (cleaned.length >= 2) {
                setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
              } else {
                setExpiryDate(cleaned);
              }
            }}
            maxLength={5}
          />
        </View>

        <View style={[styles.inputContainer, styles.half]}>
          <Icon
            name="lock"
            size={20}
            color="#4F46E5"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="CVV"
            placeholderTextColor="#9CA3AF"
            value={cvv}
            onChangeText={text => setCvv(text.replace(/\D/g, '').slice(0, 4))}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Icon
          name="account"
          size={20}
          color="#4F46E5"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Nome no cartão"
          placeholderTextColor="#9CA3AF"
          value={cardHolder}
          onChangeText={setCardHolder}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.secureBadge}>
        <Icon name="shield-lock" size={16} color="#10B981" />
        <Text style={styles.secureText}>
          Pagamento seguro com criptografia SSL
        </Text>
      </View>
    </View>
  );

  const renderPaymentFields = () => {
    switch (safePaymentMethod.id) {
      case 'MPESA':
      case 'EMOLA':
        return renderMpesaFields();
      case 'CARD':
        return renderCardFields();
      default:
        return (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Método não suportado</Text>
            <Text>{safePaymentMethod.id}</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={safePaymentMethod.colors} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Icon name="cash" size={28} color="#fff" />
          <Text style={styles.headerTitle}>{safePaymentMethod.name}</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderTimer()}

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Valor a pagar</Text>
          <Text style={styles.amountValue}>
            {amount?.toFixed(2) || '0.00'} MT
          </Text>
          <Text style={styles.eventInfo}>{event?.name || 'Evento'}</Text>
        </View>

        {renderPaymentFields()}

        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setAcceptTerms(!acceptTerms)}
        >
          <View
            style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}
          >
            {acceptTerms && <Icon name="check" size={14} color="#fff" />}
          </View>
          <Text style={styles.termsText}>
            Li e aceito os{' '}
            <Text style={styles.termsLink}>termos e condições</Text> de compra
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!acceptTerms || loading) && styles.disabledButton,
          ]}
          onPress={handlePayment}
          disabled={loading || !acceptTerms}
        >
          <LinearGradient
            colors={safePaymentMethod.colors}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="cash" size={20} color="#fff" />
                <Text style={styles.payButtonText}>
                  Pagar {amount?.toFixed(2) || '0.00'} MT
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
