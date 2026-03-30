import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Dynamically split large libraries into their own chunk
          if (id.includes("jspdf")) {
            return "jspdf"; // Creates a separate chunk for jsPDF
          }
          if (id.includes("lodash")) {
            return "lodash"; // Creates a separate chunk for Lodash
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});