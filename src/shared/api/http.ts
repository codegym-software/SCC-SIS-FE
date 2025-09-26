// src/shared/api/http.ts
import axios, { AxiosError } from "axios";
import { ensureValidToken, keycloak } from "../../keycloak";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000', // fallback nếu không có env
  timeout: 15000,
});

// ========== REQUEST INTERCEPTOR ==========
api.interceptors.request.use(async (config) => {
  const token = await ensureValidToken(30);

  // Build URL hiển thị đẹp để log
  const fullUrl =
    (config.baseURL ?? "") +
    (config.url?.startsWith("/") ? config.url : `/${config.url ?? ""}`);

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any)["Authorization"] = `Bearer ${token}`;
    console.log(
      `%c[HTTP:REQ]`,
      "color:#2563eb",
      config.method?.toUpperCase(),
      fullUrl,
      "(auth ok)"
    );
  } else {
    console.warn(
      `%c[HTTP:REQ]`,
      "color:#f59e0b",
      config.method?.toUpperCase(),
      fullUrl,
      "(no token)"
    );
  }

  return config;
});

// ========== RESPONSE INTERCEPTOR ==========
api.interceptors.response.use(
  (res) => {
    const fullUrl =
      (res.config.baseURL ?? "") +
      (res.config.url?.startsWith("/") ? res.config.url : `/${res.config.url ?? ""}`);
    console.log(
      `%c[HTTP:RES]`,
      "color:#16a34a",
      res.status,
      res.statusText,
      fullUrl
    );
    return res;
  },
  async (err: AxiosError) => {
    const cfg: any = err.config || {};
    const fullUrl =
      (cfg.baseURL ?? "") + (cfg.url?.startsWith("/") ? cfg.url : `/${cfg.url ?? ""}`);

    const status = err.response?.status;
    const data = err.response?.data;

    console.error(
      `%c[HTTP:ERR]`,
      "color:#dc2626",
      status,
      fullUrl,
      "\n→ data:",
      data
    );

    // Nếu 401: điều hướng login lại cho tiện
    if (status === 401) {
      try {
        await keycloak.login();
      } catch { }
    }

    return Promise.reject(err);
  }
);

export default api;
