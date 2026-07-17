import api, { multipartConfig } from './http';

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (formData) => api.put('/api/users/profile', formData, multipartConfig()),
  getAllOrganizers: () => api.get('/api/users?role=organizer'),
  verifyOrganizer: (id, status) => api.post(`/api/users/${id}/verify`, status),
  getUserById: (id) => api.get(`/api/users/${id}`),
};
