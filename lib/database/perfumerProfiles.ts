import { getMasterFragranceDatabase } from "./masterFragranceDatabase";
import { decodeEditorialDetails } from "./curatedCatalog";
import { calculatePerfumerStatistics, type PerfumerCreationEvidence } from "../data/perfumerEvidence";
import { topPerfumerProfiles, type TopPerfumerProfile } from "../data/topPerfumerProfiles";

export type EvidencedPerfumerProfile = TopPerfumerProfile & {
  topCreations: number;
  evaluatedCreations: number;
  works: Array<ReturnType<typeof calculatePerfumerStatistics>["statistics"][number]["works"][number] & { recordId: string | null }>;
  rank: number | null;
};

export function readEvidencedPerfumerProfiles(): EvidencedPerfumerProfile[] {
  const db = getMasterFragranceDatabase();
  const rows = db.prepare(`SELECT e.row_id, e.source_record_id, e.brand_id, f.record_id, f.brand, f.perfume
    FROM editorial_fragrances e JOIN fragrances f ON f.row_id=e.row_id
    WHERE e.row_id IN (SELECT MIN(row_id) FROM editorial_fragrances GROUP BY source_record_id)
    ORDER BY e.row_id`).all() as Array<{
      row_id: number; source_record_id: string; brand_id: string; record_id: string; brand: string; perfume: string;
    }>;
  const houses = db.prepare("SELECT brand_id, details_blob FROM editorial_houses").all() as Array<{ brand_id: string; details_blob: Buffer }>;
  const details = new Map(houses.map((house) => [house.brand_id, decodeEditorialDetails(house.details_blob)]));
  const evidence: PerfumerCreationEvidence[] = rows.map((row) => {
    const item = details.get(row.brand_id)?.[row.row_id];
    if (!item) throw new Error(`Missing canonical perfumer provenance: ${row.source_record_id}`);
    return { id: row.source_record_id, brand: row.brand, name: row.perfume, score: item.olfactiveScore ?? null, credits: item.creatorCredits ?? [] };
  });
  const { statistics } = calculatePerfumerStatistics(topPerfumerProfiles, evidence);
  const recordIds = new Map(rows.map((row) => [row.source_record_id, row.record_id]));
  return topPerfumerProfiles.map((profile) => {
    const stats = statistics.find((item) => item.slug === profile.slug);
    if (!stats) throw new Error(`Missing perfumer statistics: ${profile.slug}`);
    return { ...profile, ...stats, works: stats.works.map((work) => ({ ...work, recordId: recordIds.get(work.id) ?? null })) };
  });
}
