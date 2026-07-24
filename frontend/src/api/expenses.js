import { api } from './client';

export const expensesApi = {
  list: async (shiftId = null) => {
    const url = shiftId ? `/expenses?shift_id=${shiftId}` : '/expenses';
    return await api.get(url);
  },
  
  create: async (expenseData) => {
    return await api.post('/expenses', expenseData);
  }
};
