import { Shell } from "@/components/Shell";
import { BookmarkList } from "@/components/BookmarkList";
import { listBookmarksByTag } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

export default async function Page({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const name = decodeURIComponent(tag);
  const includePrivate = Boolean(await getCurrentUser());
  const rows = listBookmarksByTag(name, { includePrivate, limit: 200 });
  return (
    <Shell crumb={<>Tag · {name}</>}>
      <BookmarkList rows={rows} canEdit={includePrivate} empty={`No bookmarks tagged "${name}".`} />
    </Shell>
  );
}
