// src/services/PacientesService.js
import api from "./Api"; // supondo que você já tenha um axios configurado

const GuardiansService = {
  listarPorCpf: async (query) => {
    const response = await api.get(`/guardian/?cpf=${query}`);
    return response.data;
  }
};

export default GuardiansService;
