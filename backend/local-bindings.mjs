// Local stand-ins for the Sites bindings used during `npm run dev`:
// D1 ("DB") backed by node:sqlite, R2 ("FILES") backed by the filesystem.
import { mkdirSync, existsSync, readFileSync, writeFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const normalize = (value) => (value === undefined ? null : typeof value === "boolean" ? Number(value) : value);
const plain = (row) => (row ? { ...row } : row);

class LocalStatement {
  constructor(db, sql, params = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }

  bind(...params) {
    return new LocalStatement(this.db, this.sql, params.map(normalize));
  }

  async all() {
    const results = this.db.prepare(this.sql).all(...this.params).map(plain);
    return { results, success: true, meta: {} };
  }

  async first(column) {
    const row = this.db.prepare(this.sql).get(...this.params);
    if (!row) return null;
    return column ? row[column] : plain(row);
  }

  async run() {
    const info = this.db.prepare(this.sql).run(...this.params);
    return { success: true, meta: { last_row_id: Number(info.lastInsertRowid), changes: Number(info.changes) } };
  }
}

// node:sqlite needs Node 22.5+; loaded lazily so production builds never touch it.
export async function createLocalD1(file) {
  const { DatabaseSync } = await import("node:sqlite");
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  return {
    prepare: (sql) => new LocalStatement(db, sql),
    async batch(statements) {
      db.exec("BEGIN");
      try {
        const out = [];
        for (const s of statements) out.push(await s.run());
        db.exec("COMMIT");
        return out;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    async exec(sql) {
      db.exec(sql);
      return { count: 1 };
    },
    close: () => db.close(),
  };
}

export function createLocalR2(dir) {
  mkdirSync(dir, { recursive: true });
  const target = (key) => {
    const full = path.resolve(dir, key);
    if (!full.startsWith(path.resolve(dir))) throw new Error("Invalid key");
    return full;
  };
  return {
    async put(key, body, options = {}) {
      const file = target(key);
      mkdirSync(path.dirname(file), { recursive: true });
      const buffer = Buffer.from(await new Response(body).arrayBuffer());
      writeFileSync(file, buffer);
      writeFileSync(`${file}.meta.json`, JSON.stringify({ httpMetadata: options.httpMetadata ?? {} }));
      return { key, size: buffer.length };
    },
    async head(key) {
      const file = target(key);
      if (!existsSync(file)) return null;
      const meta = existsSync(`${file}.meta.json`) ? JSON.parse(readFileSync(`${file}.meta.json`, "utf8")) : {};
      return { key, size: statSync(file).size, httpMetadata: meta.httpMetadata ?? {} };
    },
    async get(key, options = {}) {
      const file = target(key);
      if (!existsSync(file)) return null;
      const buffer = readFileSync(file);
      const meta = existsSync(`${file}.meta.json`) ? JSON.parse(readFileSync(`${file}.meta.json`, "utf8")) : {};
      const { offset = 0, length = buffer.length - offset } = options.range ?? {};
      const body = buffer.subarray(offset, offset + length);
      return { key, size: buffer.length, httpMetadata: meta.httpMetadata ?? {}, body: new Response(body).body };
    },
    async delete(key) {
      const file = target(key);
      rmSync(file, { force: true });
      rmSync(`${file}.meta.json`, { force: true });
    },
  };
}
