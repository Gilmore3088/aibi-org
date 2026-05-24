// Audit A3 (2026-05-24): iOS Safari evicts background tabs aggressively
// — a 4-minute interruption during the free assessment wiped
// sessionStorage state and the E2E mobile flow failed the headline
// test. localStorage survives tab eviction; a 24-hour TTL prevents
// stale resumes from leaking into a new visit days later.
//
// This module is the single storage adapter used by useAssessmentV2
// and useAssessmentInDepth so the TTL policy lives in one place.

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface Envelope<T> {
  readonly savedAt: number;
  readonly payload: T;
}

function getStore(): Storage | null {
  if (typeof window === 'undefined') return null;
  // Prefer localStorage; fall back to sessionStorage if localStorage is
  // unavailable (private mode in older Safari, some embedded webviews).
  // Probe both via a try/throwaway-write because Safari surfaces the
  // QuotaExceededError lazily on first write, not on access.
  try {
    const probeKey = '__aibi_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    /* fall through */
  }
  try {
    const probeKey = '__aibi_storage_probe__';
    window.sessionStorage.setItem(probeKey, '1');
    window.sessionStorage.removeItem(probeKey);
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function loadAssessment<T>(key: string): T | null {
  const store = getStore();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope<T>;
    if (typeof env.savedAt !== 'number') return null;
    const age = Date.now() - env.savedAt;
    if (age < 0 || age > TTL_MS) {
      // Expired or clock-skew — purge and behave as a fresh start.
      store.removeItem(key);
      return null;
    }
    return env.payload;
  } catch {
    return null;
  }
}

export function saveAssessment<T>(key: string, payload: T): void {
  const store = getStore();
  if (!store) return;
  try {
    const env: Envelope<T> = { savedAt: Date.now(), payload };
    store.setItem(key, JSON.stringify(env));
  } catch {
    /* quota or serialization failure — silent; not worth crashing the UI */
  }
}

export function clearAssessment(key: string): void {
  const store = getStore();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* swallow */
  }
}

// Exposed for tests.
export const ASSESSMENT_STORAGE_TTL_MS = TTL_MS;
