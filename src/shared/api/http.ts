// src/shared/api/http.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000', // Backend chạy trên port 7000
  timeout: 15000,
});

export default api;
