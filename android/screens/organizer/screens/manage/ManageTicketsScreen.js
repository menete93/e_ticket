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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  updateTicket,
  batchUpdateTickets,
  getTicketPricePreview,
} from '../../../../services/ticketService';
import { getEventById } from '../../../../services/eventService';
import styles from './style';

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

  // Estados para edição em lote
  const [batchMode, setBatchMode] = useState(false);
  const [batchEdits, setBatchEdits] = useState({});

  // Obter tickets do evento
  const tickets = event?.tickets || [];

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

  const loadData = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const eventData = await getEventById(eventId);
      setEvent(eventData);

      // Carregar preview de preços
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
      Alert.alert('Erro', 'Não foi possível carregar os ingressos');
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

  // Entrar no modo batch
  const enterBatchMode = () => {
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

  // Edição individual
  const handleEditQuantity = ticket => {
    setSelectedTicket(ticket);
    setNewQuantity(ticket.totalQuantity?.toString() || '');
    setShowModal(true);
  };

  const handleUpdateQuantity = async () => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
      Alert.alert('Erro', 'Quantidade inválida');
      return;
    }

    if (!selectedTicket) return;

    const currentTotal = totalTickets - (selectedTicket.totalQuantity || 0);
    const newTotal = currentTotal + quantity;

    if (quantity < (selectedTicket.soldQuantity || 0)) {
      Alert.alert(
        '❌ Redução não permitida',
        `Você já vendeu ${selectedTicket.soldQuantity} ingressos desta categoria.`,
      );
      return;
    }

    if (newTotal > maxAttendees) {
      Alert.alert(
        '⚠️ Capacidade Excedida',
        `Total após alteração: ${newTotal} / ${maxAttendees}`,
      );
      return;
    }

    try {
      setUpdating(true);
      await updateTicket(selectedTicket.id, {
        totalQuantity: quantity,
        changeReason: 'Ajuste de quantidade pelo organizador',
      });
      await loadData();
      Alert.alert('✅ Sucesso', 'Quantidade atualizada!');
      setShowModal(false);
      setSelectedTicket(null);
    } catch (error) {
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Falha ao atualizar',
      );
    } finally {
      setUpdating(false);
    }
  };

  // Edição em lote
  const handleBatchQuantityChange = (ticketId, value) => {
    setBatchEdits(prev => ({ ...prev, [ticketId]: value }));
  };

  const handleBatchSave = async () => {
    const updates = [];
    let totalNewQuantity = 0;

    for (const ticket of tickets) {
      const newQuantity = parseInt(batchEdits[ticket.id]);
      if (!isNaN(newQuantity) && newQuantity !== ticket.totalQuantity) {
        if (newQuantity < (ticket.soldQuantity || 0)) {
          Alert.alert(
            '❌ Redução não permitida',
            `Ticket "${ticket.ticketName}": Já vendeu ${ticket.soldQuantity}`,
          );
          return;
        }
        updates.push({
          ticketId: ticket.id,
          totalQuantity: newQuantity,
        });
        totalNewQuantity += newQuantity;
      } else if (!isNaN(newQuantity)) {
        totalNewQuantity += newQuantity;
      }
    }

    if (updates.length === 0) {
      Alert.alert('Info', 'Nenhuma alteração foi feita');
      return;
    }

    if (totalNewQuantity > maxAttendees) {
      Alert.alert(
        '⚠️ Capacidade Excedida',
        `Total: ${totalNewQuantity} / ${maxAttendees}`,
      );
      return;
    }

    Alert.alert('Confirmar', `Deseja atualizar ${updates.length} ticket(s)?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            setUpdating(true);
            await batchUpdateTickets(eventId, updates, 'Ajuste em lote');
            await loadData();
            exitBatchMode();
            Alert.alert(
              '✅ Sucesso',
              `${updates.length} ticket(s) atualizado(s)!`,
            );
          } catch (error) {
            Alert.alert(
              'Erro',
              error.response?.data?.message || 'Falha ao atualizar',
            );
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  const navigateToStrategies = () => {
    Alert.alert(
      '📊 Gerenciar Preços com Estratégias',
      'Os preços são gerenciados automaticamente pelas estratégias.',
      [
        { text: 'Fechar', style: 'cancel' },
        {
          text: 'Ir para Estratégias',
          onPress: () =>
            navigation.navigate('ApplyStrategiesScreen', {
              eventId,
              eventName,
            }),
        },
      ],
    );
  };

  const PriceDisplay = ({ ticket }) => {
    const preview = pricePreviews[ticket.id];
    if (!preview) return null;

    const originalPrice = ticket.price || preview?.basePrice || 0;
    const finalPrice = preview?.finalPrice || originalPrice;
    const isPriceDifferent = originalPrice !== finalPrice;

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
        <TouchableOpacity
          style={styles.managePriceButton}
          onPress={navigateToStrategies}
        >
          <Ionicons name="settings-outline" size={16} color="#4F46E5" />
          <Text style={styles.managePriceButtonText}>
            Gerenciar preços com estratégias
          </Text>
        </TouchableOpacity>
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
        <TouchableOpacity
          onPress={batchMode ? exitBatchMode : enterBatchMode}
          style={styles.batchButton}
        >
          <Ionicons
            name={batchMode ? 'close-outline' : 'options-outline'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Banner de Capacidade */}
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
          </View>
        ) : (
          ticketsList.map(ticket => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketName}>{ticket.ticketName}</Text>
                {!batchMode && (
                  <TouchableOpacity onPress={() => handleEditQuantity(ticket)}>
                    <Ionicons name="create-outline" size={20} color="#4F46E5" />
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
                  {batchMode ? (
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
          ))
        )}
      </ScrollView>

      {batchMode && ticketsList.length > 0 && (
        <View style={styles.batchFooter}>
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
                <Text style={styles.buttonText}>Salvar Todas</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

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
