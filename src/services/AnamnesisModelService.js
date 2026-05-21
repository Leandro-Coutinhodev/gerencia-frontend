import api from "./Api";

const AnamnesisModelService = {

  // Lista todos os templates ativos
  async getAll() {
    const response = await api.get("/anamnesis/templates");
    return response.data;
  },

  // Busca um template pelo ID (com campos)
  async getById(id) {
    const response = await api.get(`/anamnesis/templates/${id}`);
    return response.data;
  },

  // Cria um novo template com seus campos
  async create(templateData) {
    const response = await api.post("/anamnesis/templates", templateData);
    return response.data;
  },

  // Atualiza um template existente e seus campos
  async update(id, templateData) {
    const response = await api.put(`/anamnesis/templates/${id}`, templateData);
    return response.data;
  },

  // Soft delete: desativa o template
  async deactivate(id) {
    const response = await api.delete(`/anamnesis/templates/${id}`);
    return response.data;
  },

  // Reativa um template desativado
  async reactivate(id) {
    const response = await api.patch(`/anamnesis/templates/${id}/reactivate`);
    return response.data;
  },
};

export default AnamnesisModelService;