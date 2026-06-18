import { Shell } from "@/components/Shell";
import { BookmarkList } from "@/components/BookmarkList";
import { listBookmarks } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const includePrivate = Boolean(await getCurrentUser());
  const rows = listBookmarks({ filter: "untagged", includePrivate, limit: 200 });
  return (
    <Shell crumb="Untagged">
      <BookmarkList rows={rows} canEdit={includePrivate} empty="No untagged bookmarks — everything is tagged." />
    </Shell>
  );
}
