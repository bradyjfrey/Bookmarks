import { Shell } from "@/components/Shell";
import { BookmarkList } from "@/components/BookmarkList";
import { Pagination } from "@/components/Pagination";
import { listBookmarks, getCounts } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

const PER_PAGE = 100;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const includePrivate = Boolean(await getCurrentUser());

  const rows = listBookmarks({
    filter: "all",
    includePrivate,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  });
  const total = getCounts(includePrivate).all;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <Shell title="All Bookmarks">
      <BookmarkList rows={rows} canEdit={includePrivate} empty="No bookmarks yet." />
      <Pagination page={page} pages={pages} basePath="/" />
    </Shell>
  );
}
