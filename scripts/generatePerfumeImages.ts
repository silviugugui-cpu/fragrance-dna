import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  readAllMasterFragrances,
  updateMasterFragranceLocalImage,
  type MasterFragranceRecord,
} from "../lib/database/masterFragranceDatabase";

const ROOT = process.cwd();
loadEnvConfig(ROOT);
const PUBLIC_DIRECTORY = path.join(ROOT, "public");
const IMAGE_DIRECTORY = path.join(PUBLIC_DIRECTORY, "images", "ai-generated-perfumes");
const REPORT_PATH = path.join(ROOT, "data", "generated", "ai-perfume-image-generation-report.json");
const API_URL = "https://api.openai.com/v1/images/generations";
const MODEL = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
const MAX_RETRIES = 3;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

interface ImageGenerationResponse {
  data?: Array<{ b64_json?: string }>;
  error?: { message?: string };
}

interface ImageCandidate {
  identity: string;
  label: string;
  localImagePath: string;
  destinationPath: string;
  prompt: string;
}

interface GenerationResult {
  identity: string;
  label: string;
  status: "generated" | "failed";
  localImagePath?: string;
  error?: string;
}

function parseInteger(value: string | undefined, fallback: number, minimum: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? Math.max(minimum, parsed) : fallback;
}

const REQUEST_DELAY_MS = parseInteger(process.env.IMAGE_GENERATION_DELAY_MS, 1000, 0);
const getIdentity = (record: MasterFragranceRecord): string =>
  String(record.canonicalKey ?? record.id ?? "").trim();

const getLabel = (record: MasterFragranceRecord): string =>
  [record.brand, record.perfume ?? record.name].map((value) => String(value ?? "").trim()).filter(Boolean).join(" - ");

const buildPrompt = (record: MasterFragranceRecord): string => {
  const label = getLabel(record);
  const notes = Array.isArray(record.notes) ? record.notes.slice(0, 8).join(", ") : "";
  const accords = Array.isArray(record.mainAccords) ? record.mainAccords.slice(0, 5).join(", ") : "";
  const description = String(record.description ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
  const details = [
    notes ? `Scent notes: ${notes}.` : "",
    accords ? `Olfactory accords: ${accords}.` : "",
    description ? `Fragrance description: ${description}` : "",
  ].filter(Boolean).join(" ");

  return [
    `Create a premium editorial still-life image inspired by the fragrance "${label}".`,
    details,
    "Show one elegant, original perfume bottle with a refined silhouette, surrounded by subtle visual cues for its scent profile.",
    "This is an artistic interpretation, not a photograph of the real retail product. Do not copy any existing bottle design, brand logo, trademark, or label. No readable text.",
    "Single centered subject, tasteful luxury art direction, soft directional studio lighting, realistic glass and materials, clean uncluttered background, square composition.",
  ].filter(Boolean).join(" ");
};

const makeCandidate = (record: MasterFragranceRecord): ImageCandidate | null => {
  const identity = getIdentity(record);
  const label = getLabel(record);
  if (!identity || !label) return null;

  const digest = createHash("sha256").update(identity).digest("hex").slice(0, 32);
  const localImagePath = `/images/ai-generated-perfumes/${digest}.png`;

  return {
    identity,
    label,
    localImagePath,
    destinationPath: path.join(IMAGE_DIRECTORY, `${digest}.png`),
    prompt: buildPrompt(record),
  };
};

const resolvePublicImagePath = (localImagePath: string): string | null => {
  const relativePath = localImagePath.replace(/^[/\\]+/, "");
  const resolvedPath = path.resolve(PUBLIC_DIRECTORY, relativePath);
  return resolvedPath.startsWith(`${PUBLIC_DIRECTORY}${path.sep}`) ? resolvedPath : null;
};

const hasUsableLocalImage = (record: MasterFragranceRecord): boolean => {
  const localImagePath = String(record.localImagePath ?? "").trim();
  if (!localImagePath) return false;
  const resolvedPath = resolvePublicImagePath(localImagePath);
  return resolvedPath !== null && fs.existsSync(resolvedPath);
};

const buildCandidates = (): { total: number; missingIdentity: number; candidates: ImageCandidate[] } => {
  const records = readAllMasterFragrances();
  const uniqueCandidates = new Map<string, ImageCandidate>();
  const identitiesWithImage = new Set<string>();
  let missingIdentity = 0;

  for (const record of records) {
    const identity = getIdentity(record);
    const candidate = makeCandidate(record);
    if (!candidate) {
      missingIdentity += 1;
      continue;
    }
    if (hasUsableLocalImage(record)) {
      identitiesWithImage.add(identity);
      continue;
    }
    if (!uniqueCandidates.has(identity)) uniqueCandidates.set(identity, candidate);
  }

  return {
    total: records.length,
    missingIdentity,
    candidates: [...uniqueCandidates.entries()]
      .filter(([identity]) => !identitiesWithImage.has(identity))
      .map(([, candidate]) => candidate),
  };
};

const parseArguments = (args: string[]): { dryRun: boolean; all: boolean; limit: number | null } => {
  const dryRun = args.includes("--dry-run");
  const all = args.includes("--all");
  const limitIndex = args.indexOf("--limit");
  const limit = limitIndex < 0 ? null : Number.parseInt(args[limitIndex + 1] ?? "", 10);

  if (limitIndex >= 0 && (!Number.isInteger(limit) || (limit ?? 0) < 1)) {
    throw new Error("Usage: npm run images:generate -- [--dry-run] [--limit N | --all]");
  }
  if (all && limit !== null) {
    throw new Error("Use either --all or --limit N, not both.");
  }

  const allowedArgs = new Set(["--dry-run", "--all", "--limit"]);
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!allowedArgs.has(arg) && !(args[index - 1] === "--limit" && /^\d+$/.test(arg))) {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return { dryRun, all, limit };
};

const wait = async (milliseconds: number): Promise<void> => {
  if (milliseconds > 0) await new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const retryDelay = (attempt: number, response: Response): number => {
  const retryAfter = Number(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return retryAfter * 1000;
  return Math.min(60_000, 1000 * 2 ** attempt);
};

const generateImage = async (candidate: ImageCandidate, apiKey: string): Promise<Buffer> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          prompt: candidate.prompt,
          size: "1024x1024",
          quality: "medium",
          output_format: "png",
        }),
        signal: AbortSignal.timeout(180_000),
      });
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        throw new Error(`Image API request failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      await wait(Math.min(60_000, 1000 * 2 ** attempt));
      continue;
    }

    if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
      await wait(retryDelay(attempt, response));
      continue;
    }

    const payload = await response.json() as ImageGenerationResponse;
    if (!response.ok) {
      throw new Error(`Image API returned ${response.status}: ${payload.error?.message ?? "No error details"}`);
    }

    const encodedImage = payload.data?.[0]?.b64_json;
    if (!encodedImage) throw new Error("Image API response did not contain base64 image data.");
    const image = Buffer.from(encodedImage, "base64");
    if (image.length < PNG_SIGNATURE.length || !image.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
      throw new Error("Image API returned data that is not a valid PNG.");
    }
    return image;
  }

  throw new Error("Image generation exhausted its retry limit.");
};

const saveImageAtomically = async (destinationPath: string, image: Buffer): Promise<void> => {
  await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
  const temporaryPath = `${destinationPath}.${randomUUID()}.tmp`;
  try {
    await fs.promises.writeFile(temporaryPath, image, { flag: "wx" });
    await fs.promises.rename(temporaryPath, destinationPath);
  } finally {
    await fs.promises.rm(temporaryPath, { force: true });
  }
};

const writeReport = async (
  results: GenerationResult[],
  summary: { total: number; missingIdentity: number; eligible: number; requested: number },
): Promise<void> => {
  await fs.promises.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.promises.writeFile(REPORT_PATH, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    model: MODEL,
    ...summary,
    generated: results.filter((result) => result.status === "generated").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
  }, null, 2)}\n`, "utf8");
};

const run = async (): Promise<void> => {
  const options = parseArguments(process.argv.slice(2));
  const { total, missingIdentity, candidates } = buildCandidates();
  const selected = options.all
    ? candidates
    : candidates.slice(0, options.limit ?? 5);
  const summary = {
    total,
    missingIdentity,
    eligible: candidates.length,
    requested: selected.length,
  };

  console.log(JSON.stringify({
    ...summary,
    mode: options.dryRun ? "dry-run" : options.all ? "all" : `batch-${options.limit ?? 5}`,
    outputDirectory: path.relative(ROOT, IMAGE_DIRECTORY),
  }, null, 2));

  if (options.dryRun || selected.length === 0) return;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is required. Add it to .env.local before generating images.");

  const results: GenerationResult[] = [];
  let interrupted = false;
  process.once("SIGINT", () => {
    interrupted = true;
    console.log("\nStop requested. Finishing the current image before exiting.");
  });

  for (const [index, candidate] of selected.entries()) {
    if (interrupted) break;
    try {
      const image = await generateImage(candidate, apiKey);
      await saveImageAtomically(candidate.destinationPath, image);
      const updatedRecords = updateMasterFragranceLocalImage(candidate.identity, candidate.localImagePath);
      if (updatedRecords === 0) {
        throw new Error(`No database rows matched fragrance identity "${candidate.identity}".`);
      }
      results.push({
        identity: candidate.identity,
        label: candidate.label,
        status: "generated",
        localImagePath: candidate.localImagePath,
      });
      console.log(`[${index + 1}/${selected.length}] Generated ${candidate.label}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        identity: candidate.identity,
        label: candidate.label,
        status: "failed",
        error: message,
      });
      console.error(`[${index + 1}/${selected.length}] Failed ${candidate.label}: ${message}`);
    }

    if (index < selected.length - 1 && !interrupted) await wait(REQUEST_DELAY_MS);
  }

  await writeReport(results, summary);
  console.log(`Report saved to ${path.relative(ROOT, REPORT_PATH)}`);
  if (interrupted || results.some((result) => result.status === "failed")) process.exitCode = 1;
};

run().catch((error: unknown) => {
  console.error(`[perfume-image-agent] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
