// src/shared/api/http.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // đọc từ .env
  timeout: 15000,
});

export default api;
