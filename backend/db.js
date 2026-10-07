import { SETTING_SECTIONS } from "./shared/defaults.js";

export const isMysql = (db) => db?.dialect === "mysql";

const SQLITE_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (
    \`key\` TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'nouveau',
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    message TEXT,
    items TEXT NOT NULL,
    estimate REAL,
    quoted_price REAL,
    admin_notes TEXT,
    history TEXT NOT NULL DEFAULT '[]',
    checkout TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_requests_status ON requests (status)`,
  `CREATE INDEX IF NOT EXISTS idx_requests_created ON requests (created_at)`,
  `CREATE TABLE IF NOT EXISTS request_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    item_index INTEGER,
    storage_key TEXT,
    name TEXT NOT NULL,
    size INTEGER,
    type TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_request_files_request ON request_files (request_id)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    ip TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    window_start INTEGER NOT NULL
  )`,
];

const MYSQL_TABLE = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

const MYSQL_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (
    \`key\` VARCHAR(64) NOT NULL PRIMARY KEY,
    value MEDIUMTEXT NOT NULL,
    updated_at VARCHAR(32) NOT NULL
  ) ${MYSQL_TABLE}`,
  `CREATE TABLE IF NOT EXISTS requests (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ref VARCHAR(32) NOT NULL UNIQUE,
    kind VARCHAR(20) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'nouveau',
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(60),
    email VARCHAR(200),
    message TEXT,
    items MEDIUMTEXT NOT NULL,
    estimate DOUBLE,
    quoted_price DOUBLE,
    admin_notes TEXT,
    history MEDIUMTEXT NOT NULL,
    checkout TEXT,
    created_at VARCHAR(32) NOT NULL,
    updated_at VARCHAR(32) NOT NULL,
    INDEX idx_requests_status (status),
    INDEX idx_requests_created (created_at)
  ) ${MYSQL_TABLE}`,
  `CREATE TABLE IF NOT EXISTS request_files (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    request_id INT UNSIGNED NOT NULL,
    item_index INT,
    storage_key VARCHAR(500),
    name VARCHAR(255) NOT NULL,
    size BIGINT,
    type VARCHAR(150),
    created_at VARCHAR(32) NOT NULL,
    INDEX idx_request_files_request (request_id)
  ) ${MYSQL_TABLE}`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    ip VARCHAR(64) NOT NULL PRIMARY KEY,
    count INT NOT NULL,
    window_start BIGINT NOT NULL
  ) ${MYSQL_TABLE}`,
];

// INSERT … or update the given columns when the primary key already exists.
export function upsertSql(db, table, columns, keyColumn, updates) {
  const cols = columns.map((c) => `\`${c}\``).join(", ");
  const marks = columns.map(() => "?").join(", ");
  const base = `INSERT INTO ${table} (${cols}) VALUES (${marks})`;
  if (isMysql(db)) {
    const set = Object.entries(updates).map(([c, v]) => `\`${c}\` = ${v === "excluded" ? `VALUES(\`${c}\`)` : v}`);
    return `${base} ON DUPLICATE KEY UPDATE ${set.join(", ")}`;
  }
  const set = Object.entries(updates).map(([c, v]) => `\`${c}\` = ${v === "excluded" ? `excluded.\`${c}\`` : v}`);
  return `${base} ON CONFLICT(\`${keyColumn}\`) DO UPDATE SET ${set.join(", ")}`;
}

// Columns added after the first release: existing databases get them on startup.
const ADDED_COLUMNS = [["requests", "checkout", "TEXT"]];

async function addMissingColumns(db) {
  for (const [table, column, type] of ADDED_COLUMNS) {
    try {
      await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
    } catch (error) {
      if (!/duplicate column/i.test(String(error?.message))) throw error;
    }
  }
}

const ready = new WeakMap();

export function ensureSchema(db) {
  if (!ready.has(db)) {
    const schema = isMysql(db) ? MYSQL_SCHEMA : SQLITE_SCHEMA;
    ready.set(
      db,
      db.batch(schema.map((sql) => db.prepare(sql))).then(() => addMissingColumns(db)).catch((error) => {
        ready.delete(db);
        throw error;
      }),
    );
  }
  return ready.get(db);
}

export const now = () => new Date().toISOString();

export async function readSection(db, key) {
  const row = await db.prepare("SELECT value FROM settings WHERE `key` = ?").bind(key).first();
  if (!row) return structuredClone(SETTING_SECTIONS[key]);
  try {
    return JSON.parse(row.value);
  } catch {
    return structuredClone(SETTING_SECTIONS[key]);
  }
}

export async function readAllSections(db) {
  const { results } = await db.prepare("SELECT `key`, value FROM settings").all();
  const stored = Object.fromEntries((results ?? []).map((r) => [r.key, r.value]));
  const out = {};
  for (const key of Object.keys(SETTING_SECTIONS)) {
    try {
      out[key] = stored[key] ? JSON.parse(stored[key]) : structuredClone(SETTING_SECTIONS[key]);
    } catch {
      out[key] = structuredClone(SETTING_SECTIONS[key]);
    }
  }
  return out;
}

export async function writeSection(db, key, value) {
  await db
    .prepare(upsertSql(db, "settings", ["key", "value", "updated_at"], "key", { value: "excluded", updated_at: "excluded" }))
    .bind(key, JSON.stringify(value), now())
    .run();
}

export async function resetSection(db, key) {
  await db.prepare("DELETE FROM settings WHERE `key` = ?").bind(key).run();
}

export function parseRequestRow(row) {
  if (!row) return null;
  const safe = (text, fallback) => {
    try {
      return JSON.parse(text);
    } catch {
      return fallback;
    }
  };
  return { ...row, items: safe(row.items, []), history: safe(row.history, []), checkout: row.checkout ? safe(row.checkout, null) : null };
}
