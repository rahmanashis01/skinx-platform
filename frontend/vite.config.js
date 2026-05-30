import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const skinxBlue = "#1e3a8a";
const appBackground = "#f8fbff";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeManifestIcons: false,
      manifest: {
        name: "skinX - skin Cancer Detector",
        short_name: "skinX",
        description:
          "AI-assisted skin image screening and skin-health assistant",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: skinxBlue,
        background_color: appBackground,
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/maskable-icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        globPatterns: [
          "assets/**/*.{js,css,png,svg,jpg,jpeg,webp,woff2}",
          "icons/*.png",
          "favicon.svg",
          "icons.svg",
          "logo.png",
          "offline.html",
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /^\/(?:api\/|telegram\/|uploads?\/|uploaded-photos?\/|scan-results?\/|user\/|profile\/)/.test(
                url.pathname,
              ),
            handler: "NetworkOnly",
            method: "GET",
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              /^\/(?:api\/|telegram\/|uploads?\/|uploaded-photos?\/|scan-results?\/|user\/|profile\/)/.test(
                url.pathname,
              ),
            handler: "NetworkOnly",
            method: "POST",
          },
          {
            urlPattern: ({ url, request }) =>
              url.origin === self.location.origin &&
              !/^\/(?:api\/|telegram\/|uploads?\/|uploaded-photos?\/|scan-results?\/|user\/|profile\/)/.test(
                url.pathname,
              ) &&
              (url.pathname.startsWith("/assets/") ||
                url.pathname.startsWith("/icons/") ||
                url.pathname === "/favicon.svg" ||
                url.pathname === "/icons.svg" ||
                url.pathname === "/logo.png") &&
              ["font", "image", "script", "style"].includes(
                request.destination,
              ),
            handler: "CacheFirst",
            options: {
              cacheName: "skinx-static-assets",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              url.origin === self.location.origin &&
              request.mode === "navigate" &&
              !/^\/(?:api\/|telegram\/|uploads?\/|uploaded-photos?\/|scan-results?\/|user\/|profile\/)/.test(
                url.pathname,
              ),
            handler: "NetworkOnly",
            options: {
              precacheFallback: {
                fallbackURL: "/offline.html",
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0", // Expose to local network (all interfaces)
    port: 5173,
    strictPort: false,
    hmr: {
      protocol: "ws",
      host: "localhost", // Will be overridden by actual host when accessed remotely
    },
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:5001",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
