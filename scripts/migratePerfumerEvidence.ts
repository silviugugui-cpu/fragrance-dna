import Database from "better-sqlite3";
import { gzipSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { decodeEditorialDetails } from "../lib/database/curatedCatalog";
import { creatorCredits, percentile67 } from "../lib/data/perfumerEvidence";

async function main() {
  const file = path.resolve("data", "generated", "fragrancedna.sqlite");
  const source = new Database(path.resolve("data", "generated", "perfume-house-articles.sqlite"), { readonly: true, fileMustExist: true });
  const db = new Database(file, { fileMustExist: true });
  try {
    const evidence = source.prepare(`SELECT f.source_record_id, f.perfumer, f.source_url, r.fragrantiq_rating_100 AS score
      FROM fragrances f LEFT JOIN fragrance_ratings r USING(source_record_id)`).all() as Array<{
        source_record_id: string; perfumer: string | null; source_url: string | null; score: number | null;
      }>;
    percentile67(evidence.flatMap((row) => row.score === null ? [] : [row.score]));
    const byId = new Map(evidence.map((row) => [row.source_record_id, { olfactiveScore: row.score, creatorCredits: creatorCredits(row.perfumer, row.source_url) }]));
    const houses = db.prepare("SELECT brand_id, details_blob FROM editorial_houses").all() as Array<{ brand_id: string; details_blob: Buffer }>;
    const updates = houses.flatMap((house) => {
      const details = decodeEditorialDetails(house.details_blob);
      let changed = false;
      for (const detail of Object.values(details)) {
        const next = byId.get(detail.sourceRecordId);
        if (!next) throw new Error(`Missing source evidence: ${detail.sourceRecordId}`);
        if (JSON.stringify(detail.creatorCredits) !== JSON.stringify(next.creatorCredits) || detail.olfactiveScore !== next.olfactiveScore) {
          Object.assign(detail, next);
          changed = true;
        }
      }
      return changed ? [{ id: house.brand_id, blob: gzipSync(JSON.stringify(details)) }] : [];
    });
    if (updates.length) {
      fs.mkdirSync(path.resolve("tmp"), { recursive: true });
      const backup = path.resolve("tmp", `perfumer-evidence-backup-${Date.now()}.sqlite`);
      await db.backup(backup);
      const save = db.prepare("UPDATE editorial_houses SET details_blob=? WHERE brand_id=?");
      db.transaction(() => { for (const update of updates) save.run(update.blob, update.id); })();
      db.exec("VACUUM");
      console.log(`Backup: ${backup}`);
    }
    console.log(`Updated ${updates.length} canonical house evidence blobs. Companion SQLite is ingestion-only.`);
  } finally { db.close(); source.close(); }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
