import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        plugin: "src/plugin.js",
        index: "./index.html",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
  server: {
    port: 5173,
    cors: true,
  },
  preview: {
    port: 5173,
    cors: true,
  },
});
