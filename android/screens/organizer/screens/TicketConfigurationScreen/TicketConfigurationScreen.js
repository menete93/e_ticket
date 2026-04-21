// screens/organizer/TicketConfigurationScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { createTicketsForEvent } from '../../../../services/ticketService';
import styles from './style';

const TicketConfigurationScreen = ({ navigation, route }) => {
  const { eventId, eventName, isFree, maxAttendees } = route.params || {};

  const DEFAULT_CATEGORIES = {
    Normal: {
      name: 'Normal',
      price: '',
      quantity: '',
      color: '#22C55E',
      icon: '🎫',
      order: 1,
    },
    VIP: {
      name: 'VIP',
      price: '',
      quantity: '',
      color: '#3B82F6',
      icon: '⭐',
      order: 2,
    },
    VVIP: {
      name: 'VVIP',
      price: '',
      quantity: '',
      color: '#F59E0B',
      icon: '👑',
      order: 3,
    },
  };

  const [tickets, setTickets] = useState([{ ...DEFAULT_CATEGORIES.Normal }]);
  const [loading, setLoading] = useState(false);

  // Calcular o total de ingressos
  const calculateTotalTickets = () => {
    return tickets.reduce((total, ticket) => {
      const qty = ticket.quantity ? parseInt(ticket.quantity) : 0;
      return total + qty;
    }, 0);
  };

  // Verificar se o total excede a capacidade máxima
  const isTotalExceedingCapacity = () => {
    if (!maxAttendees) return false;
    const total = calculateTotalTickets();
    return total > parseInt(maxAttendees);
  };

  // Obter a capacidade restante
  const getRemainingCapacity = () => {
    if (!maxAttendees) return null;
    const total = calculateTotalTickets();
    const max = parseInt(maxAttendees);
    return max - total;
  };

  const toggleCategory = categoryName => {
    const exists = tickets.some(t => t.name === categoryName);
    if (exists) {
      setTickets(tickets.filter(t => t.name !== categoryName));
    } else {
      const newTicket = {
        ...DEFAULT_CATEGORIES[categoryName],
        price: '',
        quantity: '',
      };
      const updated = [...tickets, newTicket];
      updated.sort((a, b) => a.order - b.order);
      setTickets(updated);
    }
  };

  const updateTicket = (index, field, value) => {
    const updated = [...tickets];
    updated[index][field] = value;
    setTickets(updated);
  };

  // Validar quantidade de um ticket específico
  const validateTicketQuantity = (quantity, ticketName) => {
    if (!quantity) return true;

    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum < 0) {
      Alert.alert('Erro', `Quantidade inválida para ${ticketName}`);
      return false;
    }

    if (maxAttendees) {
      const currentTotal = calculateTotalTickets();
      const max = parseInt(maxAttendees);

      if (qtyNum > max) {
        Alert.alert(
          'Erro',
          `Quantidade para ${ticketName} (${qtyNum}) excede a capacidade máxima do evento (${max})`,
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    // Validação de preços
    const invalidTickets = tickets.filter(
      t => !t.price || parseFloat(t.price) <= 0,
    );
    if (invalidTickets.length > 0) {
      Alert.alert(
        'Erro',
        `Defina o preço para: ${invalidTickets.map(t => t.name).join(', ')}`,
      );
      return;
    }

    // Validação de quantidade total vs capacidade máxima
    if (maxAttendees) {
      const totalTickets = calculateTotalTickets();
      const maxCapacity = parseInt(maxAttendees);

      if (totalTickets > maxCapacity) {
        Alert.alert(
          '⚠️ Capacidade Excedida',
          `A soma total dos ingressos (${totalTickets}) excede a capacidade máxima do evento (${maxCapacity}).\n\n` +
            `Por favor, reduza a quantidade de ingressos em ${
              totalTickets - maxCapacity
            } unidades.`,
          [{ text: 'OK' }],
        );
        return;
      }

      if (totalTickets === 0) {
        Alert.alert(
          '⚠️ Atenção',
          `Você não definiu nenhuma quantidade de ingressos.\n\n` +
            `A capacidade máxima do evento é de ${maxCapacity} pessoas.`,
          [{ text: 'OK' }],
        );
        return;
      }
    }

    if (!eventId) {
      Alert.alert('Erro', 'ID do evento não encontrado');
      return;
    }

    try {
      setLoading(true);

      const ticketData = tickets.map(ticket => ({
        eventId: eventId,
        ticketName: ticket.name,
        category: ticket.name.toUpperCase(),
        totalQuantity: ticket.quantity ? parseInt(ticket.quantity) : null,
        price: parseFloat(ticket.price),
        changeReason: 'Configuração inicial de bilhetes',
        strategyId: 1,
        ticketId: null,
        description: `${ticket.name} - Ingresso para o evento`,
        benefits: [],
        salesStartDate: new Date().toISOString(),
        salesEndDate: null,
        maxTicketsPerUser: 10,
        hasDynamicPricing: false,
      }));

      console.log('📦 Enviando tickets:', JSON.stringify(ticketData, null, 2));
      console.log('📊 Resumo:', {
        totalTickets: calculateTotalTickets(),
        maxCapacity: maxAttendees,
        categories: tickets.length,
      });

      const response = await createTicketsForEvent(ticketData);

      Alert.alert(
        '✅ Sucesso!',
        `${tickets.length} bilhete(s) configurado(s) com sucesso!\n\n` +
          `📊 Total de ingressos: ${calculateTotalTickets()}\n` +
          `🏟️ Capacidade do evento: ${maxAttendees || 'Ilimitada'}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Alert.alert('Erro de Validação', errors.map(e => e.message).join('\n'));
      } else {
        Alert.alert(
          'Erro',
          error.response?.data?.message ||
            error.message ||
            'Falha ao criar bilhetes',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const totalTickets = calculateTotalTickets();
  const isExceeding = isTotalExceedingCapacity();
  const remainingCapacity = getRemainingCapacity();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Salvando bilhetes...</Text>
        </View>
      )}

      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Configurar Bilhetes</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {eventName || 'Evento sem nome'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Banner de Capacidade */}
      {maxAttendees && (
        <View
          style={[
            styles.capacityBanner,
            isExceeding && styles.capacityBannerError,
          ]}
        >
          <Icon
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
              Capacidade do Evento: {maxAttendees} pessoas
            </Text>
            <Text
              style={[
                styles.capacityBannerText,
                isExceeding && styles.capacityBannerTextError,
              ]}
            >
              {isExceeding
                ? `⚠️ Excedido em ${Math.abs(remainingCapacity)} ingressos!`
                : `📊 Disponível: ${remainingCapacity} ingressos`}
            </Text>
            <Text style={styles.capacityBannerSubtext}>
              Total configurado: {totalTickets} ingressos
            </Text>
          </View>
        </View>
      )}

      {/* Seção de Categorias */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Selecione as categorias</Text>
        <View style={styles.categoryRow}>
          {Object.values(DEFAULT_CATEGORIES).map(category => {
            const isActive = tickets.some(t => t.name === category.name);
            return (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.color },
                  isActive && styles.categoryCardActive,
                ]}
                onPress={() => toggleCategory(category.name)}
                disabled={loading}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryStatus}>
                  {isActive ? '✓' : '+'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Lista de Bilhetes */}
      <ScrollView
        style={styles.ticketList}
        showsVerticalScrollIndicator={false}
      >
        {tickets.map((ticket, index) => (
          <View
            key={ticket.name}
            style={[styles.ticketCard, { borderLeftColor: ticket.color }]}
          >
            <View style={styles.ticketHeader}>
              <View style={styles.ticketTitleRow}>
                <Text style={styles.ticketIcon}>{ticket.icon}</Text>
                <Text style={styles.ticketName}>{ticket.name}</Text>
              </View>
              {tickets.length > 1 && (
                <TouchableOpacity
                  onPress={() => toggleCategory(ticket.name)}
                  disabled={loading}
                >
                  <Text style={styles.removeText}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Preço (MT) *</Text>
                <TextInput
                  style={styles.input}
                  value={ticket.price}
                  onChangeText={text => updateTicket(index, 'price', text)}
                  placeholder="Ex: 500"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Quantidade
                  {maxAttendees && ` (máx: ${maxAttendees})`}
                </Text>
                <TextInput
                  style={[styles.input, isExceeding && styles.inputError]}
                  value={ticket.quantity}
                  onChangeText={text => updateTicket(index, 'quantity', text)}
                  placeholder="Ex: 100 (deixe vazio para ilimitado)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>
            </View>
          </View>
        ))}

        {tickets.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎟️</Text>
            <Text style={styles.emptyText}>Nenhuma categoria selecionada</Text>
            <Text style={styles.emptySubtext}>
              Selecione uma categoria acima para começar
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer com Botão Salvar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (tickets.length === 0 || loading || isExceeding) &&
              styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={tickets.length === 0 || loading || isExceeding}
        >
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.saveButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="save-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  Salvar {tickets.length} Bilhete
                  {tickets.length !== 1 ? 's' : ''}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {isExceeding && (
          <Text style={styles.errorText}>
            ⚠️ A soma dos ingressos excede a capacidade máxima do evento
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default TicketConfigurationScreen;
