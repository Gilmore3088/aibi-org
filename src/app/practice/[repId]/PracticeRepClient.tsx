'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PracticeRep } from '@/types/lms';

interface PracticeRepClientProps {
  readonly rep: PracticeRep;
}

export function PracticeRepClient({ rep }: PracticeRepClientProps) {
  const storageKey = useMemo(() => `aibi-practice-${rep.id}`, [rep.id]);
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'local' | 'error'>('idle');

  async function handleSubmit() {
    if (response.trim().length < 20) return;

    setSaving(true);
    setSubmitted(true);
    setSaveState('idle');

    try {
      const apiResponse = await fetch('/api/practice-reps/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: rep.courseId,
          repId: rep.id,
          response: { learnerResponse: response },
        }),
      });

      if (apiResponse.ok) {
        setSaveState('saved');
      } else if (apiResponse.status === 401 || apiResponse.status === 503) {
        localStorage.setItem(storageKey, JSON.stringify({
          response,
          completedAt: new Date().toISOString(),
        }));
        setSaveState('local');
      } else {
        setSaveState('error');
      }
    } catch {
      localStorage.setItem(storageKey, JSON.stringify({
        response,
        completedAt: new Date().toISOString(),
      }));
      setSaveState('local');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="px-6 py-10 md:py-14">
      <div className="max-w-4xl mx-auto space-y-8">
        <nav aria-label="Breadcrumb">
          <Link
            href="/dashboard"
            className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-terra)] transition-colors"
          >
            Dashboard
          </Link>
          <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
          <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)]">
            Practice
          </span>
        </nav>

        <header className="border-b border-[color:var(--color-ink)]/10 pb-8">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            {rep.timeEstimateMinutes} minute AI rep · {rep.safetyLevel.toUpperCase()} use
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            {rep.title}
          </h1>
          <p className="text-base text-[color:var(--color-ink)]/75 mt-4 max-w-2xl leading-relaxed">
            {rep.skill}
          </p>
        </header>

        <section className="grid lg:grid-cols-[0.8fr_1.2fr] gap-6">
          <aside className="space-y-5">
            <InfoBlock title="Scenario">{rep.scenario}</InfoBlock>
            <InfoBlock title="Task">{rep.task}</InfoBlock>
            <div className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-5 bg-[color:var(--color-parch)]">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
                Constraints
              </p>
              <ul className="space-y-2">
                {rep.constraints.map((constraint) => (
                  <li key={constraint} className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-5 md:p-6">
            <label className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
              Your prompt or response
            </label>
            <div className="mt-3 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[2px] p-4">
              <p className="font-mono text-xs text-[color:var(--color-slate)] mb-2">
                Starter prompt
              </p>
              <p className="font-mono text-sm text-[color:var(--color-ink)] leading-relaxed">
                {rep.starterPrompt}
              </p>
            </div>
            <textarea
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              rows={10}
              className="mt-4 w-full rounded-[2px] border border-[color:var(--color-ink)]/15 bg-[color:var(--color-linen)] p-4 text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)]"
              placeholder="Write your prompt, revised message, or answer here..."
            />
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={response.trim().length < 20 || saving}
                className="px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] disabled:opacity-40 disabled:cursor-not-allowed font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
              >
                {saving ? 'Saving...' : 'Submit Rep'}
              </button>
              {saveState !== 'idle' && (
                <p className="text-xs text-[color:var(--color-slate)]">
                  {saveState === 'saved'
                    ? 'Saved to your course progress.'
                    : saveState === 'local'
                      ? 'Saved in this browser. Sign in to sync progress.'
                      : 'Feedback shown, but progress could not be saved.'}
                </p>
              )}
            </div>
          </section>
        </section>

        {submitted && (
          <section className="grid lg:grid-cols-2 gap-6">
            <article className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
                Model answer
              </p>
              <p className="text-sm text-[color:var(--color-ink)]/80 leading-relaxed">
                {rep.modelAnswer}
              </p>
            </article>
            <article className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-6">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
                Feedback
              </p>
              <ul className="space-y-2">
                {rep.feedback.map((item) => (
                  <li key={item} className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-serif text-xl text-[color:var(--color-ink)] leading-snug">
                {rep.reflectionQuestion}
              </p>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}

function InfoBlock({
  title,
  children,
}: {
  readonly title: string;
  readonly children: string;
}) {
  return (
    <div className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-5">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
        {title}
      </p>
      <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
        {children}
      </p>
    </div>
  );
}
