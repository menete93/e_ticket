// constants/pricingStrategyMapper.js
export const STRATEGY_METADATA = {
  EARLY_BIRD: {
    type: 'DYNAMIC',
    icon: 'bird',
    badgeColor: '#10B981',
    category: 'time-based',
    description: 'Desconto para compras antecipadas',
  },
  LAST_MINUTE: {
    type: 'DYNAMIC',
    icon: 'clock-fast',
    badgeColor: '#EF4444',
    category: 'time-based',
    description: 'Aumento na última hora antes do evento',
  },
  DEMAND_BASED: {
    type: 'DYNAMIC',
    icon: 'trending-up',
    badgeColor: '#8B5CF6',
    category: 'demand-based',
    description: 'Baseado em percentual de vendas/procura',
  },
  GROUP_DISCOUNT: {
    type: 'DYNAMIC',
    icon: 'account-group',
    badgeColor: '#F59E0B',
    category: 'group',
    description: 'Desconto para compras em grupo',
  },
  CATEGORY_SPECIFIC: {
    type: 'FIXED',
    icon: 'tag',
    badgeColor: '#3B82F6',
    category: 'category',
    description: 'Estratégia específica por categoria de ingresso',
  },
  FLASH_SALE: {
    type: 'DYNAMIC',
    icon: 'flash',
    badgeColor: '#EC4899',
    category: 'time-based',
    description: 'Promoção relâmpago por tempo limitado',
  },
  WEEKEND_SPECIAL: {
    type: 'DYNAMIC',
    icon: 'calendar-weekend',
    badgeColor: '#14B8A6',
    category: 'time-based',
    description: 'Preço especial para fins de semana',
  },
  LOYALTY_DISCOUNT: {
    type: 'FIXED',
    icon: 'star',
    badgeColor: '#6366F1',
    category: 'loyalty',
    description: 'Desconto para clientes frequentes',
  },
  TIERED_PRICING: {
    type: 'FIXED',
    icon: 'layers',
    badgeColor: '#A855F7',
    category: 'tiered',
    description: 'Preço por níveis de venda',
  },
  BUNDLE_DISCOUNT: {
    type: 'DYNAMIC',
    icon: 'package',
    badgeColor: '#F97316',
    category: 'bundle',
    description: 'Desconto para compra de múltiplos ingressos',
  },
  LOYALTY: {
    type: 'FIXED',
    icon: 'heart',
    badgeColor: '#8B5CF6',
    category: 'loyalty',
    description: 'Desconto para clientes frequentes/fiéis',
  },
  BUNDLE: {
    type: 'FIXED',
    icon: 'package-variant',
    badgeColor: '#06B6D4',
    category: 'bundle',
    description: 'Desconto para compra de múltiplos ingressos',
  },
  FIRST_BUYER: {
    type: 'FIXED',
    icon: 'gift',
    badgeColor: '#D946EF',
    category: 'acquisition',
    description: 'Desconto para primeira compra',
  },
  VOLUME_BASED: {
    type: 'DYNAMIC',
    icon: 'chart-bell-curve',
    badgeColor: '#F43F5E',
    category: 'volume',
    description: 'Desconto baseado em volume de compras',
  },
  TIME_BASED: {
    type: 'DYNAMIC',
    icon: 'clock-outline',
    badgeColor: '#0EA5E9',
    category: 'time-based',
    description: 'Preço baseado no tempo até o evento',
  },
};

export const formatStrategyFromBackend = backendStrategy => {
  const metadata = STRATEGY_METADATA[backendStrategy.key] || {
    type: 'FIXED',
    icon: 'tag',
    badgeColor: '#6B7280',
    category: 'other',
    description: backendStrategy.description || 'Estratégia de precificação',
  };

  return {
    id: backendStrategy.key,
    strategyName: backendStrategy.displayName,
    description: backendStrategy.description || metadata.description,
    strategyType: metadata.type,
    strategyCategory: metadata.category,
    icon: metadata.icon,
    badgeColor: metadata.badgeColor,
    minPrice: 0,
    // Dados originais
    originalKey: backendStrategy.key,
    originalDisplayName: backendStrategy.displayName,
    originalDescription: backendStrategy.description,
    // Informações adicionais
    isDynamic: metadata.type === 'DYNAMIC',
    isFixed: metadata.type === 'FIXED',
  };
};
