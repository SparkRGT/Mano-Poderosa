import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  base: "./", // Esto es clave para que las rutas sean relativas
  server: {
    host: true,
    port: 5173
  }
});
