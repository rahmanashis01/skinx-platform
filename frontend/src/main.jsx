import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { registerSW } from "virtual:pwa-register";

const domain =
  import.meta.env.VITE_AUTH0_DOMAIN || "skinx-development.us.auth0.com";
const clientId =
  import.meta.env.VITE_AUTH0_CLIENT_ID || "Dh2Gw3LOXTc46akSj0uSTbxROCvV5gDR";
const redirectUri = import.meta.env.VITE_FRONTEND_URL
  ? `${import.meta.env.VITE_FRONTEND_URL}/callback`
  : `${window.location.origin}/callback`;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: redirectUri,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE || "https://skinx-api",
          scope: "openid profile email",
        }}
      >
        <App />
      </Auth0Provider>
    </ErrorBoundary>
  </StrictMode>,
);

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    setInterval(
      () => {
        registration.update();
      },
      60 * 60 * 1000,
    );
  },
  onRegisterError(error) {
    console.error("PWA service worker registration failed:", error);
  },
});
