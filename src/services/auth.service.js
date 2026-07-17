import api, { multipartConfig } from './http';

export const authAPI = {
  register: (formData) => api.post('/api/auth/register', formData, multipartConfig()),
  login: (credentials) => api.post('/api/auth/login', credentials),
};
