// Data constants for the Quick Win Tracker.
// Extracted from QuickWinsClient.tsx so the form options and the
// annualisation multipliers can be reused by analytics/reporting code
// without pulling in the client component.

export const QUICK_WIN_TOOLS = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'notebooklm', label: 'NotebookLM' },
  { value: 'perplexity', label: 'Perplexity' },
] as const;

export const QUICK_WIN_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: '2-3x/week', label: '2–3x per week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

export const QUICK_WIN_TIME_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2+ hours' },
] as const;

// Multiplier: runs per week used to annualise "this quarter" (13 weeks).
export const QUICK_WIN_WEEKLY_RUNS: Record<string, number> = {
  daily: 5,
  '2-3x/week': 2.5,
  weekly: 1,
  monthly: 0.25,
};

// Number of logged wins that unlocks the recommendation letter template.
export const QUICK_WINS_FOR_LETTER = 3;

export function minutesToLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes === 60) return '1 hr';
  return '2+ hrs';
}

export function toolLabel(value: string): string {
  return QUICK_WIN_TOOLS.find((t) => t.value === value)?.label ?? value;
}

export function frequencyLabel(value: string): string {
  return QUICK_WIN_FREQUENCIES.find((f) => f.value === value)?.label ?? value;
}

export interface QuickWin {
  id: string;
  enrollment_id: string;
  description: string;
  tool: string;
  skill_name: string;
  frequency: string;
  time_saved_minutes: number;
  department: string;
  created_at: string;
}

export function quarterlyHours(win: QuickWin): number {
  const runsPerWeek = QUICK_WIN_WEEKLY_RUNS[win.frequency] ?? 1;
  return (runsPerWeek * 13 * win.time_saved_minutes) / 60;
}
