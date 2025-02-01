import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react")) {
            return "react"; // Create a chunk for React
          }
          if (id.includes("node_modules/axios")) {
            return "axios"; // Create a chunk for Axios
          }
          if (id.includes("node_modules")) {
            return "vendor"; // Create a chunk for all other node_modules
          }
        },
      },
    },
    chunkSizeWarningLimit: 5000, // Set the warning threshold to 5MB (5000KB)
  },
});
