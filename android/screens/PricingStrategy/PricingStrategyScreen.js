import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getEvents } from './../../services/eventService';
import {
  STRATEGY_METADATA,
  formatStrategyFromBackend,
} from './../../constants/pricingStrategyMapper';
import { getTickets } from './../../services/ticketService';
import {
  getPricingStrategies,
  applyMultipleStrategiesToEvent,
} from './../../services/pricingService';
import style from './style';

const { width, height } = Dimensions.get('window');

// Descrições detalhadas de cada estratégia - TODAS com gradiente definido
const STRATEGY_DETAILS = {
  EARLY_BIRD: {
    title: 'Early Bird',
    subtitle: 'Desconto para compras antecipadas',
    description:
      'Oferece descontos progressivos para clientes que compram ingressos com antecedência.',
    longDescription:
      'Oferece descontos progressivos para clientes que compram ingressos com antecedência. Quanto mais cedo a compra, maior o desconto. Ideal para estimular vendas antecipadas e garantir fluxo de caixa antes do evento.',
    howItWorks:
      '• Define um período de dias antes do evento\n• Aplica descontos percentuais ou fixos\n• Pode ter níveis progressivos',
    benefits:
      '• Aumenta vendas antecipadas\n• Melhora previsibilidade financeira\n• Cria senso de urgência',
    icon: 'bird',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
  },
  LAST_MINUTE: {
    title: 'Last Minute',
    subtitle: 'Aumento na última hora',
    description:
      'Estratégia que aumenta os preços nos dias finais antes do evento.',
    longDescription:
      'Estratégia que aumenta os preços nos dias finais antes do evento. Aproveita a alta demanda de última hora e a disposição de pagar mais de clientes que deixaram para comprar em cima da hora.',
    howItWorks:
      '• Ativa nos últimos dias antes do evento\n• Aplica aumentos percentuais progressivos\n• Pode combinar com disponibilidade de ingressos',
    benefits:
      '• Maximiza receita de última hora\n• Compensa descontos de Early Bird\n• Gerencia demanda de pico',
    icon: 'clock-fast',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
  DEMAND_BASED: {
    title: 'Demand Based',
    subtitle: 'Baseado em demanda',
    description: 'Preços que se ajustam automaticamente conforme a demanda.',
    longDescription:
      'Preços que se ajustam automaticamente conforme a demanda. Quando as vendas atingem determinados patamares, os preços aumentam. Similar a modelos de airlines e hotels.',
    howItWorks:
      '• Define thresholds de vendas (ex: 30%, 60%, 90%)\n• Cada nível tem um preço específico\n• Atualiza preços em tempo real',
    benefits:
      '• Otimiza receita por demanda\n• Preços justos baseados em procura\n• Automático e dinâmico',
    icon: 'trending-up',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  GROUP_DISCOUNT: {
    title: 'Group Discount',
    subtitle: 'Desconto em grupo',
    description: 'Oferece descontos progressivos para compras em grupo.',
    longDescription:
      'Oferece descontos progressivos para compras em grupo. Quanto maior o grupo, maior o desconto. Perfeito para eventos corporativos, famílias ou grupos de amigos.',
    howItWorks:
      '• Define tamanhos mínimos de grupo\n• Aplica descontos por faixa\n• Pode ser combinado com outras estratégias',
    benefits:
      '• Incentiva vendas em grupo\n• Aumenta ticket médio\n• Ideal para eventos familiares',
    icon: 'account-group',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
  },
  CATEGORY_SPECIFIC: {
    title: 'Category Specific',
    subtitle: 'Por categoria',
    description: 'Aplica regras diferentes para cada categoria de ingresso.',
    longDescription:
      'Aplica regras de precificação diferentes para cada categoria de ingresso (VIP, Pista, Camarote, etc). Permite estratégias customizadas por segmento.',
    howItWorks:
      '• Seleciona uma ou mais categorias\n• Define regras exclusivas por categoria\n• Pode ter descontos ou acréscimos específicos',
    benefits:
      '• Precificação segmentada\n• Otimiza revenue por categoria\n• Flexibilidade total',
    icon: 'tag',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'],
  },
  FLASH_SALE: {
    title: 'Flash Sale',
    subtitle: 'Promoção relâmpago',
    description: 'Descontos agressivos por tempo limitado.',
    longDescription:
      'Descontos agressivos por um período muito curto (horas). Cria urgência e pode ser usado para liquidar ingressos remanescentes ou gerar buzz.',
    howItWorks:
      '• Define janela de tempo curta (horas)\n• Aplica descontos significativos\n• Contador regressivo visível',
    benefits:
      '• Cria urgência imediata\n• Gera buzz e marketing\n• Rápida liquidação',
    icon: 'flash',
    color: '#EC4899',
    gradient: ['#EC4899', '#DB2777'],
  },
  WEEKEND_SPECIAL: {
    title: 'Weekend Special',
    subtitle: 'Especial de fim de semana',
    description: 'Preços diferenciados para fins de semana.',
    longDescription:
      'Estratégia específica para eventos de fim de semana. Pode ter preços diferenciados para sexta, sábado e domingo baseado na demanda típica.',
    howItWorks:
      '• Identifica dias de fim de semana\n• Aplica regras diferentes por dia\n• Ajusta baseado em histórico',
    benefits:
      '• Maximiza receita de weekend\n• Adapta-se a padrões de consumo\n• Flexível por dia',
    icon: 'calendar-weekend',
    color: '#14B8A6',
    gradient: ['#14B8A6', '#0D9488'],
  },
  LOYALTY_DISCOUNT: {
    title: 'Loyalty Discount',
    subtitle: 'Desconto para clientes fiéis',
    description: 'Recompensa clientes recorrentes com descontos especiais.',
    longDescription:
      'Recompensa clientes recorrentes com descontos especiais. Quanto mais compras ou maior o histórico de gastos, maiores os benefícios.',
    howItWorks:
      '• Baseado em histórico de compras\n• Tiers de fidelidade (Bronze, Prata, Ouro)\n• Descontos progressivos por tier',
    benefits: '• Fideliza clientes\n• Aumenta lifetime value\n• Reconhecimento',
    icon: 'star',
    color: '#6366F1',
    gradient: ['#6366F1', '#4F46E5'],
  },
  LOYALTY: {
    title: 'Loyalty',
    subtitle: 'Programa de fidelidade',
    description: 'Programa de fidelidade completo com múltiplos níveis.',
    longDescription:
      'Programa de fidelidade completo com múltiplos níveis e benefícios exclusivos para clientes que mais compram.',
    howItWorks:
      '• Múltiplos níveis (Bronze, Prata, Ouro, Platina)\n• Benefícios exclusivos por nível\n• Acumula pontos ou créditos',
    benefits: '• Programa completo\n• Engajamento contínuo\n• Exclusividade',
    icon: 'heart',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  TIERED_PRICING: {
    title: 'Tiered Pricing',
    subtitle: 'Preços por níveis',
    description:
      'Preços que mudam conforme os ingressos são vendidos em lotes.',
    longDescription:
      'Preços que mudam conforme os ingressos são vendidos em lotes. Cada lote tem um preço específico, incentivando compras antecipadas.',
    howItWorks:
      '• Define lotes de ingressos\n• Cada lote tem preço crescente\n• Avança automaticamente',
    benefits:
      '• Incentiva compra antecipada\n• Escalonamento natural\n• Transparente',
    icon: 'layers',
    color: '#A855F7',
    gradient: ['#A855F7', '#9333EA'],
  },
  BUNDLE_DISCOUNT: {
    title: 'Bundle Discount',
    subtitle: 'Desconto em pacote',
    description: 'Desconto para compra de múltiplos ingressos.',
    longDescription:
      'Oferece descontos na compra de pacotes de ingressos. Pode ser para o mesmo evento (ex: 4 ingressos) ou para múltiplos eventos.',
    howItWorks:
      '• Define combos de ingressos\n• Aplica desconto progressivo\n• Pode incluir benefícios extras',
    benefits: '• Aumenta ticket médio\n• Incentiva compras maiores\n• Versátil',
    icon: 'package',
    color: '#F97316',
    gradient: ['#F97316', '#EA580C'],
  },
  BUNDLE: {
    title: 'Bundle',
    subtitle: 'Pacote de ingressos',
    description:
      'Desconto para compra de múltiplos ingressos com produtos adicionais.',
    longDescription:
      'Similar ao Bundle Discount, mas pode incluir produtos adicionais como estacionamento, comida, ou merchandise.',
    howItWorks:
      '• Combina ingressos + produtos\n• Preço especial do pacote\n• Upgrade disponível',
    benefits: '• Cross-selling\n• Experiência completa\n• Valor agregado',
    icon: 'package-variant',
    color: '#06B6D4',
    gradient: ['#06B6D4', '#0891B2'],
  },
  FIRST_BUYER: {
    title: 'First Buyer',
    subtitle: 'Primeira compra',
    description: 'Desconto especial para primeira compra.',
    longDescription:
      'Desconto especial para clientes fazendo sua primeira compra. Excelente para aquisição de novos clientes e conversão.',
    howItWorks:
      '• Identifica novos usuários\n• Aplica desconto único\n• Pode exigir cadastro',
    benefits:
      '• Atrai novos clientes\n• Reduz barreira de entrada\n• Converte visitantes',
    icon: 'gift',
    color: '#D946EF',
    gradient: ['#D946EF', '#C026D3'],
  },
  VOLUME_BASED: {
    title: 'Volume Based',
    subtitle: 'Baseado em volume',
    description: 'Descontos baseados no volume histórico de compras.',
    longDescription:
      'Descontos progressivos baseados no volume histórico de compras do cliente. Quem mais compra, mais desconto.',
    howItWorks:
      '• Analisa histórico do cliente\n• Define faixas de volume\n• Aplica descontos automáticos',
    benefits:
      '• Recompensa volume\n• Incentiva recorrência\n• Justo e transparente',
    icon: 'chart-bell-curve',
    color: '#F43F5E',
    gradient: ['#F43F5E', '#E11D48'],
  },
  TIME_BASED: {
    title: 'Time Based',
    subtitle: 'Baseado no tempo',
    description: 'Preço varia conforme o tempo até o evento.',
    longDescription:
      'Estratégia genérica baseada em tempo que pode ser customizada para diferentes períodos e intensidades.',
    howItWorks:
      '• Define janelas de tempo\n• Preços variam por período\n• Configurável',
    benefits: '• Flexível\n• Customizável\n• Controle total',
    icon: 'clock-outline',
    color: '#0EA5E9',
    gradient: ['#0EA5E9', '#0284C7'],
  },
};

export default function ApplyStrategiesScreen({ navigation }) {
  // Estados
  const [events, setEvents] = useState([]);
  const [pricingStrategies, setPricingStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [eventTickets, setEventTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [applicationResults, setApplicationResults] = useState([]);
  const [activeStep, setActiveStep] = useState(1);
  const [strategyCategoryMap, setStrategyCategoryMap] = useState({});
  const [strategyConflicts, setStrategyConflicts] = useState([]);

  // Estados para o modal de detalhes
  const [showStrategyDetails, setShowStrategyDetails] = useState(false);
  const [selectedStrategyDetail, setSelectedStrategyDetail] = useState(null);
  const [selectedStrategyForAssociation, setSelectedStrategyForAssociation] =
    useState(null);
  const [showCategoryAssociation, setShowCategoryAssociation] = useState(false);

  // Função segura para obter gradiente
  const getSafeGradient = useCallback(strategy => {
    const defaultGradient = ['#6366F1', '#4F46E5'];

    if (!strategy) return defaultGradient;

    try {
      const details = STRATEGY_DETAILS[strategy.originalKey];

      if (
        details?.gradient &&
        Array.isArray(details.gradient) &&
        details.gradient.length >= 2 &&
        details.gradient.every(c => c && typeof c === 'string')
      ) {
        return details.gradient;
      }

      if (details?.color && typeof details.color === 'string') {
        return [details.color, details.color];
      }

      return defaultGradient;
    } catch (error) {
      console.warn('Erro ao gerar gradiente:', error);
      return defaultGradient;
    }
  }, []);

  // Função segura para obter detalhes da estratégia
  const getStrategyDetails = useCallback(strategyKey => {
    const keyMap = {
      LOYALTY_DISCOUNT: 'LOYALTY',
      LOYALTY: 'LOYALTY_DISCOUNT',
      BUNDLE_DISCOUNT: 'BUNDLE',
      BUNDLE: 'BUNDLE_DISCOUNT',
    };

    let details = STRATEGY_DETAILS[strategyKey];

    if (!details && keyMap[strategyKey]) {
      details = STRATEGY_DETAILS[keyMap[strategyKey]];
    }

    if (!details) {
      console.warn(`Estratégia não encontrada: ${strategyKey}`);
      return {
        title: strategyKey?.replace(/_/g, ' ').toLowerCase() || 'Estratégia',
        subtitle: 'Estratégia de precificação',
        description: 'Configure os parâmetros desta estratégia',
        longDescription:
          'Esta estratégia permite configurar regras de precificação personalizadas.',
        howItWorks:
          '• Defina os parâmetros\n• Configure as regras\n• Aplique ao evento',
        benefits: '• Flexível\n• Customizável\n• Adaptável',
        icon: 'tag',
        color: '#6366F1',
        gradient: ['#6366F1', '#4F46E5'],
      };
    }

    return details;
  }, []);

  // Fetch eventos
  const fetchEvents = useCallback(async () => {
    try {
      const response = await getEvents();
      setEvents(response.data || response || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os eventos');
    }
  }, []);

  // Fetch estratégias
  const fetchPricingStrategies = useCallback(async () => {
    try {
      const response = await getPricingStrategies();
      const strategiesArray = Array.isArray(response)
        ? response
        : response?.data || [];
      const formattedStrategies = strategiesArray.map(
        formatStrategyFromBackend,
      );
      setPricingStrategies(formattedStrategies);
    } catch (error) {
      console.error('Erro ao buscar estratégias:', error);
      setPricingStrategies([]);
    }
  }, []);

  // Fetch tickets
  const fetchEventTickets = useCallback(async eventId => {
    if (!eventId) return;
    try {
      setLoadingTickets(true);
      const response = await getTickets(eventId);
      let tickets = [];
      if (response?.data && Array.isArray(response.data)) {
        if (response.data[0]?.category) {
          tickets = response.data;
        } else if (response.data[0]?.tickets) {
          const evento = response.data.find(e => e.id === parseInt(eventId));
          tickets = evento?.tickets || [];
        }
      } else if (Array.isArray(response)) {
        tickets = response;
      }
      setEventTickets(tickets);
      setSelectedCategories([]);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      setEventTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  // Dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchPricingStrategies()]);
      setLoading(false);
    };
    loadInitialData();
  }, [fetchEvents, fetchPricingStrategies]);

  // Atualizar tickets quando evento mudar
  useEffect(() => {
    if (selectedEvent) {
      fetchEventTickets(selectedEvent.id);
      setActiveStep(2);
    }
  }, [selectedEvent, fetchEventTickets]);

  // Debug: log das estratégias carregadas
  useEffect(() => {
    if (pricingStrategies.length > 0) {
      console.log('📊 Estratégias carregadas:');
      pricingStrategies.forEach(s => {
        const details = STRATEGY_DETAILS[s.originalKey];
        console.log(`- ${s.strategyName}:`, {
          key: s.originalKey,
          hasDetails: !!details,
          color: details?.color,
          hasGradient: !!details?.gradient,
        });
      });
    }
  }, [pricingStrategies]);

  // Categorias disponíveis
  const availableCategories = useMemo(() => {
    const categories = new Set();
    eventTickets.forEach(ticket => {
      if (ticket.category) categories.add(ticket.category);
    });
    return Array.from(categories).sort();
  }, [eventTickets]);

  // Detectar conflitos
  const detectConflicts = useCallback((strategies, map) => {
    const conflicts = [];
    const strategiesByCategory = {};

    Object.entries(map).forEach(([strategyId, cats]) => {
      cats.forEach(category => {
        if (!strategiesByCategory[category]) {
          strategiesByCategory[category] = [];
        }
        const strategy = strategies.find(s => s.id === strategyId);
        if (strategy) {
          strategiesByCategory[category].push(strategy);
        }
      });
    });

    Object.entries(strategiesByCategory).forEach(
      ([category, catsStrategies]) => {
        if (catsStrategies.length > 1) {
          conflicts.push({
            category,
            strategies: catsStrategies,
            message: `Múltiplas estratégias em ${category}`,
            type: 'multiple_strategies',
          });
        }
      },
    );

    return conflicts;
  }, []);

  // Atualizar conflitos
  useEffect(() => {
    const conflicts = detectConflicts(selectedStrategies, strategyCategoryMap);
    setStrategyConflicts(conflicts);
  }, [selectedStrategies, strategyCategoryMap, detectConflicts]);

  // Toggle estratégia
  const toggleStrategy = useCallback(strategy => {
    setSelectedStrategies(prev => {
      const isSelected = prev.some(s => s.id === strategy.id);
      if (isSelected) {
        setStrategyCategoryMap(prevMap => {
          const newMap = { ...prevMap };
          delete newMap[strategy.id];
          return newMap;
        });
        return prev.filter(s => s.id !== strategy.id);
      } else {
        setStrategyCategoryMap(prevMap => ({
          ...prevMap,
          [strategy.id]: [],
        }));
        return [...prev, strategy];
      }
    });
  }, []);

  // Associar categorias
  const associateCategories = useCallback((strategyId, categories) => {
    setStrategyCategoryMap(prev => ({
      ...prev,
      [strategyId]: categories,
    }));
  }, []);

  // Toggle categoria global
  const toggleCategory = useCallback(category => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        setStrategyCategoryMap(prevMap => {
          const newMap = {};
          Object.entries(prevMap).forEach(([strategyId, cats]) => {
            newMap[strategyId] = cats.filter(c => c !== category);
          });
          return newMap;
        });
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  // Abrir detalhes
  const openStrategyDetails = useCallback(
    strategyKey => {
      const details = getStrategyDetails(strategyKey);
      setSelectedStrategyDetail(details);
      setShowStrategyDetails(true);
    },
    [getStrategyDetails],
  );

  // Aplicar estratégias
  const applyStrategies = useCallback(async () => {
    if (!selectedEvent) {
      Alert.alert('Atenção', 'Selecione um evento');
      return;
    }

    if (selectedCategories.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos uma categoria');
      return;
    }

    if (selectedStrategies.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos uma estratégia');
      return;
    }

    const unassociatedStrategies = selectedStrategies.filter(
      strategy =>
        !strategyCategoryMap[strategy.id] ||
        strategyCategoryMap[strategy.id].length === 0,
    );

    if (unassociatedStrategies.length > 0) {
      Alert.alert(
        'Associações Incompletas',
        `${unassociatedStrategies.length} estratégia(s) sem categorias associadas`,
      );
      return;
    }

    if (strategyConflicts.length > 0) {
      Alert.alert(
        'Conflitos Detectados',
        `${strategyConflicts.length} conflito(s) encontrado(s). Deseja continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: proceedWithApplication },
        ],
      );
      return;
    }

    proceedWithApplication();
  }, [
    selectedEvent,
    selectedCategories.length,
    selectedStrategies,
    strategyConflicts.length,
    proceedWithApplication,
    strategyCategoryMap,
  ]);

  // Proceder com aplicação
  // Dentro do componente ApplyStrategiesScreen

  const proceedWithApplication = useCallback(async () => {
    try {
      setApplying(true);

      const strategyAssignments = selectedStrategies.map(strategy => ({
        strategyId: strategy.id,
        targetCategories: strategyCategoryMap[strategy.id] || [],
      }));

      const payload = {
        eventId: selectedEvent.id,
        strategyAssignments,
      };

      console.log('📦 Payload enviado:', JSON.stringify(payload, null, 2));

      // A resposta já é o array de estratégias criadas
      const results = await applyMultipleStrategiesToEvent(payload);

      console.log('✅ Estratégias criadas:', results.length);

      // Formatar resultados para exibição
      const formattedResults = results.map(strategy => ({
        strategyId: strategy.id,
        strategyName: strategy.name,
        strategyType: strategy.strategyType,
        category: strategy.specificCategory || 'Todas as categorias',
        status: 'SUCCESS',
        message: `Estratégia "${strategy.name}" aplicada com sucesso`,
        ticketsAffected: 0, // Você pode calcular isso se necessário
      }));

      setApplicationResults(formattedResults);
      setShowResults(true);
    } catch (error) {
      console.error('❌ Erro detalhado:', error);

      // Tratamento de erro melhorado
      let errorMessage = 'Não foi possível aplicar as estratégias';

      if (error.response?.data) {
        if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data.map(e => e.message).join('\n');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setApplying(false);
    }
  }, [selectedEvent, selectedStrategies, strategyCategoryMap]);

  // Limpar tudo
  const clearAll = useCallback(() => {
    setSelectedEvent(null);
    setSelectedCategories([]);
    setSelectedStrategies([]);
    setStrategyCategoryMap({});
    setActiveStep(1);
  }, []);

  // Render loading
  if (loading) {
    return (
      <View style={style.loadingContainer}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={style.loadingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={style.loadingText}>Carregando estratégias...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaView style={style.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

      {/* Header Gradiente */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={style.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={style.headerContent}>
          <View style={style.headerTitleContainer}>
            <Icon name="lightning-bolt" size={28} color="#FFFFFF" />
            <Text style={style.headerTitle}>Estratégias de Preço</Text>
          </View>
          <Text style={style.headerSubtitle}>
            Associe estratégias às categorias do evento
          </Text>
          {selectedEvent && (
            <TouchableOpacity onPress={clearAll} style={style.resetButton}>
              <Icon name="refresh" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={style.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Steps */}
        <View style={style.stepsWrapper}>
          <View style={style.stepsContainer}>
            <View style={[style.stepItem, activeStep >= 1 && style.stepActive]}>
              <View
                style={[
                  style.stepCircle,
                  activeStep >= 1 && style.stepCircleActive,
                ]}
              >
                <Icon
                  name={selectedEvent ? 'check' : 'calendar'}
                  size={16}
                  color={activeStep >= 1 ? '#6366F1' : '#9CA3AF'}
                />
              </View>
              <Text
                style={[
                  style.stepLabel,
                  activeStep >= 1 && style.stepLabelActive,
                ]}
              >
                Evento
              </Text>
            </View>

            <View
              style={[style.stepLine, activeStep >= 2 && style.stepLineActive]}
            />

            <View style={[style.stepItem, activeStep >= 2 && style.stepActive]}>
              <View
                style={[
                  style.stepCircle,
                  activeStep >= 2 && style.stepCircleActive,
                ]}
              >
                <Icon
                  name={selectedCategories.length > 0 ? 'check' : 'ticket'}
                  size={16}
                  color={activeStep >= 2 ? '#6366F1' : '#9CA3AF'}
                />
              </View>
              <Text
                style={[
                  style.stepLabel,
                  activeStep >= 2 && style.stepLabelActive,
                ]}
              >
                Categorias
              </Text>
            </View>

            <View
              style={[style.stepLine, activeStep >= 3 && style.stepLineActive]}
            />

            <View style={[style.stepItem, activeStep >= 3 && style.stepActive]}>
              <View
                style={[
                  style.stepCircle,
                  activeStep >= 3 && style.stepCircleActive,
                ]}
              >
                <Icon
                  name={
                    selectedStrategies.length > 0 ? 'check' : 'lightning-bolt'
                  }
                  size={16}
                  color={activeStep >= 3 ? '#6366F1' : '#9CA3AF'}
                />
              </View>
              <Text
                style={[
                  style.stepLabel,
                  activeStep >= 3 && style.stepLabelActive,
                ]}
              >
                Estratégias
              </Text>
            </View>
          </View>
        </View>

        {/* Card Evento */}
        <TouchableOpacity
          style={[style.card, style.eventCard]}
          onPress={() => setShowEventModal(true)}
          activeOpacity={0.7}
        >
          <View style={style.cardIconContainer}>
            <Icon name="calendar" size={24} color="#6366F1" />
          </View>

          <View style={style.cardContent}>
            <Text style={style.cardLabel}>Evento Selecionado</Text>
            {selectedEvent ? (
              <>
                <Text style={style.cardTitle}>{selectedEvent.name}</Text>
                <Text style={style.cardSubtitle}>
                  {new Date(selectedEvent.eventDate).toLocaleDateString(
                    'pt-BR',
                    {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    },
                  )}
                </Text>
              </>
            ) : (
              <>
                <Text style={style.cardPlaceholder}>
                  Nenhum evento selecionado
                </Text>
                <Text style={style.cardHint}>Toque para selecionar</Text>
              </>
            )}
          </View>

          <Icon name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Card Categorias */}
        {selectedEvent && (
          <View style={[style.card, style.categoriesCard]}>
            <View style={style.cardHeader}>
              <View style={style.cardIconContainer}>
                <Icon name="ticket" size={24} color="#6366F1" />
              </View>
              <View style={style.cardHeaderText}>
                <Text style={style.cardLabel}>Categorias de Ingresso</Text>
                <Text style={style.cardDescription}>
                  Selecione as categorias que receberão as estratégias
                </Text>
              </View>
              {availableCategories.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSelectedCategories(availableCategories)}
                  style={style.selectAllButton}
                >
                  <Text style={style.selectAllText}>Selecionar todas</Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingTickets ? (
              <ActivityIndicator
                size="small"
                color="#6366F1"
                style={style.loadingTickets}
              />
            ) : availableCategories.length > 0 ? (
              <View style={style.categoriesGrid}>
                {availableCategories.map(category => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        style.categoryChip,
                        isSelected && style.categoryChipSelected,
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Icon
                        name={isSelected ? 'check-circle' : 'circle-outline'}
                        size={18}
                        color={isSelected ? '#6366F1' : '#9CA3AF'}
                      />
                      <Text
                        style={[
                          style.categoryChipText,
                          isSelected && style.categoryChipTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                      {isSelected && (
                        <View style={style.categoryChipBadge}>
                          <Text style={style.categoryChipBadgeText}>
                            {
                              Object.values(strategyCategoryMap)
                                .flat()
                                .filter(c => c === category).length
                            }
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={style.emptyState}>
                <Icon name="ticket-outline" size={40} color="#E5E7EB" />
                <Text style={style.emptyStateText}>
                  Nenhuma categoria disponível
                </Text>
              </View>
            )}

            {selectedCategories.length > 0 && (
              <View style={style.selectedCountBadge}>
                <Icon name="check-circle" size={16} color="#10B981" />
                <Text style={style.selectedCountText}>
                  {selectedCategories.length} categoria(s) selecionada(s)
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Card Estratégias */}
        {selectedCategories.length > 0 && (
          <View style={[style.card, style.strategiesCard]}>
            <View style={style.cardHeader}>
              <View style={style.cardIconContainer}>
                <Icon name="lightning-bolt" size={24} color="#6366F1" />
              </View>
              <View style={style.cardHeaderText}>
                <Text style={style.cardLabel}>Estratégias de Preço</Text>
                <Text style={style.cardDescription}>
                  Associe estratégias às categorias selecionadas
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowStrategyModal(true)}
                style={style.addButton}
              >
                <Icon name="plus" size={20} color="#6366F1" />
                <Text style={style.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            {/* Conflitos */}
            {strategyConflicts.length > 0 && (
              <View style={style.conflictWarning}>
                <Icon name="alert" size={20} color="#EF4444" />
                <Text style={style.conflictWarningText}>
                  {strategyConflicts.length} conflito(s) detectado(s)
                </Text>
              </View>
            )}

            {/* Lista de Estratégias Selecionadas */}
            {selectedStrategies.length > 0 ? (
              <View style={style.strategiesList}>
                {selectedStrategies.map(strategy => {
                  const details = getStrategyDetails(strategy.originalKey);
                  const associatedCats = strategyCategoryMap[strategy.id] || [];

                  return (
                    <View key={strategy.id} style={style.strategyCard}>
                      <LinearGradient
                        colors={getSafeGradient(strategy)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={style.strategyGradient}
                      >
                        <View style={style.strategyHeader}>
                          <View style={style.strategyIconContainer}>
                            <Icon
                              name={details.icon || 'tag'}
                              size={20}
                              color={details.color}
                            />
                          </View>
                          <View style={style.strategyInfo}>
                            <Text style={style.strategyName}>
                              {strategy.strategyName}
                            </Text>
                            <Text style={style.strategySubtitle}>
                              {details.subtitle}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedStrategyForAssociation(strategy);
                              setShowCategoryAssociation(true);
                            }}
                            style={style.strategyAction}
                          >
                            <Icon name="pencil" size={16} color="#6366F1" />
                          </TouchableOpacity>
                        </View>

                        {associatedCats.length > 0 ? (
                          <View style={style.associatedCatsContainer}>
                            {associatedCats.map(cat => (
                              <View
                                key={cat}
                                style={[
                                  style.associatedCatTag,
                                  { borderColor: details.color + '40' },
                                ]}
                              >
                                <Text
                                  style={[
                                    style.associatedCatText,
                                    { color: details.color },
                                  ]}
                                >
                                  {cat}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    associateCategories(
                                      strategy.id,
                                      associatedCats.filter(c => c !== cat),
                                    );
                                  }}
                                >
                                  <Icon
                                    name="close"
                                    size={14}
                                    color="#9CA3AF"
                                  />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text style={style.noAssociationText}>
                            Nenhuma categoria associada
                          </Text>
                        )}
                      </LinearGradient>
                    </View>
                  );
                })}
              </View>
            ) : (
              <TouchableOpacity
                style={style.emptyStrategies}
                onPress={() => setShowStrategyModal(true)}
              >
                <Icon name="plus-circle" size={40} color="#E5E7EB" />
                <Text style={style.emptyStrategiesText}>
                  Toque para adicionar estratégias
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Botão Aplicar */}
        {selectedStrategies.length > 0 && (
          <TouchableOpacity
            style={[style.applyButton, applying && style.applyButtonDisabled]}
            onPress={applyStrategies}
            disabled={applying}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={style.applyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {applying ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Icon name="play" size={24} color="#FFFFFF" />
                  <Text style={style.applyButtonText}>
                    Aplicar {selectedStrategies.length} Estratégia(s)
                  </Text>
                  <View style={style.applyBadge}>
                    <Text style={style.applyBadgeText}>
                      {selectedCategories.length} categorias
                    </Text>
                  </View>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal Seleção de Evento */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={style.modalOverlay}>
          <View style={style.modalContainer}>
            <View style={style.modalHeader}>
              <Text style={style.modalTitle}>Selecionar Evento</Text>
              <TouchableOpacity
                onPress={() => setShowEventModal(false)}
                style={style.modalCloseButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={events}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    style.eventModalItem,
                    selectedEvent?.id === item.id &&
                      style.eventModalItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedEvent(item);
                    setShowEventModal(false);
                  }}
                >
                  <View style={style.eventModalIcon}>
                    <Icon name="calendar" size={24} color="#6366F1" />
                  </View>
                  <View style={style.eventModalInfo}>
                    <Text style={style.eventModalName}>{item.name}</Text>
                    <Text style={style.eventModalDate}>
                      {new Date(item.eventDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {selectedEvent?.id === item.id && (
                    <Icon name="check-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={style.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Seleção de Estratégias */}
      <Modal
        visible={showStrategyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStrategyModal(false)}
      >
        <View style={style.modalOverlay}>
          <View style={[style.modalContainer, style.strategyModalContainer]}>
            <View style={style.modalHeader}>
              <Text style={style.modalTitle}>Selecionar Estratégias</Text>
              <TouchableOpacity
                onPress={() => setShowStrategyModal(false)}
                style={style.modalCloseButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={pricingStrategies}
              renderItem={({ item }) => {
                const isSelected = selectedStrategies.some(
                  s => s.id === item.id,
                );
                const details = getStrategyDetails(item.originalKey);

                return (
                  <TouchableOpacity
                    style={[
                      style.strategyModalItem,
                      isSelected && style.strategyModalItemSelected,
                    ]}
                    onPress={() => toggleStrategy(item)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        isSelected
                          ? getSafeGradient(item)
                          : ['#FFFFFF', '#F9FAFB']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={style.strategyModalGradient}
                    >
                      <View
                        style={[
                          style.strategyModalIcon,
                          { backgroundColor: details.color + '20' },
                        ]}
                      >
                        <Icon
                          name={details.icon || 'tag'}
                          size={32}
                          color={details.color}
                        />
                      </View>

                      <View style={style.strategyModalContent}>
                        <View style={style.strategyModalHeader}>
                          <Text
                            style={[
                              style.strategyModalName,
                              isSelected && { color: '#FFFFFF' },
                            ]}
                          >
                            {item.strategyName}
                          </Text>
                          {isSelected && (
                            <Icon
                              name="check-circle"
                              size={20}
                              color="#FFFFFF"
                            />
                          )}
                        </View>

                        <Text
                          style={[
                            style.strategyModalSubtitle,
                            isSelected && { color: '#FFFFFF', opacity: 0.9 },
                          ]}
                        >
                          {details.subtitle}
                        </Text>

                        <Text
                          style={[
                            style.strategyModalDescription,
                            isSelected && { color: '#FFFFFF', opacity: 0.8 },
                          ]}
                          numberOfLines={2}
                        >
                          {details.description}
                        </Text>

                        <View style={style.strategyModalFooter}>
                          <View
                            style={[
                              style.strategyTypeBadge,
                              { backgroundColor: details.color + '20' },
                            ]}
                          >
                            <Icon
                              name="clock-outline"
                              size={12}
                              color={details.color}
                            />
                            <Text
                              style={[
                                style.strategyTypeText,
                                { color: details.color },
                              ]}
                            >
                              {item.strategyType}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() =>
                              openStrategyDetails(item.originalKey)
                            }
                            style={style.strategyInfoButton}
                          >
                            <Icon
                              name="information-outline"
                              size={16}
                              color={details.color}
                            />
                            <Text
                              style={[
                                style.strategyInfoText,
                                { color: details.color },
                              ]}
                            >
                              Detalhes
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={item => item.id}
              contentContainerStyle={style.modalList}
              showsVerticalScrollIndicator={false}
            />

            <View style={style.modalFooter}>
              <Text style={style.modalFooterText}>
                {selectedStrategies.length} estratégia(s) selecionada(s)
              </Text>
              <TouchableOpacity
                style={style.modalConfirmButton}
                onPress={() => setShowStrategyModal(false)}
              >
                <Text style={style.modalConfirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Associação de Categorias */}
      <Modal
        visible={showCategoryAssociation}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryAssociation(false)}
      >
        <View style={style.modalOverlay}>
          <View style={style.modalContainer}>
            <View style={style.modalHeader}>
              <Text style={style.modalTitle}>
                Associar {selectedStrategyForAssociation?.strategyName}
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryAssociation(false)}
                style={style.modalCloseButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={style.associationSubtitle}>
              Selecione as categorias para esta estratégia
            </Text>

            <View style={style.associationList}>
              {selectedCategories.map(category => {
                const isAssociated =
                  strategyCategoryMap[
                    selectedStrategyForAssociation?.id
                  ]?.includes(category);

                return (
                  <TouchableOpacity
                    key={category}
                    style={[
                      style.associationItem,
                      isAssociated && style.associationItemSelected,
                    ]}
                    onPress={() => {
                      if (selectedStrategyForAssociation) {
                        const current =
                          strategyCategoryMap[
                            selectedStrategyForAssociation.id
                          ] || [];
                        const updated = isAssociated
                          ? current.filter(c => c !== category)
                          : [...current, category];

                        associateCategories(
                          selectedStrategyForAssociation.id,
                          updated,
                        );
                      }
                    }}
                  >
                    <Icon
                      name={
                        isAssociated
                          ? 'checkbox-marked-circle'
                          : 'circle-outline'
                      }
                      size={24}
                      color={isAssociated ? '#6366F1' : '#9CA3AF'}
                    />
                    <Text
                      style={[
                        style.associationItemText,
                        isAssociated && style.associationItemTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={style.modalFooter}>
              <TouchableOpacity
                style={style.modalConfirmButton}
                onPress={() => setShowCategoryAssociation(false)}
              >
                <Text style={style.modalConfirmButtonText}>Concluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Detalhes da Estratégia */}
      <Modal
        visible={showStrategyDetails}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowStrategyDetails(false)}
      >
        <View style={style.detailsModalOverlay}>
          <View style={style.detailsModalContainer}>
            {selectedStrategyDetail && (
              <>
                <LinearGradient
                  colors={
                    selectedStrategyDetail.gradient || ['#6366F1', '#4F46E5']
                  }
                  style={style.detailsModalHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={style.detailsModalIcon}>
                    <Icon
                      name={selectedStrategyDetail.icon}
                      size={48}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={style.detailsModalTitle}>
                    {selectedStrategyDetail.title}
                  </Text>
                  <Text style={style.detailsModalSubtitle}>
                    {selectedStrategyDetail.subtitle}
                  </Text>
                  <TouchableOpacity
                    style={style.detailsModalClose}
                    onPress={() => setShowStrategyDetails(false)}
                  >
                    <Icon name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </LinearGradient>

                <ScrollView style={style.detailsModalContent}>
                  <View style={style.detailsSection}>
                    <Text style={style.detailsSectionTitle}>📋 Descrição</Text>
                    <Text style={style.detailsText}>
                      {selectedStrategyDetail.longDescription}
                    </Text>
                  </View>

                  <View style={style.detailsSection}>
                    <Text style={style.detailsSectionTitle}>
                      ⚙️ Como Funciona
                    </Text>
                    <Text style={style.detailsText}>
                      {selectedStrategyDetail.howItWorks}
                    </Text>
                  </View>

                  <View style={style.detailsSection}>
                    <Text style={style.detailsSectionTitle}>✨ Benefícios</Text>
                    <Text style={style.detailsText}>
                      {selectedStrategyDetail.benefits}
                    </Text>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={style.detailsModalButton}
                  onPress={() => setShowStrategyDetails(false)}
                >
                  <Text style={style.detailsModalButtonText}>Entendi</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Resultados */}
      <Modal
        visible={showResults}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResults(false)}
      >
        <View style={style.modalOverlay}>
          <View style={style.modalContainer}>
            <View style={style.modalHeader}>
              <Text style={style.modalTitle}>✅ Estratégias Aplicadas</Text>
              <TouchableOpacity
                onPress={() => setShowResults(false)}
                style={style.modalCloseButton}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Resumo */}
            <View style={style.resultsSummary}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={style.summaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="check-circle" size={40} color="#FFFFFF" />
                <Text style={style.summaryTitle}>
                  {applicationResults.length} Estratégia(s) Aplicada(s)
                </Text>
                <Text style={style.summarySubtitle}>
                  no evento {selectedEvent?.name}
                </Text>
              </LinearGradient>
            </View>

            <FlatList
              data={applicationResults}
              renderItem={({ item, index }) => {
                // Buscar detalhes da estratégia para o gradiente
                const strategy = pricingStrategies.find(
                  s => s.id === item.strategyId,
                );
                const details = strategy
                  ? getStrategyDetails(strategy.originalKey)
                  : STRATEGY_DETAILS[item.strategyType] ||
                    STRATEGY_DETAILS.LOYALTY;

                return (
                  <View style={style.resultCard}>
                    <LinearGradient
                      colors={getSafeGradient({
                        originalKey: item.strategyType,
                      })}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={style.resultGradient}
                    >
                      <View style={style.resultHeader}>
                        <View style={style.resultIconBadge}>
                          <Icon
                            name={details.icon || 'tag'}
                            size={20}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={style.resultHeaderInfo}>
                          <Text style={style.resultName}>
                            {item.strategyName}
                          </Text>
                          <View style={style.resultMeta}>
                            <View style={style.resultCategoryBadge}>
                              <Icon name="tag" size={12} color="#FFFFFF" />
                              <Text style={style.resultCategory}>
                                {item.category}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <Icon name="check-circle" size={24} color="#FFFFFF" />
                      </View>

                      <View style={style.resultBody}>
                        <Text style={style.resultMessage}>{item.message}</Text>

                        <View style={style.resultDetails}>
                          <View style={style.resultDetailItem}>
                            <Icon name="identifier" size={14} color="#FFFFFF" />
                            <Text style={style.resultDetailText}>
                              ID: {item.strategyId}
                            </Text>
                          </View>
                          <View style={style.resultDetailItem}>
                            <Icon
                              name="clock-outline"
                              size={14}
                              color="#FFFFFF"
                            />
                            <Text style={style.resultDetailText}>
                              {new Date().toLocaleTimeString()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                );
              }}
              keyExtractor={item => item.strategyId.toString()}
              contentContainerStyle={style.resultsList}
              showsVerticalScrollIndicator={false}
            />

            <View style={style.modalFooter}>
              <TouchableOpacity
                style={style.modalConfirmButton}
                onPress={() => {
                  setShowResults(false);
                  clearAll();
                }}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={style.confirmGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={style.modalConfirmButtonText}>
                    Nova Aplicação
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
