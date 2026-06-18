import Link from "next/link";

export function Pagination({ page, pages, basePath, query }: { page: number; pages: number; basePath: string; query?: Record<string, string> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const params = new URLSearchParams(query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const btn = "h-8 px-3 inline-flex items-center rounded-md text-sm";
  return (
    <nav className="px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center gap-3 text-sm border-t border-border">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${btn} text-ink-soft hover:bg-border-soft`}>← Newer</Link>
      ) : (
        <span className={`${btn} text-ink-faint`}>← Newer</span>
      )}
      <span className="text-ink-faint tabular-nums">Page {page} of {pages.toLocaleString()}</span>
      {page < pages ? (
        <Link href={href(page + 1)} className={`${btn} text-ink-soft hover:bg-border-soft`}>Older →</Link>
      ) : (
        <span className={`${btn} text-ink-faint`}>Older →</span>
      )}
    </nav>
  );
}
