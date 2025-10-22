import api from "./Api";

const UsuariosService = {
  listar: async () => {
    try {
      const response = await api.get("/user");

      const usuarios = response.data;

      return usuarios;
    } catch (error) {

      throw error;
    }
  },
  cadastrar: async (tipo, formData) => {
    try {
      const response = await api.post(`/${tipo}`, formData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  atualizar: async (tipo, id, formData) => {
  return api.put(`/${tipo}/${id}`, formData);
},
deletar: async (tipo, id) => {
  try {
    const response = await api.delete(`/${tipo}/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
},


};

export default UsuariosService;
