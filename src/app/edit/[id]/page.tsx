import { redirect, notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { BookmarkForm } from "@/components/BookmarkForm";
import { getCurrentUser } from "@/lib/auth";
import { getBookmark, getTagNames } from "@/lib/queries";
import { splitTags } from "@/lib/format";
import { updateBookmarkAction, deleteBookmarkAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) redirect("/login");
  const { id } = await params;
  const b = getBookmark(Number(id), true);
  if (!b) notFound();

  return (
    <Shell crumb={<>Edit · #{b.id}</>}>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <BookmarkForm
          action={updateBookmarkAction}
          deleteAction={deleteBookmarkAction}
          id={b.id}
          submitLabel="Save Changes"
          allTags={getTagNames()}
          defaults={{
            url: b.url,
            title: b.title,
            description: b.description,
            tags: splitTags(b.tags).join(" "),
            private: b.private === 1,
            starred: b.starred === 1,
          }}
        />
      </div>
    </Shell>
  );
}
