#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const dist = path.join(root, "dist");
const index = path.join(dist, "client", "index.html");
const worker = path.join(root, "backend", "worker", "index.js");
const hosting = path.join(root, "backend", ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });

// The worker imports shared modules, so bundle it into a single ESM file.
await build({
  configFile: false,
  root,
  logLevel: "warn",
  publicDir: false,
  ssr: { target: "webworker", noExternal: true },
  build: {
    ssr: worker,
    outDir: path.join(dist, "server"),
    emptyOutDir: false,
    minify: false,
    target: "es2022",
    rollupOptions: { output: { format: "es", entryFileNames: "index.js" } },
  },
});

copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

console.log("Prepared Sites build: dist/server/index.js and dist/.openai/hosting.json");
