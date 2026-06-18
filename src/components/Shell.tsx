import { getCounts, getTopTags } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

/**
 * App chrome: fixed right sidebar + a fluid main column (search header + page
 * content). The mobile drawer is a CSS-only checkbox/peer toggle. `user` is
 * null until auth lands (public view).
 */
export async function Shell({
  crumb,
  query,
  children,
}: {
  crumb?: React.ReactNode;
  query?: string;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const includePrivate = Boolean(user);
  const counts = getCounts(includePrivate);
  const topTags = getTopTags(20, includePrivate);

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 min-w-0 flex flex-col">
        <Header crumb={crumb} query={query} />
        <main className="flex-1">{children}</main>
      </div>

      {/* mobile drawer toggle (CSS-only) */}
      <input type="checkbox" id="nav" className="peer hidden" />
      <label
        htmlFor="nav"
        className="fixed inset-0 z-30 bg-black/30 hidden peer-checked:block lg:hidden"
      />
      <Sidebar counts={counts} topTags={topTags} user={user} />
    </div>
  );
}
