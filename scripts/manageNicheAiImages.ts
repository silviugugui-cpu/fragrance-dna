import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  readAllMasterFragrances,
  updateMasterFragranceLocalImage,
  type MasterFragranceRecord,
} from "../lib/database/masterFragranceDatabase";
import { loadEnvConfig } from "@next/env";

const ROOT = process.cwd();
loadEnvConfig(ROOT);
const PUBLIC_DIRECTORY = path.join(ROOT, "public");
const IMAGE_DIRECTORY = path.join(PUBLIC_DIRECTORY, "images", "perfumes");
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

interface Arguments {
  mode: "list" | "link";
  limit: number;
  recordId: string;
  imagePath: string;
}

const parseArguments = (args: string[]): Arguments => {
  let mode: Arguments["mode"] | null = null;
  let limit = 3;
  let recordId = "";
  let imagePath = "";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--list" || arg === "--link") {
      if (mode !== null) throw new Error("Choose exactly one mode: --list or --link.");
      mode = arg === "--list" ? "list" : "link";
    } else if (arg === "--limit") {
      const parsed = Number.parseInt(args[index + 1] ?? "", 10);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 3) {
        throw new Error("--limit must be an integer from 1 to 3.");
      }
      limit = parsed;
      index += 1;
    } else if (arg === "--record-id") {
      recordId = args[index + 1]?.trim() ?? "";
      if (!recordId) throw new Error("--record-id requires a value.");
      index += 1;
    } else if (arg === "--image-path") {
      imagePath = args[index + 1]?.trim() ?? "";
      if (!imagePath) throw new Error("--image-path requires a value.");
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (mode === null) throw new Error("Usage: --list [--limit 1..3] | --link --record-id ID --image-path /images/perfumes/ai-generated-perfumes--ID.png");
  if (mode === "link" && (!recordId || !imagePath)) {
    throw new Error("--link requires both --record-id and --image-path.");
  }
  if (mode === "list" && (recordId || imagePath)) {
    throw new Error("--record-id and --image-path are only valid with --link.");
  }

  return { mode, limit, recordId, imagePath };
};

const toText = (value: unknown): string => String(value ?? "").trim();

const resolveImagePath = (localImagePath: string): string | null => {
  const normalizedPath = localImagePath.replace(/\\/g, "/");
  if (!normalizedPath.startsWith("/images/perfumes/ai-generated-perfumes--") || !normalizedPath.endsWith(".png")) {
    return null;
  }

  const resolvedPath = path.resolve(PUBLIC_DIRECTORY, normalizedPath.replace(/^[/]+/, ""));
  return resolvedPath.startsWith(`${IMAGE_DIRECTORY}${path.sep}`) ? resolvedPath : null;
};

const getImagePathForRecord = (recordId: string): string => {
  const digest = createHash("sha256").update(recordId).digest("hex").slice(0, 32);
  return `/images/perfumes/ai-generated-perfumes--${digest}.png`;
};

const isValidPng = (image: Buffer): boolean => {
  if (image.length < 45 || !image.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) return false;
  if (image.subarray(12, 16).toString("ascii") !== "IHDR") return false;
  if (image.readUInt32BE(16) === 0 || image.readUInt32BE(20) === 0) return false;
  return image.subarray(-8, -4).toString("ascii") === "IEND";
};

const listCandidates = (limit: number): void => {
  const records = readAllMasterFragrances();
  const eligible = new Map<string, MasterFragranceRecord>();

  for (const record of records) {
    const recordId = toText(record.canonicalKey ?? record.id);
    if (!recordId || toText(record.brandType).toLowerCase() !== "niche") continue;
    if (toText(record.imageUrl) || toText(record.localImagePath)) continue;
    if (!eligible.has(recordId)) eligible.set(recordId, record);
  }

  const candidates = [...eligible.entries()].slice(0, limit).map(([recordId, record]) => ({
    recordId,
    imagePath: getImagePathForRecord(recordId),
    brand: toText(record.brand),
    perfume: toText(record.perfume ?? record.name),
    launchYear: toText(record.launchYear),
    notes: Array.isArray(record.notes) ? record.notes : [],
    mainAccords: Array.isArray(record.mainAccords) ? record.mainAccords : [],
    description: toText(record.description),
  }));

  console.log(JSON.stringify({
    eligibleNicheFragrances: eligible.size,
    selectedCount: candidates.length,
    candidates,
  }, null, 2));
};

const linkGeneratedImage = (recordId: string, localImagePath: string): void => {
  const resolvedPath = resolveImagePath(localImagePath);
  if (resolvedPath === null) {
    throw new Error("Image path must be an AI-generated PNG inside /images/perfumes/.");
  }
  if (localImagePath !== getImagePathForRecord(recordId)) {
    throw new Error("Image path does not match the deterministic filename for this fragrance.");
  }
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Generated image file does not exist: ${localImagePath}`);
  }

  const image = fs.readFileSync(resolvedPath);
  if (!isValidPng(image)) throw new Error(`Generated image is not a valid PNG: ${localImagePath}`);

  const record = readAllMasterFragrances().find((item) =>
    toText(item.canonicalKey ?? item.id) === recordId,
  );
  if (!record || toText(record.brandType).toLowerCase() !== "niche") {
    throw new Error(`Niche fragrance record not found: ${recordId}`);
  }
  if (toText(record.imageUrl) || toText(record.localImagePath)) {
    throw new Error(`Refusing to overwrite an existing fragrance image: ${recordId}`);
  }

  const updatedRows = updateMasterFragranceLocalImage(recordId, localImagePath);
  if (updatedRows === 0) throw new Error(`No database rows were updated for: ${recordId}`);
  console.log(JSON.stringify({ recordId, localImagePath, updatedRows }));
};

try {
  const args = parseArguments(process.argv.slice(2));
  if (args.mode === "list") {
    listCandidates(args.limit);
  } else {
    linkGeneratedImage(args.recordId, args.imagePath);
  }
} catch (error) {
  console.error(`[manage-niche-ai-images] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
