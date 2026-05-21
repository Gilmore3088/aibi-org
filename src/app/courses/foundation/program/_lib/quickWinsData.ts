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
