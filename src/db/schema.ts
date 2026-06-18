import {
  sqliteTable,
  integer,
  text,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const bookmarks = sqliteTable(
  "bookmarks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    url: text("url").notNull(),
    title: text("title"),
    description: text("description"),
    private: integer("private", { mode: "boolean" }).notNull().default(false),
    starred: integer("starred", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (t) => [
    index("idx_bookmarks_created").on(t.createdAt),
    index("idx_bookmarks_deleted").on(t.deletedAt),
  ],
);

export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
  },
  (t) => [
    uniqueIndex("idx_tags_name").on(t.name),
    uniqueIndex("idx_tags_slug").on(t.slug),
  ],
);

export const bookmarkTags = sqliteTable(
  "bookmark_tags",
  {
    bookmarkId: integer("bookmark_id")
      .notNull()
      .references(() => bookmarks.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.bookmarkId, t.tagId] }),
    index("idx_bookmark_tags_tag").on(t.tagId),
  ],
);

export type Bookmark = typeof bookmarks.$inferSelect;
export type Tag = typeof tags.$inferSelect;
