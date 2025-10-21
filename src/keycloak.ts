// src/keycloak.ts
import Keycloak from 'keycloak-js';

// Lazy initialization - chỉ tạo Keycloak instance khi cần thiết
let keycloakInstance: Keycloak | null = null;

export const keycloak = new Proxy({} as Keycloak, {
    get(target, prop) {
        // Check if we're in development mode
        const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isDevelopment) {
            // Return mock methods for development
            if (prop === 'init') {
                return async () => true;
            }
            if (prop === 'login') {
                return async () => {};
            }
            if (prop === 'logout') {
                return async () => {};
            }
            if (prop === 'updateToken') {
                return async () => true;
            }
            if (prop === 'authenticated') {
                return true;
            }
            if (prop === 'token') {
                return (window as any).token || 'dev-mock-token';
            }
            if (prop === 'tokenParsed') {
                return {
                    sub: 'dev-user-id',
                    email: 'dev@example.com',
                    preferred_username: 'dev-user',
                    authorities: ['SUPER_ADMIN']
                };
            }
            return undefined;
        }
        
        // Production mode: lazy initialize real Keycloak
        if (!keycloakInstance) {
            keycloakInstance = new Keycloak({
                url: 'https://id.dev.codegym.vn/auth',
                realm: 'codegym-software-nhom-5',
                clientId: 'sis-fe',
            });
        }
        
        return keycloakInstance[prop as keyof Keycloak];
    }
});

// Helper: luôn chắc token còn hạn trước khi dùng
export async function ensureValidToken(minSeconds = 30): Promise<string | null> {
    // Check if we're in development mode
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
        return (window as any).token || 'dev-mock-token';
    }
    
    if (!keycloak.authenticated) {
        return null;
    }

    try {
        await keycloak.updateToken(minSeconds);
        return keycloak.token ?? null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        await keycloak.login();
        return keycloak.token ?? null;
    }
}
