import api, { multipartConfig } from './http';

export const feedbackAPI = {
  getAllFeedback: () => api.get('/api/feedback/all'),
  getMyFeedback: () => api.get('/api/feedback/mine'),
  createFeedback: (formData) => api.post('/api/feedback/', formData, multipartConfig()),
  updateFeedbackStatus: (id, data) => api.put(`/api/feedback/detail/${id}/status`, data),
};
