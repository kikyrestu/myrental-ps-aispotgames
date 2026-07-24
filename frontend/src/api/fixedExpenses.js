import { api } from "./client";

export const fixedExpensesApi = {
  list: async () => {
    const res = await api.get("/fixed-expenses");
    return res;
  },
  
  create: async (data) => {
    const res = await api.post("/fixed-expenses", data);
    return res;
  },

  delete: async (id) => {
    const res = await api.delete(`/fixed-expenses/${id}`);
    return res;
  }
};
