// screens/coupons/CreateCouponScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { couponService } from '../../services/couponService';
import { getEvents } from './../../services/eventService';
import styles from './style';

export default function CreateCouponScreen({ navigation, route }) {
  const { eventId: initialEventId } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState({
    validFrom: false,
    validUntil: false,
  });

  // Dados do cupom - alinhado com CreateCouponDTO
  const [couponData, setCouponData] = useState({
    eventId: initialEventId || '',
    code: '',
    discountType: 'PERCENTAGE', // PERCENTAGE, FIXED
    discountValue: '',
    maxUses: '',
    validFrom: null,
    validUntil: null,
    description: '',
    minPurchaseAmount: '',
    isPublic: true,
  });

  // Erros de validação (apenas campos obrigatórios)
  const [errors, setErrors] = useState({});

  // Carregar eventos
  useEffect(() => {
    loadEvents();
  }, []);

  // Se tiver eventId inicial, buscar o evento selecionado
  useEffect(() => {
    if (initialEventId && events.length > 0) {
      const event = events.find(e => e.id === initialEventId);
      if (event) {
        setSelectedEvent(event);
        handleChange('eventId', event.id);
      }
    }
  }, [initialEventId, events, handleChange]);

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await getEvents();
      // Garantir que response é um array
      const eventsArray = Array.isArray(response)
        ? response
        : response?.data || [];
      setEvents(eventsArray);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de eventos');
    } finally {
      setLoadingEvents(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleChange = useCallback((field, value) => {
    setCouponData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo se existir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  });

  const selectEvent = event => {
    setSelectedEvent(event);
    handleChange('eventId', event.id);
    setShowEventModal(false);
  };

  // ✅ Validação APENAS dos campos obrigatórios
  const validateForm = () => {
    const newErrors = {};

    // Event ID é obrigatório
    if (!couponData.eventId) {
      newErrors.eventId = 'Selecione um evento';
    }

    // Código é obrigatório
    if (!couponData.code.trim()) {
      newErrors.code = 'Código do cupom é obrigatório';
    } else if (couponData.code.length < 3) {
      newErrors.code = 'Código deve ter pelo menos 3 caracteres';
    }

    // Discount Type é obrigatório (já tem valor default)
    // Discount Value é obrigatório
    if (!couponData.discountValue) {
      newErrors.discountValue = 'Valor do desconto é obrigatório';
    } else if (parseFloat(couponData.discountValue) <= 0) {
      newErrors.discountValue = 'Valor deve ser maior que zero';
    } else if (
      couponData.discountType === 'PERCENTAGE' &&
      parseFloat(couponData.discountValue) > 100
    ) {
      newErrors.discountValue = 'Percentual não pode ser maior que 100%';
    }

    // ✅ maxUses NÃO é obrigatório - sem validação
    // ✅ validFrom NÃO é obrigatório - sem validação
    // ✅ validUntil NÃO é obrigatório - sem validação
    // ✅ description NÃO é obrigatório - sem validação
    // ✅ minPurchaseAmount NÃO é obrigatório - sem validação
    // ✅ isPublic NÃO é obrigatório (tem default) - sem validação

    // Se informou validUntil mas não validFrom, ou vice-versa
    if (couponData.validFrom && !couponData.validUntil) {
      newErrors.validUntil = 'Informe a data final ou remova a data inicial';
    }
    if (!couponData.validFrom && couponData.validUntil) {
      newErrors.validFrom = 'Informe a data inicial ou remova a data final';
    }

    // Se informou ambas, validar que final > inicial
    if (couponData.validFrom && couponData.validUntil) {
      if (new Date(couponData.validUntil) <= new Date(couponData.validFrom)) {
        newErrors.validUntil = 'Data final deve ser posterior à data inicial';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      // ✅ Montar payload exatamente como o DTO espera
      const payload = {
        eventId: parseInt(couponData.eventId),
        code: couponData.code.toUpperCase().replace(/\s/g, ''),
        discountType: couponData.discountType,
        discountValue: parseFloat(couponData.discountValue),
        // Campos opcionais - só enviar se tiverem valor
        ...(couponData.maxUses && { maxUses: parseInt(couponData.maxUses) }),
        ...(couponData.validFrom && { validFrom: couponData.validFrom }),
        ...(couponData.validUntil && { validUntil: couponData.validUntil }),
        ...(couponData.description && {
          description: couponData.description.trim(),
        }),
        ...(couponData.minPurchaseAmount && {
          minPurchaseAmount: parseFloat(couponData.minPurchaseAmount),
        }),
        isPublic: couponData.isPublic, // sempre enviar (tem default)
      };

      console.log(
        '📦 Payload para o backend:',
        JSON.stringify(payload, null, 2),
      );

      await couponService.createCoupon(payload);

      Alert.alert('Sucesso', 'Cupom criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('❌ Erro ao criar cupom:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível criar o cupom',
      );
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const prefix = couponData.eventId ? `EVT${couponData.eventId}` : 'CUPOM';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    handleChange('code', `${prefix}${random}`);
  };

  const onDateChange = (event, selectedDate, field) => {
    setShowDatePicker(prev => ({ ...prev, [field]: false }));
    if (selectedDate) {
      handleChange(field, selectedDate);
    }
  };

  const formatDate = date => {
    if (!date) return 'Selecionar data';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatEventDate = dateString => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Cupom</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Evento - OBRIGATÓRIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🎫 Evento <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.eventSelector,
              errors.eventId && styles.eventSelectorError,
            ]}
            onPress={() => setShowEventModal(true)}
            disabled={loadingEvents}
          >
            {selectedEvent ? (
              <View style={styles.selectedEventInfo}>
                <Icon name="calendar-check" size={20} color="#6366F1" />
                <View style={styles.selectedEventTexts}>
                  <Text style={styles.selectedEventName}>
                    {selectedEvent.name}
                  </Text>
                  <Text style={styles.selectedEventDate}>
                    {formatEventDate(selectedEvent.eventDate)}
                  </Text>
                </View>
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              </View>
            ) : (
              <View style={styles.eventSelectorPlaceholder}>
                <Icon name="calendar-plus" size={20} color="#9CA3AF" />
                <Text style={styles.eventSelectorPlaceholderText}>
                  {loadingEvents
                    ? 'Carregando eventos...'
                    : 'Toque para selecionar um evento'}
                </Text>
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              </View>
            )}
          </TouchableOpacity>
          {errors.eventId && (
            <Text style={styles.errorText}>{errors.eventId}</Text>
          )}
        </View>

        {/* Código do Cupom - OBRIGATÓRIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🏷️ Código do Cupom <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.codeContainer}>
            <TextInput
              style={[styles.codeInput, errors.code && styles.inputError]}
              placeholder="Ex: PROMO10"
              value={couponData.code}
              onChangeText={text => handleChange('code', text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={20}
            />
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateRandomCode}
            >
              <Icon name="auto-fix" size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>
          {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
        </View>

        {/* Tipo de Desconto - OBRIGATÓRIO (tem default) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💰 Tipo de Desconto <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={styles.discountTypeContainer}>
            <TouchableOpacity
              style={[
                styles.discountTypeButton,
                couponData.discountType === 'PERCENTAGE' &&
                  styles.discountTypeActive,
              ]}
              onPress={() => handleChange('discountType', 'PERCENTAGE')}
            >
              <Icon
                name="percent"
                size={24}
                color={
                  couponData.discountType === 'PERCENTAGE'
                    ? '#6366F1'
                    : '#9CA3AF'
                }
              />
              <Text
                style={[
                  styles.discountTypeText,
                  couponData.discountType === 'PERCENTAGE' &&
                    styles.discountTypeTextActive,
                ]}
              >
                Percentual
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.discountTypeButton,
                couponData.discountType === 'FIXED' &&
                  styles.discountTypeActive,
              ]}
              onPress={() => handleChange('discountType', 'FIXED')}
            >
              <Icon
                name="currency-usd"
                size={24}
                color={
                  couponData.discountType === 'FIXED' ? '#6366F1' : '#9CA3AF'
                }
              />
              <Text
                style={[
                  styles.discountTypeText,
                  couponData.discountType === 'FIXED' &&
                    styles.discountTypeTextActive,
                ]}
              >
                Valor Fixo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Valor do Desconto - OBRIGATÓRIO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {couponData.discountType === 'PERCENTAGE'
              ? '📊 Percentual de Desconto'
              : '💵 Valor do Desconto'}{' '}
            <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={[styles.card, errors.discountValue && styles.cardError]}>
            <TextInput
              style={styles.input}
              placeholder={
                couponData.discountType === 'PERCENTAGE'
                  ? 'Ex: 20'
                  : 'Ex: 50.00'
              }
              value={couponData.discountValue}
              onChangeText={text => handleChange('discountValue', text)}
              keyboardType="numeric"
            />
            <Text style={styles.inputSuffix}>
              {couponData.discountType === 'PERCENTAGE' ? '%' : 'R$'}
            </Text>
          </View>
          {errors.discountValue && (
            <Text style={styles.errorText}>{errors.discountValue}</Text>
          )}
        </View>

        {/* Validade - OPCIONAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📅 Período de Validade (opcional)
          </Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={[
                styles.dateButton,
                errors.validFrom && styles.dateButtonError,
              ]}
              onPress={() =>
                setShowDatePicker(prev => ({ ...prev, validFrom: true }))
              }
            >
              <Icon name="calendar-start" size={20} color="#6366F1" />
              <Text style={styles.dateText}>
                {couponData.validFrom
                  ? formatDate(couponData.validFrom)
                  : 'Data inicial'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dateButton,
                errors.validUntil && styles.dateButtonError,
              ]}
              onPress={() =>
                setShowDatePicker(prev => ({ ...prev, validUntil: true }))
              }
            >
              <Icon name="calendar-end" size={20} color="#6366F1" />
              <Text style={styles.dateText}>
                {couponData.validUntil
                  ? formatDate(couponData.validUntil)
                  : 'Data final'}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.validFrom && (
            <Text style={styles.errorText}>{errors.validFrom}</Text>
          )}
          {errors.validUntil && (
            <Text style={styles.errorText}>{errors.validUntil}</Text>
          )}
        </View>

        {/* Date Pickers */}
        {showDatePicker.validFrom && (
          <DateTimePicker
            value={couponData.validFrom || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => onDateChange(event, date, 'validFrom')}
            minimumDate={new Date()}
          />
        )}

        {showDatePicker.validUntil && (
          <DateTimePicker
            value={couponData.validUntil || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => onDateChange(event, date, 'validUntil')}
            minimumDate={couponData.validFrom || new Date()}
          />
        )}

        {/* Limite de Usos - OPCIONAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Limite de Usos (opcional)</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100"
              value={couponData.maxUses}
              onChangeText={text => handleChange('maxUses', text)}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Valor Mínimo - OPCIONAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💰 Valor Mínimo de Compra (opcional)
          </Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100.00"
              value={couponData.minPurchaseAmount}
              onChangeText={text => handleChange('minPurchaseAmount', text)}
              keyboardType="numeric"
            />
            <Text style={styles.inputSuffix}>R$</Text>
          </View>
        </View>

        {/* Descrição - OPCIONAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Descrição (opcional)</Text>
          <View style={styles.card}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva as condições do cupom..."
              value={couponData.description}
              onChangeText={text => handleChange('description', text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Cupom Público - OPCIONAL (tem default) */}
        <View style={styles.section}>
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Icon name="earth" size={20} color="#4B5563" />
              <Text style={styles.switchLabel}>Cupom público</Text>
            </View>
            <Switch
              value={couponData.isPublic}
              onValueChange={value => handleChange('isPublic', value)}
              trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.switchHelp}>
            {couponData.isPublic
              ? 'Todos os clientes podem ver e usar este cupom'
              : 'Apenas você pode compartilhar este cupom'}
          </Text>
        </View>

        {/* Botão Criar */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#9CA3AF', '#6B7280'] : ['#6366F1', '#8B5CF6']}
            style={styles.submitGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Icon name="ticket-percent" size={20} color="#FFF" />
                <Text style={styles.submitText}>Criar Cupom</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal de Seleção de Eventos */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Evento</Text>
              <TouchableOpacity
                onPress={() => setShowEventModal(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {loadingEvents ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.modalLoadingText}>
                  Carregando eventos...
                </Text>
              </View>
            ) : events.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Icon name="calendar-remove" size={48} color="#E5E7EB" />
                <Text style={styles.modalEmptyText}>
                  Nenhum evento encontrado
                </Text>
              </View>
            ) : (
              <FlatList
                data={events}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.eventItem,
                      selectedEvent?.id === item.id && styles.eventItemSelected,
                    ]}
                    onPress={() => selectEvent(item)}
                  >
                    <View style={styles.eventItemIcon}>
                      <Icon
                        name="calendar"
                        size={24}
                        color={
                          selectedEvent?.id === item.id ? '#6366F1' : '#9CA3AF'
                        }
                      />
                    </View>
                    <View style={styles.eventItemInfo}>
                      <Text
                        style={[
                          styles.eventItemName,
                          selectedEvent?.id === item.id &&
                            styles.eventItemNameSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.eventItemDate}>
                        {formatEventDate(item.eventDate)}
                      </Text>
                    </View>
                    {selectedEvent?.id === item.id && (
                      <Icon name="check-circle" size={24} color="#10B981" />
                    )}
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.modalList}
              />
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEventModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
