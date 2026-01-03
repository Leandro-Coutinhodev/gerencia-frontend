import axios from "axios";
import { jwtDecode } from "jwt-decode";
import config from "../config/Config";

 const host = config.URLS.HOST;

const api = axios.create({
  baseURL: `${host}/api-gateway/gerencia`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const isLogin = config.url.includes("/login");

    if (token && !isLogin) {
      try {
        const decoded = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp < now) {
          localStorage.removeItem("token");
          
          // Disparar evento customizado para alerta de sessão expirada
          window.dispatchEvent(new CustomEvent('showGlobalAlert', {
            detail: {
              type: 'error',
              message: 'Sessão expirada. Faça login novamente.'
            }
          }));
          
          window.location.href = "/";
          return Promise.reject(new Error("Token expirado"));
        }

        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error("Erro ao decodificar token:", err);
        localStorage.removeItem("token");
        
        window.dispatchEvent(new CustomEvent('showGlobalAlert', {
          detail: {
            type: 'error',
            message: 'Erro de autenticação. Faça login novamente.'
          }
        }));
        
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