import { Shell } from "@/components/Shell";
import { BookmarkList } from "@/components/BookmarkList";
import { listBookmarks } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getCurrentUser();
  const rows = user ? listBookmarks({ filter: "private", includePrivate: true, limit: 200 }) : [];
  return (
    <Shell crumb="Private">
      <BookmarkList
        rows={rows}
        canEdit={Boolean(user)}
        empty={user ? "No private bookmarks." : "Sign in to view your private bookmarks."}
      />
    </Shell>
  );
}
