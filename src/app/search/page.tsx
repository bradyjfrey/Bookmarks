import { Shell } from "@/components/Shell";
import { BookmarkList } from "@/components/BookmarkList";
import { searchBookmarks } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const includePrivate = Boolean(await getCurrentUser());
  const rows = q ? searchBookmarks(q, includePrivate, 200) : [];
  const title = q ? (
    <>
      {rows.length.toLocaleString()} {rows.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
    </>
  ) : (
    "Search"
  );
  return (
    <Shell crumb={title} query={q}>
      <BookmarkList
        rows={rows}
        canEdit={includePrivate}
        empty={q ? "No matches. Search covers titles, URLs, notes, and tags, in any language." : "Type a query above to search."}
      />
    </Shell>
  );
}
