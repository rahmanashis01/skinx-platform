import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
