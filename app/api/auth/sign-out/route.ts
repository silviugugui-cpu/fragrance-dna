import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/serverSession";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  clearSessionCookie(response);
  return response;
}