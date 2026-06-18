-- Bookmarks schema (SQLite). Idempotent — safe to run on every boot.
-- Timestamps are Unix epoch seconds (INTEGER). Booleans are 0/1.

CREATE TABLE IF NOT EXISTS bookmarks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  url         TEXT    NOT NULL,
  title       TEXT,
  description TEXT,
  private     INTEGER NOT NULL DEFAULT 0,
  starred     INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  deleted_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created ON bookmarks(created_at);
CREATE INDEX IF NOT EXISTS idx_bookmarks_deleted ON bookmarks(deleted_at);

CREATE TABLE IF NOT EXISTS tags (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

CREATE TABLE IF NOT EXISTS bookmark_tags (
  bookmark_id INTEGER NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id      INTEGER NOT NULL REFERENCES tags(id)      ON DELETE CASCADE,
  PRIMARY KEY (bookmark_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag ON bookmark_tags(tag_id);

-- Full-text search. Trigram tokenizer = case-insensitive substring matching
-- across any script (incl. CJK) for queries >= 3 chars; the app uses a LIKE
-- fallback for 1-2 char queries. rowid mirrors bookmarks.id; the `tags` column
-- is a denormalized space-joined string kept in sync from the write path.
CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5(
  title, description, url, tags,
  tokenize = 'trigram'
);
