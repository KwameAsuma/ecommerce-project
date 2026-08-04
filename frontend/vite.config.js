import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Exposes the server to the Docker network
    port: 3000, // Aligns with your NGINX routing
    strictPort: true,
    allowedHosts: process.env.VITE_NGROK_HOST ? [process.env.VITE_NGROK_HOST] : true,
    watch: {
      usePolling: true, // Ensures hot-reloading works perfectly through the bind mount
    },
  },
});
