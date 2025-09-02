// booker-app/src/services/api.js
import axios from "axios";

// Lis l’URL racine depuis Vite. Si vide en prod -> même domaine Heroku.
const envRoot = import.meta.env.VITE_API_URL || "";
const ROOT = envRoot ? envRoot.replace(/\/$/, "") : "";

// On ajoute /api une seule fois ici
const api = axios.create({
  baseURL: `${ROOT}/api`,
});

// Ajoute le token JWT si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 => nettoyage + redirection
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err && err.response && err.response.status === 401) {
      localStorage.removeItem("access_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
