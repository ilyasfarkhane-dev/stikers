import path from "node:path";
import { createLocalD1 } from "../local-bindings.mjs";
import { defineApiSuite } from "./api-suite.mjs";

defineApiSuite("API with SQLite (Sites D1)", {
  openDb: (dir) => createLocalD1(path.join(dir, "db.sqlite")),
  closeDb: (db) => db.close(),
});
