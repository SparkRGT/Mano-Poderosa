import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  base: "/",
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: env?.VITE_API_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  }
});
