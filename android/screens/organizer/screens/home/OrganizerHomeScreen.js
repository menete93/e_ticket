// screens/organizer/OrganizerHomeScreen.jsx - VERSÃO CORRIGIDA (SEM LOOP)
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getMyAllEvents } from '../../../../services/eventService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserFullName,
  isUserOrganizer,
} from '../../../../utils/roleChecker';
import styles from './style';

// Tipos de filtro baseados no LifeCycleState
const FILTERS = {
  ALL: 'all',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
  BLOCKED: 'BLOCKED',
  BANNED: 'BANNED',
};

const FILTER_OPTIONS = [
  { id: FILTERS.ALL, label: 'Todos', icon: 'apps-outline', color: '#6B7280' },
  {
    id: FILTERS.ACTIVE,
    label: 'Ativos',
    icon: 'play-circle-outline',
    color: '#10B981',
  },
  {
    id: FILTERS.BANNED,
    label: 'Cancelados',
    icon: 'close-circle-outline',
    color: '#EF4444',
  },
  {
    id: FILTERS.INACTIVE,
    label: 'Realizados',
    icon: 'checkmark-done-circle-outline',
    color: '#6B7280',
  },
  {
    id: FILTERS.BLOCKED,
    label: 'Bloqueados',
    icon: 'lock-closed-outline',
    color: '#F59E0B',
  },
];

export default function OrganizerHomeScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS.ALL);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalSold: 0,
    totalRevenue: 0,
    activeEvents: 0,
    bannedEvents: 0,
    inactiveEvents: 0,
    blockedEvents: 0,
  });

  // Carregar usuário (apenas uma vez)
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

  // Obter o estado do evento (prioriza o state do backend)
  const getEventState = event => {
    if (event.state) return event.state;
    if (event.isCancelled === true) return 'BANNED';

    const eventDate = new Date(event.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) return 'INACTIVE';
    return 'ACTIVE';
  };

  // Obter informações visuais para o badge
  const getEventBadgeInfo = event => {
    const state = getEventState(event);
    switch (state) {
      case 'ACTIVE':
        return { text: 'Ativo', color: '#10B981', icon: 'play-circle' };
      case 'BANNED':
        return { text: 'Cancelado', color: '#EF4444', icon: 'close-circle' };
      case 'INACTIVE':
        return {
          text: 'Realizado',
          color: '#6B7280',
          icon: 'checkmark-done-circle',
        };
      case 'BLOCKED':
        return { text: 'Bloqueado', color: '#F59E0B', icon: 'lock-closed' };
      case 'DELETED':
        return { text: 'Deletado', color: '#9CA3AF', icon: 'trash-outline' };
      default:
        return {
          text: state || 'Desconhecido',
          color: '#9CA3AF',
          icon: 'help-circle',
        };
    }
  };

  // ✅ Função para filtrar eventos (sem chamar API)
  const applyFilter = useCallback((eventsList, filter) => {
    if (!eventsList || eventsList.length === 0) return [];
    if (filter === FILTERS.ALL) return eventsList;
    return eventsList.filter(event => getEventState(event) === filter);
  }, []);

  // ✅ Função para carregar eventos da API (apenas quando necessário)
  const loadMyEvents = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      console.log('Carregando eventos para userId:', userId);
      const myEvents = await getMyAllEvents(userId);
      console.log('TODOS OS MEUS EVENTOS RECEBIDOS:', myEvents.length);

      setEvents(myEvents);

      // Aplicar filtro nos eventos recebidos
      const filtered = applyFilter(myEvents, selectedFilter);
      setFilteredEvents(filtered);

      // Calcular estatísticas
      let totalSold = 0,
        totalRevenue = 0,
        activeEvents = 0,
        bannedEvents = 0,
        inactiveEvents = 0,
        blockedEvents = 0;

      for (const event of myEvents) {
        const state = getEventState(event);
        switch (state) {
          case 'ACTIVE':
            activeEvents++;
            break;
          case 'BANNED':
            bannedEvents++;
            break;
          case 'INACTIVE':
            inactiveEvents++;
            break;
          case 'BLOCKED':
            blockedEvents++;
            break;
          default:
            break;
        }

        if (state === 'ACTIVE') {
          totalSold += event.soldTickets || 0;
          totalRevenue +=
            event.totalRevenue ||
            event.soldTickets * (event.tickets?.[0]?.price || 0);
        }
      }

      setStats({
        totalEvents: myEvents.length,
        totalSold,
        totalRevenue,
        activeEvents,
        bannedEvents,
        inactiveEvents,
        blockedEvents,
      });
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus eventos');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsFirstLoad(false);
    }
  }, [userId, selectedFilter, applyFilter]);

  // ✅ Carregar eventos APENAS quando userId mudar (primeira vez)
  useEffect(() => {
    if (userId && isFirstLoad) {
      loadMyEvents();
    }
  }, [userId, isFirstLoad, loadMyEvents]);

  // ✅ Recarregar quando a tela ganhar foco (voltar de edição/criação)
  useFocusEffect(
    useCallback(() => {
      if (userId && !isFirstLoad) {
        loadMyEvents();
      }
      return () => {};
    }, [userId, isFirstLoad, loadMyEvents]),
  );

  // ✅ Apenas atualizar o filtro localmente (sem chamar API)
  useEffect(() => {
    if (events.length > 0) {
      const filtered = applyFilter(events, selectedFilter);
      setFilteredEvents(filtered);
    }
  }, [selectedFilter, events, applyFilter]);

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
  };

  // Renderizar componente de filtro
  const FilterBar = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {FILTER_OPTIONS.map(option => {
          const isActive = selectedFilter === option.id;
          let count = 0;
          if (option.id === FILTERS.ALL) {
            count = events.length;
          } else {
            count = events.filter(e => getEventState(e) === option.id).length;
          }

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterChip,
                isActive && {
                  backgroundColor: option.color,
                  borderColor: option.color,
                },
              ]}
              onPress={() => setSelectedFilter(option.id)}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={isActive ? '#fff' : option.color}
              />
              <Text
                style={[styles.filterChipText, isActive && { color: '#fff' }]}
              >
                {option.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    isActive && { backgroundColor: 'rgba(255,255,255,0.3)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      isActive && { color: '#fff' },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
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
    const badgeInfo = getEventBadgeInfo(item);
    const state = getEventState(item);

    return (
      <TouchableOpacity
        style={[
          styles.eventCard,
          state !== 'ACTIVE' && styles.eventCardInactive,
        ]}
        onPress={() => handleEventPress(item)}
      >
        <View style={styles.eventInfo}>
          <View style={styles.eventHeaderRow}>
            <Text
              style={[
                styles.eventName,
                state !== 'ACTIVE' && styles.eventNameInactive,
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: badgeInfo.color }]}
            >
              <Ionicons name={badgeInfo.icon} size={12} color="#fff" />
              <Text style={styles.statusBadgeText}>{badgeInfo.text}</Text>
            </View>
          </View>

          <View style={styles.eventMeta}>
            <Text
              style={[
                styles.eventDate,
                state !== 'ACTIVE' && styles.eventTextInactive,
              ]}
            >
              📅 {new Date(item.eventDate).toLocaleDateString('pt-BR')}
            </Text>
            <Text
              style={[
                styles.eventLocation,
                state !== 'ACTIVE' && styles.eventTextInactive,
              ]}
            >
              📍 {item.location || 'Local a definir'}
            </Text>
          </View>

          {state === 'ACTIVE' && (
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

          {state === 'BANNED' && item.cancelReason && (
            <Text style={styles.cancelReason} numberOfLines={1}>
              Motivo: {item.cancelReason}
            </Text>
          )}

          {state === 'BLOCKED' && (
            <Text style={styles.blockedReason} numberOfLines={1}>
              ⚠️ Evento bloqueado por prazo de inscrição expirado
            </Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={state !== 'ACTIVE' ? '#ccc' : '#ccc'}
        />
      </TouchableOpacity>
    );
  };

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

        <FilterBar />

        <View style={styles.statsContainer}>
          <StatCard
            title="Total Eventos"
            value={stats.totalEvents}
            icon="calendar"
            colors={['#4F46E5', '#7C3AED']}
          />
          <StatCard
            title="Ativos"
            value={stats.activeEvents}
            icon="play-circle"
            colors={['#10B981', '#059669']}
          />
          <StatCard
            title="Cancelados"
            value={stats.bannedEvents}
            icon="close-circle"
            colors={['#EF4444', '#DC2626']}
          />
          <StatCard
            title="Realizados"
            value={stats.inactiveEvents}
            icon="checkmark-done-circle"
            colors={['#6B7280', '#4B5563']}
          />
        </View>

        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === FILTERS.ALL
                ? 'Meus Eventos'
                : FILTER_OPTIONS.find(f => f.id === selectedFilter)?.label}
            </Text>
            <Text style={styles.sectionCount}>
              {filteredEvents.length} evento(s)
            </Text>
          </View>

          {loading && events.length === 0 ? (
            <ActivityIndicator size="large" color="#4F46E5" />
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Nenhum evento{' '}
                {selectedFilter !== FILTERS.ALL
                  ? FILTER_OPTIONS.find(
                      f => f.id === selectedFilter,
                    )?.label.toLowerCase()
                  : ''}{' '}
                encontrado
              </Text>
              {selectedFilter === FILTERS.ACTIVE && (
                <TouchableOpacity onPress={handleCreateEvent}>
                  <Text style={styles.createLink}>
                    Criar meu primeiro evento
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredEvents}
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
