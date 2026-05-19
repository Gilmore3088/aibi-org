// Browser-storage key migrator for the 2026-05-09 AiBI Foundations rename.
// Reads the legacy key, copies its value to the new key, and removes the
// legacy. No-op if the new key already exists (don't clobber newer state)
// or if the legacy key is absent. Safe in SSR and private browsing.

export function migrateStorageKey(
  storage: Storage,
  legacyKey: string,
  newKey: string,
): void {
  if (typeof window === 'undefined') return;
  try {
    if (storage.getItem(newKey) !== null) {
      storage.removeItem(legacyKey);
      return;
    }
    const legacyValue = storage.getItem(legacyKey);
    if (legacyValue === null) return;
    storage.setItem(newKey, legacyValue);
    storage.removeItem(legacyKey);
  } catch {
    // private browsing, disabled storage, quota — fall through silently
  }
}
