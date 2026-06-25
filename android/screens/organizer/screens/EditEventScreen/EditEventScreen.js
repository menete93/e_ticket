// screens/organizer/EditEventScreen.js
/**
 * TELA DE EDIÇÃO DE EVENTO
 *
 * REGRAS DE NEGÓCIO:
 * 1. Apenas eventos com data futura podem ser editados (não permite edição no dia do evento)
 * 2. Eventos passados ou do dia atual são bloqueados (read-only)
 * 3. Mudança de data do evento afeta automaticamente as datas de venda dos tickets
 * 4. Se já existem ingressos vendidos, algumas alterações são restritas
 * 5. Alterar de gratuito para pago requer configuração de preços depois
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { updateEvent } from '../../../../services/eventService';
import styles from './style';

const EditEventScreen = ({ navigation, route }) => {
  const { event } = route.params || {};

  // ==================== ESTADOS ====================

  // Dados básicos do evento
  const [eventName, setEventName] = useState(event?.name || '');
  const [description, setDescription] = useState(event?.description || '');

  // Datas e horários
  const [eventDate, setEventDate] = useState(
    event?.eventDate ? new Date(event.eventDate) : new Date(),
  );
  const [startTime, setStartTime] = useState(
    event?.startTime ? new Date(event.startTime) : new Date(),
  );
  const [endTime, setEndTime] = useState(
    event?.endTime ? new Date(event.endTime) : new Date(),
  );

  // Capacidade do evento
  const [maxAttendees, setMaxAttendees] = useState(
    event?.maxAttendees?.toString() || '',
  );
  const [minAttendees, setMinAttendees] = useState(
    event?.minAttendees?.toString() || '',
  );

  // Configurações
  const [isPublic, setIsPublic] = useState(event?.isPublic ?? true);
  const [isFeatured, setIsFeatured] = useState(event?.isFeatured ?? false);
  const [isFree, setIsFree] = useState(event?.isFree ?? false);
  const [registrationDeadline, setRegistrationDeadline] = useState(
    event?.registrationDeadline ? new Date(event.registrationDeadline) : null,
  );

  // Controles de UI
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==================== DADOS PARA DECISÃO ====================
  const soldTickets = event?.soldTickets || 0;
  const totalTickets = event?.totalTickets || 0;
  const availableTickets = event?.availableTickets || 0;
  const originalIsFree = event?.isFree ?? false;
  const originalEventDate = event?.eventDate ? new Date(event.eventDate) : null;

  // Capacidade atual
  const currentMaxCapacity = event?.maxAttendees || 'Ilimitada';
  const currentMinCapacity = event?.minAttendees || 'Não definida';

  // Calcular ocupação atual
  const getOccupancyPercentage = () => {
    if (!event?.maxAttendees || event.maxAttendees === 0) return null;
    return (soldTickets / event.maxAttendees) * 100;
  };

  const occupancyPercentage = getOccupancyPercentage();

  const getOccupancyColor = () => {
    if (occupancyPercentage === null) return '#6B7280';
    if (occupancyPercentage >= 90) return '#EF4444';
    if (occupancyPercentage >= 70) return '#F59E0B';
    if (occupancyPercentage >= 50) return '#10B981';
    return '#3B82F6';
  };

  const getOccupancyIcon = () => {
    if (occupancyPercentage === null) return 'help-circle-outline';
    if (occupancyPercentage >= 90) return 'alert-circle';
    if (occupancyPercentage >= 70) return 'warning';
    if (occupancyPercentage >= 50) return 'checkmark-circle';
    return 'happy-outline';
  };

  // ==================== VALIDAÇÕES DE NEGÓCIO ====================

  /**
   * REGRA 1: Verifica se o evento pode ser editado
   * Eventos que já ocorreram ou estão no dia atual NÃO podem ser editados
   */
  const canEditEvent = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDateObj = new Date(eventDate);
    eventDateObj.setHours(0, 0, 0, 0);

    const endTimeDate = new Date(endTime);
    const now = new Date();

    // Verificar se o evento já terminou (data passada OU data atual com horário já passado)
    if (eventDateObj < today) {
      return false;
    }

    // Se é hoje, verificar se o horário de término já passou
    if (eventDateObj.toDateString() === today.toDateString()) {
      if (endTimeDate < now) {
        return false;
      }
    }

    return true;
  };

  /**
   * REGRA 2: Verifica se a data selecionada é válida
   * Não pode selecionar data no passado
   */
  const validateEventDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(eventDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      Alert.alert('Erro', 'A data do evento não pode ser no passado');
      return false;
    }
    return true;
  };

  /**
   * REGRA 3: Valida os horários
   * Início deve ser antes do fim
   */
  const validateTimes = () => {
    if (startTime >= endTime) {
      Alert.alert(
        'Erro',
        'O horário de início deve ser anterior ao horário de término',
      );
      return false;
    }
    return true;
  };

  /**
   * REGRA 4: Valida capacidades
   */
  const validateCapacity = () => {
    const max = maxAttendees ? parseInt(maxAttendees) : null;
    const min = minAttendees ? parseInt(minAttendees) : null;

    if (max !== null && max < 0) {
      Alert.alert('Erro', 'A capacidade máxima deve ser maior que zero');
      return false;
    }

    if (min !== null && min < 0) {
      Alert.alert('Erro', 'A capacidade mínima deve ser maior que zero');
      return false;
    }

    if (min !== null && max !== null && min > max) {
      Alert.alert(
        'Erro',
        'A capacidade mínima não pode ser maior que a capacidade máxima',
      );
      return false;
    }

    if (max !== null && max < soldTickets) {
      Alert.alert(
        'Erro',
        `Você já vendeu ${soldTickets} ingressos. A capacidade máxima não pode ser menor que isso.`,
      );
      return false;
    }

    return true;
  };

  /**
   * REGRA 5: Valida prazo de inscrição
   */
  const validateRegistrationDeadline = () => {
    if (!registrationDeadline) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (registrationDeadline < today) {
      Alert.alert('Erro', 'O prazo de inscrição não pode ser no passado');
      return false;
    }

    if (registrationDeadline >= eventDate) {
      Alert.alert(
        'Erro',
        'O prazo de inscrição deve ser antes da data do evento',
      );
      return false;
    }

    return true;
  };

  /**
   * REGRA 6: Verifica impacto da mudança de data nos tickets
   */
  const checkDateChangeImpact = () => {
    if (!originalEventDate) return true;

    const originalDate = new Date(originalEventDate);
    const newDate = new Date(eventDate);

    if (
      originalDate.toDateString() !== newDate.toDateString() &&
      totalTickets > 0
    ) {
      return new Promise(resolve => {
        Alert.alert(
          '⚠️ Impacto nos Tickets',
          `Você está alterando a data do evento de ${originalDate.toLocaleDateString(
            'pt-BR',
          )} para ${newDate.toLocaleDateString('pt-BR')}.\n\n` +
            `Isso atualizará automaticamente as datas de venda de todos os ${totalTickets} tickets cadastrados.\n\n` +
            `Deseja continuar?`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            { text: 'Continuar', onPress: () => resolve(true) },
          ],
        );
      });
    }
    return true;
  };

  /**
   * REGRA 7: Verifica mudança de status gratuito/pago
   */
  const checkFreeStatusChange = () => {
    if (isFree === originalIsFree) return true;

    if (!isFree && originalIsFree) {
      return new Promise(resolve => {
        Alert.alert(
          '⚠️ Atenção - Configuração de Preços',
          'Você está mudando de evento GRATUITO para PAGO.\n\n' +
            'Após salvar, você precisará configurar os preços dos ingressos na tela de Gerenciar Ingressos.\n\n' +
            'Deseja continuar?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            { text: 'Continuar', onPress: () => resolve(true) },
          ],
        );
      });
    }

    if (isFree && !originalIsFree) {
      if (soldTickets > 0) {
        return new Promise(resolve => {
          Alert.alert(
            '⚠️ Atenção - Reembolso',
            `Você está mudando de evento PAGO para GRATUITO.\n\n` +
              `⚠️ ATENÇÃO: Já foram vendidos ${soldTickets} ingresso(s) para este evento.\n\n` +
              `O sistema NÃO realiza reembolso automático. Os compradores já pagaram pelos ingressos.\n\n` +
              `Deseja continuar mesmo assim?`,
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => resolve(false),
              },
              {
                text: 'Continuar',
                onPress: () => resolve(true),
                style: 'destructive',
              },
            ],
          );
        });
      } else {
        return new Promise(resolve => {
          Alert.alert(
            'ℹ️ Alteração de Tipo',
            'Você está mudando de evento PAGO para GRATUITO.\n\n' +
              'Como ainda não há vendas, esta alteração não terá impacto financeiro.\n\n' +
              'Deseja continuar?',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => resolve(false),
              },
              { text: 'Continuar', onPress: () => resolve(true) },
            ],
          );
        });
      }
    }

    return true;
  };

  /**
   * REGRA 8: Valida nome e descrição (min 3, max 200 e min 10, max 2000)
   */
  const validateTextFields = () => {
    // Nome: min 3, max 200
    if (!eventName || eventName.trim().length === 0) {
      Alert.alert('Erro', 'O nome do evento é obrigatório');
      return false;
    }
    if (eventName.trim().length < 3) {
      Alert.alert('Erro', 'O nome do evento deve ter pelo menos 3 caracteres');
      return false;
    }
    if (eventName.length > 200) {
      Alert.alert('Erro', 'O nome do evento não pode exceder 200 caracteres');
      return false;
    }

    // Descrição: min 10, max 2000
    if (!description || description.trim().length === 0) {
      Alert.alert('Erro', 'A descrição do evento é obrigatória');
      return false;
    }
    if (description.trim().length < 10) {
      Alert.alert('Erro', 'A descrição deve ter pelo menos 10 caracteres');
      return false;
    }
    if (description.length > 2000) {
      Alert.alert('Erro', 'A descrição não pode exceder 2000 caracteres');
      return false;
    }

    return true;
  };

  /**
   * REGRA 9: Validação completa antes de salvar
   */
  const validateAll = async () => {
    // Validações de campo
    if (!validateTextFields()) return false;
    if (!validateEventDate()) return false;
    if (!validateTimes()) return false;
    if (!validateCapacity()) return false;
    if (!validateRegistrationDeadline()) return false;

    // Validações com confirmação do usuário
    const dateImpactValid = await checkDateChangeImpact();
    if (!dateImpactValid) return false;

    const freeStatusValid = await checkFreeStatusChange();
    if (!freeStatusValid) return false;

    return true;
  };

  /**
   * HANDLE UPDATE EVENT
   */
  const handleUpdateEvent = async () => {
    // Verificar se pode editar (evento não pode estar no dia ou já ter terminado)
    if (!canEditEvent()) {
      const eventDateObj = new Date(eventDate);
      const today = new Date();
      const endTimeDate = new Date(endTime);

      if (
        eventDateObj.toDateString() === today.toDateString() &&
        endTimeDate < today
      ) {
        Alert.alert(
          'Edição não permitida',
          'Este evento já terminou. Não é possível editar eventos que já foram realizados.',
        );
      } else if (eventDateObj.toDateString() === today.toDateString()) {
        Alert.alert(
          'Edição não permitida',
          'Não é possível editar eventos que ocorrem hoje. As alterações devem ser feitas com pelo menos 1 dia de antecedência.',
        );
      } else {
        Alert.alert(
          'Edição não permitida',
          'Este evento já ocorreu e não pode mais ser editado.',
        );
      }
      return;
    }

    const isValid = await validateAll();
    if (!isValid) return;

    try {
      setLoading(true);

      const eventData = {};

      // Nome
      if (eventName !== event?.name) {
        eventData.name = eventName.trim();
      }

      // Descrição
      if (description !== event?.description) {
        eventData.description = description.trim();
      }

      // Data do Evento
      const newEventDate = eventDate.toISOString();
      if (newEventDate !== event?.eventDate) {
        eventData.eventDate = newEventDate;
      }

      // Horários
      const newStartTime = startTime.toISOString();
      if (newStartTime !== event?.startTime) {
        eventData.startTime = newStartTime;
      }

      const newEndTime = endTime.toISOString();
      if (newEndTime !== event?.endTime) {
        eventData.endTime = newEndTime;
      }

      // Capacidades
      const newMaxAttendees = maxAttendees ? parseInt(maxAttendees) : null;
      if (newMaxAttendees !== event?.maxAttendees) {
        eventData.maxAttendees = newMaxAttendees;
      }

      const newMinAttendees = minAttendees ? parseInt(minAttendees) : null;
      if (newMinAttendees !== event?.minAttendees) {
        eventData.minAttendees = newMinAttendees;
      }

      // Configurações
      if (isPublic !== event?.isPublic) {
        eventData.isPublic = isPublic;
      }

      if (isFeatured !== event?.isFeatured) {
        eventData.isFeatured = isFeatured;
      }

      if (isFree !== event?.isFree) {
        eventData.isFree = isFree;
      }

      // Prazo de inscrição
      const newDeadline = registrationDeadline
        ? registrationDeadline.toISOString()
        : null;
      if (newDeadline !== event?.registrationDeadline) {
        eventData.registrationDeadline = newDeadline;
      }

      if (Object.keys(eventData).length === 0) {
        Alert.alert('Info', 'Nenhuma alteração foi feita.');
        setLoading(false);
        return;
      }

      console.log(
        '📤 Enviando atualização:',
        JSON.stringify(eventData, null, 2),
      );

      Alert.alert(
        'Confirmar Alterações',
        'Deseja realmente atualizar este evento?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              try {
                const response = await updateEvent(event.id, eventData);
                console.log('✅ Resposta:', response);

                let successMessage = 'Evento atualizado com sucesso!';
                if (!isFree && originalIsFree) {
                  successMessage +=
                    '\n\n⚠️ Lembre-se de configurar os preços dos ingressos!';
                }

                Alert.alert('Sucesso!', successMessage, [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } catch (error) {
                console.error('❌ Erro:', error.response?.data);
                Alert.alert(
                  'Erro',
                  error.response?.data?.message || 'Falha ao atualizar evento',
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Erro ao preparar dados:', error);
      Alert.alert('Erro', 'Falha ao preparar dados do evento');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = date => {
    if (!date) return 'Selecionar data';
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = date => {
    if (!date) return 'Selecionar horário';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventPastOrToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(0, 0, 0, 0);

    if (eventDateTime < today) return true;
    if (eventDateTime.toDateString() === today.toDateString()) {
      const now = new Date();
      const endTimeDate = new Date(endTime);
      return endTimeDate < now;
    }
    return false;
  };

  if (!event) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Evento não encontrado</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isReadOnly = isEventPastOrToday();

  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}

      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Evento</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.form}>
        {/* Informações Básicas */}
        <Text style={styles.sectionTitle}>Informações Básicas</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Evento *</Text>
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder="Digite o nome do evento"
            editable={!isReadOnly}
          />
          <Text style={styles.helperText}>Mínimo 3, máximo 200 caracteres</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva o evento..."
            multiline
            numberOfLines={4}
            editable={!isReadOnly}
          />
          <Text style={styles.helperText}>
            Mínimo 10, máximo 2000 caracteres
          </Text>
        </View>

        {/* Capacidade Atual */}
        <View style={styles.capacityIndicatorCard}>
          <Text style={styles.capacityIndicatorTitle}>
            📊 Capacidade Atual do Evento
          </Text>

          <View style={styles.capacityStatsRow}>
            <View style={styles.capacityStat}>
              <Text style={styles.capacityStatLabel}>Ingressos Vendidos</Text>
              <Text style={styles.capacityStatValue}>{soldTickets}</Text>
            </View>
            <View style={styles.capacityStat}>
              <Text style={styles.capacityStatLabel}>
                Ingressos Disponíveis
              </Text>
              <Text style={styles.capacityStatValue}>{availableTickets}</Text>
            </View>
            <View style={styles.capacityStat}>
              <Text style={styles.capacityStatLabel}>Total de Tipos</Text>
              <Text style={styles.capacityStatValue}>{totalTickets}</Text>
            </View>
          </View>

          {occupancyPercentage !== null && (
            <View style={styles.occupancySection}>
              <View style={styles.occupancyHeader}>
                <View style={styles.occupancyTitleRow}>
                  <Ionicons
                    name={getOccupancyIcon()}
                    size={20}
                    color={getOccupancyColor()}
                  />
                  <Text style={styles.occupancyTitle}>Ocupação do Evento</Text>
                </View>
                <Text
                  style={[
                    styles.occupancyPercentage,
                    { color: getOccupancyColor() },
                  ]}
                >
                  {occupancyPercentage.toFixed(1)}%
                </Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(occupancyPercentage, 100)}%`,
                      backgroundColor: getOccupancyColor(),
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.capacityInfoRow}>
            <View style={styles.capacityInfoItem}>
              <Ionicons name="trending-up" size={16} color="#10B981" />
              <Text style={styles.capacityInfoLabel}>
                Capacidade Máxima Atual:
              </Text>
              <Text style={styles.capacityInfoValue}>
                {currentMaxCapacity === 'Ilimitada'
                  ? '∞ Ilimitada'
                  : `${currentMaxCapacity} pessoas`}
              </Text>
            </View>
            <View style={styles.capacityInfoItem}>
              <Ionicons name="trending-down" size={16} color="#F59E0B" />
              <Text style={styles.capacityInfoLabel}>
                Capacidade Mínima Atual:
              </Text>
              <Text style={styles.capacityInfoValue}>
                {currentMinCapacity === 'Não definida'
                  ? '❌ Não definida'
                  : `${currentMinCapacity} pessoas`}
              </Text>
            </View>
          </View>
        </View>

        {/* Edição de Capacidade */}
        <Text style={styles.sectionTitle}>✏️ Ajustar Capacidade</Text>
        <View style={styles.capacityEditCard}>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Nova Capacidade Máxima</Text>
              <TextInput
                style={[styles.input, soldTickets > 0 && styles.warningInput]}
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                placeholder="Deixe vazio para ilimitado"
                keyboardType="numeric"
                editable={!isReadOnly}
              />
              {soldTickets > 0 && (
                <Text style={styles.warningHelper}>
                  ⚠️ Já vendidos: {soldTickets} ingressos.
                </Text>
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Nova Capacidade Mínima</Text>
              <TextInput
                style={styles.input}
                value={minAttendees}
                onChangeText={setMinAttendees}
                placeholder="Deixe vazio para não definir"
                keyboardType="numeric"
                editable={!isReadOnly}
              />
            </View>
          </View>
        </View>

        {/* Datas e Horários */}
        <Text style={styles.sectionTitle}>Datas e Horários</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data do Evento *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEventDatePicker(true)}
            disabled={isReadOnly}
          >
            <Ionicons name="calendar" size={20} color="#4F46E5" />
            <Text style={styles.dateButtonText}>{formatDate(eventDate)}</Text>
          </TouchableOpacity>
          {totalTickets > 0 && (
            <Text style={styles.helperText}>
              ⚠️ Alterar a data afetará {totalTickets} ticket(s)
            </Text>
          )}
          {new Date(eventDate).toDateString() === new Date().toDateString() && (
            <Text style={styles.warningHelper}>
              ⚠️ Evento ocorre hoje. Não é possível editar após o término.
            </Text>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Hora de Início</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartTimePicker(true)}
              disabled={isReadOnly}
            >
              <Ionicons name="time" size={20} color="#10B981" />
              <Text style={styles.dateButtonText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Hora de Término</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndTimePicker(true)}
              disabled={isReadOnly}
            >
              <Ionicons name="time" size={20} color="#EF4444" />
              <Text style={styles.dateButtonText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Configurações */}
        <Text style={styles.sectionTitle}>Configurações</Text>

        <View style={styles.switchGroup}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Evento Público</Text>
              <Text style={styles.helperText}>Visível para todos</Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              disabled={isReadOnly}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isPublic ? '#4F46E5' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Evento em Destaque</Text>
              <Text style={styles.helperText}>Aparece na página inicial</Text>
            </View>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              disabled={isReadOnly}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isFeatured ? '#F59E0B' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Evento Gratuito</Text>
              <Text style={styles.helperText}>
                {isFree ? 'Ingressos sem custo' : 'Evento com ingressos pagos'}
              </Text>
              {!isFree && originalIsFree && (
                <Text style={styles.warningHelper}>
                  ⚠️ Configure os preços após salvar
                </Text>
              )}
              {isFree && !originalIsFree && soldTickets > 0 && (
                <Text style={styles.warningHelper}>
                  ⚠️ {soldTickets} ingresso(s) vendidos. Sem reembolso
                  automático.
                </Text>
              )}
            </View>
            <Switch
              value={isFree}
              onValueChange={setIsFree}
              disabled={isReadOnly}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isFree ? '#10B981' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Prazo de Inscrição */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prazo de Inscrição</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDeadlinePicker(true)}
            disabled={isReadOnly}
          >
            <Ionicons name="calendar" size={20} color="#8B5CF6" />
            <Text style={styles.dateButtonText}>
              {registrationDeadline
                ? formatDate(registrationDeadline)
                : 'Sem data definida'}
            </Text>
          </TouchableOpacity>
          {registrationDeadline && !isReadOnly && (
            <TouchableOpacity onPress={() => setRegistrationDeadline(null)}>
              <Text style={styles.clearButtonText}>Remover data limite</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resumo para Decisão */}
        <View style={styles.decisionSummary}>
          <Text style={styles.decisionTitle}>🎯 Resumo para sua decisão</Text>

          <View style={styles.decisionRow}>
            <Ionicons name="people" size={18} color="#4F46E5" />
            <Text style={styles.decisionLabel}>Capacidade atual:</Text>
            <Text style={styles.decisionValue}>
              {soldTickets} vendidos /{' '}
              {currentMaxCapacity === 'Ilimitada' ? '∞' : currentMaxCapacity}
            </Text>
          </View>

          <View style={styles.decisionRow}>
            <Ionicons name="trending-up" size={18} color="#10B981" />
            <Text style={styles.decisionLabel}>Ocupação:</Text>
            <Text
              style={[styles.decisionValue, { color: getOccupancyColor() }]}
            >
              {occupancyPercentage !== null
                ? `${occupancyPercentage.toFixed(1)}%`
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.decisionRow}>
            <Ionicons name="calendar" size={18} color="#F59E0B" />
            <Text style={styles.decisionLabel}>Data do evento:</Text>
            <Text style={styles.decisionValue}>
              {formatDate(eventDate)}
              {isReadOnly ? ' (Encerrado)' : ' (Futuro)'}
            </Text>
          </View>
        </View>

        {/* Botões */}
        {!isReadOnly ? (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateEvent}
            disabled={loading}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.updateButtonGradient}
            >
              <Ionicons name="save" size={20} color="#FFF" />
              <Text style={styles.updateButtonText}>Atualizar Evento</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.disabledMessage}>
            <Ionicons name="lock-closed" size={24} color="#6B7280" />
            <Text style={styles.disabledMessageText}>
              Evento já realizado. Não é possível editar.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* DatePickers */}
      {showEventDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowEventDatePicker(false);
            if (date) setEventDate(date);
          }}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, time) => {
            setShowStartTimePicker(false);
            if (time) setStartTime(time);
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, time) => {
            setShowEndTimePicker(false);
            if (time) setEndTime(time);
          }}
        />
      )}

      {showDeadlinePicker && (
        <DateTimePicker
          value={registrationDeadline || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDeadlinePicker(false);
            if (date) setRegistrationDeadline(date);
          }}
        />
      )}
    </ScrollView>
  );
};

export default EditEventScreen;
