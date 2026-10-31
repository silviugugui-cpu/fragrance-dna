import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const src = path.join(process.cwd(), "data", "generated", "user-dna-test-database.xlsx");

if (!fs.existsSync(src)) {
  throw new Error(`Source file not found: ${src}`);
}

let desktop = path.join(os.homedir(), "OneDrive", "Desktop");
if (!fs.existsSync(desktop)) {
  desktop = path.join(os.homedir(), "Desktop");
}

const dst = path.join(desktop, "user-dna-test-database.xlsx");
fs.copyFileSync(src, dst);
const info = fs.statSync(dst);

console.log(
  JSON.stringify(
    {
      savedTo: dst,
      sizeBytes: info.size,
      modifiedAt: info.mtime.toISOString(),
    },
    null,
    2,
  ),
);
