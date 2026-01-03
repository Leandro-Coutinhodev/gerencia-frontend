// src/services/SecretaryService.js
import api from "./Api";

const SecretaryService = {
  listar: async () => {
    try {
      const response = await api.get("/secretary");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar secretárias:", error);
      throw error;
    }
  },

  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/secretary/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar secretária por ID:", error);
      throw error;
    }
  },

  cadastrar: async (secretary) => {
    try {
      const response = await api.post("/secretary", secretary);
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar secretária:", error);
      throw error;
    }
  },

  atualizar: async (id, secretary) => {
    try {
      const response = await api.put(`/secretary/${id}`, secretary);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar secretária:", error);
      throw error;
    }
  },

  deletar: async (id) => {
    try {
      await api.delete(`/secretary/${id}`);
    } catch (error) {
      console.error("Erro ao deletar secretária:", error);
      throw error;
    }
  },
};

export default SecretaryService;