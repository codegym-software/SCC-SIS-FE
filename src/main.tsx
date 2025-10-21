import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { keycloak } from './keycloak';
import './index.css';

async function bootstrap() {
    try {
        // Force development mode for local development
        const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        console.log('🔍 Debug info:', {
            'import.meta.env.DEV': import.meta.env.DEV,
            'window.location.hostname': window.location.hostname,
            'isDevelopment': isDevelopment,
            'NODE_ENV': import.meta.env.MODE
        });
        
        if (isDevelopment) {
            console.log('🚀 Development mode: Bypassing Keycloak authentication');
            
            // Mock authentication for development - using valid JWT format
            const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci1pZCIsImVtYWlsIjoiZGV2QGV4YW1wbGUuY29tIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZGV2LXVzZXIiLCJhdXRob3JpdGllcyI6WyJTVVBFUl9BRE1JTiJdLCJleHAiOjk5OTk5OTk5OTl9.Z6qja-kOzUNb78r532EOke4C1FZdl99Va1qDvBN06FU';
            
            (window as any).token = mockJWT;
            (window as any).keycloak = {
                authenticated: true,
                token: mockJWT,
                tokenParsed: {
                    sub: 'dev-user-id',
                    email: 'dev@example.com',
                    preferred_username: 'dev-user',
                    authorities: ['SUPER_ADMIN']
                }
            };
            
            // Fetch user profile after mock authentication
            import('./stores/userProfile').then(({ useUserProfile }) => {
                useUserProfile.getState().fetchMe();
            });

            ReactDOM.createRoot(document.getElementById('root')!).render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>,
            );
            return;
        }

        // Production mode: Use real Keycloak
        const currentUrl = window.location.href;

        // init Keycloak, bắt buộc login trước khi render app
        const authenticated = await keycloak.init({
            onLoad: 'login-required',
            pkceMethod: 'S256',
            checkLoginIframe: false,
            redirectUri: currentUrl,
        });

        if (!authenticated || !keycloak.token) {
            await keycloak.login();
            return;
        }

        // 🔑 Token for Postman testing
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 TOKEN FOR POSTMAN:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(keycloak.token);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Expose token to window
        (window as any).token = keycloak.token;

        // Fetch user profile after Keycloak is ready
        import('./stores/userProfile').then(({ useUserProfile }) => {
            useUserProfile.getState().fetchMe();
        });

        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
        );
    } catch (e) {
        console.error('Keycloak init error:', e);
        
        // Fallback: Render app without authentication in development
        if (import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('🔄 Fallback: Rendering app without authentication');
            
            const fallbackJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWxsYmFjay11c2VyLWlkIiwiZW1haWwiOiJmYWxsYmFja0BleGFtcGxlLmNvbSIsInByZWZlcnJlZF91c2VybmFtZSI6ImZhbGxiYWNrLXVzZXIiLCJhdXRob3JpdGllcyI6WyJTVVBFUl9BRE1JTiJdLCJleHAiOjk5OTk5OTk5OTl9.QwcXKOLeJ8crSJRhlPDGeOd2tBtyf_DXCZYIEUOeGhQ';
            
            (window as any).token = fallbackJWT;
            (window as any).keycloak = {
                authenticated: true,
                token: fallbackJWT,
                tokenParsed: {
                    sub: 'fallback-user-id',
                    email: 'fallback@example.com',
                    preferred_username: 'fallback-user',
                    authorities: ['SUPER_ADMIN']
                }
            };

            ReactDOM.createRoot(document.getElementById('root')!).render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>,
            );
        }
    }
}

bootstrap();
