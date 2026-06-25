// screens/checkout/ReservationCreatedScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import CountdownTimer from './../../screens/CountdownTimer/CountdownTimer';
import { getReservationStatus } from '../../services/paymentService';
import styles from './styles';
import { normalizePaymentMethod } from '../../utils/paymentHelpers';

export default function ReservationCreatedScreen({ route, navigation }) {
  // ============================================
  // ✅ TODOS OS HOOKS NO TOPO (SEMPRE NA MESMA ORDEM)
  // ============================================

  // Estados
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutos
  const [checking, setChecking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState(null);
  const [error, setError] = useState(null);

  // Callbacks memorizados
  const checkReservationStatus = useCallback(async () => {
    if (checking || !params?.reservation?.id) return;

    setChecking(true);
    try {
      const status = await getReservationStatus(params.reservation.id);
      if (status?.isPaid) {
        navigation.replace('PaymentSuccess', {
          sale: status.sale,
          paymentMethod: params?.paymentMethod,
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setChecking(false);
    }
  }, [checking, params, navigation]);

  // Efeito para validar os parâmetros recebidos
  useEffect(() => {
    // Verificar se os parâmetros existem
    if (!route || !route.params) {
      console.error('❌ Nenhum parâmetro recebido na ReservationCreatedScreen');
      setError('Dados da reserva não encontrados');
      setIsLoading(false);
      return;
    }

    const { reservation, paymentMethod, buyerInfo, event, amount } =
      route.params;

    // Validar dados obrigatórios
    if (!reservation || !event) {
      console.error('❌ Dados incompletos:', {
        hasReservation: !!reservation,
        hasEvent: !!event,
      });
      setError('Dados da reserva estão incompletos');
      setIsLoading(false);
      return;
    }

    // Dados válidos
    setParams(route.params);
    setIsLoading(false);
    setError(null);
  }, [route]);

  // Efeito para verificar status da reserva periodicamente
  useEffect(() => {
    if (!params?.reservation?.id) return;

    const interval = setInterval(() => {
      checkReservationStatus();
    }, 30000); // a cada 30 segundos

    return () => clearInterval(interval);
  }, [params, checkReservationStatus]);

  // ============================================
  // ✅ HANDLERS (NÃO SÃO HOOKS)
  // ============================================

  const handleShareReservation = async () => {
    if (!params) return;

    try {
      await Share.share({
        message: `Reserva #${params.reservation.reservationCode}\nEvento: ${
          params.event.name
        }\nValor: ${params.amount.toFixed(2)} MT\nExpira em: ${Math.floor(
          timeLeft / 60,
        )} minutos\n\nPague agora: https://tickethub.app/pay/${
          params.reservation.reservationCode
        }`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  // ReservationCreatedScreen.jsx - handlePayNow
  const handlePayNow = () => {
    if (!params) return;

    console.log('=========================================');
    console.log('📤 NAVEGANDO PARA PAYMENT');
    console.log('=========================================');
    console.log('paymentMethod original:', params.paymentMethod);
    console.log('paymentMethod tipo:', typeof params.paymentMethod);
    console.log('reservation:', params.reservation?.id);
    console.log('event:', params.event?.name);
    console.log('amount:', params.amount);
    console.log('=========================================');

    // Se paymentMethod for string, converter para objeto
    let paymentMethodToSend = params.paymentMethod;
    if (typeof params.paymentMethod === 'string') {
      const methodId = params.paymentMethod.toUpperCase();
      paymentMethodToSend = {
        id: methodId,
        name:
          methodId === 'MPESA'
            ? 'M-Pesa'
            : methodId === 'EMOLA'
            ? 'E-Mola'
            : 'Cartão',
        colors:
          methodId === 'MPESA'
            ? ['#4F46E5', '#6366F1']
            : methodId === 'EMOLA'
            ? ['#10B981', '#059669']
            : ['#EF4444', '#DC2626'],
        allowedPrefixes:
          methodId === 'MPESA' || methodId === 'EMOLA'
            ? ['84', '85', '86']
            : [],
        phoneMask:
          methodId === 'MPESA' || methodId === 'EMOLA'
            ? '84XXXXXXX'
            : '•••• •••• •••• ••••',
      };
      console.log('✅ Convertido para objeto:', paymentMethodToSend);
    }

    const reservationObj = {
      id: params.reservation.id,
      reservationCode: params.reservation.reservationCode,
      expiresAt: params.reservation.expiresAt,
      amount: params.reservation.amount,
    };

    navigation.replace('Payment', {
      reservation: reservationObj, // ← objeto completo!
      paymentMethod: params.paymentMethod,
      buyerInfo: params.buyerInfo,
      event: params.event,
      amount: params.amount,
    });
  };
  const handlePayLater = () => {
    if (!params) return;

    Alert.alert(
      'Reserva criada com sucesso!',
      `Você tem ${Math.floor(
        timeLeft / 60,
      )} minutos para efetuar o pagamento.\n\nAcesse "Minhas Reservas" no menu principal para pagar depois ou compartilhe o código com quem vai pagar.`,
      [
        { text: 'OK', onPress: () => navigation.popToTop() },
        {
          text: 'Ver reservas',
          onPress: () => navigation.navigate('MyReservations'),
        },
      ],
    );
  };

  const handleExpire = () => {
    Alert.alert(
      'Reserva expirada',
      'O tempo para pagamento expirou. Faça um novo checkout.',
      [{ text: 'OK', onPress: () => navigation.popToTop() }],
    );
  };

  // ============================================
  // ✅ RENDERIZAÇÃO CONDICIONAL (DEPOIS DE TODOS OS HOOKS)
  // ============================================

  // Tela de loading
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>
          Carregando dados da reserva...
        </Text>
      </View>
    );
  }

  // Tela de erro
  if (error || !params) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', padding: 20 },
        ]}
      >
        <Icon name="alert-circle" size={60} color="#EF4444" />
        <Text
          style={{
            fontSize: 18,
            marginTop: 20,
            textAlign: 'center',
            color: '#333',
          }}
        >
          {error || 'Erro ao carregar reserva'}
        </Text>
        <TouchableOpacity
          style={{ marginTop: 30, paddingHorizontal: 20, paddingVertical: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#4F46E5', fontSize: 16 }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============================================
  // ✅ TELA PRINCIPAL (DADOS VÁLIDOS)
  // ============================================

  const { reservation, paymentMethod, buyerInfo, event, amount } = params;

  return (
    <View style={styles.container}>
      {/* Header com gradiente verde */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <Icon name="check-circle" size={80} color="#fff" />
        <Text style={styles.title}>Reserva Criada!</Text>
        <Text style={styles.subtitle}>
          Seus ingressos foram reservados com sucesso
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Card do timer */}
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          style={styles.timerCard}
        >
          <Icon name="timer-sand" size={24} color="#fff" />
          <View style={styles.timerInfo}>
            <Text style={styles.timerLabel}>Tempo restante para pagar</Text>
            <CountdownTimer
              seconds={timeLeft}
              onTick={setTimeLeft}
              onExpire={handleExpire}
            />
          </View>
        </LinearGradient>

        {/* Card do código da reserva */}
        <View style={styles.reservationCard}>
          <Text style={styles.cardTitle}>Código da reserva</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.reservationCode}>
              {reservation.reservationCode}
            </Text>
            <TouchableOpacity onPress={handleShareReservation}>
              <Icon name="share-variant" size={24} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card do QR Code */}
        <View style={styles.qrCard}>
          <Text style={styles.cardTitle}>QR Code para pagamento</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={`${reservation.reservationCode}|${amount}|${reservation.id}`}
              size={180}
              color="#1F2937"
              backgroundColor="#fff"
            />
          </View>
          <Text style={styles.qrHint}>
            Escaneie o QR Code para pagar rapidamente
          </Text>
        </View>

        {/* Card de detalhes */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detalhes da reserva</Text>

          <View style={styles.detailRow}>
            <Icon name="ticket" size={20} color="#4F46E5" />
            <Text style={styles.detailLabel}>Evento:</Text>
            <Text style={styles.detailValue}>{event.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="cash" size={20} color="#4F46E5" />
            <Text style={styles.detailLabel}>Valor:</Text>
            <Text style={styles.amountValue}>{amount.toFixed(2)} MT</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="wallet" size={20} color="#4F46E5" />
            <Text style={styles.detailLabel}>Método:</Text>
            <LinearGradient
              colors={paymentMethod?.colors || ['#4F46E5', '#6366F1']}
              style={styles.methodBadge}
            >
              <Text style={styles.methodText}>
                {paymentMethod?.name || paymentMethod || 'Pagamento'}
              </Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Footer com botões de ação */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.payNowButton} onPress={handlePayNow}>
          <LinearGradient
            colors={paymentMethod?.colors || ['#4F46E5', '#6366F1']}
            style={styles.buttonGradient}
          >
            <Icon name="cash" size={20} color="#fff" />
            <Text style={styles.buttonText}>Pagar Agora</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.payLaterButton}
          onPress={handlePayLater}
        >
          <Text style={styles.payLaterText}>Pagar Depois</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
