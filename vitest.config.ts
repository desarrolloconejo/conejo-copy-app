import { defineConfig } from "vitest/config";
import path from "path";

const projectRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: projectRoot,
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "client", "src"),
      "@shared": path.resolve(projectRoot, "shared"),
    },
  },
  // The app builds with the automatic JSX runtime through the React plugin,
  // but vitest transforms on its own and would fall back to the classic one,
  // where every component needs React in scope. Keep both on the same runtime.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    // Password hashing reserves ~32 MB per call by design, so running every
    // file in its own parallel worker makes the machine run out of memory and
    // scrypt fail. The whole suite takes seconds; serial files cost nothing.
    fileParallelism: false,
    include: [
      "server/**/*.test.ts",
      "server/**/*.spec.ts",
      "client/**/*.test.ts",
      "client/**/*.spec.ts",
      "client/**/*.test.tsx",
      "client/**/*.spec.tsx",
    ],
  },
});
