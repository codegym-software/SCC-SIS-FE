import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
    url: "https://id.dev.codegym.vn/auth",
    realm: "codegym-software-nhom-5",
    clientId: "sis-fe",
});
