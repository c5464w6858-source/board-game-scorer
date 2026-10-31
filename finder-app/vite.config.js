import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Supabase URL and publishable key are public (they are already in every
// copy of the app that visitors download). They are the fallback here so a
// build made without a .env file still talks to the real project instead of
// quietly starting in local sample-data mode. Real environment values win.
const SUPABASE_URL = "https://ysoxkcuuphaivacqmgwr.supabase.co";
const SUPABASE_KEY = "sb_publishable_";

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL || SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || SUPABASE_KEY),
  },
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
