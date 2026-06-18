import "server-only";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_PATH || "./data/bookmarks.db";

function open() {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  // Idempotent schema (base tables + FTS5). Safe on every boot.
  sqlite.exec(readFileSync(join(process.cwd(), "src/db/schema.sql"), "utf8"));
  return sqlite;
}

// Reuse a single connection across hot reloads in dev.
const g = globalThis as unknown as { __sqlite?: Database.Database };
const sqlite = g.__sqlite ?? open();
if (process.env.NODE_ENV !== "production") g.__sqlite = sqlite;

export const db = drizzle(sqlite, { schema });
/** Raw better-sqlite3 handle for FTS5 / pragmas the query builder can't express. */
export const raw = sqlite;
