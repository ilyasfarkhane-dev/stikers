import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(frontendRoot);

// Runs the backend API (`backend/api.js`) inside the Vite dev server with the database from backend/.env.
function sitesDevApi() {
  return {
    name: "sites-dev-api",
    apply: "serve",
    async configureServer(server) {
      const { createBackendEnv } = await import("../backend/node-env.mjs");
      const { sendJsonError, sendWebResponse, toWebRequest } = await import("../backend/node-http.mjs");
      const backend = await createBackendEnv().catch((error) => {
        server.config.logger.warn(`[sites-dev-api] Backend unavailable: ${error.message}`);
        return { env: {}, summary: "Database: unavailable" };
      });
      server.config.logger.info(backend.summary.replace(/^/gm, "[sites-dev-api] "));
      const apiEntry = path.join(projectRoot, "backend", "api.js");

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        try {
          const { handleApi } = await server.ssrLoadModule(apiEntry);
          const response = await handleApi(await toWebRequest(req), backend.env);
          if (response) return await sendWebResponse(res, response);
          return sendJsonError(res, 404, "Route inconnue.");
        } catch (error) {
          server.config.logger.error(error?.stack ?? String(error));
          sendJsonError(res, 500, "Erreur serveur (dev).");
        }
      });
    },
  };
}

// The client's original 4000px photos / raw videos stay in public/ as sources only; the site uses
// the web copies in assets/images/photos and assets/videos, so the originals are dropped from the build.
function dropSourceMedia() {
  return {
    name: "drop-source-media",
    apply: "build",
    async closeBundle() {
      const { rm } = await import("node:fs/promises");
      await rm(path.join(projectRoot, "dist", "client", "assets", "images", "imges"), { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  root: frontendRoot,
  envDir: frontendRoot,
  build: {
    outDir: path.join(projectRoot, "dist", "client"),
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    fs: {
      allow: [projectRoot],
    },
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
    watch: {
      ignored: ["**/.data/**"],
    },
  },
  plugins: [react(), sitesDevApi(), dropSourceMedia()],
});
