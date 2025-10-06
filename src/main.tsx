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
            checkLoginIframe: false, // giảm lỗi dev
            redirectUri: currentUrl, // Sử dụng URL đã lưu
        });

        // Authentication successful - token available

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
