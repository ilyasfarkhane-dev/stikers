#!/usr/bin/env node
// Standalone production server for your own hosting (VPS, cPanel Node app…):
// serves the built site from dist/client and the API from backend/api.js with MySQL.
// Usage: npm run build && npm start
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { handleApi } from "./api.js";
import { backendRoot, createBackendEnv } from "./node-env.mjs";
import { sendJsonError, sendWebResponse, toWebRequest } from "./node-http.mjs";

const clientDir = path.resolve(backendRoot, "..", "dist", "client");
const indexFile = path.join(clientDir, "index.html");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

if (!existsSync(indexFile)) {
  console.error("dist/client/index.html introuvable : lancez d'abord `npm run build`.");
  process.exit(1);
}

const { env, summary, port } = await createBackendEnv();

function serveFile(res, file, method) {
  const ext = path.extname(file).toLowerCase();
  res.setHeader("content-type", MIME[ext] ?? "application/octet-stream");
  res.setHeader("cache-control", file.includes(`${path.sep}assets${path.sep}`) && ext !== ".html" ? "public, max-age=31536000, immutable" : "no-cache");
  res.setHeader("x-content-type-options", "nosniff");
  if (method === "HEAD") return res.end();
  createReadStream(file).pipe(res);
}

function serveStatic(req, res) {
  if (!["GET", "HEAD"].includes(req.method)) return sendJsonError(res, 405, "Méthode non autorisée.");
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return sendJsonError(res, 400, "URL invalide.");
  }
  const file = path.resolve(clientDir, `.${pathname}`);
  const inside = file === clientDir || file.startsWith(clientDir + path.sep);
  const hidden = pathname.split("/").some((part) => part.startsWith("."));
  if (inside && !hidden && existsSync(file) && statSync(file).isFile()) return serveFile(res, file, req.method);
  if (path.extname(pathname)) {
    res.statusCode = 404;
    return res.end("Not found");
  }
  return serveFile(res, indexFile, req.method);
}

createServer(async (req, res) => {
  try {
    if (req.url?.startsWith("/api/")) {
      const response = await handleApi(await toWebRequest(req), env);
      if (response) return await sendWebResponse(res, response);
      return sendJsonError(res, 404, "Route inconnue.");
    }
    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) sendJsonError(res, 500, "Erreur serveur.");
    else res.end();
  }
}).listen(port, () => {
  console.log(`Stick'Arts server running on http://localhost:${port}\n${summary}`);
});
