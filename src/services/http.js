import axios from 'axios';
import { readStoredToken } from '../utils/users/sessionUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const multipartConfig = () => ({
  headers: { 'Content-Type': 'multipart/form-data' },
});

export default api;
