import fs from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import Database from "better-sqlite3";
import { relationshipsFromEvidence } from "../lib/fragranceClassification";
import type { EditorialFragranceDetails } from "../lib/database/curatedCatalog";

async function main() {
  const filename = path.join(process.cwd(), "data", "generated", "fragrancedna.sqlite");
  const db = new Database(filename);
  try {
    const patches: Array<{ rowId: number; json: string }> = [];
    for (const house of db.prepare("SELECT details_blob FROM editorial_houses").all() as Array<{ details_blob: Buffer }>) {
      const details = JSON.parse(gunzipSync(house.details_blob).toString()) as Record<string, EditorialFragranceDetails>;
      for (const [id, evidence] of Object.entries(details)) {
        const relationships = relationshipsFromEvidence(evidence.similarities);
        if (!relationships.length) continue;
        const row = db.prepare("SELECT record_json FROM fragrances WHERE row_id = ?").get(Number(id)) as { record_json: string } | undefined;
        if (!row) throw new Error(`Missing canonical row ${id}`);
        const record = JSON.parse(row.record_json) as Record<string, unknown>;
        const json = JSON.stringify({ ...record, relationships });
        if (json !== row.record_json) patches.push({ rowId: Number(id), json });
      }
    }
    if (patches.length) {
      const backup = path.join(process.cwd(), "tmp", `relationships-backup-${Date.now()}.sqlite`);
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      await db.backup(backup);
      db.transaction(() => {
        const update = db.prepare("UPDATE fragrances SET record_json = ? WHERE row_id = ?");
        patches.forEach((patch) => update.run(patch.json, patch.rowId));
      })();
      console.log(`Backup: ${backup}`);
    }
    console.log(`Updated ${patches.length} canonical relationship records; no region or clone claims inferred.`);
  } finally {
    db.close();
  }
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
