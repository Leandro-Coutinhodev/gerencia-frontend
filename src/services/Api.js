// src/services/Api.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "http://localhost:8080/api-gateway/gerencia",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Evita adicionar o token em requisições para login
    const isLogin = config.url.includes("/login");

    if (token && !isLogin) {
      try {
        const decoded = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000); // em segundos

        if (decoded.exp < now) {
          // Token expirado
          localStorage.removeItem("token");
          window.alert("Sessão expirada. Faça login novamente.");
          window.location.href = "/";
          return Promise.reject(new Error("Token expirado"));
        }

        // Token válido, adiciona no header
        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error("Erro ao decodificar token:", err);
        localStorage.removeItem("token");
        window.alert("Erro de autenticação. Faça login novamente.");
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
