import { api } from "./client";

export const settingsApi = {
  get: async () => {
    return await api.get("/settings");
  },
  
  update: async (data) => {
    return await api.put("/settings", data);
  }
};
