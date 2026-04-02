// Descrições detalhadas de cada estratégia
const STRATEGY_DETAILS = {
  EARLY_BIRD: {
    title: 'Early Bird (Passarinho)',
    description: 'Desconto para compras antecipadas',
    longDescription:
      'Oferece descontos progressivos para clientes que compram ingressos com antecedência. Quanto mais cedo a compra, maior o desconto. Ideal para estimular vendas antecipadas e garantir fluxo de caixa antes do evento.',
    howItWorks:
      '• Define um período de dias antes do evento\n• Aplica descontos percentuais ou fixos\n• Pode ter níveis progressivos (ex: 30% com 30 dias, 20% com 20 dias)',
    benefits:
      '• Aumenta vendas antecipadas\n• Melhora previsibilidade financeira\n• Cria senso de urgência',
    icon: 'bird',
    color: '#10B981',
  },
  LAST_MINUTE: {
    title: 'Last Minute (Última Hora)',
    description: 'Aumento na última hora antes do evento',
    longDescription:
      'Estratégia que aumenta os preços nos dias finais antes do evento. Aproveita a alta demanda de última hora e a disposição de pagar mais de clientes que deixaram para comprar em cima da hora.',
    howItWorks:
      '• Ativa nos últimos dias antes do evento\n• Aplica aumentos percentuais progressivos\n• Pode combinar com disponibilidade de ingressos',
    benefits:
      '• Maximiza receita de última hora\n• Compensa descontos de Early Bird\n• Gerencia demanda de pico',
    icon: 'clock-fast',
    color: '#EF4444',
  },
  DEMAND_BASED: {
    title: 'Demand Based (Baseado em Demanda)',
    description: 'Baseado em percentual de vendas/procura',
    longDescription:
      'Preços que se ajustam automaticamente conforme a demanda. Quando as vendas atingem determinados patamares, os preços aumentam. Similar a modelos de airlines e hotels.',
    howItWorks:
      '• Define thresholds de vendas (ex: 30%, 60%, 90%)\n• Cada nível tem um preço específico\n• Atualiza preços em tempo real',
    benefits:
      '• Otimiza receita por demanda\n• Preços justos baseados em procura\n• Automático e dinâmico',
    icon: 'trending-up',
    color: '#8B5CF6',
  },
  GROUP_DISCOUNT: {
    title: 'Group Discount (Desconto em Grupo)',
    description: 'Desconto para compras em grupo',
    longDescription:
      'Oferece descontos progressivos para compras em grupo. Quanto maior o grupo, maior o desconto. Perfeito para eventos corporativos, famílias ou grupos de amigos.',
    howItWorks:
      '• Define tamanhos mínimos de grupo\n• Aplica descontos por faixa (ex: 5pax = 10%, 10pax = 15%)\n• Pode ser combinado com outras estratégias',
    benefits:
      '• Incentiva vendas em grupo\n• Aumenta ticket médio\n• Ideal para eventos familiares',
    icon: 'account-group',
    color: '#F59E0B',
  },
  CATEGORY_SPECIFIC: {
    title: 'Category Specific (Categoria Específica)',
    description: 'Estratégia específica por categoria de ingresso',
    longDescription:
      'Aplica regras de precificação diferentes para cada categoria de ingresso (VIP, Pista, Camarote, etc). Permite estratégias customizadas por segmento.',
    howItWorks:
      '• Seleciona uma ou mais categorias\n• Define regras exclusivas por categoria\n• Pode ter descontos ou acréscimos específicos',
    benefits:
      '• Precificação segmentada\n• Otimiza revenue por categoria\n• Flexibilidade total',
    icon: 'tag',
    color: '#3B82F6',
  },
  FLASH_SALE: {
    title: 'Flash Sale (Promoção Relâmpago)',
    description: 'Promoção relâmpago por tempo limitado',
    longDescription:
      'Descontos agressivos por um período muito curto (horas). Cria urgência e pode ser usado para liquidar ingressos remanescentes ou gerar buzz.',
    howItWorks:
      '• Define janela de tempo curta (horas)\n• Aplica descontos significativos\n• Contador regressivo visível',
    benefits:
      '• Cria urgência imediata\n• Gera buzz e marketing\n• Rápida liquidação',
    icon: 'flash',
    color: '#EC4899',
  },
  WEEKEND_SPECIAL: {
    title: 'Weekend Special (Especial de Fim de Semana)',
    description: 'Preço especial para fins de semana',
    longDescription:
      'Estratégia específica para eventos de fim de semana. Pode ter preços diferenciados para sexta, sábado e domingo baseado na demanda típica.',
    howItWorks:
      '• Identifica dias de fim de semana\n• Aplica regras diferentes por dia\n• Ajusta baseado em histórico',
    benefits:
      '• Maximiza receita de weekend\n• Adapta-se a padrões de consumo\n• Flexível por dia',
    icon: 'calendar-weekend',
    color: '#14B8A6',
  },
  LOYALTY_DISCOUNT: {
    title: 'Loyalty Discount (Desconto Fidelidade)',
    description: 'Desconto para clientes frequentes',
    longDescription:
      'Recompensa clientes recorrentes com descontos especiais. Quanto mais compras ou maior o histórico de gastos, maiores os benefícios.',
    howItWorks:
      '• Baseado em histórico de compras\n• Tiers de fidelidade (Bronze, Prata, Ouro)\n• Descontos progressivos por tier',
    benefits: '• Fideliza clientes\n• Aumenta lifetime value\n• Reconhecimento',
    icon: 'star',
    color: '#6366F1',
  },
  TIERED_PRICING: {
    title: 'Tiered Pricing (Preços por Níveis)',
    description: 'Preço por níveis de venda',
    longDescription:
      'Preços que mudam conforme os ingressos são vendidos em lotes. Cada lote tem um preço específico, incentivando compras antecipadas.',
    howItWorks:
      '• Define lotes de ingressos\n• Cada lote tem preço crescente\n• Avança automaticamente',
    benefits:
      '• Incentiva compra antecipada\n• Escalonamento natural\n• Transparente',
    icon: 'layers',
    color: '#A855F7',
  },
  BUNDLE_DISCOUNT: {
    title: 'Bundle Discount (Desconto em Pacote)',
    description: 'Desconto para compra de múltiplos ingressos',
    longDescription:
      'Oferece descontos na compra de pacotes de ingressos. Pode ser para o mesmo evento (ex: 4 ingressos) ou para múltiplos eventos.',
    howItWorks:
      '• Define combos de ingressos\n• Aplica desconto progressivo\n• Pode incluir benefícios extras',
    benefits: '• Aumenta ticket médio\n• Incentiva compras maiores\n• Versátil',
    icon: 'package',
    color: '#F97316',
  },
  LOYALTY: {
    title: 'Loyalty (Fidelidade)',
    description: 'Desconto para clientes frequentes/fiéis',
    longDescription:
      'Programa de fidelidade completo com múltiplos níveis e benefícios exclusivos para clientes que mais compram.',
    howItWorks:
      '• Múltiplos níveis (Bronze, Prata, Ouro, Platina)\n• Benefícios exclusivos por nível\n• Acumula pontos ou créditos',
    benefits: '• Programa completo\n• Engajamento contínuo\n• Exclusividade',
    icon: 'heart',
    color: '#8B5CF6',
  },
  BUNDLE: {
    title: 'Bundle (Pacote)',
    description: 'Desconto para compra de múltiplos ingressos',
    longDescription:
      'Similar ao Bundle Discount, mas pode incluir produtos adicionais como estacionamento, comida, ou merchandise.',
    howItWorks:
      '• Combina ingressos + produtos\n• Preço especial do pacote\n• Upgrade disponível',
    benefits: '• Cross-selling\n• Experiência completa\n• Valor agregado',
    icon: 'package-variant',
    color: '#06B6D4',
  },
  FIRST_BUYER: {
    title: 'First Buyer (Primeira Compra)',
    description: 'Desconto para primeira compra',
    longDescription:
      'Desconto especial para clientes fazendo sua primeira compra. Excelente para aquisição de novos clientes e conversão.',
    howItWorks:
      '• Identifica novos usuários\n• Aplica desconto único\n• Pode exigir cadastro',
    benefits:
      '• Atrai novos clientes\n• Reduz barreira de entrada\n• Converte visitantes',
    icon: 'gift',
    color: '#D946EF',
  },
  VOLUME_BASED: {
    title: 'Volume Based (Baseado em Volume)',
    description: 'Desconto baseado em volume de compras',
    longDescription:
      'Descontos progressivos baseados no volume histórico de compras do cliente. Quem mais compra, mais desconto.',
    howItWorks:
      '• Analisa histórico do cliente\n• Define faixas de volume\n• Aplica descontos automáticos',
    benefits:
      '• Recompensa volume\n• Incentiva recorrência\n• Justo e transparente',
    icon: 'chart-bell-curve',
    color: '#F43F5E',
  },
  TIME_BASED: {
    title: 'Time Based (Baseado no Tempo)',
    description: 'Preço baseado no tempo até o evento',
    longDescription:
      'Estratégia genérica baseada em tempo que pode ser customizada para diferentes períodos e intensidades.',
    howItWorks:
      '• Define janelas de tempo\n• Preços variam por período\n• Configurável',
    benefits: '• Flexível\n• Customizável\n• Controle total',
    icon: 'clock-outline',
    color: '#0EA5E9',
  },
};
