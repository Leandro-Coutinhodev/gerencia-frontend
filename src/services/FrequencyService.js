// src/services/FrequencyService.js
// Frequência: cada ocorrência concreta de atendimento e o registro de presença/ausência.
import api from "./Api";

const FrequencyService = {
  listar: async (params) => {
    const response = await api.get("/frequencies", { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/frequencies/${id}`);
    return response.data;
  },

  // status: AGENDADO | PRESENTE | AUSENTE | JUSTIFICADO | CANCELADO
  atualizarStatus: async (id, data) => {
    const response = await api.patch(`/frequencies/${id}/status`, data);
    return response.data;
  },
};

export default FrequencyService;
