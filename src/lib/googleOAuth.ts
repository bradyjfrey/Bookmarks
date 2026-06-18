import "server-only";
import { createHash, randomBytes } from "node:crypto";

export const STATE_COOKIE = "bm_oauth_state";
export const REDIRECT_COOKIE = "bm_oauth_redirect";

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export function getOAuthEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI");
  }
  return { clientId, clientSecret, redirectUri };
}

export const generateState = () => randomBytes(16).toString("hex");
export const hashState = (s: string) => createHash("sha256").update(s).digest("hex");

/** Only allow same-site relative redirects to avoid open-redirect abuse. */
export function safeRedirect(target: string | null | undefined): string {
  if (target && target.startsWith("/") && !target.startsWith("//")) return target;
  return "/";
}

/**
 * The app's public origin. Behind a reverse proxy (Traefik) the request's own
 * origin resolves to the container bind address (0.0.0.0:3000), so derive it
 * from GOOGLE_REDIRECT_URI (which is already the correct public URL) instead.
 */
export function appOrigin(): string {
  if (process.env.APP_ORIGIN) return process.env.APP_ORIGIN.replace(/\/$/, "");
  if (process.env.GOOGLE_REDIRECT_URI) return new URL(process.env.GOOGLE_REDIRECT_URI).origin;
  return "http://localhost:3001";
}
