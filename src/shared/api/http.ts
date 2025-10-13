// src/shared/api/http.ts
import axios, { AxiosError } from 'axios';
import { ensureValidToken, keycloak } from '../../keycloak';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000', // fallback nếu không có env
    timeout: 15000,
});

// ========== REQUEST INTERCEPTOR ==========
api.interceptors.request.use(async (config) => {
    const token = await ensureValidToken(30);

    // Build URL hiển thị đẹp để log
    const fullUrl = (config.baseURL ?? '') + (config.url?.startsWith('/') ? config.url : `/${config.url ?? ''}`);
    
    console.log('API Request:', fullUrl);
    console.log('Token available:', !!token);

    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set');
    } else {
        console.warn('No token available for request:', fullUrl);
    }

    return config;
});

// ========== RESPONSE INTERCEPTOR ==========
api.interceptors.response.use(
    (res) => {
        console.log('API Response Success:', res.config.url, res.status);
        return res;
    },
    async (err: AxiosError) => {
        const cfg: any = err.config || {};
        const fullUrl = (cfg.baseURL ?? '') + (cfg.url?.startsWith('/') ? cfg.url : `/${cfg.url ?? ''}`);

        const status = err.response?.status;
        const data = err.response?.data;

        // Log error without sensitive data
        console.error(`HTTP Error ${status}: ${fullUrl}`);
        console.error('Error details:', data);

        // Nếu 401: điều hướng login lại cho tiện
        if (status === 401) {
            console.warn('401 Unauthorized - redirecting to login');
            try {
                await keycloak.login();
            } catch (loginError) {
                console.error('Login redirect failed:', loginError);
            }
        }

        return Promise.reject(err);
    },
);

export default api;
