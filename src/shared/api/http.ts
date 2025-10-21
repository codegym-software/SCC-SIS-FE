// src/shared/api/http.ts
import axios, { AxiosError } from 'axios';
import { ensureValidToken, keycloak } from '../../keycloak';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000', // fallback nếu không có env
    timeout: 15000,
});

// ========== REQUEST INTERCEPTOR ==========
api.interceptors.request.use(async (config) => {
    // Check if we're in development mode
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
        // Use mock token in development
        const mockToken = (window as any).token || 'dev-mock-token';
        if (!config.headers) {
            config.headers = {} as any;
        }
        config.headers.Authorization = `Bearer ${mockToken}`;
        return config;
    }
    
    // Production mode: Use real Keycloak
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
    async (err: AxiosError) => {
        const status = err.response?.status;
        const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (status === 401 && !isDevelopment) {
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
