// screens/organizer/MyEventsScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getMyEvents, deleteEvent } from '../../../../services/eventService';
import styles from './style';

export default function MyEventsScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const myEvents = await getMyEvents();
      setEvents(myEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus eventos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, []),
  );

  const handleEventPress = event => {
    navigation.navigate('EventStats', { event });
  };

  const handleEditEvent = event => {
    navigation.navigate('CreateEvent', { event }); // Para edição
  };

  const handleDeleteEvent = event => {
    Alert.alert(
      'Excluir Evento',
      `Tem certeza que deseja excluir "${event.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(event.id);
              Alert.alert('Sucesso', 'Evento excluído com sucesso');
              loadEvents();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o evento');
            }
          },
        },
      ],
    );
  };

  const handleManageTickets = event => {
    navigation.navigate('ManageTickets', {
      eventId: event.id,
      eventName: event.name,
    });
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
    >
      <Image
        source={{ uri: item.coverImageUrl || 'https://via.placeholder.com/80' }}
        style={styles.eventImage}
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.eventDate}>
          📅 {new Date(item.eventDate).toLocaleDateString('pt-BR')}
        </Text>
        <View style={styles.eventStats}>
          <Text style={styles.statText}>
            🎫 {item.soldTickets || 0} vendidos
          </Text>
          <Text style={styles.statText}>💰 {item.totalRevenue || 0} MT</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleManageTickets(item)}
        >
          <Ionicons name="ticket" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleEditEvent(item)}
        >
          <Ionicons name="pencil" size={22} color="#F59E0B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleDeleteEvent(item)}
        >
          <Ionicons name="trash" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Carregando eventos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={item => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadEvents} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              Você ainda não tem eventos
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateEventScreen')}
            >
              <Text style={styles.createButtonText}>
                Criar meu primeiro evento
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
