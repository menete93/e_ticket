/* eslint-disable react-hooks/exhaustive-deps */
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
  const [tempQuantities, setTempQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [eventStrategies, setEventStrategies] = useState([]);
  const [showStrategies, setShowStrategies] = useState(false);
  const [error, setError] = useState(null);

  // ✅ NOVO: Estado para controlar se o cálculo já foi feito
  const [hasCalculated, setHasCalculated] = useState(false);

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
  }, [event?.id, loadTicketData]);

  const loadTicketData = useCallback(async () => {
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
      } else if (Array.isArray(response)) {
        ticketsData = response;
      } else {
        ticketsData = [];
      }

      setTickets(ticketsData);

      const initialQuantities = {};
      ticketsData.forEach(ticket => {
        initialQuantities[ticket.id] = 0;
      });
      setQuantities(initialQuantities);
      setTempQuantities(initialQuantities);

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
  });

  // ✅ FUNÇÃO PARA CALCULAR PREÇO
  const calculateTotalPrice = async () => {
    const selectedQuantities = {};

    Object.entries(tempQuantities).forEach(([ticketId, qty]) => {
      if (qty > 0) {
        selectedQuantities[ticketId] = qty;
      }
    });

    // Verificar se tem pelo menos um ingresso selecionado
    if (Object.keys(selectedQuantities).length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um ingresso');
      setHasCalculated(false);
      return false;
    }

    // Validar quantidades
    for (const [ticketId, qty] of Object.entries(selectedQuantities)) {
      const ticket = tickets.find(t => t.id === parseInt(ticketId));
      if (ticket) {
        if (ticket.maxPerPerson && qty > ticket.maxPerPerson) {
          Alert.alert(
            'Limite excedido',
            `Máximo de ${ticket.maxPerPerson} ingressos para ${ticket.name}`,
          );
          setHasCalculated(false);
          return false;
        }
        if (ticket.availableQuantity && qty > ticket.availableQuantity) {
          Alert.alert(
            'Indisponível',
            `Apenas ${ticket.availableQuantity} ingressos disponíveis para ${ticket.name}`,
          );
          setHasCalculated(false);
          return false;
        }
      }
    }

    try {
      setCalculating(true);

      const payload = {
        eventId: event.id,
        ticketQuantities: selectedQuantities,
        couponCode: couponCode || undefined,
        userId: user?.id,
        email: user?.email,
      };

      console.log('📤 Calculando preço:', JSON.stringify(payload, null, 2));

      const response = await calculatePrice(payload);

      if (!response) {
        throw new Error('Backend não retornou dados');
      }

      setPriceCalculation({
        subtotal: response.subtotal || 0,
        discount: response.totalSavings || 0,
        finalPrice: response.finalPrice || 0,
        breakdown: response.breakdown || [],
        appliedStrategies: response.appliedStrategies || [],
      });

      // Atualizar quantidades oficiais
      setQuantities(tempQuantities);

      // ✅ MARCA QUE O CÁLCULO FOI REALIZADO
      setHasCalculated(true);

      return true;
    } catch (error) {
      console.error('❌ Erro ao calcular:', error);
      Alert.alert('Erro', 'Não foi possível calcular o preço');
      setHasCalculated(false);
      return false;
    } finally {
      setCalculating(false);
    }
  };

  // ✅ ATUALIZAR QUANTIDADE TEMPORÁRIA (reseta o estado de cálculo)
  const updateTempQuantity = (ticketId, value) => {
    const newQuantity = parseInt(value) || 0;
    const ticket = tickets.find(t => t.id === ticketId);

    if (!ticket) return;

    if (ticket.maxPerPerson && newQuantity > ticket.maxPerPerson) {
      Alert.alert(
        'Limite',
        `Máximo de ${ticket.maxPerPerson} ingressos por pessoa`,
      );
      return;
    }

    if (
      ticket.availableQuantity !== undefined &&
      newQuantity > ticket.availableQuantity
    ) {
      Alert.alert(
        'Indisponível',
        `Apenas ${ticket.availableQuantity} ingresso(s) disponível(eis)`,
      );
      return;
    }

    setTempQuantities(prev => ({ ...prev, [ticketId]: newQuantity }));

    // ✅ QUALQUER MUDANÇA NAS QUANTIDADES RESETA O CÁLCULO
    setHasCalculated(false);
    setPriceCalculation(null);
  };

  const handleIncrement = ticketId => {
    const currentQty = tempQuantities[ticketId] || 0;
    updateTempQuantity(ticketId, currentQty + 1);
  };

  const handleDecrement = ticketId => {
    const currentQty = tempQuantities[ticketId] || 0;
    if (currentQty > 0) {
      updateTempQuantity(ticketId, currentQty - 1);
    }
  };

  // ✅ APLICAR CUPOM (recalcula)
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Atenção', 'Digite um código de cupom');
      return;
    }

    const hasTickets = Object.values(tempQuantities).some(q => q > 0);
    if (!hasTickets) {
      Alert.alert('Atenção', 'Selecione os ingressos antes de aplicar o cupom');
      return;
    }

    try {
      setApplyingCoupon(true);
      const success = await calculateTotalPrice();
      if (success) {
        Alert.alert('Sucesso', 'Cupom aplicado!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Cupom inválido');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // ✅ CONFIRMAR E IR PARA CHECKOUT
  const handleCheckout = async () => {
    // ✅ VERIFICA SE O CÁLCULO JÁ FOI FEITO
    if (!hasCalculated) {
      Alert.alert(
        'Atenção',
        'Por favor, clique em "Calcular Preço" antes de continuar para o pagamento.',
        [{ text: 'OK' }],
      );
      return;
    }

    // Verificar se ainda tem ingressos selecionados
    const hasTickets = Object.values(tempQuantities).some(q => q > 0);
    if (!hasTickets) {
      Alert.alert('Atenção', 'Selecione pelo menos um ingresso');
      return;
    }

    const selectedQuantities = {};
    const selectedTicketsList = [];

    Object.entries(tempQuantities).forEach(([ticketId, qty]) => {
      if (qty > 0) {
        selectedQuantities[ticketId] = qty;
        const ticket = tickets.find(t => t.id === parseInt(ticketId));
        if (ticket) selectedTicketsList.push(ticket);
      }
    });

    navigation.navigate('Checkout', {
      event,
      selectedTickets: selectedTicketsList,
      quantities: selectedQuantities,
      priceCalculation,
      couponCode: couponCode || null,
      eventId: event.id,
      user,
    });
  };

  const clearQuantities = () => {
    const cleared = {};
    tickets.forEach(ticket => {
      cleared[ticket.id] = 0;
    });
    setTempQuantities(cleared);
    setPriceCalculation(null);
    setHasCalculated(false); // ✅ RESETA O ESTADO DE CÁLCULO
  };

  const totalTickets = Object.values(tempQuantities).reduce((a, b) => a + b, 0);

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
                    {(ticket.price || 0).toLocaleString()} MT
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
                    (tempQuantities[ticket.id] || 0) === 0 &&
                      styles.quantityButtonDisabled,
                  ]}
                  onPress={() => handleDecrement(ticket.id)}
                  disabled={(tempQuantities[ticket.id] || 0) === 0}
                >
                  <Icon
                    name="minus"
                    size={20}
                    color={
                      (tempQuantities[ticket.id] || 0) === 0
                        ? '#9CA3AF'
                        : '#6366F1'
                    }
                  />
                </TouchableOpacity>

                <TextInput
                  style={styles.quantityInput}
                  value={String(tempQuantities[ticket.id] || 0)}
                  onChangeText={text => updateTempQuantity(ticket.id, text)}
                  keyboardType="numeric"
                  selectTextOnFocus
                />

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleIncrement(ticket.id)}
                >
                  <Icon name="plus" size={20} color="#6366F1" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {totalTickets > 0 && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearQuantities}
            >
              <Icon name="close-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.clearButtonText}>Limpar tudo</Text>
            </TouchableOpacity>
          </View>
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

      {/* Footer */}
      <View style={styles.footer}>
        {/* Botão Calcular Preço - sempre disponível se houver tickets */}
        {totalTickets > 0 && (
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={calculateTotalPrice}
            disabled={calculating}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.calculateGradient}
            >
              {calculating ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Icon name="calculator" size={20} color="#FFF" />
                  <Text style={styles.calculateButtonText}>
                    {hasCalculated ? 'Recalcular Preço' : 'Calcular Preço'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Resumo do preço e botão checkout - SÓ APARECE SE JÁ CALCULOU */}
        {priceCalculation && hasCalculated && (
          <>
            <PriceBreakdown calculation={priceCalculation} />

            {/* ✅ Botão de aviso se precisa recalcular */}
            {JSON.stringify(quantities) !== JSON.stringify(tempQuantities) && (
              <View style={styles.warningRecalc}>
                <Icon name="alert-circle" size={16} color="#F59E0B" />
                <Text style={styles.warningRecalcText}>
                  As quantidades mudaram. Clique em "Recalcular Preço"
                </Text>
              </View>
            )}

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
                  {priceCalculation.finalPrice?.toLocaleString()} MT
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* Mensagem quando tem tickets mas não calculou */}
        {totalTickets > 0 && !hasCalculated && (
          <View style={styles.calculateWarning}>
            <Icon name="calculator" size={24} color="#9CA3AF" />
            <Text style={styles.calculateWarningText}>
              Clique em "Calcular Preço" para ver o valor com descontos
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
