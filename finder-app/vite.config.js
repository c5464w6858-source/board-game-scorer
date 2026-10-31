import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",  // relative paths for Capacitor
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Ensure assets work inside native app WebView
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
});
