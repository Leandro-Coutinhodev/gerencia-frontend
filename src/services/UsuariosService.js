import api from "./Api";

const UsuariosService = {
  listar: async () => {
    try {
      const response = await api.get("/user");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cadastrar: async (tipo, formData) => {
    try {
      const response = await api.post(`/${tipo}`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  atualizar: async (tipo, id, formData) => {
    try {
      const response = await api.put(`/${tipo}/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletar: async (tipo, id) => {
    try {
      const response = await api.delete(`/${tipo}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default UsuariosService;
