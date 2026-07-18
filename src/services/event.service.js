import api, { multipartConfig } from './http';

export const eventAPI = {
  getApprovedEvents: () => api.get('/api/events?status=approved'),
  getEvent: (id) => api.get(`/api/event/${id}`),
  getEventsPopular: () => api.get('/api/events/popular'),
  getMyEvents: () => api.get('/api/events/my-events'),
  createEvent: (formData) => api.post('/api/events', formData, multipartConfig()),
  updateEvent: (id, formData) => api.put(`/api/events/${id}`, formData, multipartConfig()),
  getPendingEvents: () => api.get('/api/events/all'),
  verifyEvent: (id, status) => api.patch(`/api/events/${id}/verify`, status),
  getEventReport: (eventId) => api.get(`/api/events/${eventId}/report`),
  downloadEventReport: (eventId) => api.get(`/api/events/${eventId}/report/download`, { responseType: 'blob' }),
  likeEvent: (eventId) => api.post(`/api/events/${eventId}/like`),
  getMyLikedEvents: () => api.get('/api/events/like'),
};
