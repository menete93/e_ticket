import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getEvents } from './../../services/eventService';
import axios from 'axios';
import style from './style';

export default function PricingStrategyScreen() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    applyAutomatically: true,
  });

  // Buscar eventos do backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      // Substitua pela sua URL real
      const response = await getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os eventos');
    } finally {
      setLoadingEvents(false);
    }
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  const validateForm = () => {
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
  };

  const submit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        strategyName: form.strategyName,
        strategyType: form.strategyType,
        eventId: form.eventId,
        basePrice: parseFloat(form.basePrice),
        minPrice: form.minPrice ? parseFloat(form.minPrice) : null,
        maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : null,
        demandThresholdPercentage: form.demandThresholdPercentage
          ? parseFloat(form.demandThresholdPercentage)
          : null,
        priceIncreasePercentage: form.priceIncreasePercentage
          ? parseFloat(form.priceIncreasePercentage)
          : null,
        applyAutomatically: form.applyAutomatically,
        applyToAllTickets: form.applyScope === 'EVENT',
        ticketCategory:
          form.applyScope === 'CATEGORY' ? form.ticketCategory : null,
      };

      console.log('Payload:', payload);

      // Enviar para o backend
      const response = await axios.post('/api/pricing/strategies', payload);

      Alert.alert('Sucesso!', 'Estratégia de preço criada com sucesso', [
        {
          text: 'OK',
          onPress: () => {
            // Limpar formulário ou navegar de volta
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
          },
        },
      ]);
    } catch (error) {
      console.error('Erro ao salvar estratégia:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível salvar a estratégia',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = value => {
    if (!value) return '';
    return `R$ ${Number(value).toFixed(2)}`.replace('.', ',');
  };

  const formatPercentage = value => {
    if (!value) return '';
    return `${value}%`;
  };

  const InputField = ({
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
              ? formatPercentage(value)
              : value
          }
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor="#999"
          editable={editable}
        />
      </View>
    </View>
  );

  const Section = ({ title, children }) => (
    <View style={style.section}>
      <Text style={style.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={style.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loadingEvents} onRefresh={fetchEvents} />
      }
    >
      <View style={style.header}>
        <Icon name="chart-line" size={32} color="#4F46E5" />
        <Text style={style.title}>Configurar Estratégia de Preço</Text>
        <Text style={style.subtitle}>
          Configure preços dinâmicos para otimizar vendas
        </Text>
      </View>

      <Section title="Informações Básicas">
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
          {loadingEvents ? (
            <View style={style.loadingContainer}>
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text style={style.loadingText}>Carregando eventos...</Text>
            </View>
          ) : (
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
                    label={`${event.name} - ${new Date(
                      event.date,
                    ).toLocaleDateString('pt-BR')}`}
                    value={event.id}
                  />
                ))}
              </Picker>
            </View>
          )}
          <TouchableOpacity
            style={style.refreshButton}
            onPress={fetchEvents}
            disabled={loadingEvents}
          >
            <Icon name="refresh" size={16} color="#4F46E5" />
            <Text style={style.refreshButtonText}>Atualizar lista</Text>
          </TouchableOpacity>
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
              Categoria do Bilhete
            </Text>
            <View style={style.pickerContainer}>
              <Picker
                selectedValue={form.ticketCategory}
                onValueChange={v => update('ticketCategory', v)}
                style={style.picker}
              >
                <Picker.Item label="Selecione uma categoria..." value="" />
                <Picker.Item label="VIP" value="VIP" />
                <Picker.Item label="PISTA" value="PISTA" />
                <Picker.Item label="CAMAROTE" value="CAMAROTE" />
                <Picker.Item label="MEIA-ENTRADA" value="MEIA_ENTRADA" />
              </Picker>
            </View>
          </View>
        )}
      </Section>

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

      <View style={style.footer}>
        <TouchableOpacity style={style.cancelButton} disabled={submitting}>
          <Text style={style.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[style.submitButton, submitting && style.submitButtonDisabled]}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Icon name="check" size={20} color="#FFF" />
              <Text style={style.submitButtonText}>Salvar Estratégia</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
