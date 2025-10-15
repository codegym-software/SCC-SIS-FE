import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { keycloak } from './keycloak';
import './index.css';

async function bootstrap() {
    try {
        // Lưu URL hiện tại trước khi Keycloak init
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

        ReactDOM.createRoot(document.getElementById('root')!).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
        );
    } catch (e) {
        console.error('Keycloak init error:', e);
    }
}

bootstrap();
