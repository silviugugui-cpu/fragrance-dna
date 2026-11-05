export interface FragranceRelationship {
  type: "inspired_by" | "clone_of" | "resembles";
  referenceBrand: string;
  referencePerfume: string;
  source: string;
  confidence: number;
}

export function fragranceRelationships(value: unknown): FragranceRelationship[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row): row is FragranceRelationship => {
    if (!row || typeof row !== "object") return false;
    const item = row as Record<string, unknown>;
    return ["inspired_by", "clone_of", "resembles"].includes(String(item.type))
      && typeof item.referenceBrand === "string" && item.referenceBrand.trim().length > 0
      && typeof item.referencePerfume === "string" && item.referencePerfume.trim().length > 0
      && typeof item.source === "string" && /^https?:\/\//.test(item.source)
      && typeof item.confidence === "number" && item.confidence > 0 && item.confidence <= 1;
  }).map((row) => ({
    type: row.type, referenceBrand: row.referenceBrand, referencePerfume: row.referencePerfume,
    source: row.source, confidence: row.confidence,
  }));
}

export function publicBrandType(value: unknown): string | undefined {
  return value === "Niche" || value === "Designer" ? value : undefined;
}

export function relationshipsFromEvidence(items: Array<{ status: string; referenceBrand: string | null; referencePerfume: string | null; source: string | null; confidence: number | null }>): FragranceRelationship[] {
  return fragranceRelationships(items.filter((item) => item.status === "brand_claimed_inspired_by" || item.status === "documented_resemblance")
    .map((item) => ({ ...item, type: item.status === "brand_claimed_inspired_by" ? "inspired_by" : "resembles" })));
}

export const INSPIRATION_SQL = `EXISTS (
  SELECT 1 FROM json_each(fragrances.record_json, '$.relationships') relation
  WHERE relation.type = 'object'
  AND json_extract(relation.value, '$.type') IN ('inspired_by', 'clone_of')
  AND length(trim(json_extract(relation.value, '$.referenceBrand'))) > 0
  AND length(trim(json_extract(relation.value, '$.referencePerfume'))) > 0
  AND (json_extract(relation.value, '$.source') LIKE 'https://%' OR json_extract(relation.value, '$.source') LIKE 'http://%')
  AND json_type(relation.value, '$.confidence') IN ('integer', 'real')
  AND json_extract(relation.value, '$.confidence') > 0
  AND json_extract(relation.value, '$.confidence') <= 1
)`;
