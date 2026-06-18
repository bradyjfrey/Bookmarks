import Link from "next/link";
import { Shell } from "@/components/Shell";
import { getAllTags } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const includePrivate = Boolean(await getCurrentUser());
  const tags = getAllTags(includePrivate);
  return (
    <Shell crumb={<>Tags · {tags.length.toLocaleString()}</>}>
      <div className="px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link
            key={t.slug}
            href={`/t/${encodeURIComponent(t.name)}`}
            className="group inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-ink bg-surface border border-border hover:bg-accent hover:text-white hover:border-accent"
          >
            {t.name}
            <span className="text-xs text-ink-faint tabular-nums group-hover:text-white/80">{t.count}</span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
