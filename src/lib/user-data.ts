// Client-side user data persistence via localStorage.
// Replaced by Supabase queries when auth is wired.

const STORAGE_KEY = 'aibi-user';

export interface ReadinessResult {
  readonly score: number;
  readonly tierId: string;
  readonly tierLabel: string;
  readonly answers: readonly number[];
  readonly completedAt: string;
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
  const data: UserData = {
    ...existing,
    proficiency: { ...result, completedAt: new Date().toISOString() },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isLoggedIn(): boolean {
  return getUserData() !== null;
}
