// MySQL / MariaDB database exposed with the same interface as a Sites D1 binding
// (prepare().bind().all/first/run + batch), so backend/api.js works unchanged.
import mysql from "mysql2/promise";

function unavailable(error) {
  return Object.assign(
    new Error(`Base de données MySQL injoignable (${error.code || error.message}). Démarrez MySQL (XAMPP) et vérifiez MYSQL_* dans backend/.env.`),
    { status: 503, cause: error },
  );
}

const plain = (row) => (row ? { ...row } : row);

export function createMysqlD1({ host = "127.0.0.1", port = 3306, user = "root", password = "", database = "stickarts" } = {}) {
  if (!/^[A-Za-z0-9_]+$/.test(database)) throw new Error(`Nom de base MySQL invalide : ${database}`);
  const connection = { host, port: Number(port) || 3306, user, password };
  let poolPromise = null;

  // Connects lazily (and retries on the next query) so the server can start before MySQL.
  const getPool = () => {
    poolPromise ??= (async () => {
      const admin = await mysql.createConnection(connection);
      try {
        await admin.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      } finally {
        await admin.end();
      }
      return mysql.createPool({ ...connection, database, charset: "utf8mb4", decimalNumbers: true, connectionLimit: 10 });
    })().catch((error) => {
      poolPromise = null;
      throw unavailable(error);
    });
    return poolPromise;
  };

  const exec = async (executor, sql, params) => {
    try {
      const [result] = await (executor ?? (await getPool())).query(sql, params);
      return result;
    } catch (error) {
      if (error.status) throw error;
      if (["ECONNREFUSED", "PROTOCOL_CONNECTION_LOST", "ETIMEDOUT", "ER_ACCESS_DENIED_ERROR"].includes(error.code)) {
        throw unavailable(error);
      }
      throw error;
    }
  };

  class Statement {
    constructor(sql, params = []) {
      this.sql = sql;
      this.params = params;
    }

    bind(...params) {
      return new Statement(this.sql, params.map((v) => (v === undefined ? null : v)));
    }

    async all(executor) {
      const rows = await exec(executor, this.sql, this.params);
      return { results: Array.isArray(rows) ? rows.map(plain) : [], success: true, meta: {} };
    }

    async first(column) {
      const rows = await exec(null, this.sql, this.params);
      const row = Array.isArray(rows) ? rows[0] : null;
      if (!row) return null;
      return column ? row[column] : plain(row);
    }

    async run(executor) {
      const result = await exec(executor, this.sql, this.params);
      return { success: true, meta: { last_row_id: result?.insertId ?? null, changes: result?.affectedRows ?? 0 } };
    }
  }

  return {
    dialect: "mysql",
    label: `MySQL ${user}@${connection.host}:${connection.port}/${database}`,
    prepare: (sql) => new Statement(sql),
    async batch(statements) {
      const pool = await getPool();
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const out = [];
        for (const s of statements) out.push(await s.run(conn));
        await conn.commit();
        return out;
      } catch (error) {
        await conn.rollback().catch(() => {});
        throw error;
      } finally {
        conn.release();
      }
    },
    async dropDatabase() {
      await exec(null, `DROP DATABASE IF EXISTS \`${database}\``);
    },
    async close() {
      if (!poolPromise) return;
      const pool = await poolPromise.catch(() => null);
      poolPromise = null;
      await pool?.end();
    },
  };
}
