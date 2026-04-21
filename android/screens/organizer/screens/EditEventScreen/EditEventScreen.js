// screens/organizer/EditEventScreen.js
/**
 * TELA DE EDIÇÃO DE EVENTO
 *
 * REGRAS DE NEGÓCIO:
 * 1. Apenas eventos com data futura ou hoje podem ser editados
 * 2. Eventos passados são bloqueados (read-only)
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

  // Capacidade atual (se não definida, considera como "Ilimitada")
  const currentMaxCapacity = event?.maxAttendees || 'Ilimitada';
  const currentMinCapacity = event?.minAttendees || 'Não definida';

  // Calcular ocupação atual
  const getOccupancyPercentage = () => {
    if (!event?.maxAttendees || event.maxAttendees === 0) return null;
    return (soldTickets / event.maxAttendees) * 100;
  };

  const occupancyPercentage = getOccupancyPercentage();

  // Determinar cor do indicador de ocupação
  const getOccupancyColor = () => {
    if (occupancyPercentage === null) return '#6B7280';
    if (occupancyPercentage >= 90) return '#EF4444'; // Vermelho - lotado
    if (occupancyPercentage >= 70) return '#F59E0B'; // Amarelo - quase lotado
    if (occupancyPercentage >= 50) return '#10B981'; // Verde - bom
    return '#3B82F6'; // Azul - tranquilo
  };

  // Determinar ícone do indicador
  const getOccupancyIcon = () => {
    if (occupancyPercentage === null) return 'help-circle-outline';
    if (occupancyPercentage >= 90) return 'alert-circle';
    if (occupancyPercentage >= 70) return 'warning';
    if (occupancyPercentage >= 50) return 'checkmark-circle';
    return 'happy-outline';
  };

  // ==================== VALIDAÇÕES DE NEGÓCIO ====================

  const canEditEvent = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(0, 0, 0, 0);
    return eventDateTime >= today;
  };

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

  // screens/organizer/EditEventScreen.js
  // ... (todo o código anterior permanece igual até a função checkFreeStatusChange)

  /**
   * REGRA 7: Verifica mudança de gratuito para pago
   * Se mudar de gratuito para pago, organizador precisa configurar preços depois
   * Se mudar de pago para gratuito, só alerta se já tiver vendas
   */
  const checkFreeStatusChange = () => {
    // Se não mudou o status, ok
    if (isFree === originalIsFree) return true;

    // Mudando de gratuito para pago
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

    // Mudando de pago para gratuito - SÓ ALERTA SE TIVER VENDAS
    if (isFree && !originalIsFree) {
      // Verifica se já existe pelo menos um bilhete vendido
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
        // Sem vendas, apenas informa, mas não bloqueia
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

  const validateAll = async () => {
    if (!eventName.trim()) {
      Alert.alert('Erro', 'Nome do evento é obrigatório');
      return false;
    }

    if (!validateEventDate()) return false;
    if (!validateTimes()) return false;
    if (!validateCapacity()) return false;
    if (!validateRegistrationDeadline()) return false;

    const dateImpactValid = await checkDateChangeImpact();
    if (!dateImpactValid) return false;

    const freeStatusValid = await checkFreeStatusChange();
    if (!freeStatusValid) return false;

    return true;
  };

  // EditEventScreen.js - handleUpdateEvent

  // screens/organizer/EditEventScreen.js
  // ... (importações e estados mantidos)

  const handleUpdateEvent = async () => {
    if (!canEditEvent()) {
      Alert.alert(
        'Edição não permitida',
        'Este evento já ocorreu e não pode mais ser editado.',
      );
      return;
    }

    const isValid = await validateAll();
    if (!isValid) return;

    try {
      setLoading(true);

      // 🔧 Enviar APENAS os campos que foram alterados
      const eventData = {};

      // Verifica cada campo e só adiciona se foi modificado
      if (eventName !== event?.name) {
        eventData.name = eventName.trim();
      }

      if (description !== event?.description) {
        eventData.description = description.trim();
      }

      const newEventDate = eventDate.toISOString();
      if (newEventDate !== event?.eventDate) {
        eventData.eventDate = newEventDate;
      }

      const newStartTime = startTime.toISOString();
      if (newStartTime !== event?.startTime) {
        eventData.startTime = newStartTime;
      }

      const newEndTime = endTime.toISOString();
      if (newEndTime !== event?.endTime) {
        eventData.endTime = newEndTime;
      }

      const newMaxAttendees = maxAttendees ? parseInt(maxAttendees) : null;
      if (newMaxAttendees !== event?.maxAttendees) {
        eventData.maxAttendees = newMaxAttendees;
      }

      const newMinAttendees = minAttendees ? parseInt(minAttendees) : null;
      if (newMinAttendees !== event?.minAttendees) {
        eventData.minAttendees = newMinAttendees;
      }

      if (isPublic !== event?.isPublic) {
        eventData.isPublic = isPublic;
      }

      if (isFeatured !== event?.isFeatured) {
        eventData.isFeatured = isFeatured;
      }

      if (isFree !== event?.isFree) {
        eventData.isFree = isFree;
      }

      const newDeadline = registrationDeadline
        ? registrationDeadline.toISOString()
        : null;
      if (newDeadline !== event?.registrationDeadline) {
        eventData.registrationDeadline = newDeadline;
      }

      // Se não houver alterações, alerta e retorna
      if (Object.keys(eventData).length === 0) {
        Alert.alert('Info', 'Nenhuma alteração foi feita.');
        setLoading(false);
        return;
      }

      console.log(
        '📤 Enviando apenas campos alterados:',
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
                console.error('❌ Erro detalhado:', error.response?.data);
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

  // ... (resto do componente mantido)

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

  const isEventPast = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(0, 0, 0, 0);
    return eventDateTime < today;
  };

  // ==================== RENDER ====================

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
        {/* ==================== INFORMAÇÕES BÁSICAS ==================== */}
        <Text style={styles.sectionTitle}>Informações Básicas</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Evento *</Text>
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder="Digite o nome do evento"
            editable={!isEventPast()}
          />
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
            editable={!isEventPast()}
          />
        </View>
        {/* ==================== CAPACIDADE ATUAL (INDICADOR) ==================== */}
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

          {/* Barra de ocupação */}
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

              <Text style={styles.occupancyDescription}>
                {occupancyPercentage >= 90 &&
                  '⚠️ Evento quase lotado! Considere aumentar a capacidade.'}
                {occupancyPercentage >= 70 &&
                  occupancyPercentage < 90 &&
                  '📈 Boa procura! Acompanhe as vendas.'}
                {occupancyPercentage >= 50 &&
                  occupancyPercentage < 70 &&
                  '✅ Vendas dentro do esperado.'}
                {occupancyPercentage < 50 &&
                  occupancyPercentage > 0 &&
                  '📉 Ainda há muitos ingressos disponíveis.'}
                {occupancyPercentage === 0 &&
                  '🎫 Nenhum ingresso vendido ainda.'}
              </Text>
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
        {/* ==================== EDIÇÃO DE CAPACIDADE ==================== */}
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
                editable={!isEventPast()}
              />
              {soldTickets > 0 && (
                <Text style={styles.warningHelper}>
                  ⚠️ Já vendidos: {soldTickets} ingressos. A capacidade não pode
                  ser menor que isso.
                </Text>
              )}
              {maxAttendees && parseInt(maxAttendees) > 0 && (
                <Text style={styles.infoHelper}>
                  ✨ Nova capacidade: {parseInt(maxAttendees)} pessoas
                  {soldTickets > 0 &&
                    ` (${((soldTickets / parseInt(maxAttendees)) * 100).toFixed(
                      1,
                    )}% de ocupação)`}
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
                editable={!isEventPast()}
              />
            </View>
          </View>

          {/* Recomendação baseada na ocupação atual */}
          {occupancyPercentage !== null && occupancyPercentage > 80 && (
            <View style={styles.recommendationBox}>
              <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
              <Text style={styles.recommendationText}>
                💡 Recomendação: Considere aumentar a capacidade máxima para
                acompanhar a demanda. Atualmente você está com{' '}
                {occupancyPercentage.toFixed(0)}% de ocupação.
              </Text>
            </View>
          )}
        </View>
        {/* ==================== DATAS E HORÁRIOS ==================== */}
        <Text style={styles.sectionTitle}>Datas e Horários</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data do Evento *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEventDatePicker(true)}
            disabled={isEventPast()}
          >
            <Ionicons name="calendar" size={20} color="#4F46E5" />
            <Text style={styles.dateButtonText}>{formatDate(eventDate)}</Text>
          </TouchableOpacity>
          {totalTickets > 0 && (
            <Text style={styles.helperText}>
              ⚠️ Alterar a data afetará a data de venda de {totalTickets}{' '}
              ticket(s)
            </Text>
          )}
        </View>
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Hora de Início</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartTimePicker(true)}
              disabled={isEventPast()}
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
              disabled={isEventPast()}
            >
              <Ionicons name="time" size={20} color="#EF4444" />
              <Text style={styles.dateButtonText}>{formatTime(endTime)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ==================== CONFIGURAÇÕES ==================== */}
        <Text style={styles.sectionTitle}>Configurações</Text>
        <View style={styles.switchGroup}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Evento Público</Text>
              <Text style={styles.helperText}>
                Visível para todos os usuários
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              disabled={isEventPast()}
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
              disabled={isEventPast()}
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
              {/* Indicador de impacto da mudança */}
              {!isFree && originalIsFree && (
                <Text style={styles.warningHelper}>
                  ⚠️ Após salvar, configure os preços dos ingressos
                </Text>
              )}
              {isFree && !originalIsFree && soldTickets > 0 && (
                <Text style={styles.warningHelper}>
                  ⚠️ Atenção: {soldTickets} ingresso(s) já foram vendidos. Não
                  há reembolso automático.
                </Text>
              )}
              {isFree && !originalIsFree && soldTickets === 0 && (
                <Text style={styles.infoHelper}>
                  ℹ️ Nenhum ingresso vendido ainda. Alteração segura.
                </Text>
              )}
            </View>
            <Switch
              value={isFree}
              onValueChange={setIsFree}
              disabled={isEventPast()}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isFree ? '#10B981' : '#f4f3f4'}
            />
          </View>
        </View>
        {/* ==================== PRAZO DE INSCRIÇÃO ==================== */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prazo de Inscrição</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDeadlinePicker(true)}
            disabled={isEventPast()}
          >
            <Ionicons name="calendar" size={20} color="#8B5CF6" />
            <Text style={styles.dateButtonText}>
              {registrationDeadline
                ? formatDate(registrationDeadline)
                : 'Sem data definida'}
            </Text>
          </TouchableOpacity>
          {registrationDeadline && !isEventPast() && (
            <TouchableOpacity onPress={() => setRegistrationDeadline(null)}>
              <Text style={styles.clearButtonText}>Remover data limite</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.helperText}>
            Após esta data, novos ingressos não poderão ser comprados
          </Text>
        </View>
        {/* ==================== RESUMO PARA DECISÃO ==================== */}
        <View style={styles.decisionSummary}>
          <Text style={styles.decisionTitle}>🎯 Resumo para sua decisão</Text>

          <View style={styles.decisionRow}>
            <Ionicons name="people" size={18} color="#4F46E5" />
            <Text style={styles.decisionLabel}>Capacidade atual:</Text>
            <Text style={styles.decisionValue}>
              {soldTickets} vendidos de{' '}
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
              {isEventPast() ? ' (Realizado)' : ' (Futuro)'}
            </Text>
          </View>

          <View style={styles.decisionRow}>
            <Ionicons name="cash" size={18} color="#EF4444" />
            <Text style={styles.decisionLabel}>Tipo:</Text>
            <Text style={styles.decisionValue}>
              {isFree ? 'Evento Gratuito' : 'Evento Pago'}
            </Text>
          </View>
        </View>
        {/* ==================== BOTÕES ==================== */}
        {!isEventPast() ? (
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
