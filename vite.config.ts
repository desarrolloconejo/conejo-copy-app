import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    // Bind mounts from a Windows host do not deliver inotify events to the
    // container, so file changes go unnoticed unless the watcher polls.
    // Only the containerised dev environment sets this.
    watch: process.env.VITE_USE_POLLING
      ? {
          usePolling: true,
          // A tighter interval scans the tree often enough to burn half a core
          // while idle; one second is still imperceptible when saving a file.
          interval: 1000,
          ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
        }
      : undefined,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
