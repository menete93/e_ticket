// screens/organizer/ManageTicketsScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  InteractionManager,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  batchUpdateTickets,
  getTicketPricePreview,
  createTicketsForEvent,
} from '../../../../services/ticketService';
import { getEventById } from '../../../../services/eventService';
import { getEventStrategies } from '../../../../services/pricingService';
import styles from './style';

// Categorias disponíveis que podem ser adicionadas
const AVAILABLE_CATEGORIES = {
  Normal: { name: 'Normal', color: '#22C55E', icon: '🎫', order: 1 },
  VIP: { name: 'VIP', color: '#3B82F6', icon: '⭐', order: 2 },
  VVIP: { name: 'VVIP', color: '#F59E0B', icon: '👑', order: 3 },
};

const ManageTicketsScreen = ({ navigation, route }) => {
  const { eventId, eventName, maxAttendees } = route.params;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [pricePreviews, setPricePreviews] = useState({});
  const [eventStrategies, setEventStrategies] = useState([]); // Estado para estratégias do evento

  // Estados para edição em lote
  const [batchMode, setBatchMode] = useState(false);
  const [batchEdits, setBatchEdits] = useState({});

  // Estados para adicionar nova categoria
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryData, setNewCategoryData] = useState({
    price: '',
    quantity: '',
  });

  // Obter tickets do evento
  const tickets = event?.tickets || [];

  // ==================== FUNÇÃO DE ALERTA SEGURO ====================
  const safeAlert = (title, message, buttons = [{ text: 'OK' }]) => {
    if (Platform.OS === 'android') {
      InteractionManager.runAfterInteractions(() => {
        Alert.alert(title, message, buttons);
      });
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  // ==================== VALIDAÇÃO DE DATA DO EVENTO ====================
  const canEditTickets = () => {
    if (event?.isCancelled) {
      return {
        canEdit: false,
        reason: 'Evento cancelado. Não é possível editar ingressos.',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDateObj = event?.eventDate ? new Date(event.eventDate) : null;
    if (!eventDateObj) {
      return { canEdit: false, reason: 'Data do evento não definida.' };
    }

    const eventDateOnly = new Date(eventDateObj);
    eventDateOnly.setHours(0, 0, 0, 0);

    if (eventDateOnly < today) {
      return {
        canEdit: false,
        reason: 'Este evento já ocorreu. Não é possível editar ingressos.',
      };
    }

    if (eventDateOnly.toDateString() === today.toDateString()) {
      const now = new Date();
      const eventEndTime = event?.endTime ? new Date(event.endTime) : null;

      if (eventEndTime && eventEndTime < now) {
        return {
          canEdit: false,
          reason: 'Este evento já terminou. Não é possível editar ingressos.',
        };
      }

      return {
        canEdit: true,
        reason:
          'Evento ocorre hoje. Alterações permitidas apenas até o horário de início.',
        warning: true,
      };
    }

    return { canEdit: true, reason: null };
  };

  const editPermission = canEditTickets();
  const canEdit = editPermission.canEdit;
  const editBlockReason = editPermission.reason;

  // Categorias que já existem
  const existingCategoryNames = tickets.map(t => t.ticketName);
  const availableToAdd = Object.values(AVAILABLE_CATEGORIES).filter(
    cat => !existingCategoryNames.includes(cat.name),
  );

  // Calcular totais
  const calculateTotals = () => {
    const ticketsArray = Array.isArray(tickets) ? tickets : [];
    const total = ticketsArray.reduce(
      (sum, t) => sum + (t?.totalQuantity || 0),
      0,
    );
    const remaining = (maxAttendees || 0) - total;
    const soldTotal = ticketsArray.reduce(
      (sum, t) => sum + (t?.soldQuantity || 0),
      0,
    );
    return { total, remaining, soldTotal };
  };

  const {
    total: totalTickets,
    remaining: remainingCapacity,
    soldTotal,
  } = calculateTotals();
  const isExceeding = remainingCapacity < 0;

  // Carregar dados do evento e estratégias
  const loadData = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Buscar evento
      const eventData = await getEventById(eventId);
      setEvent(eventData);

      // Buscar estratégias do evento
      try {
        const strategies = await getEventStrategies(eventId);
        setEventStrategies(strategies || []);
        console.log('📊 Estratégias do evento:', strategies);
      } catch (strategyError) {
        console.warn('Erro ao buscar estratégias:', strategyError);
        setEventStrategies([]);
      }

      // Carregar preview de preços dos tickets
      const previews = {};
      const ticketsArray = eventData?.tickets || [];
      for (const ticket of ticketsArray) {
        if (ticket && ticket.id) {
          try {
            const preview = await getTicketPricePreview(ticket.id);
            previews[ticket.id] = preview;
          } catch (error) {
            previews[ticket.id] = {
              basePrice: ticket.price || ticket.basePrice || 0,
              finalPrice: ticket.price || ticket.basePrice || 0,
              activeStrategies: ticket.activeStrategies || [],
            };
          }
        }
      }
      setPricePreviews(previews);
    } catch (error) {
      console.error('❌ Erro:', error);
      safeAlert('Erro', 'Não foi possível carregar os ingressos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // ==================== FUNÇÃO PARA EDITAR EVENTO ====================
  const handleEditEventToIncreaseCapacity = () => {
    setShowModal(false);
    setShowAddModal(false);
    setBatchMode(false);

    navigation.navigate('EditEventScreen', {
      event: {
        id: eventId,
        name: eventName,
        maxAttendees: maxAttendees,
        eventDate: event?.eventDate,
        startTime: event?.startTime,
        endTime: event?.endTime,
        isPublic: event?.isPublic,
        isFeatured: event?.isFeatured,
        isFree: event?.isFree,
        description: event?.description,
        soldTickets: soldTotal,
        totalTickets: totalTickets,
      },
      onGoBack: () => {
        loadData();
      },
    });
  };

  // ==================== VERIFICAR CAPACIDADE EXCEDIDA ====================
  const checkCapacityExceeded = (newTotal, action = 'salvar') => {
    if (newTotal > maxAttendees) {
      const exceededBy = newTotal - maxAttendees;
      safeAlert(
        '⚠️ Capacidade Excedida',
        `A capacidade máxima do evento é ${maxAttendees} pessoas.\n\n` +
          `📊 Total atual: ${totalTickets}\n` +
          `📊 Total desejado: ${newTotal}\n` +
          `📊 Excedido em: ${exceededBy} ingressos\n\n` +
          `Para ${action}, você precisa aumentar a capacidade do evento.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: '✏️ Editar Evento e Aumentar Capacidade',
            onPress: () => handleEditEventToIncreaseCapacity(),
          },
        ],
      );
      return false;
    }
    return true;
  };

  // Entrar no modo batch
  const enterBatchMode = () => {
    if (!canEdit) {
      safeAlert('Edição não permitida', editBlockReason);
      return;
    }
    const edits = {};
    tickets.forEach(ticket => {
      edits[ticket.id] = ticket.totalQuantity?.toString() || '';
    });
    setBatchEdits(edits);
    setBatchMode(true);
  };

  // Sair do modo batch
  const exitBatchMode = () => {
    setBatchMode(false);
    setBatchEdits({});
  };

  // ==================== ADICIONAR NOVA CATEGORIA ====================
  const handleAddCategory = () => {
    if (!canEdit) {
      safeAlert('Edição não permitida', editBlockReason);
      return;
    }
    if (availableToAdd.length === 0) {
      safeAlert('Info', 'Todas as categorias já foram adicionadas');
      return;
    }
    setSelectedCategory(availableToAdd[0]);
    setNewCategoryData({ price: '', quantity: '' });
    setShowAddModal(true);
  };

  const handleCreateCategory = async () => {
    if (!selectedCategory) {
      safeAlert('Erro', 'Selecione uma categoria');
      return;
    }

    const quantity = parseInt(newCategoryData.quantity) || 0;
    const price = parseFloat(newCategoryData.price);

    if (isNaN(price) || price <= 0) {
      safeAlert('Erro', 'Preço inválido');
      return;
    }

    const newTotal = totalTickets + quantity;

    if (!checkCapacityExceeded(newTotal, 'adicionar esta categoria')) {
      return;
    }

    try {
      setUpdating(true);
      const ticketData = [
        {
          eventId: eventId,
          ticketName: selectedCategory.name,
          category: selectedCategory.name.toUpperCase(),
          totalQuantity: quantity || null,
          price: price,
          changeReason: 'Adição de nova categoria',
          strategyId: 1,
          description: `${selectedCategory.name} - Ingresso para o evento`,
          benefits: [],
          salesStartDate: null,
          salesEndDate: null,
          maxTicketsPerUser: 10,
          hasDynamicPricing: false,
        },
      ];
      await createTicketsForEvent(ticketData);
      await loadData();
      safeAlert(
        '✅ Sucesso',
        `Categoria "${selectedCategory.name}" adicionada!`,
      );
      setShowAddModal(false);
    } catch (error) {
      safeAlert('Erro', error.response?.data?.message || 'Falha ao adicionar');
    } finally {
      setUpdating(false);
    }
  };

  // ==================== EDIÇÃO INDIVIDUAL ====================
  const handleEditQuantity = ticket => {
    if (!canEdit) {
      safeAlert('Edição não permitida', editBlockReason);
      return;
    }
    setSelectedTicket(ticket);
    setNewQuantity(ticket.totalQuantity?.toString() || '');
    setShowModal(true);
  };

  const handleUpdateQuantity = async () => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
      safeAlert('Erro', 'Quantidade inválida');
      return;
    }

    if (!selectedTicket) return;

    if (quantity < (selectedTicket.soldQuantity || 0)) {
      safeAlert(
        '❌ Redução não permitida',
        `Já vendeu ${selectedTicket.soldQuantity} ingressos.`,
      );
      return;
    }

    const currentTotal = totalTickets - (selectedTicket.totalQuantity || 0);
    const newTotal = currentTotal + quantity;

    if (!checkCapacityExceeded(newTotal, 'atualizar este ticket')) {
      return;
    }

    try {
      setUpdating(true);
      const updates = [
        {
          ticketId: selectedTicket.id,
          totalQuantity: quantity,
          changeReason: 'Ajuste de quantidade',
        },
      ];
      await batchUpdateTickets(eventId, updates, 'Ajuste individual');
      await loadData();
      safeAlert('✅ Sucesso', 'Quantidade atualizada!');
      setShowModal(false);
      setSelectedTicket(null);
    } catch (error) {
      safeAlert('Erro', error.response?.data?.message || 'Falha ao atualizar');
    } finally {
      setUpdating(false);
    }
  };

  // ==================== EDIÇÃO EM LOTE ====================
  const handleBatchQuantityChange = (ticketId, value) => {
    setBatchEdits(prev => ({ ...prev, [ticketId]: value }));
  };

  const handleBatchSave = async () => {
    if (!canEdit) {
      safeAlert('Edição não permitida', editBlockReason);
      return;
    }

    const updates = [];
    let totalNewQuantity = 0;

    for (const ticket of tickets) {
      const newQuantity = parseInt(batchEdits[ticket.id]);
      if (!isNaN(newQuantity) && newQuantity !== ticket.totalQuantity) {
        if (newQuantity < (ticket.soldQuantity || 0)) {
          safeAlert(
            '❌ Redução não permitida',
            `Ticket "${ticket.ticketName}": Já vendeu ${ticket.soldQuantity}`,
          );
          return;
        }
        updates.push({ ticketId: ticket.id, totalQuantity: newQuantity });
        totalNewQuantity += newQuantity;
      } else if (!isNaN(newQuantity)) {
        totalNewQuantity += newQuantity;
      }
    }

    if (updates.length === 0) {
      safeAlert('Info', 'Nenhuma alteração');
      return;
    }

    if (!checkCapacityExceeded(totalNewQuantity, 'salvar estas alterações')) {
      return;
    }

    safeAlert(
      'Confirmar',
      `Atualizar ${updates.length} ticket(s)?\n\nTotal: ${totalNewQuantity} / ${maxAttendees} ingressos`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setUpdating(true);
              await batchUpdateTickets(eventId, updates, 'Ajuste em lote');
              await loadData();
              exitBatchMode();
              safeAlert(
                '✅ Sucesso',
                `${updates.length} ticket(s) atualizado(s)!`,
              );
            } catch (error) {
              safeAlert(
                'Erro',
                error.response?.data?.message || 'Falha ao atualizar',
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  // ==================== NAVEGAÇÃO PARA ESTRATÉGIAS ====================
  const navigateToStrategies = ticket => {
    safeAlert(
      '📊 Gerenciar Estratégias',
      `Você está gerenciando estratégias para o ticket "${ticket.ticketName}".\n\n` +
        'As estratégias disponíveis são:\n\n' +
        '1️⃣ Early Bird - Desconto nos primeiros ingressos\n' +
        '2️⃣ Bulk Discount - Desconto por quantidade\n' +
        '3️⃣ Dynamic Pricing - Preço varia com demanda\n' +
        '4️⃣ Time-based - Preço varia com data\n\n' +
        'Deseja ir para a tela de configuração de estratégias?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ir para Estratégias',
          onPress: () =>
            navigation.navigate('ApplyStrategiesScreen', {
              eventId,
              eventName,
              selectedTicketId: ticket.id,
              selectedTicketName: ticket.ticketName,
            }),
        },
      ],
    );
  };

  // ==================== COMPONENTES ====================
  const StrategyBadge = ({ hasStrategies }) => {
    if (!hasStrategies) {
      return (
        <View style={styles.noStrategyBadge}>
          <Ionicons name="trending-down" size={12} color="#F59E0B" />
          <Text style={styles.noStrategyBadgeText}>Sem estratégia</Text>
        </View>
      );
    }
    return (
      <View style={styles.hasStrategyBadge}>
        <Ionicons name="trending-up" size={12} color="#10B981" />
        <Text style={styles.hasStrategyBadgeText}>Estratégia ativa</Text>
      </View>
    );
  };

  const CapacityActionButton = () => {
    if (
      canEdit &&
      (remainingCapacity < 0 ||
        (maxAttendees > 0 && remainingCapacity < maxAttendees * 0.2))
    ) {
      return (
        <TouchableOpacity
          style={styles.capacityActionButton}
          onPress={handleEditEventToIncreaseCapacity}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.capacityActionGradient}
          >
            <Ionicons name="expand-outline" size={16} color="#fff" />
            <Text style={styles.capacityActionText}>
              {isExceeding
                ? 'Capacidade Excedida - Editar Evento'
                : 'Capacidade Baixa - Aumentar'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const PriceDisplay = ({ ticket }) => {
    const preview = pricePreviews[ticket.id];
    if (!preview) return null;

    const originalPrice = ticket.price || preview?.basePrice || 0;
    const finalPrice = preview?.finalPrice || originalPrice;
    const isPriceDifferent = originalPrice !== finalPrice;

    const hasStrategies =
      ticket.activeStrategies?.length > 0 ||
      preview?.activeStrategies?.length > 0 ||
      eventStrategies.length > 0;

    const strategiesList =
      ticket.activeStrategies ||
      preview?.activeStrategies ||
      eventStrategies ||
      [];

    return (
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.basePriceLabel}>Preço original</Text>
          <Text style={styles.basePriceValue}>{originalPrice} MT</Text>
        </View>

        {isPriceDifferent && (
          <View style={styles.finalPriceRow}>
            <Text style={styles.finalPriceLabel}>Preço com estratégias</Text>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.finalPriceBadge}
            >
              <Text style={styles.finalPriceValue}>{finalPrice} MT</Text>
            </LinearGradient>
          </View>
        )}

        {hasStrategies && strategiesList.length > 0 && (
          <View style={styles.strategiesAppliedContainer}>
            <View style={styles.strategiesHeader}>
              <Ionicons name="trending-up" size={14} color="#10B981" />
              <Text style={styles.strategiesTitle}>Estratégias aplicadas</Text>
            </View>
            {strategiesList.map((strategy, index) => (
              <View key={index} style={styles.strategyItem}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                <Text style={styles.strategyName}>{strategy.name}</Text>
                <Text style={styles.strategyImpact}>{strategy.impact}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addStrategyButton}
          onPress={() => navigateToStrategies(ticket)}
        >
          <LinearGradient
            colors={
              hasStrategies ? ['#4F46E5', '#7C3AED'] : ['#F59E0B', '#D97706']
            }
            style={styles.addStrategyGradient}
          >
            <Ionicons
              name={hasStrategies ? 'settings-outline' : 'add-circle-outline'}
              size={16}
              color="#fff"
            />
            <Text style={styles.addStrategyText}>
              {hasStrategies
                ? 'Gerenciar estratégias'
                : 'Adicionar estratégia de precificação'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.infoNote}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color="#6B7280"
          />
          <Text style={styles.infoNoteText}>
            Estratégias ajustam automaticamente os preços com base em regras
            configuradas
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const ticketsList = Array.isArray(tickets) ? tickets : [];
  const batchTotal = Object.values(batchEdits).reduce(
    (sum, qty) => sum + (parseInt(qty) || 0),
    0,
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Gerenciar Ingressos</Text>
          <Text style={styles.subtitle}>{eventName}</Text>
        </View>
        <View style={styles.headerActions}>
          {canEdit && ticketsList.length > 0 && (
            <TouchableOpacity
              onPress={enterBatchMode}
              style={styles.batchButton}
            >
              <Ionicons
                name={batchMode ? 'close-outline' : 'options-outline'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          )}
          {canEdit && availableToAdd.length > 0 && !batchMode && (
            <TouchableOpacity
              onPress={handleAddCategory}
              style={styles.addButton}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {!canEdit && (
        <View style={styles.disabledBanner}>
          <Ionicons name="lock-closed" size={24} color="#EF4444" />
          <Text style={styles.disabledBannerText}>{editBlockReason}</Text>
        </View>
      )}

      {canEdit && editPermission.warning && (
        <View style={styles.warningBanner}>
          <Ionicons name="time-outline" size={24} color="#F59E0B" />
          <Text style={styles.warningBannerText}>
            ⚠️ Evento ocorre hoje. Alterações permitidas apenas até o horário de
            início.
          </Text>
        </View>
      )}

      <View
        style={[
          styles.capacityBanner,
          isExceeding && styles.capacityBannerError,
        ]}
      >
        <Ionicons
          name={isExceeding ? 'alert-circle' : 'information-circle'}
          size={24}
          color={isExceeding ? '#EF4444' : '#4F46E5'}
        />
        <View style={styles.capacityBannerContent}>
          <Text
            style={[
              styles.capacityBannerTitle,
              isExceeding && styles.capacityBannerTitleError,
            ]}
          >
            Capacidade: {maxAttendees} | Disponível: {remainingCapacity}
          </Text>
          <Text style={styles.capacityBannerSubtext}>
            Total: {totalTickets} | Vendidos: {soldTotal}
          </Text>
          <CapacityActionButton />
        </View>
      </View>

      <ScrollView
        style={styles.ticketList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {ticketsList.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              Nenhum ingresso encontrado
            </Text>
            {canEdit && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('TicketConfigurationScreen', {
                    eventId,
                    eventName,
                    maxAttendees,
                  })
                }
              >
                <Text style={styles.createTicketButtonText}>
                  Configurar ingressos agora
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          ticketsList.map(ticket => {
            const categoryInfo = AVAILABLE_CATEGORIES[ticket.ticketName] || {
              color: '#6B7280',
              icon: '🎟️',
            };
            const hasStrategies =
              ticket.activeStrategies?.length > 0 ||
              pricePreviews[ticket.id]?.activeStrategies?.length > 0 ||
              eventStrategies.length > 0;

            return (
              <View
                key={ticket.id}
                style={[
                  styles.ticketCard,
                  { borderLeftColor: categoryInfo.color },
                  !canEdit && styles.disabledCard,
                ]}
              >
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketTitle}>
                    <Text style={styles.ticketIcon}>{categoryInfo.icon}</Text>
                    <View>
                      <Text style={styles.ticketName}>{ticket.ticketName}</Text>
                      <StrategyBadge hasStrategies={hasStrategies} />
                    </View>
                  </View>
                  {!batchMode && canEdit && (
                    <TouchableOpacity
                      onPress={() => handleEditQuantity(ticket)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#4F46E5"
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Disponível</Text>
                    <Text style={styles.statNumber}>
                      {(ticket.totalQuantity || 0) - (ticket.soldQuantity || 0)}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Vendidos</Text>
                    <Text style={styles.statNumber}>
                      {ticket.soldQuantity || 0}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total</Text>
                    {batchMode && canEdit ? (
                      <TextInput
                        style={styles.batchInput}
                        value={batchEdits[ticket.id]}
                        onChangeText={text =>
                          handleBatchQuantityChange(ticket.id, text)
                        }
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text style={styles.statNumber}>
                        {ticket.totalQuantity || '∞'}
                      </Text>
                    )}
                  </View>
                </View>

                <PriceDisplay ticket={ticket} />
              </View>
            );
          })
        )}
      </ScrollView>

      {batchMode && canEdit && ticketsList.length > 0 && (
        <View style={styles.batchFooter}>
          <View style={styles.batchFooterInfo}>
            <Text style={styles.batchFooterText}>Modo de edição em lote</Text>
            <Text style={styles.batchFooterSubtext}>
              Total: {batchTotal} / {maxAttendees} ingressos
            </Text>
          </View>
          <View style={styles.batchFooterButtons}>
            <TouchableOpacity
              style={styles.batchCancelButton}
              onPress={exitBatchMode}
            >
              <LinearGradient
                colors={['#9CA3AF', '#6B7280']}
                style={styles.buttonGradient}
              >
                <Ionicons name="close-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Cancelar</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.batchSaveButton}
              onPress={handleBatchSave}
              disabled={updating}
            >
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.buttonGradient}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Salvar Todas</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal para adicionar nova categoria */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Adicionar Categoria</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.categorySelector}>
                {availableToAdd.map(cat => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryOption,
                      selectedCategory?.name === cat.name && {
                        backgroundColor: cat.color,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={styles.categoryOptionIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryOptionText,
                        selectedCategory?.name === cat.name && {
                          color: '#fff',
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedCategory && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Preço (MT) *</Text>
                    <TextInput
                      style={styles.input}
                      value={newCategoryData.price}
                      onChangeText={text =>
                        setNewCategoryData(prev => ({ ...prev, price: text }))
                      }
                      placeholder="Ex: 500"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Quantidade Disponível</Text>
                    <TextInput
                      style={styles.input}
                      value={newCategoryData.quantity}
                      onChangeText={text =>
                        setNewCategoryData(prev => ({
                          ...prev,
                          quantity: text,
                        }))
                      }
                      placeholder="Deixe vazio para ilimitado"
                      keyboardType="numeric"
                    />
                    <Text style={styles.helperText}>
                      Disponível: {remainingCapacity} ingressos
                    </Text>
                  </View>

                  <View style={styles.warningBox}>
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color="#F59E0B"
                    />
                    <Text style={styles.warningText}>
                      Após adicionar, você poderá ajustar as quantidades no modo
                      de edição em lote.
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleCreateCategory}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Adicionar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Edição Individual */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Ajustar Quantidade</Text>
            </LinearGradient>
            <Text style={styles.modalSubtitle}>
              {selectedTicket?.ticketName}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nova Quantidade Total</Text>
              <TextInput
                style={styles.input}
                value={newQuantity}
                onChangeText={setNewQuantity}
                keyboardType="numeric"
              />
            </View>

            {(() => {
              const quantity = parseInt(newQuantity) || 0;
              const currentTotal =
                totalTickets - (selectedTicket?.totalQuantity || 0);
              const newTotalCalc = currentTotal + quantity;
              return (
                newTotalCalc > maxAttendees && (
                  <View style={styles.capacityWarningModal}>
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <Text style={styles.capacityWarningModalText}>
                      Esta alteração excederia a capacidade do evento.
                    </Text>
                    <TouchableOpacity
                      onPress={handleEditEventToIncreaseCapacity}
                    >
                      <Text style={styles.capacityWarningModalLink}>
                        Aumentar capacidade do evento
                      </Text>
                    </TouchableOpacity>
                  </View>
                )
              );
            })()}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleUpdateQuantity}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Atualizar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManageTicketsScreen;
