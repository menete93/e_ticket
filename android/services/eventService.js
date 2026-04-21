import { api } from './../services/api';

// 🔹 Lista todos os eventos
export const getEvents = async () => {
  const response = await api.get('/event');
  return response.data;
};
// 🔹 Busca evento por ID
export const getEventById = async eventId => {
  const response = await api.get(`/event/${eventId}`);
  return response.data;
};
// 🔹 Cria um novo evento
export const createEvent = async eventData => {
  const response = await api.post('/event', eventData);
  return response.data;
};

// Buscar meus eventos (apenas do organizador logado)
export const getMyEvents = async referenceId => {
  const response = await api.get(`/event/findBy/organizer/${referenceId}`);
  return response.data;
};

// Atualizar evento
export const updateEvent = async (eventId, eventData) => {
  const response = await api.put(`/event/${eventId}`, eventData);
  console.log('RETORNO DO UPDATE ENVIADO:', response.data);

  return response.data;
};

// Deletar evento
export const deleteEvent = async eventId => {
  const response = await api.delete(`/event/${eventId}`);
  return response.data;
};

// ============ CATEGORIAS ============
export const getEventCategories = async () => {
  const response = await api.get('/event-categories');
  return response.data;
};

export const getEventCategoryById = async id => {
  const response = await api.get(`/event-categories/${id}`);
  return response.data;
};

// ============ ESTATÍSTICAS ============
export const getEventStats = async eventId => {
  // Se tiver endpoint específico
  try {
    const response = await api.get(`/event/${eventId}/stats`);
    return response.data;
  } catch (error) {
    // Fallback: calcula com os dados disponíveis.

    const event = await getEventById(eventId);
    return {
      totalTickets: event.totalTickets || 0,
      soldTickets: event.soldTickets || 0,
      availableTickets: event.availableTickets || 0,
      reservedTickets: event.reservedTickets || 0,
      totalRevenue: event.soldTickets * (event.tickets?.[0]?.price || 0),
    };
  }
};

// Buscar vendas de um evento
export const getEventSales = async eventId => {
  const response = await api.get(`/api/v1/tickets/event/${eventId}/sales`);
  // console.error('RETORNO DAS ESTATISTICAS:', response);

  return response.data;
};

// Cancelar evento
export const cancelEvent = async (eventId, cancelData) => {
  const response = await api.patch(`/event/${eventId}/cancel`, cancelData);
  return response.data;
};
