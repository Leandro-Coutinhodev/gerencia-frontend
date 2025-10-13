// src/services/AnamnesisService.js
import api from "./Api";

const AnamnesisService = {
  criar: async (anamneseId, dados, report = null) => {
    try {
      const formData = new FormData();
      
      // Adiciona os dados da anamnese como JSON
      formData.append("anamnesis", new Blob([JSON.stringify(dados)], {
        type: "application/json"
      }));
      
      // Adiciona o arquivo do relatório se existir
      if (report) {
        formData.append("report", report);
      }

      const response = await api.put(`/anamnesis/${anamneseId}/response`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar anamnese:", error);
      throw error;
    }
  },
  cadastrar: async (data) => {
    const response = await api.post("/anamnesis", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  listarPorPaciente: async (patientId) => {
    try {
      const response = await api.get(`/anamnesis/bypatient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao listar anamneses do paciente:", error);
      throw error;
    }
  },

  listar: async () => {
    try {
      const response = await api.get("/anamnesis");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar todas as anamneses:", error);
      throw error;
    }
  },

  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/anamnesis/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar anamnese:", error);
      throw error;
    }
  },

  atualizar: async (id, dados, report = null) => {
    try {
      const formData = new FormData();
      
      formData.append("anamnesis", new Blob([JSON.stringify(dados)], {
        type: "application/json"
      }));
      
      if (report) {
        formData.append("report", report);
      }

      const response = await api.put(`/anamnesis/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar anamnese:", error);
      throw error;
    }
  },
   buscarPorToken: async (token) => {
    try {
      const response = await api.get(`/anamnesis/form/${token}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar anamnese pelo token:", error);
      throw error;
    }
  },

  deletar: async (id) => {
    try {
      const response = await api.delete(`/anamnesis/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar anamnese:", error);
      throw error;
    }
  },
};

export default AnamnesisService;