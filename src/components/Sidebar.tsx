"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { List, Star, Lock, TagOff, Trash, Gear } from "./icons";

type Counts = { all: number; starred: number; private: number; untagged: number; tags: number };
type TopTag = { name: string; slug: string; count: number };

const NAV = [
  { key: "all", href: "/", label: "All Bookmarks", Icon: List },
  { key: "starred", href: "/starred", label: "Starred", Icon: Star },
  { key: "private", href: "/private", label: "Private", Icon: Lock },
  { key: "untagged", href: "/untagged", label: "Untagged", Icon: TagOff },
  { key: "trash", href: "/trash", label: "Trash", Icon: Trash },
] as const;

function activeKey(pathname: string): string {
  if (pathname === "/") return "all";
  const seg = pathname.split("/")[1];
  return seg || "all";
}

export function Sidebar({
  counts,
  topTags,
  user,
}: {
  counts: Counts;
  topTags: TopTag[];
  user: { name: string; email: string } | null;
}) {
  const active = activeKey(usePathname());
  const count: Record<string, number> = {
    all: counts.all,
    starred: counts.starred,
    private: counts.private,
    untagged: counts.untagged,
  };

  return (
    <aside
      className="fixed lg:sticky inset-y-0 right-0 top-0 z-40 h-screen w-72 lg:w-64 shrink-0
                 translate-x-full peer-checked:translate-x-0 lg:translate-x-0 transition-transform
                 bg-sidebar border-l border-border flex flex-col"
    >
      {/* account */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          {user ? (
            <Image src="/avatar.png" alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0 bg-border" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-border shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            {user ? (
              <>
                <div className="truncate-1 text-sm font-semibold text-ink">{user.name}</div>
                <div className="truncate-1 text-xs text-ink-faint">{user.email}</div>
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium text-accent hover:underline">
                Sign in
              </Link>
            )}
          </div>
          <Link href="/settings" className="p-1.5 rounded-md text-ink-soft hover:text-ink hover:bg-border-soft" title="Settings">
            <Gear className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pt-5 pb-3">
        <div className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Browse</div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map(({ key, href, label, Icon }) => {
            const on = active === key;
            return (
              <Link
                key={key}
                href={href}
                className={
                  "flex items-center gap-2.5 h-9 px-2.5 rounded-md text-sm font-medium " +
                  (on
                    ? "bg-active text-ink"
                    : "text-ink hover:bg-accent-soft hover:text-accent")
                }
              >
                <Icon className="w-4 h-4" />
                {label}
                {key in count && (
                  <span className="ml-auto text-xs text-ink-faint tabular-nums">
                    {count[key].toLocaleString()}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-1 pt-5 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Top Tags</span>
          <Link href="/tags" className="text-[11px] text-accent hover:underline">All {counts.tags.toLocaleString()}</Link>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {topTags.map((t) => (
            <Link
              key={t.slug}
              href={`/t/${encodeURIComponent(t.name)}`}
              className="rounded-md px-2 py-1 text-[12px] text-ink bg-surface border border-border hover:bg-accent hover:text-white hover:border-accent"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
