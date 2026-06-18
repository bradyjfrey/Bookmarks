import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { BookmarkForm } from "@/components/BookmarkForm";
import { getCurrentUser } from "@/lib/auth";
import { getTagNames } from "@/lib/queries";
import { createBookmarkAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; title?: string }>;
}) {
  if (!(await getCurrentUser())) redirect("/login?redirect=/add");
  const sp = await searchParams; // bookmarklet prefill: /add?url=…&title=…
  return (
    <Shell crumb="Add">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <BookmarkForm
          action={createBookmarkAction}
          defaults={{ url: sp.url, title: sp.title }}
          submitLabel="Save Bookmark"
          allTags={getTagNames()}
        />
      </div>
    </Shell>
  );
}
