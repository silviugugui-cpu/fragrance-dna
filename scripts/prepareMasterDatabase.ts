import path from "node:path";
import { parseArgs } from "node:util";
import { packMasterDatabase, restoreMasterDatabase } from "../lib/database/packedMasterDatabase";

async function main(): Promise<void> {
  const { values } = parseArgs({ options: { pack: { type: "boolean", default: false } }, strict: true });
  const databasePath = path.join(process.cwd(), "data", "generated", "fragrancedna.sqlite");
  const archivePath = `${databasePath}.gz`;
  if (values.pack) {
    await packMasterDatabase(databasePath, archivePath);
    console.log("Canonical SQLite snapshot packed. Commit the updated .sqlite.gz after database changes.");
  } else {
    const restored = restoreMasterDatabase(databasePath, archivePath, process.env.VERCEL === "1");
    console.log(restored ? "Canonical SQLite restored from the tracked archive." : "Existing local SQLite preserved and verified.");
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
