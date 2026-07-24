import { api } from './client';

export const debtsApi = {
  list: async () => {
    return await api.get('/debts');
  },
  
  create: async (debtData) => {
    return await api.post('/debts', debtData);
  },
  
  pay: async (id) => {
    return await api.put(`/debts/${id}/pay`);
  },
  
  remove: async (id) => {
    return await api.delete(`/debts/${id}`);
  }
};
