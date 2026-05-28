'use client';

// /courses/foundation/program/quick-wins — Quick Win Tracker
// Course completers log automations they've built and time saved.
// Three wins produces the recommendation-letter template — the practical
// artifact each set of wins is for.
//
// Client Component: form state + client-side fetch via /api/courses/log-quick-win.

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { QUICK_WINS_FOR_LETTER as WINS_FOR_LETTER } from '../_lib/quickWinsData';
import { LetterTemplatePreview } from './_local/LetterTemplatePreview';
import { QuickWinsSummary } from './_local/QuickWinsSummary';
import { QuickWinsList } from './_local/QuickWinsList';
import { QuickWinForm } from './_local/QuickWinForm';
import {
  EMPTY_FORM,
  isFormValid,
  quarterlyHours,
  toolLabel,
  type FormState,
  type QuickWin,
} from './_local/quickWinsHelpers';

export function QuickWinsClient() {
  const [wins, setWins] = useState<QuickWin[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const totalQuarterlyHours = wins.reduce((acc, win) => acc + quarterlyHours(win), 0);
  const winsToGo = Math.max(0, WINS_FOR_LETTER - wins.length);

  function handleField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid(form) || submitting) return;

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
      <nav className="mb-8" aria-label="Breadcrumb">
        <ol
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
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

      <QuickWinsSummary
        winsCount={wins.length}
        totalQuarterlyHours={totalQuarterlyHours}
        winsToGo={winsToGo}
      />

      <QuickWinsList wins={wins} loading={loading} />

      <QuickWinForm
        form={form}
        onField={handleField}
        onSubmit={(e) => void handleSubmit(e)}
        submitting={submitting}
        error={error}
        successMsg={successMsg}
      />
    </div>
  );
}
