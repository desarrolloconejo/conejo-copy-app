import express, { type Express } from "express";
import fs from "fs";
import path from "path";

/**
 * Serves the compiled client.
 *
 * Kept apart from vite.ts on purpose: that module pulls in Vite and its
 * plugins, and ES imports resolve when the process starts, not when the code
 * runs. Bundling the two together would force a production image to install
 * the whole build toolchain just to boot.
 */
export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // Fall through to index.html so client-side routes resolve on a hard reload.
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
