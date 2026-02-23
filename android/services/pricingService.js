import { api } from './../services/api';

// 🔹 Lista todos os eventos

export default async function getPricingStrategies() {
  const response = await api.get('/api/pricing');

  console.log('PricingStrategy', response);
  return response.data; // deve retornar um array de objetos [{ id, name }, ...]
}
