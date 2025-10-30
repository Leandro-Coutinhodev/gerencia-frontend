import api from "./Api"; // sua instância do Axios já com baseURL configurada

const AssistantService = {
  // Lista todos os assistentes
  async getAll() {
    const response = await api.get("/assistant");
    return response.data;
  },

  // Busca um assistente pelo ID
  async getById(id) {
    const response = await api.get(`/assistant/${id}`);
    return response.data;
  },

  // Cria um novo assistente (multipart/form-data)
  async create(formData) {
    const response = await api.post("/assistant", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Atualiza um assistente existente
  async update(id, formData) {
    const response = await api.put(`/assistant/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Deleta um assistente
  async delete(id) {
    const response = await api.delete(`/assistant/${id}`);
    return response.data;
  },

  // Confirma o encaminhamento de uma anamnese
  async confirmarEncaminhamento(data) {
    const response = await api.post("/anamnesis/encaminhamento/confirmar", data);
    return response.data;
  },
};

export default AssistantService;
