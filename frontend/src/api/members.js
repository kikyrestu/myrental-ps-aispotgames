import { api } from './client';

export const membersApi = {
  list: () => api.get('/members'),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  addTime: (id, minutes, amount = 0, payment_method = 'cash') => api.post(`/members/${id}/add-time`, { minutes, amount, payment_method }),
};
