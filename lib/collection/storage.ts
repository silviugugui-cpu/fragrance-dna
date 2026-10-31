import { getFragranceCatalog } from '@/lib/collection/catalog';
import type { CollectionFragrance, CollectionSeedOptions } from '@/lib/collection/types';
import { getBrowserUserId, getUserScopedStorageKey } from '@/lib/auth/userScope';
import { persistUserProfilePatch } from '@/lib/auth/persistentProfile';

const STORAGE_KEY = 'fragrance_collection_v1';
const COLLECTION_UPDATED_EVENT = 'fragrance-collection-updated';
let memoryCache: CollectionFragrance[] | null = null;
let memoryCacheUserId: string | null = null;

export const EMPTY_COLLECTION: CollectionFragrance[] = [];

function createId(): string {
  return `collection_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readStorage(): CollectionFragrance[] {
  if (typeof window === 'undefined') {
    return EMPTY_COLLECTION;
  }

  const userId = getBrowserUserId();
  if (memoryCache && memoryCacheUserId === userId) return memoryCache;

  try {
    const scopedKey = getUserScopedStorageKey(STORAGE_KEY, userId);
    const stored = window.localStorage.getItem(scopedKey);
    if (!stored) {
      if (userId.startsWith('anonymous_')) {
        const legacyStored = window.localStorage.getItem(STORAGE_KEY);
        if (legacyStored) {
          const legacyCollection = JSON.parse(legacyStored) as CollectionFragrance[];
          if (Array.isArray(legacyCollection)) {
            window.localStorage.setItem(scopedKey, JSON.stringify(legacyCollection));
            memoryCache = legacyCollection;
            memoryCacheUserId = userId;
            return legacyCollection;
          }
        }
      }
      memoryCache = EMPTY_COLLECTION;
      memoryCacheUserId = userId;
      return memoryCache;
    }

    const parsed = JSON.parse(stored) as CollectionFragrance[];
    memoryCache = Array.isArray(parsed) ? parsed : [];
    memoryCacheUserId = userId;
    return memoryCache;
  } catch {
    memoryCache = EMPTY_COLLECTION;
    memoryCacheUserId = userId;
    return memoryCache;
  }
}

function writeStorage(items: CollectionFragrance[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getUserScopedStorageKey(STORAGE_KEY), JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(COLLECTION_UPDATED_EVENT, { detail: items }));
}

if (typeof window !== 'undefined') {
  window.addEventListener('fragrancedna-user-profile-loaded', (event) => {
    const detail = (event as CustomEvent<{ userId?: string; profileResetAt?: string }>).detail;
    const currentUserId = getBrowserUserId();
    if (detail?.userId !== currentUserId) return;

    if (detail.profileResetAt) {
      memoryCache = EMPTY_COLLECTION;
    } else {
      try {
        const stored = window.localStorage.getItem(getUserScopedStorageKey(STORAGE_KEY, currentUserId));
        const parsed = stored ? JSON.parse(stored) as CollectionFragrance[] : EMPTY_COLLECTION;
        memoryCache = Array.isArray(parsed) ? parsed : EMPTY_COLLECTION;
      } catch {
        memoryCache = EMPTY_COLLECTION;
      }
    }
    memoryCacheUserId = currentUserId;
    window.dispatchEvent(new CustomEvent(COLLECTION_UPDATED_EVENT, { detail: memoryCache }));
  });
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
  memoryCacheUserId = getBrowserUserId();
  writeStorage(normalized);
  persistUserProfilePatch({ collection: normalized });
  return normalized;
}

export function addCollectionFragrance(payload: {
  fragranceId: string;
  name?: string;
  brand?: string;
  image?: string;
  owned?: boolean;
  wishlist?: boolean;
  personalRating?: number;
  notes?: string;
  purchaseDate?: string;
}): { added: boolean; duplicate: boolean; collection: CollectionFragrance[]; item?: CollectionFragrance } {
  const fragranceId = payload.fragranceId.trim();
  const collection = loadCollection();
  const duplicate = collection.some((item) => item.fragranceId === fragranceId);

  if (duplicate || !fragranceId) {
    return { added: false, duplicate, collection };
  }

  const item: CollectionFragrance = {
    id: createId(),
    fragranceId,
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
