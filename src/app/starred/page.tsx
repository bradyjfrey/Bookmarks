import { Shell } from "@/components/Shell";
import { BookmarkList } from "@/components/BookmarkList";
import { listBookmarks } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const includePrivate = Boolean(await getCurrentUser());
  const rows = listBookmarks({ filter: "starred", includePrivate, limit: 200 });
  return (
    <Shell crumb="Starred">
      <BookmarkList rows={rows} canEdit={includePrivate} empty="No starred bookmarks yet. Tap the star on any bookmark to favorite it." />
    </Shell>
  );
}
