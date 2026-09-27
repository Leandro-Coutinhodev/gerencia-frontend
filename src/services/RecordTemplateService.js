// src/services/RecordTemplateService.js
// Modelos de ficha de atendimento (templates reutilizáveis com atividades + campos gerais).
import api from "./Api";

const RecordTemplateService = {
  listar: async () => {
    const response = await api.get("/record-templates");
    return response.data;
  },

  // Modelos ativos do profissional autenticado — usado ao iniciar uma nova ficha
  listarAtivosDoProfissional: async () => {
    const response = await api.get("/record-templates/active");
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/record-templates/${id}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post("/record-templates", data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/record-templates/${id}`, data);
    return response.data;
  },

  // Soft delete: desativa o modelo
  desativar: async (id) => {
    const response = await api.delete(`/record-templates/${id}`);
    return response.data;
  },

  reativar: async (id) => {
    const response = await api.patch(`/record-templates/${id}/reactivate`);
    return response.data;
  },
};

export default RecordTemplateService;
