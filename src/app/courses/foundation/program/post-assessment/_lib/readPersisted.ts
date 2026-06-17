import { migrateStorageKey } from '@/lib/storage/migrate';
import { questions as questionPool } from '@content/assessments/v2/questions';
import type { AssessmentQuestion } from '@content/assessments/v2/types';

export const QUESTIONS_PER_SESSION = 12;
export const STORAGE_KEY = 'foundations-post-assessment-v2';
const LEGACY_STORAGE_KEY = 'aibi-post-assessment-v2';

interface PersistedState {
  readonly selectedQuestionIds: readonly string[];
  readonly answers: readonly number[];
  readonly currentQuestion: number;
}

export function readPersisted(): {
  questions: AssessmentQuestion[];
  answers: number[];
  currentQuestion: number;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    migrateStorageKey(window.sessionStorage, LEGACY_STORAGE_KEY, STORAGE_KEY);
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.selectedQuestionIds)) return null;
    if (!Array.isArray(parsed.answers)) return null;
    if (typeof parsed.currentQuestion !== 'number') return null;

    const poolById = new Map(questionPool.map((q) => [q.id, q]));
    const restored = parsed.selectedQuestionIds
      .map((id) => poolById.get(id))
      .filter((q): q is AssessmentQuestion => q !== undefined);

    if (restored.length !== QUESTIONS_PER_SESSION) return null;

    return {
      questions: restored,
      answers: parsed.answers.slice(0, QUESTIONS_PER_SESSION),
      currentQuestion: Math.min(Math.max(parsed.currentQuestion, 0), QUESTIONS_PER_SESSION - 1),
    };
  } catch {
    return null;
  }
}
