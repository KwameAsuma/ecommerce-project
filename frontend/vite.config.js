import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes the server to the Docker network
    port: 3000, // Aligns with your NGINX routing
    strictPort: true,
    watch: {
      usePolling: true, // Ensures hot-reloading works perfectly through the bind mount
    },
  },
});
