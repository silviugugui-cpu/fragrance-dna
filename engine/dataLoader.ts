import raw from '@/data/FragranceDNA_USER_ATTRIBUTE_LAYER_V3.json';
import type { DNAAxis, Fragrance } from '@/lib/types';

const CANONICAL_AXES = [
  'Freshness',
  'Warmth',
  'Complexity',
  'Elegance',
  'Character',
  'Presence',
  'Comfort',
  'Uniqueness',
  'Versatility',
  'Luxury',
  'Formality',
] as const;

type RawRecord = Record<string, unknown>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toPercentage(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 50;
  }
  if (numeric <= 1) {
    return Math.max(0, Math.min(100, Math.round(numeric * 100)));
  }
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeAxes(input: unknown): DNAAxis[] {
  const result: DNAAxis[] = [];

  if (Array.isArray(input)) {
    for (const entry of input) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      const rawEntry = entry as RawRecord;
      const axisName = String(rawEntry.name ?? '').trim();
      if (!axisName) {
        continue;
      }
      result.push({
        name: axisName,
        value: toPercentage(rawEntry.value ?? rawEntry.score),
      });
    }
  } else if (input && typeof input === 'object') {
    for (const [key, value] of Object.entries(input as RawRecord)) {
      if (!CANONICAL_AXES.includes(key as (typeof CANONICAL_AXES)[number])) {
        continue;
      }
      result.push({ name: key, value: toPercentage(value) });
    }
  }

  const axisMap = new Map(result.map((axis) => [axis.name, axis]));
  return CANONICAL_AXES.map((axisName) => axisMap.get(axisName) ?? { name: axisName, value: 50 });
}

function normalizeFragrance(input: RawRecord, index: number): Fragrance {
  const name = String(input.name ?? input.title ?? `Fragrance ${index + 1}`).trim();
  const id = String(input.id ?? (slugify(name) || `fragrance-${index + 1}`));
  const brand = typeof input.brand === 'string' ? input.brand : 'Independent';

  return {
    id,
    name,
    brand,
    year: typeof input.year === 'string' ? input.year : undefined,
    notes: Array.isArray(input.notes) ? (input.notes.filter((note): note is string => typeof note === 'string')) : undefined,
    dna_axes: normalizeAxes(input.dna_axes),
    semantic_v1: input.semantic_v1 && typeof input.semantic_v1 === 'object'
      ? Object.fromEntries(
          Object.entries(input.semantic_v1 as RawRecord)
            .filter(([, value]) => Number.isFinite(Number(value)))
            .map(([key, value]) => [key, toPercentage(value)])
        )
      : undefined,
  };
}

export function getLayers() {
  // Support either top-level `layers` or nested under known root key
  const asAny = raw as RawRecord;
  if (Array.isArray(asAny.layers)) return asAny.layers;
  if (
    asAny.FragranceDNA_USER_ATTRIBUTE_LAYER_v3 &&
    typeof asAny.FragranceDNA_USER_ATTRIBUTE_LAYER_v3 === 'object' &&
    Array.isArray((asAny.FragranceDNA_USER_ATTRIBUTE_LAYER_v3 as RawRecord).layers)
  ) {
    return (asAny.FragranceDNA_USER_ATTRIBUTE_LAYER_v3 as RawRecord).layers as unknown[];
  }
  return [];
}

export function getAllFragrances() {
  const layers = getLayers();

  const normalized: Fragrance[] = [];

  for (const layer of layers) {
    if (!layer || typeof layer !== 'object') {
      continue;
    }

    const asRecord = layer as RawRecord;
    const groupedFragrances =
      (Array.isArray(asRecord.fragrances) && asRecord.fragrances) ||
      (Array.isArray(asRecord.items) && asRecord.items) ||
      null;

    if (groupedFragrances) {
      groupedFragrances.forEach((item, index) => {
        if (item && typeof item === 'object') {
          normalized.push(normalizeFragrance(item as RawRecord, index));
        }
      });
      continue;
    }

    normalized.push(normalizeFragrance(asRecord, normalized.length));
  }

  return normalized;
}
