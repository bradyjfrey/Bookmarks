import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  state: "Your sign-in attempt expired. Please try again.",
  token: "Could not complete sign-in with Google.",
  denied: "That Google account isn't on the allowlist.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  if (await getCurrentUser()) redirect("/");
  const sp = await searchParams;
  const msg = sp.error ? (ERRORS[sp.error] ?? "Sign-in failed.") : null;
  const dest = sp.redirect?.startsWith("/") ? sp.redirect : "/";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Bookmarks</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Brady&rsquo;s personal bookmark archive.</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          {msg && <p className="mb-4 text-sm text-red-600 text-center">{msg}</p>}
          <a
            href={`/api/auth/google?redirect=${encodeURIComponent(dest)}`}
            className="w-full inline-flex items-center justify-center gap-2.5 h-11 rounded-md border border-border bg-surface text-sm font-medium text-ink hover:bg-border-soft"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.3-.97 2.4-2.06 3.13l3.33 2.58c1.94-1.79 3.06-4.43 3.06-7.58 0-.73-.07-1.43-.19-2.06H12Z" />
              <path fill="#34A853" d="M6.6 14.27 5.86 14.83l-2.6 2.02C4.9 20.1 8.2 22 12 22c2.7 0 4.96-.89 6.62-2.42l-3.33-2.58c-.9.6-2.05.96-3.29.96-2.53 0-4.68-1.71-5.45-4.01Z" />
              <path fill="#4A90D9" d="M3.26 7.15A9.96 9.96 0 0 0 2 12c0 1.61.39 3.13 1.06 4.48l3.54-2.76A5.97 5.97 0 0 1 6.28 12c0-.62.11-1.21.29-1.77L3.26 7.15Z" />
              <path fill="#FBBC05" d="M12 6.58c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.95 3.69 14.7 2.8 12 2.8 8.2 2.8 4.9 4.9 3.26 8.15l3.31 2.08C7.32 8.29 9.47 6.58 12 6.58Z" />
            </svg>
            Sign in with Google
          </a>
          <p className="mt-4 text-center text-xs text-ink-faint leading-relaxed">
            Public bookmarks are visible to everyone.
            <br />
            Sign in to add, edit, or view private bookmarks.
          </p>
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-accent hover:underline">← Browse public bookmarks</Link>
        </div>
      </div>
    </div>
  );
}
