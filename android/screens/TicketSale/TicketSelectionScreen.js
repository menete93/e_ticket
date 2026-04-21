// screens/tickets/TicketSelectionScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEventStrategies } from './../../services/pricingService';
import { getTickets, calculatePrice } from './../../services/ticketService';
import PriceBreakdown from './../../screens/PriceBreakdown/PriceBreakdown';
import styles from './style';

export default function TicketSelectionScreen({ route, navigation }) {
  const { event } = route.params;

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [eventStrategies, setEventStrategies] = useState([]);
  const [showStrategies, setShowStrategies] = useState(false);
  const [error, setError] = useState(null);

  // Refs para evitar loops
  const isFirstRender = useRef(true);
  const isCalculating = useRef(false);

  // Buscar usuário (apenas uma vez)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erro ao pegar usuário:', error);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // Carregar tickets (apenas uma vez)
  useEffect(() => {
    if (event?.id) {
      loadTicketData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  const loadTicketData = async () => {
    if (!event?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getTickets(event.id);

      let ticketsData = [];
      if (response?.data) {
        ticketsData = Array.isArray(response.data)
          ? response.data
          : [response.data];
      }

      setTickets(ticketsData);

      const initialQuantities = {};
      ticketsData.forEach(ticket => {
        initialQuantities[ticket.id] = 0;
      });
      setQuantities(initialQuantities);

      // Buscar estratégias
      try {
        const strategies = await getEventStrategies(event.id);
        setEventStrategies(strategies || []);
      } catch (strategyError) {
        console.log('Erro ao buscar estratégias:', strategyError);
        setEventStrategies([]);
      }
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      setError('Não foi possível carregar os ingressos');
    } finally {
      setLoading(false);
    }
  };

  // Calcular preço (apenas quando quantities mudar)
  useEffect(() => {
    // Pular na primeira renderização
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const hasTickets = Object.values(quantities).some(q => q > 0);
    if (hasTickets && !isCalculating.current) {
      calculateTotalPrice();
    } else {
      setPriceCalculation(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantities]);
  const calculateTotalPrice = async () => {
    const selectedQuantities = {};

    Object.entries(quantities).forEach(([ticketId, qty]) => {
      if (qty > 0) {
        selectedQuantities[ticketId] = qty;
      }
    });

    if (Object.keys(selectedQuantities).length === 0) {
      setPriceCalculation(null);
      return;
    }

    if (isCalculating.current) return;
    isCalculating.current = true;

    try {
      const payload = {
        eventId: event.id,
        ticketQuantities: selectedQuantities,
        couponCode: couponCode || undefined,
        userId: user?.id,
        email: user?.email,
      };

      console.log('📤 Payload enviado:', JSON.stringify(payload, null, 2));

      const response = await calculatePrice(payload);

      // ✅ CORREÇÃO: O response JÁ É o objeto, não response.data
      console.log('📥 Resposta recebida:', response);

      // Verifica se a resposta existe
      if (!response) {
        console.error('❌ Resposta vazia do backend');
        throw new Error('Backend não retornou dados');
      }

      // ✅ Agora usa response diretamente, não response.data
      setPriceCalculation({
        subtotal: response.subtotal || 0,
        discount: response.totalSavings || 0,
        finalPrice: response.finalPrice || 0,
        breakdown: response.breakdown || [],
        appliedStrategies: response.appliedStrategies || [],
      });
    } catch (error) {
      console.error('❌ Erro detalhado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Fallback: cálculo local
      let subtotal = 0;
      const breakdown = [];

      Object.entries(selectedQuantities).forEach(([ticketId, qty]) => {
        const ticket = tickets.find(t => t.id === parseInt(ticketId));
        if (ticket) {
          const ticketTotal = (ticket.price || 0) * qty;
          subtotal += ticketTotal;
          breakdown.push({
            ticketId: ticket.id,
            ticketName: ticket.name,
            quantity: qty,
            unitPrice: ticket.price,
            subtotal: ticketTotal,
          });
        }
      });

      setPriceCalculation({
        subtotal,
        discount: 0,
        finalPrice: subtotal,
        breakdown,
        appliedStrategies: [],
      });
    } finally {
      isCalculating.current = false;
    }
  };
  const handleQuantityChange = (ticketId, increment) => {
    setQuantities(prev => {
      const currentQty = prev[ticketId] || 0;
      const newQty = increment ? currentQty + 1 : Math.max(0, currentQty - 1);

      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket?.maxPerPerson && newQty > ticket.maxPerPerson) {
        Alert.alert(
          'Limite',
          `Máximo de ${ticket.maxPerPerson} ingressos por pessoa`,
        );
        return prev;
      }

      if (
        ticket?.availableQuantity !== undefined &&
        newQty > ticket.availableQuantity
      ) {
        Alert.alert(
          'Indisponível',
          `Apenas ${ticket.availableQuantity} ingresso(s) disponível(eis)`,
        );
        return prev;
      }

      return { ...prev, [ticketId]: newQty };
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Atenção', 'Digite um código de cupom');
      return;
    }

    try {
      setApplyingCoupon(true);
      await calculateTotalPrice();
      Alert.alert('Sucesso', 'Cupom aplicado!');
    } catch (error) {
      Alert.alert('Erro', 'Cupom inválido');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCheckout = () => {
    const selectedQuantities = {};
    const selectedTicketsList = [];

    Object.entries(quantities).forEach(([ticketId, qty]) => {
      if (qty > 0) {
        selectedQuantities[ticketId] = qty;
        const ticket = tickets.find(t => t.id === parseInt(ticketId));
        if (ticket) selectedTicketsList.push(ticket);
      }
    });

    if (selectedTicketsList.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um ingresso');
      return;
    }

    console.log('🔍🔍🔍 Navegando para Checkout com:', {
      eventId: event.id,
      eventName: event.name,
      userId: user?.id,
      hasEvent: !!event,
    });

    // ✅ CORRIGIDO: Mudar 'CheckoutFlow' para 'Checkout'
    navigation.navigate('CheckoutFlow', {
      event,
      selectedTickets: selectedTicketsList,
      quantities: selectedQuantities,
      priceCalculation,
      couponCode: couponCode || null,
      eventId: event.id,
      user,
    });
  };

  if (loadingUser || (loading && tickets.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTicketData}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event?.name || 'Evento'}
        </Text>
        <TouchableOpacity onPress={() => setShowStrategies(!showStrategies)}>
          <Icon
            name={showStrategies ? 'tag-off' : 'tag'}
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.eventInfoCard}>
          <Icon name="calendar" size={20} color="#6366F1" />
          <Text style={styles.eventDate}>
            {event?.eventDate
              ? new Date(event.eventDate).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Data a definir'}
          </Text>
        </View>

        {showStrategies && eventStrategies.length > 0 && (
          <View style={styles.strategiesPreview}>
            <Text style={styles.strategiesTitle}>📋 Estratégias ativas:</Text>
            {eventStrategies.map(strategy => (
              <View key={strategy.id} style={styles.strategyPreviewItem}>
                <Icon name="tag" size={16} color="#10B981" />
                <Text style={styles.strategyPreviewText}>{strategy.name}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Selecione seus ingressos</Text>

        {tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="ticket-outline" size={48} color="#E5E7EB" />
            <Text style={styles.emptyStateText}>
              Nenhum ingresso disponível
            </Text>
          </View>
        ) : (
          tickets.map(ticket => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketName}>{ticket.name}</Text>
                <Text style={styles.ticketDescription} numberOfLines={2}>
                  {ticket.description || 'Ingresso para o evento'}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Preço:</Text>
                  <Text style={styles.normalPrice}>
                    R$ {(ticket.price || 0).toFixed(2)}
                  </Text>
                </View>

                {ticket.availableQuantity < 20 && (
                  <View style={[styles.badge, styles.lowStockBadge]}>
                    <Icon name="alert" size={12} color="#EF4444" />
                    <Text style={[styles.badgeText, styles.lowStockText]}>
                      Últimos {ticket.availableQuantity}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantities[ticket.id] === 0 &&
                      styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleQuantityChange(ticket.id, false)}
                  disabled={quantities[ticket.id] === 0}
                >
                  <Icon
                    name="minus"
                    size={20}
                    color={quantities[ticket.id] === 0 ? '#9CA3AF' : '#6366F1'}
                  />
                </TouchableOpacity>

                <Text style={styles.quantity}>
                  {quantities[ticket.id] || 0}
                </Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(ticket.id, true)}
                >
                  <Icon name="plus" size={20} color="#6366F1" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {totalTickets > 0 && (
          <View style={styles.couponSection}>
            <Text style={styles.sectionTitle}>🎟️ Cupom de desconto</Text>
            <View style={styles.couponInput}>
              <TextInput
                style={styles.input}
                placeholder="Digite o código do cupom"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  applyingCoupon && styles.applyButtonDisabled,
                ]}
                onPress={handleApplyCoupon}
                disabled={applyingCoupon}
              >
                {applyingCoupon ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.applyButtonText}>Aplicar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {totalTickets > 0 && priceCalculation && (
        <View style={styles.footer}>
          <PriceBreakdown calculation={priceCalculation} />
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.checkoutGradient}
            >
              <Text style={styles.checkoutButtonText}>
                Continuar para pagamento
              </Text>
              <Text style={styles.checkoutTotal}>
                R$ {priceCalculation.finalPrice?.toFixed(2)}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
