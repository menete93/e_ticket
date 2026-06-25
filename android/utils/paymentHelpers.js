// utils/paymentHelpers.js
export const normalizePaymentMethod = paymentMethod => {
  // console.log('🔧 Normalizando paymentMethod recebido:', paymentMethod);

  // Se for undefined ou null
  if (!paymentMethod) {
    // console.error('❌ paymentMethod é null ou undefined');
    return {
      id: 'MPESA', // Valor padrão
      name: 'M-Pesa',
      colors: ['#4F46E5', '#6366F1'],
      allowedPrefixes: ['84', '85', '86'],
      phoneMask: '84XXXXXXX',
    };
  }

  // Se já é um objeto com id
  if (typeof paymentMethod === 'object' && paymentMethod.id) {
    // console.log('✅ Já é objeto:', paymentMethod);
    return {
      id: paymentMethod.id,
      name: paymentMethod.name || getMethodName(paymentMethod.id),
      colors: paymentMethod.colors || getDefaultColors(paymentMethod.id),
      allowedPrefixes:
        paymentMethod.allowedPrefixes || getAllowedPrefixes(paymentMethod.id),
      phoneMask: paymentMethod.phoneMask || getPhoneMask(paymentMethod.id),
    };
  }

  // Se é uma string
  if (typeof paymentMethod === 'string') {
    const methodId = paymentMethod.toUpperCase();
    console.log('✅ Convertendo string para objeto:', methodId);
    return {
      id: methodId,
      name: getMethodName(methodId),
      colors: getDefaultColors(methodId),
      allowedPrefixes: getAllowedPrefixes(methodId),
      phoneMask: getPhoneMask(methodId),
    };
  }

  // Fallback para M-Pesa (padrão)
  console.warn('⚠️ Usando fallback para M-Pesa');
  return {
    id: 'MPESA',
    name: 'M-Pesa',
    colors: ['#4F46E5', '#6366F1'],
    allowedPrefixes: ['84', '85', '86'],
    phoneMask: '84XXXXXXX',
  };
};

const getMethodName = id => {
  const names = {
    MPESA: 'M-Pesa',
    EMOLA: 'E-Mola',
    CARD: 'Cartão de Crédito',
  };
  return names[id] || id;
};

const getDefaultColors = id => {
  const colors = {
    MPESA: ['#4F46E5', '#6366F1'],
    EMOLA: ['#10B981', '#059669'],
    CARD: ['#EF4444', '#DC2626'],
  };
  return colors[id] || ['#4F46E5', '#6366F1'];
};

const getAllowedPrefixes = id => {
  const prefixes = {
    MPESA: ['84', '85', '86'],
    EMOLA: ['84', '85', '86'],
    CARD: [],
  };
  return prefixes[id] || [];
};

const getPhoneMask = id => {
  const masks = {
    MPESA: '84XXXXXXX',
    EMOLA: '84XXXXXXX',
    CARD: '•••• •••• •••• ••••',
  };
  return masks[id] || 'XXXXXXXXX';
};
