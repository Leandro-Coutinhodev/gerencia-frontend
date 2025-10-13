import api from "./Api";

const LoginService = {
  login: async (cpf, password) => {
    try {
      const response = await api.post("/login", { cpf, password});

      const token = response.data.accessToken;
      localStorage.setItem("token", token);

      return token;
    } catch (error) {

      throw error;
    }
  },
};

export default LoginService;
