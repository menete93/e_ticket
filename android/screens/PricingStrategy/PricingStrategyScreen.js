import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  Switch,
  View,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getEvents } from './../../services/eventService';
import { getTickets } from './../../services/ticketService';
import {
  getPricingStrategies,
  createPricingStrategy,
  updatePricingStrategy,
  deletePricingStrategy,
} from './../../services/pricingService';
import style from './style';

export default function PricingStrategyScreen({ navigation }) {
  // Estados
  const [events, setEvents] = useState([]);
  const [pricingStrategies, setPricingStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [showStrategySelector, setShowStrategySelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventTickets, setEventTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Estado do formulário
  const [form, setForm] = useState({
    strategyName: '',
    strategyType: 'DYNAMIC',
    eventId: '',
    basePrice: '',
    minPrice: '',
    maxPrice: '',
    demandThresholdPercentage: '70',
    priceIncreasePercentage: '15',
    applyScope: 'EVENT',
    ticketCategory: '',
    ticketId: '', // NOVO: para guardar o ID do ticket selecionado
    applyAutomatically: true,
  });

  // Função para resetar formulário
  const resetForm = useCallback(() => {
    setForm({
      strategyName: '',
      strategyType: 'DYNAMIC',
      eventId: '',
      basePrice: '',
      minPrice: '',
      maxPrice: '',
      demandThresholdPercentage: '70',
      priceIncreasePercentage: '15',
      applyScope: 'EVENT',
      ticketCategory: '',
      applyAutomatically: true,
    });
  }, []);

  // Funções de fetch usando useCallback
  const fetchEvents = useCallback(async () => {
    try {
      const response = await getEvents();
      setEvents(response.data || response || []);

      console.log('eventos:', response);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os eventos');
    }
  }, []);

  const fetchPricingStrategies = useCallback(async () => {
    try {
      setLoadingStrategies(true);
      const response = await getPricingStrategies();
      console.log('PricingStrategies:', response);
      if (response && Array.isArray(response.data)) {
        setPricingStrategies(response.data);
      } else if (Array.isArray(response)) {
        setPricingStrategies(response);
      } else {
        setPricingStrategies([]);
      }
    } catch (error) {
      console.error('Erro ao buscar estratégias:', error);
      setPricingStrategies([]);
    } finally {
      setLoadingStrategies(false);
    }
  }, []);

  const fetchEventTickets = useCallback(async () => {
    if (!form.eventId) {
      setEventTickets([]);
      return;
    }

    try {
      setLoadingTickets(true);
      console.log('🔄 Buscando tickets para evento:', form.eventId);

      // Opção 1: Tentar o endpoint correto de tickets
      const response = await getTickets(form.eventId);

      // Opção 2: Se o acima falhar, usar getEvents como fallback
      // const response = await getEvents();

      console.log('📦 Resposta:', response);

      let tickets = [];

      // Extrair tickets baseado na estrutura da resposta
      if (response?.data && Array.isArray(response.data)) {
        // Se for array de tickets diretamente
        if (response.data[0]?.category) {
          tickets = response.data;
        }
        // Se for array de eventos (como no seu log)
        else if (response.data[0]?.tickets) {
          const evento = response.data.find(
            e => e.id === parseInt(form.eventId),
          );
          tickets = evento?.tickets || [];
        }
      } else if (Array.isArray(response)) {
        tickets = response;
      }

      console.log('✅ Tickets processados:', tickets);
      setEventTickets(tickets);
    } catch (error) {
      console.error('❌ Erro:', error);
      setEventTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  }, [form.eventId]);

  const ticketOptions = useMemo(() => {
    if (!form.eventId || !eventTickets.length) {
      console.log('📌 Sem tickets disponíveis');
      return [];
    }

    console.log('📌 Tickets para criar opções:', eventTickets);

    // Criar array de objetos com id e category
    const options = eventTickets.map(ticket => ({
      id: ticket.id,
      category: ticket.category,
      ticketName: ticket.ticketName || ticket.category, // Nome amigável
    }));

    console.log('📌 Opções de tickets:', options);

    // Se quiser ordenar por categoria
    options.sort((a, b) => a.category.localeCompare(b.category));

    return options;
  }, [eventTickets, form.eventId]);

  // Função fetchAllData usando useCallback
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchEvents(),
        fetchPricingStrategies(),
        fetchEventTickets(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchEvents, fetchPricingStrategies, fetchEventTickets]);

  // Buscar dados iniciais
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Buscar estratégias por evento específico (opcional)
  useEffect(() => {
    if (form.eventId) {
      // Opcional: implementar fetch específico por evento
    }
  }, [form.eventId]);

  // Selecionar estratégia existente
  const handleSelectStrategy = useCallback(strategy => {
    setSelectedStrategy(strategy);

    // Preencher formulário com dados da estratégia
    setForm({
      strategyName: strategy.strategyName || '',
      strategyType: strategy.strategyType || 'DYNAMIC',
      eventId: strategy.eventId || '',
      basePrice: strategy.basePrice?.toString() || '',
      minPrice: strategy.minPrice?.toString() || '',
      maxPrice: strategy.maxPrice?.toString() || '',
      demandThresholdPercentage:
        strategy.demandThresholdPercentage?.toString() || '70',
      priceIncreasePercentage:
        strategy.priceIncreasePercentage?.toString() || '15',
      applyScope: strategy.ticketCategory ? 'CATEGORY' : 'EVENT',
      ticketCategory: strategy.ticketCategory || '',
      ticketId: strategy.ticketId || '', // NOVO
      applyAutomatically:
        strategy.applyAutomatically !== undefined
          ? strategy.applyAutomatically
          : true,
    });

    setShowStrategySelector(false);
  }, []);

  // Limpar seleção - AGORA INCLUINDO resetForm NAS DEPENDÊNCIAS
  const handleClearSelection = useCallback(() => {
    setSelectedStrategy(null);
    resetForm();
  }, [resetForm]); // resetForm adicionado aqui

  // Atualizar campo do formulário
  const update = useCallback((k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
  }, []);

  // Validação do formulário - AGORA INCLUINDO form NAS DEPENDÊNCIAS
  const validateForm = useCallback(() => {
    const errors = [];

    if (!form.strategyName.trim())
      errors.push('Nome da estratégia é obrigatório');
    if (!form.eventId) errors.push('Selecione um evento');
    if (!form.basePrice) errors.push('Preço Base é obrigatório');

    if (
      form.minPrice &&
      form.maxPrice &&
      Number(form.minPrice) > Number(form.maxPrice)
    ) {
      errors.push('Preço mínimo não pode ser maior que preço máximo');
    }

    if (form.strategyType === 'DYNAMIC') {
      if (!form.demandThresholdPercentage)
        errors.push('Limite de Demanda é obrigatório');
      if (!form.priceIncreasePercentage)
        errors.push('Acréscimo no Preço é obrigatório');
    }

    if (errors.length > 0) {
      Alert.alert('Erro de Validação', errors.join('\n'));
      return false;
    }
    return true;
  }, [form]); // form adicionado aqui

  // Salvar estratégia - AGORA INCLUINDO TODAS AS DEPENDÊNCIAS
  const submit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        strategyName: form.strategyName,
        strategyType: form.strategyType,
        eventId: form.eventId,
        basePrice: parseFloat(form.basePrice.replace(',', '.')),
        minPrice: form.minPrice
          ? parseFloat(form.minPrice.replace(',', '.'))
          : null,
        maxPrice: form.maxPrice
          ? parseFloat(form.maxPrice.replace(',', '.'))
          : null,
        demandThresholdPercentage: form.demandThresholdPercentage
          ? parseFloat(form.demandThresholdPercentage.replace(',', '.'))
          : null,
        priceIncreasePercentage: form.priceIncreasePercentage
          ? parseFloat(form.priceIncreasePercentage.replace(',', '.'))
          : null,
        applyAutomatically: form.applyAutomatically,
        applyToAllTickets: form.applyScope === 'EVENT',
        ticketId: form.applyScope === 'CATEGORY' ? form.ticketId : null,
        ticketCategory:
          form.applyScope === 'CATEGORY' ? form.ticketCategory : null,
      };

      let response;

      if (selectedStrategy) {
        // Modo edição
        response = await updatePricingStrategy(selectedStrategy.id, payload);
        Alert.alert('Sucesso!', 'Estratégia de preço atualizada com sucesso');
      } else {
        // Modo criação
        response = await createPricingStrategy(payload);
        Alert.alert('Sucesso!', 'Estratégia de preço criada com sucesso');
      }

      // Atualizar lista e limpar
      await fetchPricingStrategies();
      handleClearSelection();
    } catch (error) {
      console.error('Erro ao salvar estratégia:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível salvar a estratégia',
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    form,
    selectedStrategy,
    validateForm,
    fetchPricingStrategies,
    handleClearSelection,
  ]); // Todas as dependências incluídas

  // Deletar estratégia - AGORA INCLUINDO TODAS AS DEPENDÊNCIAS
  const handleDeleteStrategy = useCallback(async () => {
    if (!selectedStrategy) return;

    try {
      setDeleting(true);
      await deletePricingStrategy(selectedStrategy.id);

      Alert.alert('Sucesso!', 'Estratégia excluída com sucesso');
      handleClearSelection();
      await fetchPricingStrategies();
    } catch (error) {
      console.error('Erro ao deletar estratégia:', error);
      Alert.alert('Erro', 'Não foi possível excluir a estratégia');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [selectedStrategy, handleClearSelection, fetchPricingStrategies]); // Todas as dependências incluídas

  // Formatar valores monetários
  const formatCurrency = useCallback(value => {
    if (!value) return '';
    const numericValue = value.replace(/\D/g, '');
    const floatValue = parseFloat(numericValue) / 100;
    return floatValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  }, []);

  const parseCurrency = useCallback(value => {
    return value.replace('R$', '').replace('.', '').replace(',', '.').trim();
  }, []);

  // Componente InputField - AGORA INCLUINDO TODAS AS DEPENDÊNCIAS
  const InputField = useCallback(
    ({
      label,
      value,
      onChangeText,
      keyboardType = 'default',
      icon,
      placeholder,
      isCurrency,
      isPercentage,
      editable = true,
    }) => (
      <View style={style.inputContainer}>
        <Text style={style.label}>
          {icon && (
            <Icon name={icon} size={16} color="#666" style={style.labelIcon} />
          )}
          {label}
        </Text>
        <View style={style.inputWrapper}>
          {isCurrency && <Text style={style.currencySymbol}>R$</Text>}
          {isPercentage && <Text style={style.percentageSymbol}>%</Text>}
          <TextInput
            style={[
              style.input,
              isCurrency && style.inputWithPrefix,
              isPercentage && style.inputWithSuffix,
              !editable && style.inputDisabled,
            ]}
            value={
              isCurrency
                ? formatCurrency(value)
                : isPercentage
                ? `${value}%`
                : value
            }
            onChangeText={text => {
              if (isCurrency) {
                const parsed = parseCurrency(text);
                onChangeText(parsed);
              } else if (isPercentage) {
                const numeric = text.replace(/\D/g, '');
                onChangeText(numeric);
              } else {
                onChangeText(text);
              }
            }}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor="#999"
            editable={editable}
          />
        </View>
      </View>
    ),
    [formatCurrency, parseCurrency],
  ); // Dependências incluídas

  // Componente Section
  const Section = useCallback(
    ({ title, children }) => (
      <View style={style.section}>
        <Text style={style.sectionTitle}>{title}</Text>
        {children}
      </View>
    ),
    [],
  );

  // Modal de seleção de estratégias - AGORA INCLUINDO TODAS AS DEPENDÊNCIAS
  const StrategySelectorModal = useCallback(
    () => (
      <Modal
        visible={showStrategySelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStrategySelector(false)}
      >
        <View style={style.modalOverlay}>
          <View style={style.modalContainer}>
            <View style={style.modalHeader}>
              <Text style={style.modalTitle}>Selecionar Estratégia</Text>
              <TouchableOpacity
                onPress={() => setShowStrategySelector(false)}
                style={style.modalCloseButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {loadingStrategies ? (
              <View style={style.modalLoading}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={style.modalLoadingText}>
                  Carregando estratégias...
                </Text>
              </View>
            ) : pricingStrategies.length === 0 ? (
              <View style={style.modalEmpty}>
                <Icon name="chart-line" size={48} color="#9CA3AF" />
                <Text style={style.modalEmptyText}>
                  Nenhuma estratégia encontrada
                </Text>
                <TouchableOpacity
                  style={style.modalEmptyButton}
                  onPress={fetchPricingStrategies}
                >
                  <Text style={style.modalEmptyButtonText}>Recarregar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={pricingStrategies}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      style.strategyItem,
                      selectedStrategy?.id === item.id &&
                        style.strategyItemSelected,
                    ]}
                    onPress={() => handleSelectStrategy(item)}
                  >
                    <View style={style.strategyItemContent}>
                      <View style={style.strategyItemHeader}>
                        <Text style={style.strategyItemName} numberOfLines={1}>
                          {item.strategyName}
                        </Text>
                        <View
                          style={[
                            style.strategyTypeBadge,
                            item.strategyType === 'DYNAMIC'
                              ? style.strategyTypeDynamic
                              : style.strategyTypeFixed,
                          ]}
                        >
                          <Text style={style.strategyTypeBadgeText}>
                            {item.strategyType === 'DYNAMIC'
                              ? 'Dinâmica'
                              : 'Fixa'}
                          </Text>
                        </View>
                      </View>

                      <Text style={style.strategyItemEvent} numberOfLines={1}>
                        {item.eventName || `Evento ID: ${item.eventId}`}
                      </Text>

                      <View style={style.strategyItemDetails}>
                        <Text style={style.strategyItemPrice}>
                          Base: R$ {parseFloat(item.basePrice || 0).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <Icon name="chevron-right" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={style.modalList}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <View style={style.modalListHeader}>
                    <Text style={style.modalListCount}>
                      {pricingStrategies.length} estratégia(s) encontrada(s)
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    ),
    [
      showStrategySelector,
      loadingStrategies,
      pricingStrategies,
      selectedStrategy,
      handleSelectStrategy,
      fetchPricingStrategies,
    ],
  ); // Todas as dependências incluídas

  // Modal de confirmação de exclusão - AGORA INCLUINDO TODAS AS DEPENDÊNCIAS
  const DeleteConfirmModal = useCallback(
    () => (
      <Modal
        visible={showDeleteConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={style.deleteModalOverlay}>
          <View style={style.deleteModalContainer}>
            <View style={style.deleteModalIcon}>
              <Icon name="alert-circle" size={48} color="#EF4444" />
            </View>

            <Text style={style.deleteModalTitle}>Excluir Estratégia</Text>

            <Text style={style.deleteModalText}>
              Tem certeza que deseja excluir a estratégia "
              {selectedStrategy?.strategyName}"? Esta ação não pode ser
              desfeita.
            </Text>

            <View style={style.deleteModalButtons}>
              <TouchableOpacity
                style={style.deleteModalCancelButton}
                onPress={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                <Text style={style.deleteModalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={style.deleteModalConfirmButton}
                onPress={handleDeleteStrategy}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={style.deleteModalConfirmText}>Excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    ),
    [showDeleteConfirm, selectedStrategy, deleting, handleDeleteStrategy],
  ); // Todas as dependências incluídas

  // Loading screen
  if (loading) {
    return (
      <View style={style.loadingFullScreen}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={style.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={style.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loadingStrategies}
          onRefresh={fetchPricingStrategies}
        />
      }
    >
      <StrategySelectorModal />
      <DeleteConfirmModal />

      <View style={style.header}>
        <Icon name="chart-line" size={32} color="#4F46E5" />
        <Text style={style.title}>Estratégias de Preço</Text>
        <Text style={style.subtitle}>
          {selectedStrategy
            ? 'Editando estratégia selecionada'
            : 'Crie ou selecione uma estratégia para editar'}
        </Text>
      </View>

      {/* Seção: Selecionar Estratégia Existente */}
      <Section title="Selecionar Estratégia Existente">
        {selectedStrategy ? (
          <View style={style.selectedStrategyContainer}>
            <View style={style.selectedStrategyInfo}>
              <View style={style.selectedStrategyHeader}>
                <Text style={style.selectedStrategyName}>
                  {selectedStrategy.strategyName}
                </Text>
                <View
                  style={[
                    style.selectedStrategyTypeBadge,
                    selectedStrategy.strategyType === 'DYNAMIC'
                      ? style.strategyTypeDynamic
                      : style.strategyTypeFixed,
                  ]}
                >
                  <Text style={style.selectedStrategyTypeText}>
                    {selectedStrategy.strategyType === 'DYNAMIC'
                      ? 'Dinâmica'
                      : 'Fixa'}
                  </Text>
                </View>
              </View>
              <Text style={style.selectedStrategyDetails}>
                Evento:{' '}
                {selectedStrategy.eventName ||
                  `ID: ${selectedStrategy.eventId}`}
              </Text>
              <Text style={style.selectedStrategyDetails}>
                Preço Base: R${' '}
                {parseFloat(selectedStrategy.basePrice || 0).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={style.clearSelectionButton}
              onPress={handleClearSelection}
            >
              <Icon name="close" size={20} color="#EF4444" />
              <Text style={style.clearSelectionText}>Remover</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={style.selectStrategyButton}
            onPress={() => setShowStrategySelector(true)}
          >
            <Icon name="format-list-bulleted" size={24} color="#4F46E5" />
            <View style={style.selectStrategyButtonTextContainer}>
              <Text style={style.selectStrategyButtonTitle}>
                Selecionar Estratégia
              </Text>
              <Text style={style.selectStrategyButtonSubtitle}>
                Escolha uma estratégia existente para editar
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={style.newStrategyButton}
          onPress={handleClearSelection}
        >
          <Icon name="plus-circle" size={20} color="#10B981" />
          <Text style={style.newStrategyButtonText}>Criar Nova Estratégia</Text>
        </TouchableOpacity>
      </Section>

      {/* Formulário de Estratégia */}
      <Section
        title={selectedStrategy ? 'Editar Estratégia' : 'Nova Estratégia'}
      >
        <InputField
          label="Nome da Estratégia"
          icon="tag-outline"
          value={form.strategyName}
          onChangeText={v => update('strategyName', v)}
          placeholder="Ex: Estratégia Verão 2024"
        />

        <View style={style.inputContainer}>
          <Text style={style.label}>
            <Icon
              name="calendar"
              size={16}
              color="#666"
              style={style.labelIcon}
            />
            Selecione o Evento
          </Text>
          <View style={style.pickerContainer}>
            <Picker
              selectedValue={form.eventId}
              onValueChange={v => update('eventId', v)}
              style={style.picker}
              dropdownIconColor="#6B7280"
            >
              <Picker.Item
                label="Selecione um evento..."
                value=""
                color="#9CA3AF"
              />
              {events.map(event => (
                <Picker.Item
                  key={event.id}
                  label={event.name}
                  value={event.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={style.inputContainer}>
          <Text style={style.label}>
            <Icon
              name="format-list-bulleted-type"
              size={16}
              color="#666"
              style={style.labelIcon}
            />
            Tipo de Estratégia
          </Text>
          <View style={style.strategyTypeContainer}>
            <TouchableOpacity
              style={[
                style.strategyTypeButton,
                form.strategyType === 'DYNAMIC' &&
                  style.strategyTypeButtonActive,
              ]}
              onPress={() => update('strategyType', 'DYNAMIC')}
            >
              <Icon
                name="chart-bell-curve"
                size={20}
                color={form.strategyType === 'DYNAMIC' ? '#4F46E5' : '#6B7280'}
              />
              <Text
                style={[
                  style.strategyTypeText,
                  form.strategyType === 'DYNAMIC' &&
                    style.strategyTypeTextActive,
                ]}
              >
                Dinâmica
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                style.strategyTypeButton,
                form.strategyType === 'FIXED' && style.strategyTypeButtonActive,
              ]}
              onPress={() => update('strategyType', 'FIXED')}
            >
              <Icon
                name="lock"
                size={20}
                color={form.strategyType === 'FIXED' ? '#4F46E5' : '#6B7280'}
              />
              <Text
                style={[
                  style.strategyTypeText,
                  form.strategyType === 'FIXED' && style.strategyTypeTextActive,
                ]}
              >
                Fixa
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Section>

      {/* Seção: Configuração de Preços */}
      <Section title="Configuração de Preços">
        <View style={style.priceGrid}>
          <View style={style.priceColumn}>
            <InputField
              label="Preço Base"
              icon="currency-usd"
              value={form.basePrice}
              onChangeText={v => update('basePrice', v)}
              keyboardType="decimal-pad"
              isCurrency
              placeholder="0,00"
            />
          </View>
          <View style={style.priceColumn}>
            <InputField
              label="Preço Mínimo (opcional)"
              icon="arrow-down"
              value={form.minPrice}
              onChangeText={v => update('minPrice', v)}
              keyboardType="decimal-pad"
              isCurrency
              placeholder="0,00"
            />
          </View>
          <View style={style.priceColumn}>
            <InputField
              label="Preço Máximo (opcional)"
              icon="arrow-up"
              value={form.maxPrice}
              onChangeText={v => update('maxPrice', v)}
              keyboardType="decimal-pad"
              isCurrency
              placeholder="0,00"
            />
          </View>
        </View>

        <View style={style.priceInfoContainer}>
          <Icon name="information" size={16} color="#6B7280" />
          <Text style={style.priceInfoText}>
            {form.strategyType === 'DYNAMIC'
              ? 'O preço variará dinamicamente dentro dos limites mínimo e máximo'
              : 'O preço será fixo no valor base informado'}
          </Text>
        </View>
      </Section>

      {/* Seção: Parâmetros Dinâmicos (apenas para estratégia dinâmica) */}
      {form.strategyType === 'DYNAMIC' && (
        <Section title="Parâmetros Dinâmicos">
          <View style={style.dynamicGrid}>
            <View style={style.dynamicColumn}>
              <InputField
                label="Limite de Demanda"
                icon="trending-up"
                value={form.demandThresholdPercentage}
                onChangeText={v => update('demandThresholdPercentage', v)}
                keyboardType="decimal-pad"
                placeholder="70"
                isPercentage
              />
              <Text style={style.helperText}>
                Quando a ocupação atingir esta porcentagem, o preço aumentará
              </Text>
            </View>
            <View style={style.dynamicColumn}>
              <InputField
                label="Acréscimo no Preço"
                icon="percent"
                value={form.priceIncreasePercentage}
                onChangeText={v => update('priceIncreasePercentage', v)}
                keyboardType="decimal-pad"
                placeholder="15"
                isPercentage
              />
              <Text style={style.helperText}>
                Percentual de aumento aplicado ao preço base
              </Text>
            </View>
          </View>
        </Section>
      )}

      {/* Seção: Escopo de Aplicação */}
      <Section title="Escopo de Aplicação">
        <View style={style.scopeContainer}>
          <TouchableOpacity
            style={[
              style.scopeOption,
              form.applyScope === 'EVENT' && style.scopeOptionActive,
            ]}
            onPress={() => update('applyScope', 'EVENT')}
          >
            <Icon
              name="calendar-check"
              size={24}
              color={form.applyScope === 'EVENT' ? '#4F46E5' : '#666'}
            />
            <Text
              style={[
                style.scopeOptionText,
                form.applyScope === 'EVENT' && style.scopeOptionTextActive,
              ]}
            >
              Todo o Evento
            </Text>
            <Text style={style.scopeOptionSubtext}>
              Aplicar a todos os ingressos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              style.scopeOption,
              form.applyScope === 'CATEGORY' && style.scopeOptionActive,
            ]}
            onPress={() => update('applyScope', 'CATEGORY')}
          >
            <Icon
              name="ticket-confirmation"
              size={24}
              color={form.applyScope === 'CATEGORY' ? '#4F46E5' : '#666'}
            />
            <Text
              style={[
                style.scopeOptionText,
                form.applyScope === 'CATEGORY' && style.scopeOptionTextActive,
              ]}
            >
              Categoria Específica
            </Text>
            <Text style={style.scopeOptionSubtext}>
              Aplicar apenas a uma categoria
            </Text>
          </TouchableOpacity>
        </View>

        {form.applyScope === 'CATEGORY' && (
          <View style={style.inputContainer}>
            <Text style={style.label}>
              <Icon
                name="ticket"
                size={16}
                color="#666"
                style={style.labelIcon}
              />
              Selecione o Tipo de Ingresso
            </Text>
            <View style={style.pickerContainer}>
              <Picker
                selectedValue={form.ticketId}
                onValueChange={value => {
                  console.log('🎯 Ticket selecionado ID:', value);

                  // Encontrar o ticket selecionado
                  const ticketSelecionado = ticketOptions.find(
                    t => t.id === value,
                  );

                  // Atualizar tanto o ID quanto a categoria
                  update('ticketId', value);
                  update('ticketCategory', ticketSelecionado?.category || '');

                  console.log('📦 Ticket completo:', ticketSelecionado);
                }}
                style={style.picker}
                dropdownIconColor="#6B7280"
                enabled={ticketOptions.length > 0}
              >
                <Picker.Item
                  label={
                    ticketOptions.length === 0
                      ? 'Nenhum ingresso disponível'
                      : 'Selecione um tipo de ingresso...'
                  }
                  value=""
                  color="#9CA3AF"
                />

                {ticketOptions.map(ticket => (
                  <Picker.Item
                    key={ticket.id}
                    label={ticket.category}
                    value={ticket.id}
                    color="#000000"
                  />
                ))}
              </Picker>

              {loadingTickets && (
                <View style={style.pickerLoading}>
                  <ActivityIndicator size="small" color="#4F46E5" />
                </View>
              )}
            </View>

            {/* Mostrar detalhes do ticket selecionado */}
            {form.ticketId && (
              <View style={style.selectedTicketInfo}>
                <Icon name="information" size={16} color="#4F46E5" />
                <Text style={style.selectedTicketText}>
                  Ticket ID: {form.ticketId} | Categoria: {form.ticketCategory}
                </Text>
              </View>
            )}
          </View>
        )}
      </Section>

      {/* Seção: Configurações Avançadas */}
      <Section title="Configurações Avançadas">
        <View style={style.switchContainer}>
          <View style={style.switchLabel}>
            <Icon name="robot" size={20} color="#666" />
            <View style={style.switchTextContainer}>
              <Text style={style.switchText}>Aplicar automaticamente</Text>
              <Text style={style.switchSubtext}>
                A estratégia será aplicada automaticamente quando as condições
                forem atendidas
              </Text>
            </View>
          </View>
          <Switch
            value={form.applyAutomatically}
            onValueChange={v => update('applyAutomatically', v)}
            trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
            thumbColor={form.applyAutomatically ? '#4F46E5' : '#F3F4F6'}
          />
        </View>
      </Section>

      {/* Rodapé com botões */}
      <View style={style.footer}>
        {selectedStrategy && (
          <TouchableOpacity
            style={style.deleteButton}
            onPress={() => setShowDeleteConfirm(true)}
            disabled={submitting || deleting}
          >
            <Icon name="delete" size={20} color="#FFFFFF" />
            <Text style={style.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={style.cancelButton}
          onPress={handleClearSelection}
          disabled={submitting || deleting}
        >
          <Text style={style.cancelButtonText}>
            {selectedStrategy ? 'Cancelar Edição' : 'Limpar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            style.submitButton,
            (submitting || deleting) && style.submitButtonDisabled,
          ]}
          onPress={submit}
          disabled={submitting || deleting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Icon
                name={selectedStrategy ? 'check' : 'plus'}
                size={20}
                color="#FFF"
              />
              <Text style={style.submitButtonText}>
                {selectedStrategy ? 'Atualizar' : 'Criar'} Estratégia
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
