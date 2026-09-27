// src/services/ActivityService.js
// Banco de atividades reutilizáveis por profissional.
import api from "./Api";

const ActivityService = {
  listar: async () => {
    const response = await api.get("/activities");
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post("/activities", data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/activities/${id}`, data);
    return response.data;
  },

  alterarStatus: async (id, active) => {
    const response = await api.patch(`/activities/${id}/status`, { active });
    return response.data;
  },
};

export default ActivityService;
