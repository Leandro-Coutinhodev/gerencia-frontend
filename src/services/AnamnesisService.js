// src/services/AnamnesisService.js
import api from "./Api";

const AnamnesisService = {
  // src/services/AnamnesisService.js
  criar: async (anamneseId, dados, reports = []) => {
    try {
      const formData = new FormData();

      // Dados da anamnese em JSON
      formData.append(
        "anamnesis",
        new Blob([JSON.stringify(dados)], { type: "application/json" })
      );

      // Anexa múltiplos arquivos (se houver)
      if (Array.isArray(reports) && reports.length > 0) {
        reports.forEach((file) => {
          formData.append("reports", file); // ⚠️ plural, igual ao backend
        });
      }

      const response = await api.put(
        `/anamnesis/${anamneseId}/response`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

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
  async sendReferral(data) {
  return api.post("/anamnesis/referral", data);
},
assignAssistantToReferral: async (referralId, assistantId) => {
    return api.put(`/anamnesis/referral/${referralId}/assign-assistant`, {
      assistantId: assistantId
    });
  
}
};

export default AnamnesisService;