// Client-side user data persistence via localStorage.
// localStorage is the primary write path (fast, always available).
// Supabase is a secondary write path — synced async via API routes when
// configured. Dashboard reads try Supabase first, fall back to localStorage.

const STORAGE_KEY = 'aibi-user';

export interface DimensionScoreSerialized {
  readonly score: number;
  readonly maxScore: number;
  readonly label: string;
}

export interface ReadinessResult {
  readonly score: number;
  readonly tierId: string;
  readonly tierLabel: string;
  readonly answers: readonly number[];
  readonly completedAt: string;
  // v2 additions (optional for backward compat with v1-shaped persisted data)
  readonly version?: 'v1' | 'v2';
  readonly maxScore?: number;
  readonly dimensionBreakdown?: Record<string, DimensionScoreSerialized>;
}

export interface TopicScore {
  readonly topic: string;
  readonly label: string;
  readonly correct: number;
  readonly total: number;
  readonly pct: number;
}

export interface ProficiencyResult {
  readonly pctCorrect: number;
  readonly levelId: string;
  readonly levelLabel: string;
  readonly topicScores: readonly TopicScore[];
  readonly completedAt: string;
}

export interface UserData {
  readonly email: string;
  readonly readiness?: ReadinessResult;
  readonly proficiency?: ProficiencyResult;
}

// ── Synchronous localStorage helpers ────────────────────────────────────────

export function getUserData(): UserData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserData;
  } catch {
    return null;
  }
}

export function saveReadinessResult(
  email: string,
  result: Omit<ReadinessResult, 'completedAt'>
): void {
  if (typeof window === 'undefined') return;
  const existing = getUserData();
  const data: UserData = {
    ...existing,
    email,
    readiness: { ...result, completedAt: new Date().toISOString() },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveProficiencyResult(
  result: Omit<ProficiencyResult, 'completedAt'>
): void {
  if (typeof window === 'undefined') return;
  const existing = getUserData();
  if (!existing) return;
  const completedAt = new Date().toISOString();
  const proficiency: ProficiencyResult = { ...result, completedAt };
  const data: UserData = { ...existing, proficiency };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // Fire-and-forget Supabase sync — failure is silently swallowed so
  // the exam results page is never blocked waiting for a network call.
  syncProficiencyToSupabase(existing.email, proficiency).catch(() => {
    // Intentional no-op: localStorage is the fallback.
  });
}

export function isLoggedIn(): boolean {
  return getUserData() !== null;
}

// ── Supabase sync helpers ────────────────────────────────────────────────────

/**
 * Push a proficiency result to /api/save-proficiency.
 * Only called after the localStorage write succeeds and only when an
 * email is already known (captured at the assessment email gate).
 */
async function syncProficiencyToSupabase(
  email: string,
  result: ProficiencyResult
): Promise<void> {
  await fetch('/api/save-proficiency', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      pctCorrect: result.pctCorrect,
      levelId: result.levelId,
      levelLabel: result.levelLabel,
      topicScores: result.topicScores,
      completedAt: result.completedAt,
    }),
  });
}

/**
 * Try to load the user's profile from Supabase, falling back to localStorage.
 *
 * Call this from the dashboard instead of getUserData() directly.
 * Returns null if neither source has data (user has not taken assessment).
 */
export async function getUserDataWithSupabaseFallback(): Promise<UserData | null> {
  // Always read localStorage first — it is the fast path and works offline.
  const local = getUserData();

  // No email means no Supabase lookup is possible.
  if (!local?.email) return local;

  try {
    const res = await fetch(
      `/api/user-profile?email=${encodeURIComponent(local.email)}`,
      { cache: 'no-store' }
    );

    // 503 = Supabase not configured; 404 = no profile yet. Fall back silently.
    if (res.status === 503 || res.status === 404) return local;

    if (!res.ok) return local;

    const remote = (await res.json()) as UserData;

    // Merge: prefer whichever source has the more recent result for each field.
    // completedAt is an ISO string so lexicographic comparison is correct.
    const readiness = newerReadiness(local.readiness, remote.readiness);
    const proficiency = newerProficiency(local.proficiency, remote.proficiency);

    const merged: UserData = {
      email: local.email,
      ...(readiness ? { readiness } : {}),
      ...(proficiency ? { proficiency } : {}),
    };

    // Backfill localStorage with any data retrieved from Supabase so
    // subsequent synchronous reads are up-to-date on this device.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

    return merged;
  } catch {
    // Network error — fall back to localStorage without noise.
    return local;
  }
}

// ── Merge helpers ────────────────────────────────────────────────────────────

function newerReadiness(
  a: ReadinessResult | undefined,
  b: ReadinessResult | undefined
): ReadinessResult | undefined {
  if (!a) return b;
  if (!b) return a;
  return a.completedAt >= b.completedAt ? a : b;
}

function newerProficiency(
  a: ProficiencyResult | undefined,
  b: ProficiencyResult | undefined
): ProficiencyResult | undefined {
  if (!a) return b;
  if (!b) return a;
  return a.completedAt >= b.completedAt ? a : b;
}
