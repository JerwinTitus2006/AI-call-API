import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 30000,
});

// Attach JWT to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vs_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("vs_token");
      localStorage.removeItem("vs_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
