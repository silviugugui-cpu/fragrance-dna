const ANONYMOUS_USER_STORAGE_KEY = "fragrancedna_anonymous_user_id";
const AUTHENTICATED_USER_STORAGE_KEY = "fragrancedna_user";

export const getBrowserUserId = (authenticatedUserId?: string | null): string => {
  const normalizedUserId = authenticatedUserId?.trim();
  if (normalizedUserId) return normalizedUserId;
  if (typeof window === "undefined") return "anonymous";

  try {
    const storedUser = window.localStorage.getItem(AUTHENTICATED_USER_STORAGE_KEY);
    if (storedUser) {
      const parsed = JSON.parse(storedUser) as { id?: string };
      if (parsed.id?.trim()) return parsed.id.trim();
    }
  } catch {
    window.localStorage.removeItem(AUTHENTICATED_USER_STORAGE_KEY);
  }

  const existingId = window.localStorage.getItem(ANONYMOUS_USER_STORAGE_KEY);
  if (existingId) return existingId;

  const generatedId = `anonymous_${window.crypto.randomUUID()}`;
  window.localStorage.setItem(ANONYMOUS_USER_STORAGE_KEY, generatedId);
  return generatedId;
};

export const getUserScopedStorageKey = (key: string, userId?: string | null): string =>
  `${key}:${encodeURIComponent(getBrowserUserId(userId))}`;
