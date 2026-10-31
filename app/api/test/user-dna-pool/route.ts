import { NextResponse } from "next/server";
import { readMasterUserDnaProfiles } from "@/lib/database/masterFragranceDatabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const profiles = readMasterUserDnaProfiles();
  return NextResponse.json({ profiles, count: profiles.length }, { status: 200 });
}