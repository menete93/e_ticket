// screens/organizer/OrganizerHomeScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { getMyEvents } from '../../../../services/eventService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserFullName,
  isUserOrganizer,
} from '../../../../utils/roleChecker';
import styles from './style';

export default function OrganizerHomeScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalSold: 0,
    totalRevenue: 0,
    activeEvents: 0,
  });

  // Carregar usuário
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setUserId(parsedUser.referenceId);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Função para carregar eventos
  const loadMyEvents = useCallback(async () => {
    if (!userId) {
      console.log('Aguardando userId...');
      return;
    }

    try {
      setLoading(true);
      console.log('Carregando eventos para userId:', userId);
      const myEvents = await getMyEvents(userId);
      console.log('EVENTO VINDO DA API:', myEvents);

      setEvents(myEvents);

      // Calcular estatísticas
      let totalSold = 0;
      let totalRevenue = 0;
      let activeEvents = 0;

      for (const event of myEvents) {
        // Só contar vendas de eventos não cancelados
        if (!event.isCancelled) {
          totalSold += event.soldTickets || 0;
          totalRevenue +=
            event.totalRevenue ||
            event.soldTickets * (event.tickets?.[0]?.price || 0);

          const eventDate = new Date(event.eventDate);
          if (eventDate > new Date()) {
            activeEvents++;
          }
        }
      }

      setStats({
        totalEvents: myEvents.length,
        totalSold,
        totalRevenue,
        activeEvents,
      });
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus eventos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Carrega eventos quando userId estiver disponível
  useEffect(() => {
    if (userId) {
      loadMyEvents();
    }
  }, [loadMyEvents, userId]);

  // Refresh control
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMyEvents();
  }, [loadMyEvents]);

  const handleCreateEvent = () => {
    navigation.navigate('CreateEventScreen');
  };

  const handleEventPress = event => {
    navigation.navigate('EventStatsScreen', { event });
    console.log('EVENTO ENVIADO AO STATISTC ', event);
  };

  // Função para verificar se evento está cancelado
  const isEventCancelled = event => {
    return event.isCancelled === true;
  };

  // Função para obter o status do evento
  const getEventStatus = event => {
    if (isEventCancelled(event)) {
      return { text: 'Cancelado', color: '#EF4444', icon: 'close-circle' };
    }

    const eventDate = new Date(event.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
      return {
        text: 'Realizado',
        color: '#6B7280',
        icon: 'checkmark-done-circle',
      };
    } else if (eventDate.toDateString() === today.toDateString()) {
      return { text: 'Hoje!', color: '#F59E0B', icon: 'today' };
    } else {
      return { text: 'Próximo', color: '#10B981', icon: 'calendar' };
    }
  };

  const StatCard = ({ title, value, icon, colors }) => (
    <LinearGradient colors={colors} style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={28} color="#fff" />
      </View>
      <Text style={styles.statValue}>
        {typeof value === 'number' ? value : value}
      </Text>
      <Text style={styles.statTitle}>{title}</Text>
    </LinearGradient>
  );

  const renderEventItem = ({ item }) => {
    const isCancelled = isEventCancelled(item);
    const status = getEventStatus(item);

    return (
      <TouchableOpacity
        style={[styles.eventCard, isCancelled && styles.eventCardCancelled]}
        onPress={() => handleEventPress(item)}
      >
        <View style={styles.eventInfo}>
          <View style={styles.eventHeaderRow}>
            <Text
              style={[
                styles.eventName,
                isCancelled && styles.eventNameCancelled,
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {/* Badge de status */}
            <View
              style={[styles.statusBadge, { backgroundColor: status.color }]}
            >
              <Ionicons name={status.icon} size={12} color="#fff" />
              <Text style={styles.statusBadgeText}>{status.text}</Text>
            </View>
          </View>

          {/* Badge de cancelado adicional */}
          {isCancelled && (
            <View style={styles.cancelledBadge}>
              <Ionicons name="close-circle" size={14} color="#EF4444" />
              <Text style={styles.cancelledBadgeText}>Evento Cancelado</Text>
            </View>
          )}

          <View style={styles.eventMeta}>
            <Text
              style={[
                styles.eventDate,
                isCancelled && styles.eventTextCancelled,
              ]}
            >
              📅 {new Date(item.eventDate).toLocaleDateString('pt-BR')}
            </Text>
            <Text
              style={[
                styles.eventLocation,
                isCancelled && styles.eventTextCancelled,
              ]}
            >
              📍 {item.location || 'Local a definir'}
            </Text>
          </View>

          {!isCancelled && (
            <View style={styles.eventMetrics}>
              <View style={styles.metric}>
                <Ionicons name="ticket" size={14} color="#4F46E5" />
                <Text style={styles.metricText}>
                  {item.soldTickets || 0} vendidos
                </Text>
              </View>
              <View style={styles.metric}>
                <Ionicons name="cash" size={14} color="#10B981" />
                <Text style={styles.metricText}>
                  {item.totalRevenue || 0} MT
                </Text>
              </View>
            </View>
          )}

          {isCancelled && item.cancelReason && (
            <Text style={styles.cancelReason} numberOfLines={1}>
              Motivo: {item.cancelReason}
            </Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isCancelled ? '#ccc' : '#ccc'}
        />
      </TouchableOpacity>
    );
  };

  // Verificar se é organizador
  const isOrganizer =
    user && (user.role === 'organizer' || user.isOrganizer === true);

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!isOrganizer) {
    return (
      <View style={styles.accessDenied}>
        <Ionicons name="lock-closed" size={64} color="#ccc" />
        <Text style={styles.accessDeniedText}>
          Acesso restrito a organizadores
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.header}>
        <Text style={styles.headerTitle}>Painel do Organizador</Text>
        <Text style={styles.headerSubtitle}>
          Olá, {getUserFullName(user)}! Gerencie seus eventos
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Botão Criar Evento */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateEvent}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.createGradient}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Criar Novo Evento</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Cards de Estatísticas */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Eventos"
            value={stats.totalEvents}
            icon="calendar"
            colors={['#4F46E5', '#7C3AED']}
          />
          <StatCard
            title="Eventos Ativos"
            value={stats.activeEvents}
            icon="play-circle"
            colors={['#10B981', '#059669']}
          />
          <StatCard
            title="Ingressos Vendidos"
            value={stats.totalSold}
            icon="ticket"
            colors={['#EC4899', '#F43F5E']}
          />
          <StatCard
            title="Receita Total"
            value={`${stats.totalRevenue} MT`}
            icon="cash"
            colors={['#F59E0B', '#D97706']}
          />
        </View>

        {/* Meus Eventos */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Meus Eventos</Text>

          {loading && events.length === 0 ? (
            <ActivityIndicator size="large" color="#4F46E5" />
          ) : events.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Você ainda não tem eventos
              </Text>
              <TouchableOpacity onPress={handleCreateEvent}>
                <Text style={styles.createLink}>Criar meu primeiro evento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={events}
              renderItem={renderEventItem}
              keyExtractor={item => String(item.id)}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
