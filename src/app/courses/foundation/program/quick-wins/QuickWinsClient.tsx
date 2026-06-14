'use client';

// /courses/foundation/program/quick-wins — Quick Win Tracker
// Course completers log automations they've built and time saved.
// Three wins produces the recommendation-letter template — the practical
// artifact each set of wins is for.
//
// Client Component: form state + client-side fetch via /api/courses/log-quick-win
// Department pre-filled from onboarding primary_role stored in sessionStorage.

import { useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import {
  QUICK_WIN_TOOLS as TOOLS,
  QUICK_WIN_FREQUENCIES as FREQUENCIES,
  QUICK_WIN_TIME_OPTIONS as TIME_OPTIONS,
  QUICK_WIN_WEEKLY_RUNS as WEEKLY_RUNS,
  QUICK_WINS_FOR_LETTER as WINS_FOR_LETTER,
} from '../_lib/quickWinsData';
import { LetterTemplatePreview } from './_local/LetterTemplatePreview';

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

// ---- Shared styles ----

const fieldLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--slate-600)',
  marginBottom: 8,
};

const inputStyle: CSSProperties = {
  width: '100%',
  background: 'var(--cream)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 16,
  color: 'var(--ink)',
  outline: 'none',
  fontFamily: 'inherit',
};

// ---- Main Component ----

export function QuickWinsClient() {
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
        <ol
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}
        >
          <li>
            <Link
              href="/courses/foundation/program"
              style={{ color: 'var(--slate-500)', textDecoration: 'none' }}
            >
              AiBI-Foundation
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li style={{ color: 'var(--ink)' }}>Quick Wins</li>
        </ol>
      </nav>

      {/* Artifact-first: render the letter template the wins are for */}
      <LetterTemplatePreview
        wins={wins.map((w) => ({
          description: w.description,
          toolLabel: toolLabel(w.tool),
          department: w.department,
          quarterlyHours: quarterlyHours(w),
        }))}
        winsForLetter={WINS_FOR_LETTER}
        totalQuarterlyHours={totalQuarterlyHours}
      />

      {/* Compact summary strip — no more 2-card stats block; the letter is the headline */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 24px',
          alignItems: 'baseline',
          marginBottom: 36,
          paddingBottom: 18,
          borderBottom: '1px solid var(--ink-a10)',
        }}
        aria-label="Logging summary"
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
          }}
        >
          {wins.length} {wins.length === 1 ? 'win' : 'wins'} logged
        </span>
        <span
          aria-hidden="true"
          style={{ fontSize: 12, color: 'var(--slate-400)' }}
        >
          ·
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {totalQuarterlyHours.toFixed(1)} hrs / quarter saved
        </span>
        {winsToGo > 0 && (
          <>
            <span
              aria-hidden="true"
              style={{ fontSize: 12, color: 'var(--slate-400)' }}
            >
              ·
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              {winsToGo} more to fill the template
            </span>
          </>
        )}
      </div>

      {/* Logged wins list — first so the learner sees what they've already done */}
      <section aria-labelledby="wins-list-heading" style={{ marginBottom: 48 }}>
        <h2
          id="wins-list-heading"
          style={{
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: '0 0 18px',
          }}
        >
          Your wins
        </h2>

        {loading && (
          <p style={{ fontSize: 16, color: 'var(--slate-500)', margin: 0 }}>Loading...</p>
        )}

        {!loading && wins.length === 0 && (
          <div
            style={{
              border: '1px dashed var(--ink-a15)',
              borderRadius: 16,
              padding: '20px 22px',
              background: 'var(--cream)',
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--slate-500)',
                margin: '0 0 8px',
              }}
            >
              Sample line — what a win looks like
            </p>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--ink)',
                margin: '0 0 8px',
                lineHeight: 1.4,
              }}
            >
              Weekly exception report drafting · 45 min saved each Friday
            </p>
            <p
              style={{
                fontSize: 16,
                color: 'var(--slate-500)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Use the form below to log your first one.
            </p>
          </div>
        )}

        {!loading && wins.length > 0 && (
          <ol
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              margin: 0,
              padding: 0,
              listStyle: 'none',
            }}
            aria-label="Logged quick wins"
          >
            {wins.map((win) => (
              <li
                key={win.id}
                style={{
                  background: 'var(--cream-2)',
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 16,
                  padding: '18px 20px',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                  }}
                >
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      lineHeight: 1.4,
                      flex: 1,
                      margin: 0,
                    }}
                  >
                    {win.description}
                  </p>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      fontVariantNumeric: 'tabular-nums',
                      flexShrink: 0,
                    }}
                  >
                    {minutesToLabel(win.time_saved_minutes)}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px 16px',
                  }}
                >
                  {[
                    toolLabel(win.tool),
                    win.skill_name,
                    win.frequency,
                    win.department,
                  ].map((meta, i) => (
                    <span
                      key={`${win.id}-meta-${i}`}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: 'var(--slate-500)',
                      }}
                    >
                      {meta}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Log form — focused, small, below the list */}
      <section aria-labelledby="log-form-heading" style={{ marginBottom: 56 }}>
        <h2
          id="log-form-heading"
          style={{
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: '0 0 6px',
          }}
        >
          Add a win
        </h2>
        <p
          style={{
            fontSize: 16,
            color: 'var(--slate-600)',
            lineHeight: 1.6,
            margin: '0 0 20px',
            maxWidth: '60ch',
          }}
        >
          What you automated · what it saved · which tool and skill you used.
        </p>

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: 20,
              padding: '12px 16px',
              border: '1px solid var(--ink-a15)',
              background: 'var(--cream-2)',
              borderRadius: 12,
              fontSize: 16,
              color: 'var(--ink)',
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginBottom: 20,
              padding: '12px 16px',
              border: '1px solid var(--emerald-700)',
              background: 'var(--cream-2)',
              borderRadius: 12,
              fontSize: 16,
              color: 'var(--emerald-800)',
            }}
          >
            {successMsg}
          </div>
        )}

        <form
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >

          {/* Description */}
          <div>
            <label htmlFor="qw-description" style={fieldLabelStyle}>
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
              style={inputStyle}
            />
          </div>

          {/* Tool + Skill row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
            }}
          >
            <div>
              <label htmlFor="qw-tool" style={fieldLabelStyle}>
                Which tool?
              </label>
              <select
                id="qw-tool"
                required
                value={form.tool}
                onChange={(e) => handleField('tool', e.target.value)}
                style={inputStyle}
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
              <label htmlFor="qw-skill" style={fieldLabelStyle}>
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
                style={inputStyle}
              />
            </div>
          </div>

          {/* Frequency + Time row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
            }}
          >
            <div>
              <label htmlFor="qw-frequency" style={fieldLabelStyle}>
                How often?
              </label>
              <select
                id="qw-frequency"
                required
                value={form.frequency}
                onChange={(e) => handleField('frequency', e.target.value)}
                style={inputStyle}
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
              <label htmlFor="qw-time" style={fieldLabelStyle}>
                Time saved per use
              </label>
              <select
                id="qw-time"
                required
                value={form.timeSavedMinutes || ''}
                onChange={(e) => handleField('timeSavedMinutes', Number(e.target.value))}
                style={inputStyle}
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
            <label htmlFor="qw-department" style={fieldLabelStyle}>
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
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || submitting}
            style={{
              marginTop: 8,
              alignSelf: 'flex-start',
              padding: '14px 24px',
              background: 'var(--ink)',
              color: 'var(--cream-2)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              borderRadius: 12,
              border: 'none',
              cursor: !isFormValid() || submitting ? 'not-allowed' : 'pointer',
              opacity: !isFormValid() || submitting ? 0.4 : 1,
              transition: 'background-color var(--t-fast) var(--ease)',
            }}
            aria-busy={submitting}
          >
            {submitting ? 'LOGGING...' : 'LOG QUICK WIN'}
          </button>
        </form>
      </section>
    </div>
  );
}
