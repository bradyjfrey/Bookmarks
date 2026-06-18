import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/session";
import { appOrigin } from "@/lib/googleOAuth";

async function handle(_req: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/", appOrigin()));
}

export const GET = handle;
export const POST = handle;
