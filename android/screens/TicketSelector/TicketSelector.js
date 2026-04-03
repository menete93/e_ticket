// components/checkout/TicketSelector.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getTickets } from '../../services/ticket.service';
import styles from './styles';

export const TicketSelector = ({ eventId, onSelectionChange, disabled }) => {
  const [tickets, setTickets] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ CORRIGIDO: useCallback para memoizar a função
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTickets(eventId);
      const ticketsData = Array.isArray(response)
        ? response
        : response.data || [];
      setTickets(ticketsData);

      const initialQuantities = {};
      ticketsData.forEach(ticket => {
        initialQuantities[ticket.id] = 0;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      console.error('Erro ao carregar tickets:', err);
      setError('Não foi possível carregar os ingressos');
    } finally {
      setLoading(false);
    }
  }, [eventId]); // ✅ dependência correta

  // ✅ CORRIGIDO: inclui loadTickets como dependência
  useEffect(() => {
    loadTickets();
  }, [loadTickets]); // ✅ agora loadTickets é estável

  const handleQuantityChange = (ticketId, quantity) => {
    const newQuantity = parseInt(quantity) || 0;
    const ticket = tickets.find(t => t.id === ticketId);

    if (ticket.maxTicketsPerUser && newQuantity > ticket.maxTicketsPerUser) {
      Alert.alert(
        'Limite excedido',
        `Máximo de ${ticket.maxTicketsPerUser} ingressos por usuário`,
      );
      return;
    }

    if (newQuantity > ticket.availableQuantity) {
      Alert.alert(
        'Indisponível',
        `Apenas ${ticket.availableQuantity} ingressos disponíveis`,
      );
      return;
    }

    const newQuantities = { ...quantities, [ticketId]: newQuantity };
    setQuantities(newQuantities);
    onSelectionChange(newQuantities);
  };

  const getCategoryColor = category => {
    switch (category?.toLowerCase()) {
      case 'vip':
        return '#d97706';
      case 'regular':
        return '#0284c7';
      case 'earlybird':
        return '#16a34a';
      case 'student':
        return '#9333ea';
      default:
        return '#667eea';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Carregando ingressos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTickets}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Selecione seus ingressos</Text>
      {tickets.map(ticket => (
        <View
          key={ticket.id}
          style={[
            styles.ticketItem,
            !ticket.isAvailable && styles.disabledItem,
          ]}
        >
          <View style={styles.ticketInfo}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketName}>{ticket.ticketName}</Text>
              {ticket.category && (
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(ticket.category) },
                  ]}
                >
                  <Text style={styles.categoryText}>{ticket.category}</Text>
                </View>
              )}
            </View>
            <Text style={styles.ticketPrice}>{ticket.price} MT</Text>
            {ticket.description && (
              <Text style={styles.ticketDescription}>{ticket.description}</Text>
            )}
            {ticket.benefits && ticket.benefits.length > 0 && (
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsText}>
                  Benefícios: {ticket.benefits.join(', ')}
                </Text>
              </View>
            )}
            <View style={styles.ticketStats}>
              <Text style={styles.statsText}>
                Disponíveis: {ticket.availableQuantity}
              </Text>
              {ticket.maxTicketsPerUser && (
                <Text style={styles.statsText}>
                  Máx por pessoa: {ticket.maxTicketsPerUser}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.ticketQuantity}>
            <Text style={styles.quantityLabel}>Quantidade:</Text>
            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={String(quantities[ticket.id] || 0)}
              onChangeText={value => handleQuantityChange(ticket.id, value)}
              editable={
                !disabled && ticket.isAvailable && ticket.availableQuantity > 0
              }
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
