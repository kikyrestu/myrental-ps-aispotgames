import { api } from './client';

export const sessionsApi = {
  list: (status) => api.get(status ? `/sessions?status=${status}` : '/sessions'),
  start: (data) => api.post('/sessions', data),
  extend: (id, extraMinutes) => api.put(`/sessions/${id}/extend`, { extra_minutes: extraMinutes }),
  complete: async (id, paymentMethod, promoCode, notes, saveTime, kasbonPersonName, assignMemberId) => {
    return await api.put(`/sessions/${id}/complete`, { 
      payment_method: paymentMethod, 
      promo_code: promoCode, 
      notes, 
      save_time: saveTime,
      kasbon_person_name: kasbonPersonName,
      assign_member_id: assignMemberId
    });
  },
  cancel: (id) => api.delete(`/sessions/${id}`),
};
