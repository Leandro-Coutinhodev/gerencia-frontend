// src/services/AnamnesisService.js
import api from "./Api";

const AnamnesisService = {
  // Criar/Atualizar anamnese (usado no fluxo autenticado)
  criar: async (anamneseId, dados, reports = []) => {
    try {
      const formData = new FormData();

      formData.append(
        "anamnesis",
        new Blob([JSON.stringify(dados)], { type: "application/json" })
      );

      if (Array.isArray(reports) && reports.length > 0) {
        reports.forEach((file) => {
          formData.append("reports", file);
        });
      }

      const response = await api.put(`/anamnesis/${anamneseId}/response`, formData);
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar anamnese:", error);
      throw error;
    }
  },

  // ✅ NOVO: Método para responder anamnese via formulário público
  responderAnamnese: async (id, formData) => {
    try {
      const response = await api.put(`/anamnesis/${id}/response`, formData);
      return response.data;
    } catch (error) {
      console.error("Erro ao responder anamnese:", error);
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

      const response = await api.put(`/anamnesis/${id}`, formData);
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

  sendReferral: async (data) => {
    return api.post("/anamnesis/referral", data);
  },

  assignAssistantToReferral: async (referralId, assistantId) => {
    return api.put(`/anamnesis/referral/${referralId}/assign-assistant`, {
      assistantId: assistantId
    });
  },

  getReferralByAnamnesis: async (anamnesisId) => {
    const response = await api.get(`/anamnesis/${anamnesisId}/referral`);
    return response.data;
  },

  assignAssistant: async (referralId, assistantId) => {
    return api.put(`/anamnesis/referral/${referralId}/assign-assistant`, {
      assistantId,
    });
  },

  assignAssistantEmail: async (referralId, assistantId) => {
    return api.put(`/anamnesis/referral/${referralId}/assign-assistant/mail`, {
      assistantId,
    });
  },

  listarReferral: async (assistantId) => {
    try {
      const response = await api.get(`/anamnesis/referral/findByAssistant/${assistantId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao listar todas as anamneses:", error);
      throw error;
    }
  },

  listarHistorico: async (patientId) => {
    const response = await api.get(`/anamnesis/referral/${patientId}`);
    return response.data;
  },

  relReferral: async (referralId) => {
    try {
      const response = await api.get(`/anamnesis/referral/findById/${referralId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao listar todas as anamneses:", error);
      throw error;
    }
  },
  listAllReferral: async () => {
    try {
      const response = await api.get("/anamnesis/referral/findall");
      return response.data;
    } catch (error) {
      console.error("Erro ao listar todas as anamneses:", error);
      throw error;
    }
  },
};

export default AnamnesisService;