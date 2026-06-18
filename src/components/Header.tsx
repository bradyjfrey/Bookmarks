import Link from "next/link";
import { Search, Plus, Menu } from "./icons";

/** Sticky top bar: global search + add button, then the context-title strip. */
export function Header({ title, query = "" }: { title: React.ReactNode; query?: string }) {
  return (
    <div className="sticky top-0 z-10 bg-surface border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-2.5 flex items-center gap-2">
        <form action="/search" className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search bookmarks…"
            className="w-full h-10 bg-surface border border-border rounded-md pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus-accent"
          />
        </form>
        <Link
          href="/add"
          className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-md bg-cubs text-white hover:bg-cubs-dark"
          title="Add Bookmark"
          aria-label="Add Bookmark"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 pt-2.5 pb-2.5 border-t border-border flex items-center justify-between">
        <h1 className="text-[13px] font-semibold uppercase tracking-wide text-ink-soft">{title}</h1>
        <label
          htmlFor="nav"
          className="lg:hidden p-1.5 -mr-1.5 rounded-md text-ink-soft hover:text-ink hover:bg-border-soft cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </label>
      </div>
    </div>
  );
}
