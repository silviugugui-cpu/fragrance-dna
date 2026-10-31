import { NextResponse } from "next/server";
import {
  createCombinedDatabaseRecord,
  deleteCombinedDatabaseRecord,
  downloadCombinedDatabaseRecordImage,
  loadMasterDatabaseDetailById,
} from "@/lib/builder/masterDatabaseWorkspace/masterDatabaseWorkspace";
import { requireAdminSession } from "@/lib/auth/serverSession";

export const dynamic = "force-dynamic";

const requireApiAdmin = async (): Promise<NextResponse | null> => {
  try {
    await requireAdminSession();
    return null;
  } catch {
    return NextResponse.json({ error: "Administrator authentication is required." }, { status: 401 });
  }
};

export async function GET(request: Request) {
  const denied = await requireApiAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const recordId = searchParams.get("recordId")?.trim() ?? "";

  if (recordId.length === 0) {
    return NextResponse.json({ error: "Missing recordId query parameter." }, { status: 400 });
  }

  const detail = loadMasterDatabaseDetailById(recordId);
  if (!detail) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  return NextResponse.json({ detail }, { status: 200 });
}

export async function DELETE(request: Request) {
  const denied = await requireApiAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const recordId = searchParams.get("recordId")?.trim() ?? "";

  if (recordId.length === 0) {
    return NextResponse.json({ error: "Missing recordId query parameter." }, { status: 400 });
  }

  const deleted = deleteCombinedDatabaseRecord(recordId);
  if (!deleted) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, recordId }, { status: 200 });
}

export async function POST(request: Request) {
  const denied = await requireApiAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const recordId = searchParams.get("recordId")?.trim() ?? "";

  if (recordId.length === 0) {
    return NextResponse.json({ error: "Missing recordId query parameter." }, { status: 400 });
  }

  try {
    const detail = await downloadCombinedDatabaseRecordImage(recordId);
    if (!detail) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }

    return NextResponse.json({ detail }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to download image from Image URL.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireApiAdmin();
  if (denied) return denied;
  let payload: Record<string, unknown> | null = null;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const toText = (value: unknown): string => (typeof value === "string" ? value : "");
  const toList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((entry) => String(entry).trim())
        .filter((entry) => entry.length > 0);
    }

    if (typeof value === "string") {
      return value
        .split(/[\n,]+/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    }

    return [];
  };

  const created = createCombinedDatabaseRecord({
    perfume: toText(payload.perfume),
    brand: toText(payload.brand),
    launchYear: toText(payload.launchYear),
    source: toText(payload.source),
    status: toText(payload.status),
    externalId: toText(payload.externalId),
    externalUrl: toText(payload.externalUrl),
    rating: toText(payload.rating),
    voteCount: toText(payload.voteCount),
    sourceFingerprint: toText(payload.sourceFingerprint),
    perfumer: toText(payload.perfumer),
    gender: toText(payload.gender),
    description: toText(payload.description),
    imageUrl: toText(payload.imageUrl),
    localImagePath: toText(payload.localImagePath),
    notes: toList(payload.notes),
    mainAccords: toList(payload.mainAccords),
  });

  if (!created) {
    return NextResponse.json(
      { error: "Unable to create record. Brand and Perfume are required." },
      { status: 400 },
    );
  }

  const detail = loadMasterDatabaseDetailById(String(created.id ?? ""));
  if (!detail) {
    return NextResponse.json({ error: "Record created but could not be loaded." }, { status: 500 });
  }

  return NextResponse.json({ detail }, { status: 201 });
}
