import { api } from './client';

export const unitsApi = {
  list: () => api.get('/units'),
  create: (data) => api.post('/units', data),
  update: (id, data) => api.put(`/units/${id}`, data),
  updateStatus: (id, status) => api.patch(`/units/${id}/status`, { status }),
  remove: (id) => api.delete(`/units/${id}`),
};
