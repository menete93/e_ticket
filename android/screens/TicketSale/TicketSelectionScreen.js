// screens/tickets/TicketSelectionScreen.js
import React, { useState, useEffect, useCallback } from 'react';
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
import { getEventStrategies } from '../../services/pricingService';
import { getTickets } from '../../services/pricingService';
import PriceBreakdown from './../PriceBreakdown/PriceBreakdown';
import styles from './style';

export default function TicketSelectionScreen({ route, navigation }) {
  const { event } = route.params;

  // Estado do usuário vindo do AsyncStorage
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

  // 👉 SEU CÓDIGO PARA PEGAR O USUÁRIO
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('👤 Usuário autenticado:', parsedUser);
        }
      } catch (error) {
        console.error('Erro ao pegar usuário:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // Carregar tickets e estratégias do evento
  useEffect(() => {
    loadTicketData();
  }, [event.id, loadTicketData]);

  const loadTicketData = useCallback(async () => {
    try {
      setLoading(true);

      const ticketsResponse = await getTickets(event.id);
      setTickets(ticketsResponse);

      const initialQuantities = {};
      ticketsResponse.forEach(ticket => {
        initialQuantities[ticket.id] = 0;
      });

      setQuantities(initialQuantities);

      const strategiesResponse = await getEventStrategies(event.id);
      setEventStrategies(strategiesResponse);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os ingressos');
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  const calculatePrice = useCallback(async () => {
    const selectedQuantities = {};

    Object.entries(quantities).forEach(([ticketId, qty]) => {
      if (qty > 0) {
        selectedQuantities[ticketId] = qty;
      }
    });

    if (Object.keys(selectedQuantities).length === 0) return;

    try {
      const payload = {
        eventId: event.id,
        ticketQuantities: selectedQuantities,
        userId: user?.id,
        userEmail: user?.email,
      };

      console.log('📦 Payload cálculo:', payload);
      const response = await calculatePrice(payload);
      setPriceCalculation(response);
    } catch (error) {
      console.error('Erro ao calcular preço:', error);
      Alert.alert('Erro', 'Não foi possível calcular o preço');
    }
  }, [quantities, event.id, user]);

  useEffect(() => {
    const hasTickets = Object.values(quantities).some(q => q > 0);
    if (hasTickets) {
      calculatePrice();
    } else {
      setPriceCalculation(null);
    }
  }, [quantities, calculatePrice]);

  const handleQuantityChange = (ticketId, increment) => {
    setQuantities(prev => {
      const currentQty = prev[ticketId] || 0;
      const newQty = increment ? currentQty + 1 : Math.max(0, currentQty - 1);

      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket?.maxTicketsPerUser && newQty > ticket.maxTicketsPerUser) {
        Alert.alert(
          'Limite',
          `Máximo de ${ticket.maxTicketsPerUser} por pedido`,
        );
        return prev;
      }

      if (
        ticket?.availableQuantity !== undefined &&
        newQty > ticket.availableQuantity
      ) {
        Alert.alert(
          'Indisponível',
          `Apenas ${ticket.availableQuantity} disponível(is)`,
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
      await calculatePrice();
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
        const ticket = tickets.find(t => t.id === parseInt(ticketId, 10));
        if (ticket) selectedTicketsList.push(ticket);
      }
    });

    if (selectedTicketsList.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um ingresso');
      return;
    }

    navigation.navigate('Checkout', {
      event,
      selectedTickets: selectedTicketsList,
      quantities: selectedQuantities,
      priceCalculation,
      couponCode: couponCode || null,
      user, // 👉 Passa o usuário para o checkout
    });
  };

  const getTicketPrice = ticket => {
    if (!priceCalculation?.breakdown) return ticket.basePrice;
    const breakdownItem = priceCalculation.breakdown.find(
      b => b.ticketId === ticket.id,
    );
    return breakdownItem
      ? breakdownItem.subtotal / breakdownItem.quantity
      : ticket.basePrice;
  };

  // Loading enquanto busca usuário
  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Carregando usuário...</Text>
      </View>
    );
  }

  if (loading && tickets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Carregando ingressos...</Text>
      </View>
    );
  }

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event.name}
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
        {/* Event Info */}
        <View style={styles.eventInfoCard}>
          <Icon name="calendar" size={20} color="#6366F1" />
          <Text style={styles.eventDate}>
            {new Date(event.eventDate).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Estratégias */}
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

        {/* Tickets */}
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
                <Text style={styles.ticketName}>{ticket.ticketName}</Text>
                <Text style={styles.ticketDescription} numberOfLines={2}>
                  {ticket.description || 'Ingresso para o evento'}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Preço:</Text>
                  {priceCalculation?.appliedStrategies?.length > 0 ? (
                    <>
                      <Text style={styles.originalPrice}>
                        R$ {ticket.basePrice?.toFixed(2)}
                      </Text>
                      <Text style={styles.discountedPrice}>
                        R$ {getTicketPrice(ticket)?.toFixed(2)}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.normalPrice}>
                      R$ {ticket.basePrice?.toFixed(2)}
                    </Text>
                  )}
                </View>

                <View style={styles.badges}>
                  {ticket.category && (
                    <View style={[styles.badge, styles.categoryBadge]}>
                      <Icon name="tag" size={12} color="#6366F1" />
                      <Text style={styles.badgeText}>{ticket.category}</Text>
                    </View>
                  )}
                  {ticket.availableQuantity < 20 && (
                    <View style={[styles.badge, styles.lowStockBadge]}>
                      <Icon name="alert" size={12} color="#EF4444" />
                      <Text style={[styles.badgeText, styles.lowStockText]}>
                        Últimos {ticket.availableQuantity}
                      </Text>
                    </View>
                  )}
                </View>
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

                <Text style={styles.quantity}>{quantities[ticket.id]}</Text>

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

        {/* Cupom */}
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

      {/* Footer */}
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
