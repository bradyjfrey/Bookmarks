import Link from "next/link";
import { Shell } from "@/components/Shell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const BOOKMARKLET =
  "javascript:(()=>{window.open('https://bookmarks.bradyjfrey.com/add?url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title))})()";

export default async function Page() {
  const user = await getCurrentUser();

  return (
    <Shell title="Settings">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-ink">Appearance</h2>
          <p className="mt-0.5 text-[13px] text-ink-soft">Choose how Bookmarks looks. System follows your device.</p>
          <div className="mt-3">
            <ThemeToggle />
          </div>
        </section>

        <hr className="border-border" />

        <section>
          <h2 className="text-sm font-semibold text-ink">Account</h2>
          {user ? (
            <div className="mt-3 flex items-center gap-3 p-3 rounded-lg border border-border bg-bg">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink">{user.name}</div>
                <div className="text-xs text-ink-faint">{user.email}</div>
              </div>
              <a href="/api/auth/logout" className="h-9 px-3 inline-flex items-center rounded-md border border-border text-sm font-medium text-ink hover:bg-border-soft">
                Sign Out
              </a>
            </div>
          ) : (
            <p className="mt-3 text-[13px] text-ink-soft">
              <Link href="/login" className="text-accent hover:underline">Sign in with Google</Link> to add, edit, and view private bookmarks.
            </p>
          )}
        </section>

        <hr className="border-border" />

        <section>
          <h2 className="text-sm font-semibold text-ink">Quick add</h2>
          <p className="mt-0.5 text-[13px] text-ink-soft">Drag this button to your bookmarks bar, then click it on any page to save it here.</p>
          <div
            className="mt-3"
            dangerouslySetInnerHTML={{
              __html: `<a href="${BOOKMARKLET.replace(/"/g, "&quot;")}" onclick="return false" class="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-cubs text-white text-sm font-medium cursor-grab">+ Bookmarks</a>`,
            }}
          />
        </section>

        <hr className="border-border" />

        <section>
          <h2 className="text-sm font-semibold text-ink">Data</h2>
          <p className="mt-0.5 text-[13px] text-ink-soft">Export a full JSON backup of all bookmarks and tags.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/api/export" className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border text-sm font-medium text-ink hover:bg-border-soft">
              Export JSON
            </a>
          </div>
        </section>
      </div>
    </Shell>
  );
}
