import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/auth/serverSession";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentSessionUser();
    if (!user) return NextResponse.json({ user: null }, { status: 200 });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read authentication session.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}