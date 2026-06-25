// screens/checkout/MyReservationsScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getUserReservations } from '../../services/paymentService';
import styles from './styles';

export default function MyReservationsScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await getUserReservations();
      setReservations(data);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  const formatTimeRemaining = expiresAt => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = Math.floor((expiry - now) / 1000);
    if (diff <= 0) return 'Expirada';
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status, expiresAt) => {
    if (status === 'PAID') return '#10B981';
    if (new Date(expiresAt) < new Date()) return '#EF4444';
    return '#F59E0B';
  };

  const getStatusText = (status, expiresAt) => {
    if (status === 'PAID') return 'Pago';
    if (new Date(expiresAt) < new Date()) return 'Expirada';
    return 'Pendente';
  };

  const handlePayReservation = reservation => {
    navigation.navigate('PaymentScreen', {
      reservation,
      paymentMethod: reservation.paymentMethod,
      buyerInfo: reservation.buyerInfo,
      event: reservation.event,
      amount: reservation.amount,
    });
  };

  const renderReservationCard = item => {
    const isExpired = new Date(item.expiresAt) < new Date();
    const statusColor = getStatusColor(item.status, item.expiresAt);
    const statusText = getStatusText(item.status, item.expiresAt);

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.reservationCard, isExpired && styles.expiredCard]}
        onPress={() =>
          !isExpired && item.status !== 'PAID' && handlePayReservation(item)
        }
        disabled={isExpired || item.status === 'PAID'}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.eventName}>{item.event.name}</Text>
            <Text style={styles.reservationCode}>{item.reservationCode}</Text>
          </View>
          <LinearGradient
            colors={[statusColor, statusColor + 'CC']}
            style={styles.statusBadge}
          >
            <Text style={styles.statusText}>{statusText}</Text>
          </LinearGradient>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Icon name="cash" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.amount.toFixed(2)} MT</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="wallet" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.paymentMethod.name}</Text>
          </View>
          {item.status !== 'PAID' && !isExpired && (
            <View style={styles.detailItem}>
              <Icon name="timer-sand" size={16} color="#F59E0B" />
              <Text style={styles.timerText}>
                Expira em: {formatTimeRemaining(item.expiresAt)}
              </Text>
            </View>
          )}
        </View>

        {item.status !== 'PAID' && !isExpired && (
          <LinearGradient
            colors={item.paymentMethod.colors}
            style={styles.payButton}
          >
            <Text style={styles.payButtonText}>Pagar agora</Text>
            <Icon name="arrow-right" size={16} color="#fff" />
          </LinearGradient>
        )}

        {item.status === 'PAID' && (
          <View style={styles.paidBadge}>
            <Icon name="check-circle" size={16} color="#10B981" />
            <Text style={styles.paidText}>Pagamento confirmado</Text>
          </View>
        )}

        {isExpired && item.status !== 'PAID' && (
          <View style={styles.expiredBadge}>
            <Icon name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.expiredText}>Reserva expirada</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Reservas</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {reservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="ticket-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhuma reserva encontrada</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.browseButtonText}>Explorar eventos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reservations.map(renderReservationCard)
        )}
      </ScrollView>
    </View>
  );
}
