import { findFragranceById, getFragranceCatalog } from '@/lib/collection/catalog';
import type { CollectionFragrance, CollectionSeedOptions } from '@/lib/collection/types';

const STORAGE_KEY = 'fragrance_collection_v1';
const COLLECTION_UPDATED_EVENT = 'fragrance-collection-updated';
let memoryCache: CollectionFragrance[] | null = null;

function createId(): string {
  return `collection_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readStorage(): CollectionFragrance[] {
  if (memoryCache) {
    return memoryCache;
  }

  if (typeof window === 'undefined') {
    memoryCache = [];
    return memoryCache;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      memoryCache = [];
      return memoryCache;
    }

    const parsed = JSON.parse(stored) as CollectionFragrance[];
    memoryCache = Array.isArray(parsed) ? parsed : [];
    return memoryCache;
  } catch {
    memoryCache = [];
    return memoryCache;
  }
}

function writeStorage(items: CollectionFragrance[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(COLLECTION_UPDATED_EVENT, { detail: items }));
}

export function loadCollection(): CollectionFragrance[] {
  return readStorage();
}

export function saveCollection(items: CollectionFragrance[]): CollectionFragrance[] {
  const normalized = items.map((item) => ({
    ...item,
    owned: Boolean(item.owned),
    wishlist: Boolean(item.wishlist),
    personalRating: typeof item.personalRating === 'number' ? clampRating(item.personalRating) : undefined,
    notes: item.notes?.trim() || undefined,
  }));

  memoryCache = normalized;
  writeStorage(normalized);
  return normalized;
}

export function addCollectionFragrance(payload: {
  fragranceId: string;
  owned?: boolean;
  wishlist?: boolean;
  personalRating?: number;
  notes?: string;
  purchaseDate?: string;
}): { added: boolean; duplicate: boolean; collection: CollectionFragrance[]; item?: CollectionFragrance } {
  const catalogItem = findFragranceById(payload.fragranceId);
  const collection = loadCollection();
  const duplicate = collection.some((item) => item.fragranceId === payload.fragranceId);

  if (duplicate || !catalogItem) {
    return { added: false, duplicate, collection };
  }

  const item: CollectionFragrance = {
    id: createId(),
    fragranceId: catalogItem.id,
    name: catalogItem.name,
    brand: catalogItem.brand ?? 'Independent',
    personalRating: typeof payload.personalRating === 'number' ? clampRating(payload.personalRating) : undefined,
    owned: payload.owned ?? true,
    wishlist: payload.wishlist ?? false,
    purchaseDate: payload.purchaseDate,
    notes: payload.notes?.trim() || undefined,
  };

  const next = saveCollection([...collection, item]);
  return { added: true, duplicate: false, collection: next, item };
}

export function updateCollectionFragrance(
  collectionItemId: string,
  updates: Partial<Pick<CollectionFragrance, 'personalRating' | 'notes' | 'owned' | 'wishlist' | 'purchaseDate' | 'image'>>
): CollectionFragrance[] {
  const collection = loadCollection();
  const next = collection.map((item) =>
    item.id === collectionItemId
      ? {
          ...item,
          ...updates,
          personalRating: typeof updates.personalRating === 'number' ? clampRating(updates.personalRating) : updates.personalRating,
          notes: typeof updates.notes === 'string' ? updates.notes.trim() || undefined : item.notes,
          owned: typeof updates.owned === 'boolean' ? updates.owned : item.owned,
          wishlist: typeof updates.wishlist === 'boolean' ? updates.wishlist : item.wishlist,
        }
      : item
  );

  return saveCollection(next);
}

export function removeCollectionFragrance(collectionItemId: string): CollectionFragrance[] {
  const next = loadCollection().filter((item) => item.id !== collectionItemId);
  return saveCollection(next);
}

export function createCollectionSeed(options: CollectionSeedOptions = {}): CollectionFragrance[] {
  const source = options.source ?? getFragranceCatalog();
  const count = options.count ?? Math.min(6, source.length);

  return source.slice(0, count).map((fragrance, index) => ({
    id: `seed_${fragrance.id}_${index}`,
    fragranceId: fragrance.id,
    name: fragrance.name,
    brand: fragrance.brand ?? 'Independent',
    personalRating: 8 + (index % 2),
    owned: true,
    wishlist: false,
    notes: `Seeded collection item for ${fragrance.name}`,
  }));
}

export function subscribeToCollection(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = () => listener();
  window.addEventListener(COLLECTION_UPDATED_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(COLLECTION_UPDATED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

function clampRating(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value * 10) / 10));
}
