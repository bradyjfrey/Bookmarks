import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  GOOGLE_AUTH_URL,
  STATE_COOKIE,
  REDIRECT_COOKIE,
  generateState,
  hashState,
  getOAuthEnv,
  safeRedirect,
} from "@/lib/googleOAuth";

export async function GET(req: NextRequest) {
  const { clientId, redirectUri } = getOAuthEnv();
  const state = generateState();
  const redirectTo = safeRedirect(req.nextUrl.searchParams.get("redirect"));

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const c = await cookies();
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  };
  c.set(STATE_COOKIE, hashState(state), opts);
  c.set(REDIRECT_COOKIE, redirectTo, opts);

  return NextResponse.redirect(url.toString(), 302);
}
