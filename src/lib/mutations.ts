import "server-only";
import { raw } from "@/db/client";

const now = () => Math.floor(Date.now() / 1000);

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-") || "tag";

/** Parse a free-text tag field ("a, b  c") into a unique, ordered list. */
export const parseTags = (s: string) =>
  Array.from(new Set(s.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean)));

function ensureTag(name: string): number {
  const ex = raw.prepare("SELECT id FROM tags WHERE name = ?").get(name) as { id: number } | undefined;
  if (ex) return ex.id;
  let slug = slugify(name);
  let n = 2;
  while (raw.prepare("SELECT 1 FROM tags WHERE slug = ?").get(slug)) slug = `${slugify(name)}-${n++}`;
  return Number(raw.prepare("INSERT INTO tags (name, slug) VALUES (?, ?)").run(name, slug).lastInsertRowid);
}

function setTags(bookmarkId: number, names: string[]) {
  raw.prepare("DELETE FROM bookmark_tags WHERE bookmark_id = ?").run(bookmarkId);
  const link = raw.prepare("INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)");
  for (const name of names) link.run(bookmarkId, ensureTag(name));
}

/** Rebuild the FTS row for a bookmark from its current fields + tags. */
function syncFts(bookmarkId: number) {
  raw.prepare("DELETE FROM bookmarks_fts WHERE rowid = ?").run(bookmarkId);
  const b = raw
    .prepare(
      `SELECT b.title, b.description, b.url,
        (SELECT group_concat(t.name, ' ') FROM bookmark_tags bt JOIN tags t ON t.id = bt.tag_id WHERE bt.bookmark_id = b.id) AS tags
       FROM bookmarks b WHERE b.id = ?`,
    )
    .get(bookmarkId) as { title: string | null; description: string | null; url: string; tags: string | null } | undefined;
  if (!b) return;
  raw
    .prepare("INSERT INTO bookmarks_fts (rowid, title, description, url, tags) VALUES (?, ?, ?, ?, ?)")
    .run(bookmarkId, b.title, b.description, b.url, b.tags);
}

export type BookmarkInput = {
  url: string;
  title?: string | null;
  description?: string | null;
  tags?: string[];
  private?: boolean;
  starred?: boolean;
};

export function createBookmark(input: BookmarkInput): number {
  const t = now();
  return raw.transaction(() => {
    const id = Number(
      raw
        .prepare(
          `INSERT INTO bookmarks (url, title, description, private, starred, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(input.url, input.title ?? null, input.description ?? null, input.private ? 1 : 0, input.starred ? 1 : 0, t, t)
        .lastInsertRowid,
    );
    setTags(id, input.tags ?? []);
    syncFts(id);
    return id;
  })();
}

export function updateBookmark(id: number, input: BookmarkInput) {
  raw.transaction(() => {
    raw
      .prepare(
        `UPDATE bookmarks SET url = ?, title = ?, description = ?, private = ?, starred = ?, updated_at = ? WHERE id = ?`,
      )
      .run(input.url, input.title ?? null, input.description ?? null, input.private ? 1 : 0, input.starred ? 1 : 0, now(), id);
    setTags(id, input.tags ?? []);
    syncFts(id);
  })();
}

export function toggleStarred(id: number) {
  const r = raw.prepare("SELECT starred s FROM bookmarks WHERE id = ?").get(id) as { s: number } | undefined;
  if (r) raw.prepare("UPDATE bookmarks SET starred = ?, updated_at = ? WHERE id = ?").run(r.s ? 0 : 1, now(), id);
}

export function togglePrivate(id: number) {
  const r = raw.prepare("SELECT private p FROM bookmarks WHERE id = ?").get(id) as { p: number } | undefined;
  if (r) raw.prepare("UPDATE bookmarks SET private = ?, updated_at = ? WHERE id = ?").run(r.p ? 0 : 1, now(), id);
}

export function softDelete(id: number) {
  raw.prepare("UPDATE bookmarks SET deleted_at = ?, updated_at = ? WHERE id = ?").run(now(), now(), id);
  raw.prepare("DELETE FROM bookmarks_fts WHERE rowid = ?").run(id);
}

export function restore(id: number) {
  raw.prepare("UPDATE bookmarks SET deleted_at = NULL, updated_at = ? WHERE id = ?").run(now(), id);
  syncFts(id);
}

export function purge(id: number) {
  raw.prepare("DELETE FROM bookmarks WHERE id = ?").run(id);
  raw.prepare("DELETE FROM bookmarks_fts WHERE rowid = ?").run(id);
}

/** Import an array of bookmarks (Pinboard export or our own export shape). */
export function importItems(items: Record<string, unknown>[]): { added: number; skipped: number } {
  let added = 0;
  let skipped = 0;
  const findUrl = raw.prepare("SELECT 1 FROM bookmarks WHERE url = ?");
  const ins = raw.prepare(
    `INSERT INTO bookmarks (url, title, description, private, starred, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  raw.transaction(() => {
    for (const row of items) {
      const it = row as Record<string, unknown>;
      const url = (it.href ?? it.url) as string | undefined;
      if (!url || findUrl.get(url)) {
        skipped++;
        continue;
      }
      const pinboard = it.href != null; // Pinboard: description=title, extended=note
      const title = ((pinboard ? it.description : it.title) as string) || null;
      const note = ((pinboard ? it.extended : it.description) as string) || null;
      const tagStr =
        typeof it.tags === "string" ? it.tags : Array.isArray(it.tags) ? it.tags.join(" ") : "";
      const names = tagStr.split(/\s+/).filter(Boolean);
      const isPrivate = pinboard ? it.shared === "no" : Boolean(it.private);
      const starred = pinboard ? false : Boolean(it.starred);
      const created = pinboard
        ? Math.floor(Date.parse(String(it.time ?? "")) / 1000) || now()
        : Number(it.created_at) || now();
      const id = Number(ins.run(url, title, note, isPrivate ? 1 : 0, starred ? 1 : 0, created, created).lastInsertRowid);
      setTags(id, names);
      syncFts(id);
      added++;
    }
  })();
  return { added, skipped };
}

export function emptyTrash(): number {
  const ids = raw.prepare("SELECT id FROM bookmarks WHERE deleted_at IS NOT NULL").all() as { id: number }[];
  raw.transaction(() => ids.forEach(({ id }) => purge(id)))();
  return ids.length;
}
