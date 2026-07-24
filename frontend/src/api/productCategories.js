import { api } from './client';

export const productCategoriesApi = {
  list: async () => {
    return await api.get('/product-categories');
  },
  
  create: async (data) => {
    return await api.post('/product-categories', data);
  },
  
  update: async (id, data) => {
    return await api.put(`/product-categories/${id}`, data);
  },
  
  delete: async (id) => {
    return await api.delete(`/product-categories/${id}`);
  }
};
