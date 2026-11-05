import fs from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import Database from "better-sqlite3";

function verifyDatabase(filename: string): void {
  const database = new Database(filename, { readonly: true, fileMustExist: true });
  try {
    if (database.pragma("quick_check", { simple: true }) !== "ok") {
      throw new Error("Canonical SQLite integrity check failed.");
    }
    database.prepare("SELECT row_id, record_json FROM fragrances LIMIT 1").get();
  } finally {
    database.close();
  }
}

export async function packMasterDatabase(databasePath: string, archivePath: string): Promise<void> {
  const snapshot = `${archivePath}.snapshot.tmp`;
  const temporary = `${archivePath}.tmp`;
  const database = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    await database.backup(snapshot);
    verifyDatabase(snapshot);
    fs.writeFileSync(temporary, gzipSync(fs.readFileSync(snapshot), { level: 9 }));
    fs.renameSync(temporary, archivePath);
  } finally {
    database.close();
    fs.rmSync(snapshot, { force: true });
    fs.rmSync(temporary, { force: true });
  }
}

export function restoreMasterDatabase(databasePath: string, archivePath: string, overwrite = false): boolean {
  if (!overwrite && fs.existsSync(databasePath)) {
    verifyDatabase(databasePath);
    return false;
  }
  const temporary = `${databasePath}.restore.tmp`;
  try {
    fs.writeFileSync(temporary, gunzipSync(fs.readFileSync(archivePath)));
    verifyDatabase(temporary);
    fs.renameSync(temporary, databasePath);
    return true;
  } finally {
    fs.rmSync(temporary, { force: true });
  }
}
