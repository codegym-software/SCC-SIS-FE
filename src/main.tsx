import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { keycloak } from "./keycloak";

async function bootstrap() {
  try {
    // init Keycloak, bắt buộc login trước khi render app
    const authenticated = await keycloak.init({
      onLoad: "login-required",
      pkceMethod: "S256",
      checkLoginIframe: false, // giảm lỗi dev
    });

    console.log("KC authenticated:", authenticated);
    console.log("access token:", keycloak.token);

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    console.error("Keycloak init error:", e);
  }
}

bootstrap();
