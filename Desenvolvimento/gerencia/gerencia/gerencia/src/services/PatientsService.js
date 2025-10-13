// src/services/PacientesService.js
import api from "./Api"; // supondo que você já tenha um axios configurado

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


  cadastrar: async (paciente) => {
    const response = await api.post("/patient", paciente, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  atualizar: async (id, paciente) => {
    const response = await api.put(`/patient/${id}`, paciente, {
      headers: { "Content-Type": "application/json" },
    });
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
};

export default PatientsService;
