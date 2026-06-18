import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

async function handle(req: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/", req.nextUrl.origin));
}

export const GET = handle;
export const POST = handle;
