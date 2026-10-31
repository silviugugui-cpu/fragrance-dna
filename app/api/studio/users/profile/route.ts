import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/serverSession";
import { clearPersistentUserProfile, readPersistentUserProfile } from "@/lib/database/neonDatabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const userId = new URL(request.url).searchParams.get("userId")?.trim() ?? "";
    if (!userId) return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    const profile = await readPersistentUserProfile(userId);
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read user profile.";
    const status = message.includes("Administrator authentication") ? 401 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminSession();
    const userId = new URL(request.url).searchParams.get("userId")?.trim() ?? "";
    if (!userId) return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    await clearPersistentUserProfile(userId);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reset user profile.";
    const status = message.includes("Administrator authentication") ? 401 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}