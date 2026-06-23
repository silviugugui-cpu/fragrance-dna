import { getAllFragrances } from '@/engine/dataLoader';
import type { Fragrance } from '@/lib/types';

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function scoreMatch(fragrance: Fragrance, query: string): number {
  const normalizedQuery = normalize(query);
  const name = normalize(fragrance.name);
  const brand = normalize(fragrance.brand ?? 'Independent');
  const notes = (fragrance.notes ?? []).map(normalize);

  if (name === normalizedQuery) {
    return 100;
  }
  if (name.startsWith(normalizedQuery)) {
    return 90;
  }
  if (name.includes(normalizedQuery)) {
    return 80;
  }
  if (brand.includes(normalizedQuery)) {
    return 55;
  }
  if (notes.some((note) => note.includes(normalizedQuery))) {
    return 40;
  }
  return 0;
}

export function getFragranceCatalog(): Fragrance[] {
  return getAllFragrances();
}

export function findFragranceById(
  fragranceId: string,
  catalog: Fragrance[] = getFragranceCatalog()
): Fragrance | null {
  return catalog.find((fragrance) => fragrance.id === fragranceId) ?? null;
}

export function searchFragrances(
  query: string,
  catalog: Fragrance[] = getFragranceCatalog()
): Fragrance[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return catalog.slice(0, 8);
  }

  return catalog
    .map((fragrance) => ({ fragrance, score: scoreMatch(fragrance, normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.fragrance.name.localeCompare(right.fragrance.name))
    .map((entry) => entry.fragrance)
    .slice(0, 8);
}
