'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useExam } from '../_lib/useExam';
import { saveProficiencyResult } from '@/lib/user-data';

export default function AiBIPExamPage() {
  const exam = useExam();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // ── Intro ──
  if (exam.phase === 'intro') {
    return (
      <main className="px-6 py-14 md:py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Foundations Proficiency Assessment
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            How ready are you for the Foundations Certificate?
          </h1>
          <p className="text-lg text-[color:var(--color-ink)]/75 leading-relaxed max-w-xl mx-auto">
            A short proficiency assessment covering fundamentals, prompting,
            safe use, use case identification, and measurement. Your result
            is a proficiency level &mdash; not a grade &mdash; that tells you
            whether you are ready to pursue certification or where to focus
            your development first. Take it as many times as you like.
          </p>
          <button
            type="button"
            onClick={exam.start}
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Begin Assessment
          </button>
        </div>
      </main>
    );
  }

  // ── Questions ──
  if (exam.phase === 'questions') {
    const q = exam.questions[exam.currentIndex];
    const selectedKey = exam.answers.get(q.id);
    const answeredCount = exam.answers.size;
    const total = exam.questions.length;
    const progress = ((exam.currentIndex + 1) / total) * 100;

    return (
      <main className="min-h-screen">
        {/* Progress bar */}
        <div className="w-full h-[3px] bg-[color:var(--color-ink)]/10">
          <div
            className="h-full bg-[color:var(--color-terra)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-6 py-12 md:py-20">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono text-xs text-[color:var(--color-ink)]/70">
                Question {exam.currentIndex + 1} of {total}
              </span>
              <span className="font-mono text-xs text-[color:var(--color-slate)]">
                {answeredCount} of {total} answered
              </span>
            </div>

            {/* Topic label */}
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              {q.topic.replace(/-/g, ' ')}
            </p>

            {/* Question */}
            <h2 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-8">
              {q.stem}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((option) => {
                const selected = selectedKey === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => exam.answer(q.id, option.key)}
                    className={
                      'w-full text-left px-5 py-4 border transition-colors flex gap-4 items-start ' +
                      (selected
                        ? 'border-[color:var(--color-terra)] bg-[color:var(--color-terra-pale)]/30'
                        : 'border-[color:var(--color-ink)]/15 hover:border-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-pale)]/10')
                    }
                  >
                    <span
                      className={
                        'flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs mt-0.5 transition-colors ' +
                        (selected
                          ? 'border-[color:var(--color-terra)] bg-[color:var(--color-terra)] text-[color:var(--color-linen)]'
                          : 'border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)]/70')
                      }
                    >
                      {option.key.toUpperCase()}
                    </span>
                    <span className="font-sans text-base text-[color:var(--color-ink)] leading-snug pt-1">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
              <button
                type="button"
                onClick={exam.prev}
                disabled={exam.currentIndex === 0}
                className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 hover:text-[color:var(--color-terra)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &larr; Back
              </button>
              {exam.currentIndex < total - 1 ? (
                <button
                  type="button"
                  onClick={exam.next}
                  className="px-6 py-2 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-sm font-medium hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={exam.finish}
                  className="px-6 py-2 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-sm font-medium hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Results ──
  if (exam.phase === 'results' && exam.proficiency) {
    // Save proficiency result to localStorage for the dashboard
    saveProficiencyResult({
      pctCorrect: exam.pctCorrect,
      levelId: exam.proficiency.id,
      levelLabel: exam.proficiency.label,
      topicScores: exam.topicScores.map((ts) => ({
        topic: ts.topic,
        label: ts.label,
        correct: ts.correct,
        total: ts.total,
        pct: ts.pct,
      })),
    });

    return (
      <main className="px-6 py-14 md:py-20">
        <div className="max-w-3xl mx-auto space-y-16">
          {/* Score */}
          <div className="text-center">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
              Your Proficiency Assessment Results
            </p>
            <p className="font-mono text-6xl md:text-7xl tabular-nums leading-none" style={{ color: exam.proficiency.colorVar }}>
              {exam.pctCorrect}
              <span className="text-3xl text-[color:var(--color-dust)]">/100</span>
            </p>
            <p
              className="font-serif-sc text-2xl md:text-3xl mt-4 uppercase"
              style={{ color: exam.proficiency.colorVar }}
            >
              Proficiency Level: {exam.proficiency.label}
            </p>
          </div>

          {/* Interpretation */}
          <section className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-4">
              What your score means
            </p>
            <h2 className="font-serif text-3xl text-[color:var(--color-ink)] leading-tight mb-4">
              {exam.proficiency.headline}
            </h2>
            <p className="text-[color:var(--color-ink)]/75 leading-relaxed mb-4">
              {exam.proficiency.summary}
            </p>
            <p className="text-[color:var(--color-ink)] font-medium leading-relaxed">
              {exam.proficiency.recommendation}
            </p>
          </section>

          {/* Topic breakdown */}
          <section>
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
              Score by topic
            </p>
            <div className="space-y-4">
              {exam.topicScores.map((ts) => (
                <div key={ts.topic} className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-lg text-[color:var(--color-ink)]">
                      {ts.label}
                    </span>
                    <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums">
                      {ts.correct} / {ts.total} ({ts.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[color:var(--color-ink)]/10">
                    <div
                      className="h-full bg-[color:var(--color-terra)] transition-all duration-700"
                      style={{ width: `${ts.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={exam.retake}
              className="px-8 py-4 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
            >
              Retake with new questions
            </button>
            <Link
              href="/certifications#inquiry-form"
              className="px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
            >
              Inquire about certification
            </Link>
          </div>

        </div>
      </main>
    );
  }

  return null;
}
