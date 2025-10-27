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
    
    if (token) {
        if (!config.headers) {
            config.headers = {} as any;
        }
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ========== RESPONSE INTERCEPTOR ==========
api.interceptors.response.use(
    (res) => res,
    async (err: AxiosError<any>) => {
        const status = err.response?.status;

        if (status === 401) {
            try {
                await keycloak.login();
            } catch (loginError) {
                console.error('Login redirect failed:', loginError);
            }
        }

        // Format error message from backend
        if (err.response?.data) {
            const backendMessage = err.response.data.message || err.response.data.error;
            if (backendMessage) {
                err.message = backendMessage;
            }
        }

        return Promise.reject(err);
    },
);

export default api;
