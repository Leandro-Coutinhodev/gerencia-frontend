// src/services/AppointmentService.js
// Agendamentos (únicos e recorrentes) e agenda/calendário.
import api from "./Api";

const AppointmentService = {
  criar: async (data) => {
    const response = await api.post("/appointments", data);
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  listar: async (params) => {
    const response = await api.get("/appointments", { params });
    return response.data;
  },

  // scope: "THIS" | "FROM_HERE" | "ALL"
  cancelar: async (id, { scope, frequencyId }) => {
    const response = await api.patch(`/appointments/${id}/cancel`, { scope, frequencyId });
    return response.data;
  },

  // Todas as ocorrências (frequências) no período — alimenta o calendário mensal
  calendario: async (params) => {
    const response = await api.get("/appointments/calendar", { params });
    return response.data;
  },

  // Resumo do período (dashboard) — sempre calculado a partir dos dados reais
  resumo: async (params) => {
    const response = await api.get("/appointments/summary", { params });
    return response.data;
  },
};

export default AppointmentService;
