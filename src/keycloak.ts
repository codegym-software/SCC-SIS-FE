// src/keycloak.ts
import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
    url: "https://id.dev.codegym.vn/auth",
    realm: "codegym-software-nhom-5",
    clientId: "sis-fe",
});

// Helper: luôn chắc token còn hạn trước khi dùng
export async function ensureValidToken(minSeconds = 30): Promise<string | null> {
    if (!keycloak.authenticated) {
        return null;
    }

    try {
        const refreshed = await keycloak.updateToken(minSeconds);
        if (refreshed) {
            console.log("Token refreshed");
        } else {
            console.log("Token is still valid");
        }
        return keycloak.token;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        await keycloak.login();
        return keycloak.token;
    }
}
