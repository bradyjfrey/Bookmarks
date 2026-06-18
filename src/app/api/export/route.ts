import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { raw } from "@/db/client";

export async function GET() {
  if (!(await getCurrentUser())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const rows = raw
    .prepare(
      `SELECT b.id, b.url, b.title, b.description, b.private, b.starred,
        b.created_at, b.updated_at,
        (SELECT group_concat(t.name, ' ') FROM bookmark_tags bt JOIN tags t ON t.id = bt.tag_id WHERE bt.bookmark_id = b.id) AS tags
       FROM bookmarks b WHERE b.deleted_at IS NULL ORDER BY b.created_at DESC`,
    )
    .all();
  return new NextResponse(JSON.stringify(rows, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="bookmarks-export.json"',
    },
  });
}
