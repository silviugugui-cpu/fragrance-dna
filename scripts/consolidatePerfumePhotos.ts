import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  getMasterFragranceDatabase,
  getMasterFragranceDatabasePath,
  isMasterFragranceDatabaseReadOnly,
} from "../lib/database/masterFragranceDatabase";

const sources = ["master-db", "product-photos", "google-enriched", "ai-generated-perfumes"];
const root = process.cwd();
const imageRoot = path.join(root, "public", "images");
const destination = path.join(imageRoot, "perfumes");
const apply = process.argv.includes("--apply");
const checksum = (filename: string): string =>
  createHash("sha256").update(fs.readFileSync(filename)).digest("hex");

async function main(): Promise<void> {
  loadEnvConfig(root);
  if (process.argv.slice(2).some((argument) => argument !== "--apply")) {
    throw new Error("Usage: consolidatePerfumePhotos.ts [--apply]");
  }
  const files = sources.flatMap((source) => {
    const directory = path.join(imageRoot, source);
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).map((entry) => {
      if (!entry.isFile() || !/\.(png|jpe?g|webp|avif)$/i.test(entry.name)) {
        throw new Error(`Unexpected photo library entry: ${path.join(directory, entry.name)}`);
      }
      const sourcePath = path.join(directory, entry.name);
      const filename = `${source}--${entry.name}`;
      const destinationPath = path.join(destination, filename);
      const sha256 = checksum(sourcePath);
      if (fs.existsSync(destinationPath) && checksum(destinationPath) !== sha256) {
        throw new Error(`Conflicting destination: ${destinationPath}`);
      }
      return {
        sourcePath, destinationPath, sha256,
        previous: `/images/${source}/${entry.name}`,
        current: `/images/perfumes/${filename}`,
      };
    });
  });
  const mappings = new Map(files.map((file) => [file.previous, file.current]));
  const replacePaths = (value: string): string => value.replace(
    /\/images\/(?:master-db|product-photos|google-enriched|ai-generated-perfumes)\/[^"\\\s]+/g,
    (previous) => {
      const current = mappings.get(previous);
      if (!current) throw new Error(`Missing source image: ${previous}`);
      return current;
    },
  );
  const database = getMasterFragranceDatabase();
  const rows = database.prepare("SELECT row_id, local_image_path, record_json FROM fragrances").all() as {
    row_id: number; local_image_path: string; record_json: string;
  }[];
  const updates = rows.map((row) => ({
    rowId: row.row_id,
    image: replacePaths(row.local_image_path),
    json: replacePaths(row.record_json),
  })).filter((row, index) =>
    row.image !== rows[index].local_image_path || row.json !== rows[index].record_json);
  const generated = path.join(root, "data", "generated");
  const referenceFiles = [
    "complete-fragrance-database.json", "sampleMasterPerfumeObject.json",
    "product-photo-import-report.json", "user-profiles.json",
  ].flatMap((name) => {
    const filename = path.join(generated, name);
    if (!fs.existsSync(filename)) return [];
    const original = fs.readFileSync(filename, "utf8");
    const updated = replacePaths(original);
    return original === updated ? [] : [{ filename, updated }];
  });
  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run", files: files.length,
    canonicalRows: updates.length, referenceFiles: referenceFiles.length, destination,
  }, null, 2));
  if (!apply || files.length === 0) return;
  if (isMasterFragranceDatabaseReadOnly()) throw new Error("Cannot consolidate a read-only database.");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await database.backup(`${getMasterFragranceDatabasePath()}.before-photo-consolidation-${stamp}.bak`);
  fs.mkdirSync(destination, { recursive: true });
  for (const file of files) {
    if (!fs.existsSync(file.destinationPath)) fs.copyFileSync(file.sourcePath, file.destinationPath, fs.constants.COPYFILE_EXCL);
    if (checksum(file.destinationPath) !== file.sha256) throw new Error(`Copy verification failed: ${file.destinationPath}`);
  }
  const save = database.prepare("UPDATE fragrances SET local_image_path = ?, record_json = ? WHERE row_id = ?");
  database.transaction(() => {
    for (const row of updates) save.run(row.image, row.json, row.rowId);
  })();
  for (const file of referenceFiles) {
    fs.copyFileSync(file.filename, `${file.filename}.before-photo-consolidation-${stamp}.bak`, fs.constants.COPYFILE_EXCL);
    fs.writeFileSync(file.filename, file.updated);
  }
  for (const file of files) fs.unlinkSync(file.sourcePath);
  for (const source of sources) {
    const directory = path.join(imageRoot, source);
    if (fs.existsSync(directory)) fs.rmdirSync(directory);
  }
}

main().catch((error: unknown) => {
  console.error(`[consolidate-perfume-photos] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
