// Runs the API suite against MySQL using the MYSQL_* settings from backend/.env,
// in a throwaway "<MYSQL_DATABASE>_test" database. Skipped when MySQL is not running.
import { test } from "node:test";
import { createMysqlD1 } from "../mysql-adapter.mjs";
import { readBackendSettings } from "../node-env.mjs";
import { defineApiSuite } from "./api-suite.mjs";

const setting = readBackendSettings();
const config = {
  host: setting("MYSQL_HOST", "127.0.0.1"),
  port: setting("MYSQL_PORT", "3306"),
  user: setting("MYSQL_USER", "root"),
  password: setting("MYSQL_PASSWORD", ""),
  database: `${setting("MYSQL_DATABASE", "stickarts")}_test`,
};

const probe = createMysqlD1(config);
const reachable = await probe
  .prepare("SELECT 1 AS ok")
  .first()
  .then(() => true)
  .catch(() => false);
await probe.close();

if (reachable) {
  defineApiSuite(`API with MySQL (${config.user}@${config.host}:${config.port})`, {
    openDb: async () => {
      const db = createMysqlD1(config);
      await db.dropDatabase();
      await db.close();
      return createMysqlD1(config);
    },
    closeDb: async (db) => {
      await db.dropDatabase();
      await db.close();
    },
  });
} else {
  test("API with MySQL", { skip: `MySQL not reachable on ${config.host}:${config.port} — start MySQL in XAMPP` }, () => {});
}
