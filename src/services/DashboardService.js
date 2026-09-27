import api from "./Api";

const DashboardService = {
  getDashboardGeral: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },
};

export default DashboardService;
