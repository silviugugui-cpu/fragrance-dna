import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  const handoffPath = path.join(
    process.cwd(),
    "docs",
    "FRAGRANCEDNA_USER_FLOW_AND_NEON_HANDOFF_2026-10-19.json",
  );

  try {
    const contents = await fs.readFile(handoffPath, "utf8");
    return new NextResponse(contents, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": "attachment; filename=FragranceDNA_User_Flow_Handoff_2026-10-19.json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "The handoff JSON file is unavailable." }, { status: 404 });
  }
}