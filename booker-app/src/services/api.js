import axios from "axios";

// URL racine de l’API :
// - en dev: http://localhost:5000  (via .env.development)
// - en prod: même domaine Heroku où l’app est servie (via .env.production vide)
// On enlève le / final s'il existe
const ROOT = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// IMPORTANT: on ajoute automatiquement le préfixe /api ici
const api = axios.create({
  baseURL: `${ROOT}/api`,
});

// Ajout du token JWT si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion 401: on nettoie et on renvoie vers /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("access_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
