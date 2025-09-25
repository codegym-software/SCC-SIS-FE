// src/keycloak.ts
import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
    url: "https://id.dev.codegym.vn/auth",
    realm: "codegym-software-nhom-5",
    clientId: "sis-fe",
});

// Helper: luôn chắc token còn hạn trước khi dùng
export async function ensureValidToken(minSeconds = 30): Promise<string | null> {
    try {
        if (!keycloak.authenticated) return null;
        await keycloak.updateToken(minSeconds); // refresh nếu sắp hết hạn
        return keycloak.token ?? null;
    } catch {
        // nếu refresh lỗi -> yêu cầu login lại
        await keycloak.login();
        return null;
    }
}
