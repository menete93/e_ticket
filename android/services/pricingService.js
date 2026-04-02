import { api } from './../services/api';

// 🔹 Lista todos os eventos
export async function getPricingStrategies() {
  const response = await api.get('/api/pricing/strategies/types');
  console.log('PricingStrategy', response);
  return response.data; // [{ id, name }, ...]
}

// // 🔹 Cria uma nova estratégia //bullk
// export async function applyMultipleStrategiesToEvent(payload) {
//   const response = await api.post(
//     '/api/pricing/strategies/bulk-create',
//     payload,
//   );
//   console.log('PricingStrategy', response);
//   return response.data; // [{ id, name }, ...]
// }

// // 🔹 Cria uma nova estratégia
// export async function applyMultipleStrategiesToEvent(payload) {
//   const response = await api.post('/api/pricing/strategies/create', payload);
//   console.log('PricingStrategy', response);
//   return response.data; // [{ id, name }, ...]
// }

export const applyMultipleStrategiesToEvent = async payload => {
  try {
    // A resposta já vem com a estrutura que você mostrou
    const response = await api.post(
      '/api/pricing//strategies/bulk-create',
      payload,
    );

    // Log para debug
    console.log(
      '📦 Resposta do backend:',
      JSON.stringify(response.data, null, 2),
    );

    return response.data; // Retorna o array diretamente
  } catch (error) {
    console.error('❌ Erro ao aplicar estratégias:', error);
    throw error;
  }
};

// services/pricingService.js
export const applyStrategyToEvent = async payload => {
  const response = await api.post(
    '/pricing/strategies/apply-to-event',
    payload,
  );
  return response.data;
};

// export const applyMultipleStrategiesToEvent = async payload => {
//   const response = await api.post(
//     '/pricing/strategies/apply-multiple',
//     payload,
//   );
//   return response.data;
// };

// Buscar estratégias de um evento
// getEventStrategies: async (eventId) => {
//   const response = await api.get(`/strategies/event/${eventId}`);
//   return response.data;
// },

// // Buscar estratégia por ID
// getStrategy: async (id) => {
//   const response = await api.get(`/strategies/${id}`);
//   return response.data;
// },

// // Atualizar estratégia
// updateStrategy: async (id, data) => {
//   const response = await api.put(`/strategies/${id}`, data);
//   return response.data;
// },

// // Deletar estratégia
// deleteStrategy: async (id) => {
//   const response = await api.delete(`/strategies/${id}`);
//   return response.data;
// }
