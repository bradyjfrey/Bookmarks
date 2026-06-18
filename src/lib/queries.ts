import "server-only";
import { raw } from "@/db/client";

export type ListRow = {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  private: number;
  starred: number;
  created_at: number;
  tags: string | null;
};

export type Filter = "all" | "starred" | "private" | "untagged";

const SORT = "b.created_at DESC, b.id DESC";
const LIST_COLS = `b.id, b.url, b.title, b.description, b.private, b.starred, b.created_at,
  (SELECT group_concat(t.name, ' ') FROM bookmark_tags bt JOIN tags t ON t.id = bt.tag_id WHERE bt.bookmark_id = b.id) AS tags`;

const one = (sql: string, ...args: unknown[]) =>
  (raw.prepare(sql).get(...args) as { c: number }).c;

export function getCounts(includePrivate: boolean) {
  const vis = includePrivate ? "" : " AND private = 0";
  return {
    all: one(`SELECT count(*) c FROM bookmarks WHERE deleted_at IS NULL${vis}`),
    starred: one(`SELECT count(*) c FROM bookmarks WHERE deleted_at IS NULL AND starred = 1${vis}`),
    private: one(`SELECT count(*) c FROM bookmarks WHERE deleted_at IS NULL AND private = 1`),
    untagged: one(
      `SELECT count(*) c FROM bookmarks b WHERE deleted_at IS NULL${vis}
       AND NOT EXISTS (SELECT 1 FROM bookmark_tags bt WHERE bt.bookmark_id = b.id)`,
    ),
    tags: one(
      `SELECT count(DISTINCT bt.tag_id) c FROM bookmark_tags bt
       JOIN bookmarks b ON b.id = bt.bookmark_id AND b.deleted_at IS NULL${vis}`,
    ),
  };
}

export function getTopTags(limit = 20, includePrivate = false) {
  const vis = includePrivate ? "" : " AND b.private = 0";
  return raw
    .prepare(
      `SELECT t.name, t.slug, count(*) AS count
       FROM bookmark_tags bt
       JOIN tags t ON t.id = bt.tag_id
       JOIN bookmarks b ON b.id = bt.bookmark_id AND b.deleted_at IS NULL${vis}
       GROUP BY t.id ORDER BY count DESC, t.name LIMIT ?`,
    )
    .all(limit) as { name: string; slug: string; count: number }[];
}

export function listBookmarks(opts: {
  filter?: Filter;
  includePrivate?: boolean;
  limit?: number;
  offset?: number;
}): ListRow[] {
  const { filter = "all", includePrivate = false, limit = 100, offset = 0 } = opts;
  const where = ["b.deleted_at IS NULL"];
  if (!includePrivate) where.push("b.private = 0");
  if (filter === "starred") where.push("b.starred = 1");
  if (filter === "private") where.push("b.private = 1");
  if (filter === "untagged")
    where.push("NOT EXISTS (SELECT 1 FROM bookmark_tags bt WHERE bt.bookmark_id = b.id)");
  return raw
    .prepare(
      `SELECT ${LIST_COLS} FROM bookmarks b WHERE ${where.join(" AND ")} ORDER BY ${SORT} LIMIT ? OFFSET ?`,
    )
    .all(limit, offset) as ListRow[];
}

export function listTrash(): (ListRow & { deleted_at: number })[] {
  return raw
    .prepare(
      `SELECT ${LIST_COLS}, b.deleted_at FROM bookmarks b WHERE b.deleted_at IS NOT NULL ORDER BY b.deleted_at DESC LIMIT 200`,
    )
    .all() as (ListRow & { deleted_at: number })[];
}

export function getBookmark(id: number, includePrivate: boolean): ListRow | null {
  const vis = includePrivate ? "" : " AND b.private = 0";
  const row = raw
    .prepare(`SELECT ${LIST_COLS} FROM bookmarks b WHERE b.id = ? AND b.deleted_at IS NULL${vis}`)
    .get(id) as ListRow | undefined;
  return row ?? null;
}

export function listBookmarksByTag(
  tagName: string,
  opts: { includePrivate?: boolean; limit?: number; offset?: number } = {},
): ListRow[] {
  const { includePrivate = false, limit = 100, offset = 0 } = opts;
  const vis = includePrivate ? "" : " AND b.private = 0";
  return raw
    .prepare(
      `SELECT ${LIST_COLS} FROM bookmarks b
       WHERE b.deleted_at IS NULL${vis}
       AND EXISTS (SELECT 1 FROM bookmark_tags bt JOIN tags t ON t.id = bt.tag_id
                   WHERE bt.bookmark_id = b.id AND t.name = ?)
       ORDER BY ${SORT} LIMIT ? OFFSET ?`,
    )
    .all(tagName, limit, offset) as ListRow[];
}

export function countBookmarksByTag(tagName: string, includePrivate: boolean): number {
  const vis = includePrivate ? "" : " AND b.private = 0";
  return one(
    `SELECT count(*) c FROM bookmarks b
     WHERE b.deleted_at IS NULL${vis}
     AND EXISTS (SELECT 1 FROM bookmark_tags bt JOIN tags t ON t.id = bt.tag_id
                 WHERE bt.bookmark_id = b.id AND t.name = ?)`,
    tagName,
  );
}

export function getTagNames(): string[] {
  return (raw.prepare("SELECT name FROM tags ORDER BY name").all() as { name: string }[]).map(
    (r) => r.name,
  );
}

export function getAllTags(includePrivate = false) {
  const vis = includePrivate ? "" : " AND b.private = 0";
  return raw
    .prepare(
      `SELECT t.name, t.slug, count(*) AS count
       FROM bookmark_tags bt
       JOIN tags t ON t.id = bt.tag_id
       JOIN bookmarks b ON b.id = bt.bookmark_id AND b.deleted_at IS NULL${vis}
       GROUP BY t.id ORDER BY count DESC, t.name`,
    )
    .all() as { name: string; slug: string; count: number }[];
}

export function searchBookmarks(q: string, includePrivate: boolean, limit = 100): ListRow[] {
  const query = q.trim();
  const vis = includePrivate ? "" : " AND b.private = 0";
  if (query.length >= 3) {
    const phrase = `"${query.replace(/"/g, '""')}"`; // trigram substring match
    return raw
      .prepare(
        `SELECT ${LIST_COLS} FROM bookmarks b
         JOIN bookmarks_fts ON bookmarks_fts.rowid = b.id
         WHERE bookmarks_fts MATCH ? AND b.deleted_at IS NULL${vis}
         ORDER BY bookmarks_fts.rank LIMIT ?`,
      )
      .all(phrase, limit) as ListRow[];
  }
  const like = `%${query.replace(/[%_\\]/g, "\\$&")}%`;
  return raw
    .prepare(
      `SELECT ${LIST_COLS} FROM bookmarks b
       WHERE b.deleted_at IS NULL${vis}
       AND (b.title LIKE ? ESCAPE '\\' OR b.url LIKE ? ESCAPE '\\' OR b.description LIKE ? ESCAPE '\\')
       ORDER BY ${SORT} LIMIT ?`,
    )
    .all(like, like, like, limit) as ListRow[];
}
