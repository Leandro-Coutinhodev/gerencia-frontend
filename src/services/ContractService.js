import api from "./Api";

const ContractService = {

  create: async (data) => {
    try {
      const response = await api.post("/contract", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getByToken: async (token) => {
    try {
      const response = await api.get(`/contract/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sign: async (token) => {
    try {
      const response = await api.post(`/contract/${token}/accept`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
   listAll: async () => {
    try {
      const response = await api.get("/contract");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

};

export default ContractService;
