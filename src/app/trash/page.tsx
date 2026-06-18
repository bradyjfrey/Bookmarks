import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { getCurrentUser } from "@/lib/auth";
import { listTrash } from "@/lib/queries";
import { domain, splitTags } from "@/lib/format";
import { restoreBookmarkAction, purgeBookmarkAction, emptyTrashAction } from "@/lib/actions";
import { Trash } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function Page() {
  if (!(await getCurrentUser())) redirect("/login");
  const rows = listTrash();

  return (
    <Shell crumb="Trash">
      {rows.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-1 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-faint">Deleted bookmarks stay here until you empty the trash. Nothing auto-purges.</p>
          <form action={emptyTrashAction}>
            <button className="shrink-0 h-8 px-3 rounded-md bg-red-700 text-white text-xs font-medium hover:bg-red-800">Empty Trash</button>
          </form>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="px-4 sm:px-6 lg:px-8 py-16 text-center text-sm text-ink-faint">Trash is empty.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((b) => (
            <li key={b.id} className="px-4 sm:px-6 lg:px-8 py-3 opacity-75">
              <div className="min-w-0 text-[15px] font-medium leading-snug text-ink line-through truncate-1">{b.title || b.url}</div>
              <div className="mt-0.5 truncate-1 text-[13px] text-ink-soft">{domain(b.url)}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
                  {splitTags(b.tags).map((t) => (
                    <span key={t} className="rounded px-1.5 py-0.5 text-[11px] font-medium text-ink bg-border">{t}</span>
                  ))}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <form action={restoreBookmarkAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button className="h-7 px-2 rounded-md border border-border text-xs font-medium text-ink hover:bg-border-soft">Restore</button>
                  </form>
                  <form action={purgeBookmarkAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button className="p-1 rounded text-ink-soft hover:text-red-600 hover:bg-border-soft" title="Delete Forever">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
