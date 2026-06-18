import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { getBookmark } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, domain, splitTags } from "@/lib/format";
import { Lock } from "@/components/icons";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const includePrivate = Boolean(await getCurrentUser());
  const b = getBookmark(Number(id), includePrivate);
  if (!b) notFound();
  const tags = splitTags(b.tags);

  return (
    <Shell
      title={
        <>
          <Link href="/" className="hover:text-ink">All Bookmarks</Link>{" "}
          <span className="text-ink-faint">/ #{b.id}</span>
        </>
      }
    >
      <article className="px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        <div className="text-sm text-ink-soft mb-2">{domain(b.url)}</div>
        <h2 className="text-2xl font-semibold tracking-tight text-ink leading-snug flex items-start gap-2">
          {b.title || b.url}
          {b.private === 1 && <Lock className="w-4 h-4 text-red-700 mt-1.5 shrink-0" />}
        </h2>
        <a
          href={b.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm text-accent hover:underline break-all"
        >
          {b.url}
        </a>
        {b.description && (
          <p className="mt-4 text-[15px] text-ink leading-relaxed whitespace-pre-wrap">{b.description}</p>
        )}
        {tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <Link
                key={t}
                href={`/t/${encodeURIComponent(t)}`}
                className="rounded px-2 py-1 text-xs font-medium text-ink bg-border hover:bg-accent hover:text-white"
              >
                {t}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6 pt-5 border-t border-border text-sm text-ink-soft">
          Saved {formatDate(b.created_at)} · #{b.id}
        </div>
      </article>
    </Shell>
  );
}
