import Keycloak from "keycloak-js";

const keycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL || "https://id.dev.codegym.vn/auth",
    realm: import.meta.env.VITE_KEYCLOAK_REALM || "codegym-software-nhom-5",
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "sis-fe",
};

export const keycloak = new Keycloak(keycloakConfig);

// Cấu hình redirect URI cố định
keycloak.redirectUri = "http://localhost:5173";
