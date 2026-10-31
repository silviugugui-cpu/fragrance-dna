import fs from "node:fs";

const path = "data/generated/complete-fragrance-database.json";
const raw = fs.readFileSync(path, "utf-8");
const parsed = JSON.parse(raw);
const records = Array.isArray(parsed?.records) ? parsed.records : [];
const first = records[0] ?? null;

const keyCounts = new Map();
for (const rec of records.slice(0, 2000)) {
  if (!rec || typeof rec !== "object") {
    continue;
  }
  for (const key of Object.keys(rec)) {
    keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
  }
}

const topKeys = Array.from(keyCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40)
  .map(([key, count]) => ({ key, countInSample: count }));

console.log(
  JSON.stringify(
    {
      totalCombinedPerfumes: parsed?.totalCombinedPerfumes ?? null,
      recordsLength: records.length,
      firstRecordKeys: first ? Object.keys(first) : [],
      firstRecordSample: first,
      topKeys,
    },
    null,
    2,
  ),
);
