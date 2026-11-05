import { getUserScopedStorageKey } from "@/lib/auth/userScope";
import type { PersistentUserProfile } from "@/lib/database/neonDatabase";

const AUTH_USER_STORAGE_KEY = "fragrancedna_user";
let hydrationErrorUserId: string | null = null;
export const hasProfileHydrationError = (): boolean => hydrationErrorUserId !== null && hydrationErrorUserId === getCachedUserId();
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
    if (!response.ok) throw new Error(`Profile hydration failed (${response.status}).`);
    const payload = await response.json() as { profile?: PersistentUserProfile };
    if (getCachedUserId() !== userId) return;
    const profile = payload.profile ?? {};
      if (profile.profileResetAt) {
        hydrationErrorUserId = null;
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
        if (field === "dnaSession") {
          const cached = window.localStorage.getItem(getUserScopedStorageKey(storageKey, userId));
          if (cached) {
            const local = JSON.parse(cached) as { schemaVersion?: number; lastUpdatedAt?: number; evaluationState?: { records?: unknown[]; draft?: unknown; legacyPerception?: { answers?: Record<string, unknown> } } };
            const remote = value as { schemaVersion?: number; lastUpdatedAt?: number };
            const hasLocalProgress = Boolean(local.evaluationState?.draft || local.evaluationState?.records?.length || Object.keys(local.evaluationState?.legacyPerception?.answers ?? {}).length);
            if (local.schemaVersion === 2 && hasLocalProgress && (local.lastUpdatedAt ?? 0) >= (remote.lastUpdatedAt ?? 0)) {
              localProfile.dnaSession = local;
              continue;
            }
          }
        }
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
      await persistUserProfilePatchStrict(localProfile);
    }
    hydrationErrorUserId = null;
    window.dispatchEvent(new CustomEvent("fragrancedna-user-profile-loaded", { detail: { userId } }));
  } catch (error: unknown) {
    hydrationErrorUserId = userId;
    console.error("[profile] Profile hydration failed; local progress was preserved.", error);
    window.dispatchEvent(new CustomEvent("fragrancedna-user-profile-error", { detail: { userId } }));
  }
};

export const persistUserProfilePatch = (patch: PersistentUserProfile): void => {
  void persistUserProfilePatchStrict(patch).catch((error: unknown) => console.error("[profile] Profile synchronization failed.", error));
};

let profileWrites: Promise<void> = Promise.resolve();
export const persistUserProfilePatchStrict = (patch: PersistentUserProfile): Promise<void> => {
  const userId = getCachedUserId();
  if (typeof window === "undefined" || !userId) return Promise.resolve();
  const body = JSON.stringify(patch);
  const write = profileWrites.then(async () => {
    if (getCachedUserId() !== userId) throw new Error("Account changed before profile synchronization.");
    const response = await fetch("/api/user/profile", { method: "PUT", headers: { "content-type": "application/json" }, body });
    if (!response.ok) throw new Error(`Profile save failed (${response.status}).`);
  });
  profileWrites = write.catch((error: unknown) => console.error("[profile] Profile write failed.", error));
  return write;
};
