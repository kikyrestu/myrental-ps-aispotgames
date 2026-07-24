import { api } from './client';

export const consoleTypesApi = {
  list: () => api.get('/console-types'),
  create: (data) => api.post('/console-types', data),
  update: (id, data) => api.put(`/console-types/${id}`, data),
  remove: (id) => api.delete(`/console-types/${id}`),
};
