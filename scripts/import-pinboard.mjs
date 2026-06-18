// Import a Pinboard JSON export into the SQLite database.
//   node scripts/import-pinboard.mjs [path-to-export.json]
// Idempotent: dedupes by URL, so re-running won't create duplicates.
import Database from "better-sqlite3";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const SRC =
  process.argv[2] ||
  join(homedir(), "Downloads", "pinboard_export.2026.06.17_22.32.json");
const DB_PATH = process.env.DATABASE_PATH || "./data/bookmarks.db";

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "tag";

mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(readFileSync(join(process.cwd(), "src/db/schema.sql"), "utf8"));

const items = JSON.parse(readFileSync(SRC, "utf8"));
console.log(`Loaded ${items.length} bookmarks from ${SRC}`);

const findBookmark = db.prepare("SELECT id FROM bookmarks WHERE url = ?");
const insBookmark = db.prepare(
  `INSERT INTO bookmarks (url, title, description, private, starred, created_at, updated_at)
   VALUES (@url, @title, @description, @private, 0, @ts, @ts)`,
);
const findTagByName = db.prepare("SELECT id FROM tags WHERE name = ?");
const findTagBySlug = db.prepare("SELECT id FROM tags WHERE slug = ?");
const insTag = db.prepare("INSERT INTO tags (name, slug) VALUES (?, ?)");
const linkTag = db.prepare(
  "INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)",
);
const insFts = db.prepare(
  `INSERT INTO bookmarks_fts (rowid, title, description, url, tags)
   VALUES (?, ?, ?, ?, ?)`,
);

const tagCache = new Map();
function ensureTag(name) {
  if (tagCache.has(name)) return tagCache.get(name);
  const existing = findTagByName.get(name);
  if (existing) {
    tagCache.set(name, existing.id);
    return existing.id;
  }
  let slug = slugify(name);
  let n = 2;
  while (findTagBySlug.get(slug)) slug = `${slugify(name)}-${n++}`;
  const id = insTag.run(name, slug).lastInsertRowid;
  tagCache.set(name, id);
  return id;
}

let added = 0,
  skipped = 0;
const run = db.transaction(() => {
  for (const it of items) {
    const url = it.href;
    if (!url || findBookmark.get(url)) {
      skipped++;
      continue;
    }
    const ts = Math.floor(Date.parse(it.time || "") / 1000) || Math.floor(Date.now() / 1000);
    const title = it.description || null; // Pinboard `description` is the title
    const description = it.extended || null; // `extended` is the note
    const info = insBookmark.run({
      url,
      title,
      description,
      private: it.shared === "no" ? 1 : 0,
      ts,
    });
    const bookmarkId = Number(info.lastInsertRowid);

    const names = (it.tags || "").split(/\s+/).filter(Boolean);
    for (const name of names) linkTag.run(bookmarkId, ensureTag(name));

    insFts.run(bookmarkId, title, description, url, names.join(" "));
    added++;
  }
});
run();

const counts = {
  bookmarks: db.prepare("SELECT count(*) c FROM bookmarks").get().c,
  private: db.prepare("SELECT count(*) c FROM bookmarks WHERE private = 1").get().c,
  tags: db.prepare("SELECT count(*) c FROM tags").get().c,
  links: db.prepare("SELECT count(*) c FROM bookmark_tags").get().c,
  fts: db.prepare("SELECT count(*) c FROM bookmarks_fts").get().c,
};
console.log(`Added ${added}, skipped ${skipped} (existing/no-url).`);
console.log("Totals:", counts);
db.close();
