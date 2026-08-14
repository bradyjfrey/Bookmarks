import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { BookmarkForm } from "@/components/BookmarkForm";
import { getCurrentUser } from "@/lib/auth";
import { findBookmarkByUrl, getTagNames } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { createBookmarkAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    url?: string;
    title?: string;
    description?: string;
    tags?: string;
    private?: string;
    starred?: string;
  }>;
}) {
  if (!(await getCurrentUser())) redirect("/login?redirect=/add");
  const sp = await searchParams; // bookmarklet prefill: /add?url=…&title=…
  const existing = sp.url ? findBookmarkByUrl(sp.url) : null;
  return (
    <Shell crumb="Add">
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {existing && (
          <div className="max-w-2xl rounded-md border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
            You already bookmarked this URL on {formatDate(existing.created_at)}
            {existing.title ? ` (“${existing.title}”)` : ""}.{" "}
            <Link href={`/edit/${existing.id}`} className="font-medium underline">
              Edit the existing bookmark
            </Link>{" "}
            or save anyway to create a duplicate.
          </div>
        )}
        <BookmarkForm
          action={createBookmarkAction}
          defaults={{
            url: sp.url,
            title: sp.title,
            description: sp.description,
            tags: sp.tags,
            private: sp.private === "1",
            starred: sp.starred === "1",
          }}
          submitLabel={existing ? "Save Anyway" : "Save Bookmark"}
          force={!!existing}
          allTags={getTagNames()}
        />
      </div>
    </Shell>
  );
}
