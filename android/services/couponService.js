// services/couponService.js
import { api } from './../services/api';

export const couponService = {
  // Criar cupom - POST /e-ticket/api/coupons
  createCoupon: async data => {
    const response = await api.post('/api/coupons', data);
    console.log(data);

    return response.data;
  },

  // Listar cupons de um evento - GET /e-ticket/api/coupons/event/{eventId}
  getEventCoupons: async eventId => {
    const response = await api.get(`/api/coupons/event/${eventId}`);
    return response.data;
  },

  // Validar cupom - POST /e-ticket/api/coupons/validate
  validateCoupon: async (code, eventId, purchaseAmount) => {
    const response = await api.post('/api/coupons/validate', {
      code,
      eventId,
      purchaseAmount,
    });
    return response.data;
  },

  // Deletar cupom - DELETE /e-ticket/api/coupons/{id}
  deleteCoupon: async id => {
    const response = await api.delete(`/api/coupons/${id}`);
    return response.data;
  },

  // Buscar cupom por ID - GET /e-ticket/api/coupons/{id}
  getCouponById: async id => {
    const response = await api.get(`/api/coupons/${id}`);
    return response.data;
  },

  // Atualizar cupom - PUT /e-ticket/api/coupons/{id}
  updateCoupon: async (id, data) => {
    const response = await api.put(`/api/coupons/${id}`, data);
    return response.data;
  },

  // Listar cupons do organizador - GET /e-ticket/api/coupons/organizer
  getOrganizerCoupons: async () => {
    const response = await api.get('/api/coupons/organizer');
    return response.data;
  },
};
