import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import Database from "better-sqlite3";
import { gzipSync, gunzipSync } from "node:zlib";
import { packMasterDatabase, restoreMasterDatabase } from "../lib/database/packedMasterDatabase";

test("canonical archive restores exact SQLite bytes and does not replace local edits", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "packed-master-test-"));
  const source = path.join(root, "master.sqlite");
  const archive = `${source}.gz`;
  const target = path.join(root, "restored.sqlite");
  const database = new Database(source);
  try {
    database.exec("CREATE TABLE fragrances (row_id INTEGER PRIMARY KEY, record_json TEXT); INSERT INTO fragrances VALUES (1, '{\"blobImageUrl\":\"https://example.com/image.jpg\"}')");
    await packMasterDatabase(source, archive);
    const snapshot = gunzipSync(fs.readFileSync(archive));
    assert.equal(restoreMasterDatabase(target, archive), true);
    assert.deepEqual(fs.readFileSync(target), snapshot);
    const local = new Database(target);
    assert.deepEqual(local.prepare("SELECT * FROM fragrances").all(), database.prepare("SELECT * FROM fragrances").all());
    local.exec("INSERT INTO fragrances VALUES (2, '{}')");
    local.close();
    assert.equal(restoreMasterDatabase(target, archive), false);
    assert.notDeepEqual(fs.readFileSync(target), snapshot);
    assert.equal(restoreMasterDatabase(target, archive, true), true);
    assert.deepEqual(fs.readFileSync(target), snapshot);
    fs.writeFileSync(archive, Buffer.from("corrupt gzip"));
    assert.throws(() => restoreMasterDatabase(target, archive, true));
    assert.deepEqual(fs.readFileSync(target), snapshot);
    fs.writeFileSync(archive, gzipSync(Buffer.from("not sqlite")));
    assert.throws(() => restoreMasterDatabase(target, archive, true));
    assert.deepEqual(fs.readFileSync(target), snapshot);
    assert.equal(fs.existsSync(`${target}.restore.tmp`), false);
  } finally {
    database.close();
    fs.rmSync(root, { recursive: true });
  }
});
