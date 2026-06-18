import "server-only";
import { cache } from "react";
import { getSession, type SessionUser } from "./session";

export function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const isAllowed = (email: string) => allowedEmails().includes(email.toLowerCase());

/** The signed-in, allowlisted user — or null (public view). Cached per request. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const u = await getSession();
  return u && isAllowed(u.email) ? u : null;
});

/** Throws if not signed in; use to guard mutations. */
export async function requireUser(): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) throw new Error("Unauthorized");
  return u;
}
