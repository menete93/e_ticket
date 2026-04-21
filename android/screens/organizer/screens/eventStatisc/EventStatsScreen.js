// screens/organizer/EventStatsScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {
  getEventById,
  getEventStats,
  getEventSales,
  cancelEvent, // ← ADICIONAR ESTE IMPORT
} from '../../../../services/eventService';
import styles from './style';

export default function EventStatsScreen({ route, navigation }) {
  const { event: initialEvent } = route.params;
  const [event, setEvent] = useState(initialEvent);
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados do modal de cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundTickets, setRefundTickets] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Recarregar quando a tela ganhar foco (voltar da edição)
  useFocusEffect(
    useCallback(() => {
      loadAllData();
      return () => {};
    }, [loadAllData]),
  );

  // Carregar todos os dados atualizados
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadAllData = useCallback(async () => {
    if (!initialEvent?.id) return;

    try {
      setLoading(true);

      const updatedEvent = await getEventById(initialEvent.id);
      setEvent(updatedEvent);

      const [statsData, salesData] = await Promise.all([
        getEventStats(initialEvent.id),
        getEventSales(initialEvent.id),
      ]);
      setStats(statsData);
      setSales(salesData);

      console.log('✅ Dados recarregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  });

  // Refresh manual (pull to refresh)
  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const shareEvent = async () => {
    try {
      await Share.share({
        message: `🎉 ${event.name}\n📅 ${new Date(
          event.eventDate,
        ).toLocaleDateString('pt-BR')}\n\nCompre seu ingresso agora!`,
        url: `https://mozbuy.co.mz/event/${event.id}`,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  // ==================== VALIDAÇÕES ====================
  const canEditOrConfigure = () => {
    // Se evento já foi cancelado, não permite editar/configurar
    if (event.isCancelled) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateTime = new Date(event.eventDate);
    eventDateTime.setHours(0, 0, 0, 0);

    return eventDateTime >= today;
  };

  // Verificar se pode cancelar o evento
  const canCancelEvent = () => {
    // Não permite cancelar se:
    // 1. Evento já foi cancelado
    // 2. Evento já ocorreu
    if (event.isCancelled) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateTime = new Date(event.eventDate);
    eventDateTime.setHours(0, 0, 0, 0);

    return eventDateTime >= today;
  };

  const handleCancelEvent = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Erro', 'Por favor, informe o motivo do cancelamento');
      return;
    }

    setCancelling(true);

    try {
      const payload = {
        reason: cancelReason.trim(),
        refundTickets: refundTickets,
      };

      await cancelEvent(event.id, payload);

      Alert.alert(
        '✅ Evento Cancelado',
        `O evento "${event.name}" foi cancelado com sucesso.\n\n${
          refundTickets
            ? 'Os reembolsos serão processados em até 5 dias úteis.'
            : ''
        }`,
        [{ text: 'OK', onPress: () => loadAllData() }],
      );

      setShowCancelModal(false);
      setCancelReason('');
      setRefundTickets(false);
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Falha ao cancelar evento',
      );
    } finally {
      setCancelling(false);
    }
  };

  // EventStatsScreen.jsx - Atualizar handleManageTickets

  const handleManageTickets = () => {
    if (!canEditOrConfigure()) {
      Alert.alert(
        '⚠️ Configuração não permitida',
        event.isCancelled
          ? 'Este evento foi cancelado. Não é possível configurar ingressos.'
          : `Este evento já ocorreu em ${new Date(
              event.eventDate,
            ).toLocaleDateString(
              'pt-BR',
            )}.\n\nNão é possível configurar ingressos para eventos passados.`,
        [{ text: 'OK' }],
      );
      return;
    }

    // 🔥 NAVEGAÇÃO CONDICIONAL
    if (hasTickets) {
      // Já tem tickets -> Vai para GERENCIAR (editar quantidades)
      navigation.navigate('ManageTicketsScreen', {
        eventId: event.id,
        eventName: event.name,
        maxAttendees: event.maxAttendees,
        currentTotalTickets: stats?.totalTickets || 0,
      });
    } else {
      // Não tem tickets -> Vai para CONFIGURAR (criar pela primeira vez)
      navigation.navigate('TicketConfigurationScreen', {
        eventId: event.id,
        eventName: event.name,
        isFree: event.isFree,
        maxAttendees: event.maxAttendees,
      });
    }
  };

  const handleEditEvent = () => {
    if (!canEditOrConfigure()) {
      Alert.alert(
        '⚠️ Edição não permitida',
        event.isCancelled
          ? 'Este evento foi cancelado. Não é possível editar.'
          : `Este evento já ocorreu em ${new Date(
              event.eventDate,
            ).toLocaleDateString(
              'pt-BR',
            )}.\n\nEventos passados não podem ser editados.`,
        [{ text: 'OK' }],
      );
      return;
    }

    navigation.navigate('EditEventScreen', { event });
  };

  const getEventStatus = () => {
    // Se evento foi cancelado
    if (event.isCancelled) {
      return {
        status: 'cancelled',
        label: 'Evento Cancelado',
        color: '#EF4444',
        icon: 'close-circle',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateTime = new Date(event.eventDate);
    eventDateTime.setHours(0, 0, 0, 0);

    if (eventDateTime < today) {
      return {
        status: 'past',
        label: 'Evento Realizado',
        color: '#6B7280',
        icon: 'checkmark-done-circle',
      };
    } else if (eventDateTime.toDateString() === today.toDateString()) {
      return {
        status: 'today',
        label: 'Evento Hoje!',
        color: '#F59E0B',
        icon: 'today',
      };
    } else {
      return {
        status: 'upcoming',
        label: 'Próximo Evento',
        color: '#10B981',
        icon: 'calendar',
      };
    }
  };

  const eventStatus = getEventStatus();
  const hasTickets = stats?.totalTickets > 0;
  const canEdit = canEditOrConfigure();
  const canCancel = canCancelEvent();

  const StatCard = ({ title, value, icon, color }) => (
    <LinearGradient colors={color} style={styles.statCard}>
      <Ionicons name={icon} size={32} color="#fff" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </LinearGradient>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header do Evento com Botão Voltar */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.eventName}>{event.name}</Text>

        {/* Badge de Status do Evento */}
        <View
          style={[styles.statusBadge, { backgroundColor: eventStatus.color }]}
        >
          <Ionicons name={eventStatus.icon} size={14} color="#fff" />
          <Text style={styles.statusBadgeText}>{eventStatus.label}</Text>
        </View>

        <Text style={styles.eventDate}>
          {new Date(event.eventDate).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <TouchableOpacity style={styles.shareButton} onPress={shareEvent}>
          <Ionicons name="share-social" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Cards de Estatísticas */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Ingressos Vendidos"
          value={stats?.soldTickets || 0}
          icon="ticket"
          color={['#4F46E5', '#7C3AED']}
        />
        <StatCard
          title="Ingressos Disponíveis"
          value={stats?.availableTickets || 0}
          icon="ticket-outline"
          color={['#10B981', '#059669']}
        />
        <StatCard
          title="Receita Total"
          value={`${stats?.totalRevenue || 0} MT`}
          icon="cash"
          color={['#F59E0B', '#D97706']}
        />
        <StatCard
          title="Ocupação"
          value={`${
            Math.round((stats?.soldTickets / stats?.totalTickets) * 100) || 0
          }%`}
          icon="pie-chart"
          color={['#EC4899', '#F43F5E']}
        />
      </View>

      {/* Aviso para evento cancelado */}
      {event.isCancelled && (
        <View style={styles.cancelledBanner}>
          <Ionicons name="close-circle" size={24} color="#EF4444" />
          <Text style={styles.cancelledBannerText}>
            Este evento foi cancelado. Motivo:{' '}
            {event.cancelReason || 'Não informado'}
          </Text>
        </View>
      )}

      {/* Aviso se não tem ingressos configurados - Só mostra se evento ainda pode ser configurado */}
      {!hasTickets && canEdit && !event.isCancelled && (
        <View style={styles.warningBanner}>
          <Ionicons name="alert-circle" size={24} color="#F59E0B" />
          <Text style={styles.warningText}>
            Este evento ainda não tem ingressos configurados!
          </Text>
        </View>
      )}

      {/* Aviso para eventos passados sem ingressos */}
      {!hasTickets && !canEdit && !event.isCancelled && (
        <View style={styles.warningBannerDisabled}>
          <Ionicons name="lock-closed" size={24} color="#6B7280" />
          <Text style={styles.warningTextDisabled}>
            Evento já realizado. Não é possível configurar ingressos.
          </Text>
        </View>
      )}

      {/* Últimas Vendas */}
      <View style={styles.salesSection}>
        <Text style={styles.sectionTitle}>Últimas Vendas</Text>
        {sales.length === 0 ? (
          <View style={styles.emptySales}>
            <Text style={styles.emptyText}>Nenhuma venda ainda</Text>
          </View>
        ) : (
          sales.slice(0, 5).map((sale, index) => (
            <View key={index} style={styles.saleItem}>
              <View>
                <Text style={styles.buyerName}>
                  {sale.buyerName || 'Anônimo'}
                </Text>
                <Text style={styles.saleDate}>
                  {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <View style={styles.saleRight}>
                <Text style={styles.saleQuantity}>{sale.quantity}x</Text>
                <Text style={styles.saleAmount}>{sale.totalAmount} MT</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        {/* Botão Gerenciar/Configurar Ingressos */}
        <TouchableOpacity
          style={[
            styles.manageButton,
            (!canEdit || event.isCancelled) && styles.buttonDisabled,
          ]}
          onPress={handleManageTickets}
          disabled={!canEdit || event.isCancelled}
        >
          <LinearGradient
            colors={
              !canEdit || event.isCancelled
                ? ['#9CA3AF', '#6B7280']
                : ['#4F46E5', '#7C3AED']
            }
            style={styles.buttonGradient}
          >
            <Ionicons name="ticket" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {event.isCancelled
                ? 'Evento Cancelado'
                : !canEdit
                ? 'Configuração Indisponível'
                : hasTickets
                ? 'Gerenciar Ingressos'
                : 'Configurar Ingressos'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Botão Editar Evento */}
        <TouchableOpacity
          style={[
            styles.editButton,
            (!canEdit || event.isCancelled) && styles.buttonDisabled,
          ]}
          onPress={handleEditEvent}
          disabled={!canEdit || event.isCancelled}
        >
          <LinearGradient
            colors={
              !canEdit || event.isCancelled
                ? ['#9CA3AF', '#6B7280']
                : ['#6B7280', '#4B5563']
            }
            style={styles.buttonGradient}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {event.isCancelled
                ? 'Evento Cancelado'
                : !canEdit
                ? 'Edição Indisponível'
                : 'Editar Evento'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Botão Cancelar Evento - Só aparece se puder cancelar */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCancelModal(true)}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.buttonGradient}
            >
              <Ionicons name="close-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>Cancelar Evento</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de Cancelamento */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCancelModal}
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cancelar Evento</Text>
            <Text style={styles.modalSubtitle}>
              Você está prestes a cancelar "{event.name}"
            </Text>

            {/* Aviso de vendas */}
            {stats?.soldTickets > 0 && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={24} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Este evento já possui {stats.soldTickets} ingresso(s)
                  vendido(s). Os compradores serão notificados sobre o
                  cancelamento.
                </Text>
              </View>
            )}

            {/* Motivo do cancelamento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Motivo do cancelamento *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="Ex: Problemas de logística, baixa adesão, etc."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Opção de reembolso (se houver vendas) */}
            {stats?.soldTickets > 0 && (
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Reembolsar compradores?</Text>
                  <Text style={styles.helperText}>
                    Os compradores receberão o valor integral de volta
                  </Text>
                </View>
                <Switch
                  value={refundTickets}
                  onValueChange={setRefundTickets}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={refundTickets ? '#EF4444' : '#f4f3f4'}
                />
              </View>
            )}

            {/* Botões do Modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Voltar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleCancelEvent}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>
                    Confirmar Cancelamento
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
