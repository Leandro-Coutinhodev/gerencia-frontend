// src/services/PatientsService.js
import api from "./Api";

const PatientsService = {
  listar: async () => {
    const response = await api.get("/patient");
    return response.data;
  },

  buscarPorCpf: async (cpf) => {
    try {
      const response = await api.get(`/patient/search/cpf?cpf=${cpf}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar paciente por CPF:", error);
      throw error;
    }
  },

  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/patient/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar paciente por id:", error);
      throw error;
    }
  },

  // ✅ CORRIGIDO: Removido o Content-Type para permitir multipart/form-data
  cadastrar: async (formData) => {
    const response = await api.post("/patient", formData);
    // O navegador define automaticamente Content-Type: multipart/form-data
    return response.data;
  },

  // ✅ CORRIGIDO: Removido o Content-Type para permitir multipart/form-data
  atualizar: async (id, formData) => {
    const response = await api.put(`/patient/${id}`, formData);
    return response.data;
  },

  deletar: async (id) => {
    await api.delete(`/patient/${id}`);
  },

  buscarPorNome: async (nome) => {
    try {
      const response = await api.get(`/patient/search/name?nome=${nome}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
      throw error;
    }
  },

  buscarPorResponsavel: async (guardianId) => {
    try {
      const response = await api.get(`/patient/guardian/${guardianId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
      throw error;
    }
  },
 buscarPorNomeOuCpf: async (termo) => {
  try {
    const response = await api.get(`/patient/search`, {
      params: { query: termo }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    throw error;
  }
},}

;

export default PatientsService;