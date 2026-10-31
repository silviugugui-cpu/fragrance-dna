import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/auth/serverSession";
import { readPersistentUserProfile, upsertPersistentUserProfile, type PersistentUserProfile } from "@/lib/database/neonDatabase";

export const dynamic = "force-dynamic";

const ALLOWED_FIELDS = [
  "dnaProfile",
  "dnaSession",
  "grounding",
  "groundingVector",
  "seed",
  "collection",
  "ratedAttributes",
  "testPlanSelections",
] as const;

export async function GET() {
  try {
    const user = await getCurrentSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const profile = await readPersistentUserProfile(user.id);
    return NextResponse.json({ profile: profile ?? {} }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read user profile.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const payload = await request.json() as Record<string, unknown>;
    const profile: PersistentUserProfile = {};
    for (const key of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        profile[key] = payload[key];
      }
    }
    if (Object.keys(profile).length === 0) {
      return NextResponse.json({ error: "No supported profile fields were provided." }, { status: 400 });
    }
    await upsertPersistentUserProfile(user.id, profile);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save user profile.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}