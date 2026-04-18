'use client';

// /courses/aibi-p/quick-wins — Quick Win Tracker
// Course completers log automations they've built and time saved.
// Encouragement milestone: 3 wins unlocks a recommendation letter template.
//
// Client Component: form state + client-side fetch via /api/courses/log-quick-win
// Department pre-filled from onboarding primary_role stored in sessionStorage.

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ---- Constants ----

const TOOLS = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'notebooklm', label: 'NotebookLM' },
  { value: 'perplexity', label: 'Perplexity' },
] as const;

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: '2-3x/week', label: '2–3x per week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

const TIME_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2+ hours' },
] as const;

// Multiplier: runs per week used to annualise "this quarter" (13 weeks)
const WEEKLY_RUNS: Record<string, number> = {
  daily: 5,
  '2-3x/week': 2.5,
  weekly: 1,
  monthly: 0.25,
};

const WINS_FOR_LETTER = 3;

// ---- Types ----

interface QuickWin {
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

interface FormState {
  description: string;
  tool: string;
  skillName: string;
  frequency: string;
  timeSavedMinutes: number;
  department: string;
}

const EMPTY_FORM: FormState = {
  description: '',
  tool: '',
  skillName: '',
  frequency: '',
  timeSavedMinutes: 0,
  department: '',
};

// ---- Helpers ----

function minutesToLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes === 60) return '1 hr';
  return '2+ hrs';
}

function toolLabel(value: string): string {
  return TOOLS.find((t) => t.value === value)?.label ?? value;
}

function quarterlyHours(win: QuickWin): number {
  const runsPerWeek = WEEKLY_RUNS[win.frequency] ?? 1;
  return (runsPerWeek * 13 * win.time_saved_minutes) / 60;
}

// ---- Main Component ----

export default function QuickWinsPage() {
  const [wins, setWins] = useState<QuickWin[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing wins
  const loadWins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses/log-quick-win');
      if (!res.ok) throw new Error('Failed to load wins');
      const json = (await res.json()) as { wins: QuickWin[] };
      setWins(json.wins);
    } catch {
      setError('Could not load your quick wins. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWins();
  }, [loadWins]);

  // Derived: total quarterly hours saved
  const totalQuarterlyHours = wins.reduce((acc, win) => acc + quarterlyHours(win), 0);
  const winsToGo = Math.max(0, WINS_FOR_LETTER - wins.length);

  function handleField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function isFormValid(): boolean {
    return (
      form.description.trim().length > 0 &&
      form.tool.length > 0 &&
      form.skillName.trim().length > 0 &&
      form.frequency.length > 0 &&
      form.timeSavedMinutes > 0 &&
      form.department.trim().length > 0
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid() || submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/courses/log-quick-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: 'dev-mock-enrollment',
          description: form.description,
          tool: form.tool,
          skillName: form.skillName,
          frequency: form.frequency,
          timeSavedMinutes: form.timeSavedMinutes,
          department: form.department,
        }),
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? 'Submission failed');
      }

      const json = (await res.json()) as { win: QuickWin };
      setWins((prev) => [json.win, ...prev]);
      setForm(EMPTY_FORM);
      setSuccessMsg('Quick win logged.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto px-8 lg:px-16 py-16">

      {/* Breadcrumb */}
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
          <li>
            <Link
              href="/courses/aibi-p"
              className="hover:text-[color:var(--color-terra)] transition-colors"
            >
              AiBI-P
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-[color:var(--color-ink)]">Quick Wins</li>
        </ol>
      </nav>

      {/* Page header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-terra)]">
            Post-Course
          </span>
          <div className="h-px w-8 bg-[color:var(--color-terra)]/30" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-slate)]">
            Value Log
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[color:var(--color-ink)] mb-4">
          Quick Win Tracker
        </h1>

        <p className="font-sans text-base text-[color:var(--color-ink)]/80 leading-relaxed max-w-2xl">
          Log every workflow you&apos;ve automated. Each entry builds your professional
          record and proves the return on your AI Practitioner training.
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div
          className="bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/10 rounded-sm p-5"
          aria-label="Time saved this quarter"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-1">
            Saved this quarter
          </div>
          <div className="font-mono text-3xl font-bold text-[color:var(--color-terra)] tabular-nums">
            {totalQuarterlyHours.toFixed(1)}
            <span className="text-base font-normal text-[color:var(--color-slate)] ml-1">hrs</span>
          </div>
        </div>

        <div
          className="bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/10 rounded-sm p-5"
          aria-label="Quick wins logged"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-1">
            Wins logged
          </div>
          <div className="font-mono text-3xl font-bold text-[color:var(--color-ink)] tabular-nums">
            {wins.length}
          </div>
        </div>
      </div>

      {/* Encouragement banner */}
      <div
        className="mb-10 border border-[color:var(--color-sage)]/30 bg-[color:var(--color-sage)]/5 rounded-sm px-5 py-4"
        role="status"
        aria-live="polite"
      >
        {winsToGo === 0 ? (
          <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
            You have logged{' '}
            <span className="font-mono font-bold text-[color:var(--color-sage)] tabular-nums">
              {wins.length}
            </span>{' '}
            quick wins. Your{' '}
            <span className="font-bold">recommendation letter template</span> is
            unlocked — download it from your{' '}
            <Link
              href="/courses/aibi-p/certificate"
              className="underline hover:text-[color:var(--color-terra)] transition-colors"
            >
              certificate page
            </Link>
            .
          </p>
        ) : (
          <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
            Log{' '}
            <span className="font-mono font-bold text-[color:var(--color-sage)] tabular-nums">
              {winsToGo}
            </span>{' '}
            more quick {winsToGo === 1 ? 'win' : 'wins'} to earn a{' '}
            <span className="font-bold">recommendation letter template</span>.
          </p>
        )}
      </div>

      {/* Log form */}
      <section aria-labelledby="log-form-heading" className="mb-14">
        <h2
          id="log-form-heading"
          className="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-6"
        >
          Log a new quick win
        </h2>

        {error && (
          <div
            role="alert"
            className="mb-5 px-4 py-3 border border-[color:var(--color-error)]/30 bg-[color:var(--color-error)]/5 rounded-sm font-sans text-sm text-[color:var(--color-error)]"
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            aria-live="polite"
            className="mb-5 px-4 py-3 border border-[color:var(--color-sage)]/30 bg-[color:var(--color-sage)]/5 rounded-sm font-sans text-sm text-[color:var(--color-ink)]"
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-5">

          {/* Description */}
          <div>
            <label
              htmlFor="qw-description"
              className="block font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2"
            >
              What did you automate?
            </label>
            <input
              id="qw-description"
              type="text"
              required
              maxLength={200}
              placeholder='e.g. "Weekly exception report analysis"'
              value={form.description}
              onChange={(e) => handleField('description', e.target.value)}
              className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/20 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]/40"
            />
          </div>

          {/* Tool + Skill row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="qw-tool"
                className="block font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2"
              >
                Which tool?
              </label>
              <select
                id="qw-tool"
                required
                value={form.tool}
                onChange={(e) => handleField('tool', e.target.value)}
                className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/20 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]/40"
              >
                <option value="">Select tool</option>
                {TOOLS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="qw-skill"
                className="block font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2"
              >
                Which skill?
              </label>
              <input
                id="qw-skill"
                type="text"
                required
                maxLength={100}
                placeholder='e.g. "RTFC Framework" or "custom workflow"'
                value={form.skillName}
                onChange={(e) => handleField('skillName', e.target.value)}
                className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/20 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]/40"
              />
            </div>
          </div>

          {/* Frequency + Time row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="qw-frequency"
                className="block font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2"
              >
                How often?
              </label>
              <select
                id="qw-frequency"
                required
                value={form.frequency}
                onChange={(e) => handleField('frequency', e.target.value)}
                className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/20 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]/40"
              >
                <option value="">Select frequency</option>
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="qw-time"
                className="block font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2"
              >
                Time saved per use
              </label>
              <select
                id="qw-time"
                required
                value={form.timeSavedMinutes || ''}
                onChange={(e) => handleField('timeSavedMinutes', Number(e.target.value))}
                className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/20 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]/40"
              >
                <option value="">Select time</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="qw-department"
              className="block font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2"
            >
              Department
            </label>
            <input
              id="qw-department"
              type="text"
              required
              maxLength={100}
              placeholder='e.g. "Compliance" or "Lending"'
              value={form.department}
              onChange={(e) => handleField('department', e.target.value)}
              className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/20 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]/40"
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || submitting}
            className="mt-2 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] disabled:opacity-40 disabled:cursor-not-allowed text-[color:var(--color-linen)] px-6 py-3 rounded-sm font-mono text-[10px] uppercase tracking-widest font-bold transition-colors"
            aria-busy={submitting}
          >
            {submitting ? 'Logging...' : 'Log Quick Win'}
          </button>
        </form>
      </section>

      {/* Logged wins list */}
      <section aria-labelledby="wins-list-heading">
        <h2
          id="wins-list-heading"
          className="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-6"
        >
          Your wins
        </h2>

        {loading && (
          <p className="font-sans text-sm text-[color:var(--color-slate)]">Loading...</p>
        )}

        {!loading && wins.length === 0 && (
          <p className="font-sans text-sm text-[color:var(--color-ink)]/60 italic">
            No quick wins logged yet. Use the form above to add your first one.
          </p>
        )}

        {!loading && wins.length > 0 && (
          <ol className="space-y-4" aria-label="Logged quick wins">
            {wins.map((win) => (
              <li
                key={win.id}
                className="bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/10 rounded-sm px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="font-serif text-sm font-bold text-[color:var(--color-ink)] leading-snug flex-1">
                    {win.description}
                  </p>
                  <span className="font-mono text-sm font-bold text-[color:var(--color-terra)] tabular-nums shrink-0">
                    {minutesToLabel(win.time_saved_minutes)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                    {toolLabel(win.tool)}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                    {win.skill_name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                    {win.frequency}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                    {win.department}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
