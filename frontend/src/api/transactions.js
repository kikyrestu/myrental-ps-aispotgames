import { api } from './client';

export const transactionsApi = {
  list: (dateFrom, dateTo) => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    const qs = params.toString();
    return api.get(`/transactions${qs ? `?${qs}` : ''}`);
  },
  getDetails: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
};

export const packagesApi = {
  list: () => api.get('/packages'),
};
