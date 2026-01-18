// TicketConfigurationScreen.js
import React, { useState, useEffect } from 'react';
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
import { createTicketsForEvent } from './../../services/ticketService';
import styles from './style';

const TicketConfigurationScreen = ({ navigation, route }) => {
  const { eventId, eventName } = route.params || {};

  // Configurações padrão para cada categoria
  const DEFAULT_CATEGORIES = {
    Normal: {
      id: 'normal',
      name: 'Normal',
      price: '',
      quantity: '',
      description: 'Acesso padrão ao evento',
      benefits: ['Acesso ao evento', 'Documentação digital'],
      color: '#4CAF50', // Verde
      icon: '🎫',
      order: 1,
    },
    VIP: {
      id: 'vip',
      name: 'VIP',
      price: '',
      quantity: '',
      description: 'Experiência VIP com benefícios exclusivos',
      benefits: [
        'Acesso ao evento',
        'Documentação premium',
        'Área VIP',
        'Brinde exclusivo',
        'Welcome drink',
      ],
      color: '#2196F3', // Azul
      icon: '⭐',
      order: 2,
    },
    VVIP: {
      id: 'vvip',
      name: 'VVIP',
      price: '',
      quantity: '',
      description: 'Experiência VVIP premium com todos os benefícios',
      benefits: [
        'Todos benefícios VIP',
        'Parking dedicado',
        'Meet & greet',
        'Jantar com organizadores',
        'Kit premium personalizado',
      ],
      color: '#FF9800', // Laranja
      icon: '👑',
      order: 3,
    },
  };

  // Estado para tickets
  const [tickets, setTickets] = useState([
    { ...DEFAULT_CATEGORIES.Normal, isActive: true },
  ]);
  const [loading, setLoading] = useState(false);

  // Verificar se temos o eventId
  useEffect(() => {
    if (!eventId) {
      Alert.alert('Erro', 'ID do evento não encontrado');
      navigation.goBack();
    }
  }, [eventId, navigation]);

  // Alternar categoria (ativar/desativar)
  const toggleCategory = categoryName => {
    const category = DEFAULT_CATEGORIES[categoryName];
    const existingIndex = tickets.findIndex(t => t.name === categoryName);

    if (existingIndex >= 0) {
      // Remover se já existe
      const updated = tickets.filter(t => t.name !== categoryName);
      setTickets(updated);
    } else {
      // Adicionar na ordem correta
      const newTicket = {
        ...category,
        isActive: true,
        price: getSuggestedPrice(categoryName),
      };
      const updated = [...tickets, newTicket];

      // Ordenar: Normal → VIP → VVIP
      updated.sort((a, b) => a.order - b.order);

      setTickets(updated);
    }
  };

  // Obter preço sugerido baseado na categoria
  const getSuggestedPrice = categoryName => {
    switch (categoryName) {
      case 'VIP':
        return '2500';
      case 'VVIP':
        return '5000';
      default:
        return '';
    }
  };

  // Atualizar ticket
  const updateTicket = (index, field, value) => {
    const updated = [...tickets];
    updated[index][field] = value;
    setTickets(updated);
  };

  // Verificar se uma categoria está ativa
  const isCategoryActive = categoryName => {
    return tickets.some(t => t.name === categoryName);
  };

  // Renderizar selector de categorias
  const renderCategorySelector = () => (
    <View style={styles.categorySelector}>
      <Text style={styles.selectorTitle}>Selecione as Categorias:</Text>
      <Text style={styles.selectorSubtitle}>
        Escolha entre Normal, VIP e VVIP
      </Text>
      <View style={styles.categoryButtons}>
        {Object.values(DEFAULT_CATEGORIES).map(category => {
          const isActive = isCategoryActive(category.name);

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                { backgroundColor: category.color },
                isActive && styles.categoryButtonActive,
              ]}
              onPress={() => toggleCategory(category.name)}
              disabled={loading}
            >
              <Text style={styles.categoryButtonIcon}>{category.icon}</Text>
              <Text style={styles.categoryButtonText}>{category.name}</Text>
              <Text style={styles.categoryButtonStatus}>
                {isActive ? '✓ Selecionado' : '+ Adicionar'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Renderizar lista de tickets ativos
  const renderActiveTickets = () => (
    <ScrollView style={styles.ticketList}>
      {tickets.map((ticket, index) => (
        <View
          key={ticket.id}
          style={[styles.ticketCard, { borderLeftColor: ticket.color }]}
        >
          <View style={styles.ticketHeader}>
            <View style={styles.ticketTitleRow}>
              <Text style={styles.ticketIcon}>{ticket.icon}</Text>
              <Text style={styles.ticketName}>{ticket.name}</Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: ticket.color },
                ]}
              >
                <Text style={styles.categoryBadgeText}>{ticket.name}</Text>
              </View>
            </View>

            {tickets.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => toggleCategory(ticket.name)}
                disabled={loading}
              >
                <Text style={styles.removeButtonText}>Remover</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.ticketRow}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Preço (MZN)*</Text>
              <TextInput
                style={styles.input}
                value={ticket.price}
                onChangeText={text => updateTicket(index, 'price', text)}
                placeholder="0.00"
                keyboardType="decimal-pad"
                editable={!loading}
              />
              <Text style={styles.currencyText}>MT</Text>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Quantidade</Text>
              <TextInput
                style={styles.input}
                value={ticket.quantity}
                onChangeText={text => updateTicket(index, 'quantity', text)}
                placeholder="Ilimitado"
                keyboardType="numeric"
                editable={!loading}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Descrição</Text>
          <TextInput
            style={styles.descriptionInput}
            value={ticket.description}
            onChangeText={text => updateTicket(index, 'description', text)}
            placeholder="Descreva os benefícios desta categoria..."
            multiline
            numberOfLines={2}
            editable={!loading}
          />

          {/* Benefícios sugeridos */}
          {ticket.benefits && ticket.benefits.length > 0 && (
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Benefícios Sugeridos:</Text>
              <View style={styles.benefitsList}>
                {ticket.benefits.map((benefit, i) => (
                  <View key={i} style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>✓</Text>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  // Salvar tickets no backend
  const handleSave = async () => {
    // Validação
    const invalidTickets = tickets.filter(
      ticket =>
        !ticket.price ||
        isNaN(parseFloat(ticket.price)) ||
        parseFloat(ticket.price) < 0,
    );

    if (invalidTickets.length > 0) {
      Alert.alert(
        'Validação',
        `Por favor, defina um preço válido para:\n${invalidTickets
          .map(t => t.name)
          .join(', ')}`,
      );
      return;
    }

    if (!eventId) {
      Alert.alert('Erro', 'ID do evento não encontrado');
      return;
    }

    try {
      setLoading(true);

      // Preparar dados dos tickets
      const ticketData = tickets.map(ticket => ({
        ticketId: null,
        eventId: eventId,
        ticketName: ticket.name,
        price: parseFloat(ticket.price),
        totalQuantity: ticket.quantity ? parseInt(ticket.quantity) : null,
        description: ticket.description,
        benefits: ticket.benefits,
        category: ticket.name.toUpperCase(),
        isActive: true,
        maxTicketsPerUser: 10, // Valor padrão
        saleStartDate: new Date().toISOString(),
        saleEndDate: null, // Pode ser definido depois
      }));

      console.log('📦 Enviando tickets:', JSON.stringify(ticketData, null, 2));

      // Enviar para API
      const response = await createTicketsForEvent(ticketData);

      Alert.alert(
        '✅ Sucesso!',
        `${tickets.length} categorias de bilhetes criadas com sucesso!`,
        [
          {
            text: 'Voltar para Eventos',
            onPress: () => {
              // Navegar para a tela de eventos
              navigation.reset({
                index: 0,
                routes: [{ name: 'Events' }],
              });
            },
          },
          {
            text: 'Ver Detalhes',
            onPress: () => {
              // Navegar para detalhes do evento
              navigation.navigate('EventDetails', { eventId });
            },
          },
        ],
      );
    } catch (error) {
      console.error('Erro ao criar tickets:', error);
      Alert.alert(
        'Erro',
        `Falha ao criar bilhetes: ${error.message || 'Erro desconhecido'}`,
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Salvando bilhetes...</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Configurar Bilhetes</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {eventName || 'Evento sem nome'}
          </Text>
          <Text style={styles.eventId}>ID do Evento: {eventId}</Text>
        </View>
      </View>

      {renderCategorySelector()}
      {renderActiveTickets()}

      <View style={styles.footer}>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumo:</Text>
          {tickets.map((ticket, index) => (
            <View key={index} style={styles.summaryItem}>
              <Text style={styles.summaryName}>
                {ticket.icon} {ticket.name}
              </Text>
              <Text style={styles.summaryPrice}>
                {ticket.price
                  ? `${parseFloat(ticket.price).toFixed(2)} MT`
                  : 'Preço não definido'}
              </Text>
            </View>
          ))}
          {tickets.length === 0 && (
            <Text style={styles.summaryEmpty}>
              Nenhuma categoria selecionada
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            tickets.length === 0 && styles.disabledButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={tickets.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {tickets.length === 0
                ? 'Selecione pelo menos uma categoria'
                : `✓ Criar ${tickets.length} Bilhete${
                    tickets.length > 1 ? 's' : ''
                  }`}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Configurar mais tarde</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default TicketConfigurationScreen;
