import Link from "next/link";
import type { ListRow } from "@/lib/queries";
import { formatDate, domain, splitTags } from "@/lib/format";
import { Star, StarFilled, Lock, Unlock, Edit, Trash } from "./icons";
import { toggleStarAction, togglePrivateAction, deleteBookmarkAction } from "@/lib/actions";

const iconBtn = "p-1 rounded text-ink-soft hover:text-ink hover:bg-border-soft";

export function BookmarkRow({ b, canEdit }: { b: ListRow; canEdit: boolean }) {
  const tags = splitTags(b.tags);
  const isPrivate = b.private === 1;
  const isStarred = b.starred === 1;
  const dom = domain(b.url);

  return (
    <li className={"group px-4 sm:px-6 lg:px-8 py-3 transition-colors " + (isPrivate ? "bg-priv hover:bg-priv-h" : "hover:bg-border-soft")}>
      <div className="min-w-0 flex items-center gap-1.5">
        <a href={b.url} className="truncate-1 text-[15px] font-medium leading-snug text-accent hover:text-ink" target="_blank" rel="noreferrer">
          {b.title || b.url}
        </a>
        {isPrivate && <Lock className="w-3.5 h-3.5 text-red-700 shrink-0" />}
      </div>

      <div className="mt-0.5 truncate-1 text-[13px] text-ink-soft">
        {dom}
        {b.description && <span className="text-ink-faint"> · {b.description}</span>}
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <div className="min-w-0 flex-1 flex items-center gap-1.5 flex-wrap">
          {isPrivate && <span className="rounded px-1.5 py-0.5 text-[11px] font-medium text-white bg-red-800">Private</span>}
          {tags.map((t) => (
            <Link key={t} href={`/t/${encodeURIComponent(t)}`} className="rounded px-1.5 py-0.5 text-[11px] font-medium text-ink bg-border hover:bg-accent hover:text-white">
              {t}
            </Link>
          ))}
          <span className="text-[11px] text-ink-faint tabular-nums whitespace-nowrap">{formatDate(b.created_at)}</span>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Link href={`/b/${b.id}`} className="text-[11px] text-ink-soft hover:text-accent tabular-nums" title="Permalink">
            #{b.id}
          </Link>
          {canEdit && (
            <div className="flex items-center gap-0.5">
              <form action={toggleStarAction} className="contents">
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className={isStarred ? "p-1 rounded text-amber-500 hover:bg-border-soft" : iconBtn} title={isStarred ? "Unstar" : "Star"}>
                  {isStarred ? <StarFilled className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                </button>
              </form>
              <Link href={`/edit/${b.id}`} className={iconBtn} title="Edit">
                <Edit className="w-3.5 h-3.5" />
              </Link>
              <form action={togglePrivateAction} className="contents">
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className={isPrivate ? "p-1 rounded text-red-700 hover:text-ink hover:bg-border-soft" : iconBtn} title={isPrivate ? "Make Public" : "Make Private"}>
                  {isPrivate ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                </button>
              </form>
              <form action={deleteBookmarkAction} className="contents">
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className="p-1 rounded text-ink-soft hover:text-red-600 hover:bg-border-soft" title="Delete">
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
