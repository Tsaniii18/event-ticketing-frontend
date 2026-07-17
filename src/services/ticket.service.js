import api from './http';

export const ticketAPI = {
  getTickets: (status = '') => api.get(`/api/tickets${status && status !== 'all' ? `?status=${status}` : ''}`),
  checkInTicket: (eventId, code) => api.patch(`/api/tickets/${eventId}/${code}/checkin`),
  updateTagTicket: (id, data) => api.patch(`/api/tickets/${id}/tag`, data),
};
