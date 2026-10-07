// Builds the backend `env` (DB, FILES, secrets) from backend/.env for Node runtimes:
// the Vite dev server and the standalone server (backend/server.mjs).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { createLocalR2 } from "./local-bindings.mjs";

export const backendRoot = path.dirname(fileURLToPath(import.meta.url));

export function readBackendSettings() {
  const file = path.join(backendRoot, ".env");
  const fromFile = existsSync(file) ? parseEnv(readFileSync(file, "utf8")) : {};
  return (key, fallback) => process.env[key] || fromFile[key] || fallback;
}

export async function createBackendEnv() {
  const setting = readBackendSettings();
  const client = setting("DB_CLIENT", "sqlite").toLowerCase();
  let DB;

  if (client === "mysql") {
    const { createMysqlD1 } = await import("./mysql-adapter.mjs");
    DB = createMysqlD1({
      host: setting("MYSQL_HOST", "127.0.0.1"),
      port: setting("MYSQL_PORT", "3306"),
      user: setting("MYSQL_USER", "root"),
      password: setting("MYSQL_PASSWORD", ""),
      database: setting("MYSQL_DATABASE", "stickarts"),
    });
  } else if (client === "sqlite") {
    const { createLocalD1 } = await import("./local-bindings.mjs");
    const file = path.resolve(backendRoot, setting("DB_PATH", ".data/dev.sqlite"));
    DB = await createLocalD1(file);
    DB.label = `SQLite ${file}`;
  } else {
    throw new Error(`DB_CLIENT inconnu : « ${client} » (valeurs possibles : mysql, sqlite).`);
  }

  const filesDir = path.resolve(backendRoot, setting("FILES_DIR", ".data/files"));
  return {
    env: {
      DB,
      FILES: createLocalR2(filesDir),
      ADMIN_PASSWORD: setting("ADMIN_PASSWORD"),
      SESSION_SECRET: setting("SESSION_SECRET"),
    },
    summary: `Database: ${DB.label}\nUploaded files: ${filesDir}`,
    port: Number(setting("PORT", "8080")),
  };
}
