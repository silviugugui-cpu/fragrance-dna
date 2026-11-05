export interface CreatorCredit {
  name: string;
  role: "perfumer";
  source: string;
}

export interface PerfumerCreationEvidence {
  id: string;
  brand: string;
  name: string;
  score: number | null;
  credits: CreatorCredit[];
}

export interface CreditedWork {
  id: string;
  brand: string;
  name: string;
  credits: CreatorCredit[];
}

export const MIN_EVALUATED_CREATIONS = 15;
export const normalizeCreator = (value: string): string =>
  value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function creatorCredits(names: string | null, source: string | null): CreatorCredit[] {
  if (!names?.trim() || !source) return [];
  const url = new URL(source);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Perfumer attribution requires an HTTP source.");
  return [...new Set(names.split(/,|;|\s+and\s+|\s+&\s+/).map((name) => name.trim()).filter(Boolean))]
    .map((name) => ({ name, role: "perfumer", source: url.href }));
}

export function percentile67(scores: number[]): number | null {
  if (!scores.length) return null;
  if (scores.some((score) => !Number.isFinite(score) || score < 0 || score > 100)) throw new Error("Invalid Olfactive Score.");
  const sorted = [...scores].sort((a, b) => a - b);
  const position = (sorted.length - 1) * 0.67;
  const lower = Math.floor(position);
  return sorted[lower] + (sorted[Math.ceil(position)] - sorted[lower]) * (position - lower);
}

export function calculatePerfumerStatistics(people: Array<{ slug: string; name: string }>, evidence: PerfumerCreationEvidence[]) {
  const unique = new Map<string, PerfumerCreationEvidence>();
  for (const creation of evidence) {
    const previous = unique.get(creation.id);
    if (previous && JSON.stringify(previous) !== JSON.stringify(creation)) throw new Error(`Conflicting creation evidence: ${creation.id}`);
    unique.set(creation.id, creation);
  }
  const evaluated = [...unique.values()].filter((row): row is PerfumerCreationEvidence & { score: number } => row.score !== null);
  const cutoff = percentile67(evaluated.map((row) => row.score));
  const statistics = people.map((person) => {
    const attributed = evaluated.filter((row) => row.credits.some((credit) =>
      normalizeCreator(credit.name) === normalizeCreator(person.name) && credit.role === "perfumer" && /^https?:\/\//.test(credit.source)));
    const top = attributed.filter((row) => cutoff !== null && row.score >= cutoff).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    return {
      slug: person.slug,
      topCreations: top.length,
      evaluatedCreations: attributed.length,
      works: top.map(({ id, brand, name, credits }): CreditedWork => ({ id, brand, name, credits })),
      rank: null as number | null,
    };
  });
  const compare = (a: typeof statistics[number], b: typeof statistics[number]) =>
    b.topCreations - a.topCreations || b.topCreations * a.evaluatedCreations - a.topCreations * b.evaluatedCreations;
  const ranked = statistics.filter((item) => item.evaluatedCreations >= MIN_EVALUATED_CREATIONS).sort(compare);
  ranked.forEach((item, index) => {
    item.rank = index > 0 && compare(ranked[index - 1], item) === 0 ? ranked[index - 1].rank : index + 1;
  });
  return { statistics, evaluated: evaluated.length, cutoff, qualifying: evaluated.filter((row) => cutoff !== null && row.score >= cutoff).length };
}
