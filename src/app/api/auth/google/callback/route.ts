import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";
import {
  GOOGLE_TOKEN_URL,
  STATE_COOKIE,
  REDIRECT_COOKIE,
  getOAuthEnv,
  hashState,
  safeRedirect,
  appOrigin,
} from "@/lib/googleOAuth";
import { createSession } from "@/lib/session";
import { isAllowed } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const c = await cookies();
  const origin = appOrigin();
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expected = c.get(STATE_COOKIE)?.value;
  const redirectTo = safeRedirect(c.get(REDIRECT_COOKIE)?.value);
  c.delete(STATE_COOKIE);
  c.delete(REDIRECT_COOKIE);

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, origin));

  if (!code || !state || !expected || hashState(state) !== expected) return fail("state");

  const { clientId, clientSecret, redirectUri } = getOAuthEnv();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) return fail("token");

  const tokens = (await res.json()) as { id_token?: string };
  if (!tokens.id_token) return fail("token");

  const claims = decodeJwt(tokens.id_token) as { email?: string; name?: string };
  if (!claims.email || !isAllowed(claims.email)) return fail("denied");

  await createSession({ email: claims.email, name: claims.name || claims.email });
  return NextResponse.redirect(new URL(redirectTo, origin));
}
