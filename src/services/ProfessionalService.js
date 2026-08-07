import api from "./Api";

const ProfessionalService = {
  getAll: async () => {
    const response = await api.get("/professional");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/professional/${id}`);
    return response.data;
  },
};

export default ProfessionalService;