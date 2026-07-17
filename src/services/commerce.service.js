import api from './http';

export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  updateCart: (data) => api.patch('/api/cart', data),
  deleteCart: (data) => api.delete('/api/cart', { data }),
};

export const paymentAPI = { createPayment: () => api.post('/api/payment/midtrans') };
export const transactionAPI = {
  getTransactionHistory: () => api.get('/api/transactions'),
};
