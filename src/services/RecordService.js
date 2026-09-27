// src/services/RecordService.js
// Fichas de atendimento preenchidas (sessões registradas a partir de um modelo).
import api from "./Api";

const RecordService = {
  criar: async (data) => {
    const response = await api.post("/records", data);
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/records/${id}`);
    return response.data;
  },

  listarPorPaciente: async (patientId) => {
    const response = await api.get(`/records/patient/${patientId}`);
    return response.data;
  },

  // Visão total do admin sobre todas as fichas registradas
  listarTodos: async () => {
    const response = await api.get("/records");
    return response.data;
  },
};

export default RecordService;
