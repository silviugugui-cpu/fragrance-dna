import { territories } from "../data/territories";

export interface ReviewedTerritory {
  territoryId: string;
  status: "reviewed";
  source: string;
  confidence: number;
}

export function reviewedTerritories(value: unknown): ReviewedTerritory[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set(Object.values(territories).map((territory) => territory.id));
  return value.filter((item): item is ReviewedTerritory => {
    if (!item || typeof item !== "object") return false;
    const row = item as Record<string, unknown>;
    return typeof row.territoryId === "string" && ids.has(row.territoryId)
      && row.status === "reviewed" && typeof row.source === "string" && /^https?:\/\//.test(row.source)
      && typeof row.confidence === "number" && row.confidence > 0 && row.confidence <= 1;
  });
}

export function collectionTerritoryCoverage(items: Array<{ fragranceId: string; owned: boolean; reviewedTerritories?: ReviewedTerritory[] }>) {
  const owned = new Map(items.filter((item) => item.owned).map((item) => [item.fragranceId, item]));
  const ids = new Set<string>();
  let classified = 0;
  for (const item of owned.values()) {
    const labels = reviewedTerritories(item.reviewedTerritories);
    if (labels.length) classified++;
    labels.forEach((label) => ids.add(label.territoryId));
  }
  return { represented: ids.size, classified, total: owned.size,
    coverage: classified ? Math.round(ids.size / Object.keys(territories).length * 100) : null };
}
