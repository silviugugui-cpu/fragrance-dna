import { getUserScopedStorageKey } from "@/lib/auth/userScope";
import type { PersistentUserProfile } from "@/lib/database/neonDatabase";

const AUTH_USER_STORAGE_KEY = "fragrancedna_user";
const PROFILE_CACHE_KEYS: Record<Exclude<keyof PersistentUserProfile, "profileResetAt">, string> = {
  dnaProfile: "fragrance_user_profile",
  dnaSession: "fragrance_dna_session",
  grounding: "fragrance_grounding",
  groundingVector: "fragrance_vector",
  seed: "fragrance_seed",
  collection: "fragrance_collection_v1",
  ratedAttributes: "fragranceDNA-rated-attributes",
  testPlanSelections: "fragranceDNA-plan-selections",
};

const getCachedUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const user = JSON.parse(window.localStorage.getItem(AUTH_USER_STORAGE_KEY) ?? "null") as { id?: string } | null;
    return user?.id?.trim() || null;
  } catch {
    return null;
  }
};

export const hydratePersistentUserProfile = async (): Promise<void> => {
  const userId = getCachedUserId();
  if (!userId) return;

  try {
    const response = await fetch("/api/user/profile", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json() as { profile?: PersistentUserProfile };
    const profile = payload.profile ?? {};
      if (profile.profileResetAt) {
        for (const storageKey of Object.values(PROFILE_CACHE_KEYS)) {
          window.localStorage.removeItem(getUserScopedStorageKey(storageKey, userId));
        }
        window.dispatchEvent(new CustomEvent("fragrancedna-user-profile-loaded", { detail: { userId, profileResetAt: profile.profileResetAt } }));
        return;
      }
    const localProfile: PersistentUserProfile = {};
    for (const [field, storageKey] of Object.entries(PROFILE_CACHE_KEYS) as Array<[keyof PersistentUserProfile, string]>) {
      const value = profile[field];
      if (value !== undefined && value !== null) {
        window.localStorage.setItem(getUserScopedStorageKey(storageKey, userId), JSON.stringify(value));
      } else {
        const cached = window.localStorage.getItem(getUserScopedStorageKey(storageKey, userId));
        if (cached) {
          try {
            localProfile[field] = JSON.parse(cached);
          } catch {
            window.localStorage.removeItem(getUserScopedStorageKey(storageKey, userId));
          }
        }
      }
    }
    if (Object.keys(localProfile).length > 0) {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(localProfile),
      });
    }
    window.dispatchEvent(new CustomEvent("fragrancedna-user-profile-loaded", { detail: { userId } }));
  } catch {
    // Local cache remains usable when the optional Neon connection is unavailable in development.
  }
};

export const persistUserProfilePatch = (patch: PersistentUserProfile): void => {
  if (typeof window === "undefined" || !getCachedUserId()) return;
  void fetch("/api/user/profile", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  }).catch(() => undefined);
};
