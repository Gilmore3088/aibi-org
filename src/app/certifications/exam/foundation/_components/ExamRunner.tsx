'use client';

// ExamRunner — client component that drives the Foundation final exam.
//
// Reuses the existing useExam hook (12-question random draw, 5-topic
// distribution, scoring + proficiency level). Renders three phases:
//
//   intro     → exam blurb, "Begin Exam" CTA
//   questions → one question at a time with progress bar, prev/next
//   results   → overall score, proficiency level, topic breakdown
//
// On finish, posts the attempt summary to /api/certifications/exam/submit.
// Submission is best-effort — the API is currently a stub. Failure does not
// block the learner from seeing their result.
//
// 2026-05-27: Ported to the mockup design system. Calm, focused assessment
// surface — Inter typography, navy/cream/gold/slate tokens, no italics,
// no "unlock" / "earn" language. The exam reads like a serious credential
// sitting, not a game.

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useExam } from '../../_lib/useExam';
import { INTER_STACK } from '@/lib/ui/fonts';


const buttonPrimary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 22px',
  borderRadius: 12,
  background: 'var(--ink)',
  color: 'var(--cream)',
  border: 'none',
  cursor: 'pointer',
  fontFamily: INTER_STACK,
  fontSize: '0.6875rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 700,
};

const buttonGhost: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '11px 20px',
  borderRadius: 12,
  background: 'transparent',
  color: 'var(--ink)',
  border: '1px solid var(--ink-a15)',
  cursor: 'pointer',
  fontFamily: INTER_STACK,
  fontSize: '0.6875rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 700,
};

const kickerStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};

const mutedKickerStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
};

export function ExamRunner() {
  const exam = useExam();
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>(
    'idle',
  );
  const submitOnceRef = useRef(false);

  // Fire-and-forget submission to the exam-submit API once results land.
  useEffect(() => {
    if (exam.phase !== 'results' || submitOnceRef.current) return;
    submitOnceRef.current = true;
    setSubmitState('submitting');

    // Analytics: exam_completed fires once per attempt when results land.
    void import('@/lib/analytics/events').then((mod) => {
      mod.trackExamCompleted({
        pct: exam.pctCorrect,
        proficiency: exam.proficiency?.id ?? 'unknown',
      });
    });

    fetch('/api/certifications/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examId: 'foundation',
        totalCorrect: exam.totalCorrect,
        totalQuestions: exam.questions.length,
        pctCorrect: exam.pctCorrect,
        proficiency: exam.proficiency?.id ?? null,
        topicScores: exam.topicScores.map((t) => ({
          topic: t.topic,
          correct: t.correct,
          total: t.total,
          pct: t.pct,
        })),
        answers: Array.from(exam.answers.entries()).map(([questionId, key]) => ({
          questionId,
          key,
        })),
      }),
    })
      .then((res) => setSubmitState(res.ok ? 'submitted' : 'error'))
      .catch(() => setSubmitState('error'));
  }, [
    exam.phase,
    exam.totalCorrect,
    exam.questions.length,
    exam.pctCorrect,
    exam.proficiency,
    exam.topicScores,
    exam.answers,
  ]);

  if (exam.phase === 'intro') {
    return <IntroPhase onStart={exam.start} />;
  }

  if (exam.phase === 'questions') {
    const question = exam.questions[exam.currentIndex];
    if (!question) return null;
    const selected = exam.answers.get(question.id);
    const isLast = exam.currentIndex === exam.questions.length - 1;
    const answered = exam.questions.filter((q) => exam.answers.has(q.id)).length;
    const allAnswered = answered === exam.questions.length;

    return (
      <section>
        <ProgressBar current={exam.currentIndex + 1} total={exam.questions.length} answered={answered} />
        <div style={{ marginTop: 24, ...mutedKickerStyle }}>
          Question {exam.currentIndex + 1} of {exam.questions.length}
        </div>
        <h2
          style={{
            fontFamily: INTER_STACK,
            fontWeight: 700,
            fontSize: 'clamp(1.375rem, 2.6vw, 1.75rem)',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            margin: '10px 0 22px',
            color: 'var(--ink)',
          }}
        >
          {question.stem}
        </h2>

        <div style={{ display: 'grid', gap: 10 }}>
          {question.options.map((opt) => {
            const active = selected === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => exam.answer(question.id, opt.key)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr',
                  gap: 12,
                  alignItems: 'baseline',
                  textAlign: 'left',
                  padding: '14px 18px',
                  background: active ? 'var(--cream-2)' : 'var(--cream)',
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--ink-a10)'}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontFamily: INTER_STACK,
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'var(--ink)',
                  lineHeight: 1.5,
                  transition: 'border-color 120ms cubic-bezier(0.4, 0, 0.2, 1), background 120ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <span
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: active ? 'var(--gold-deep)' : 'var(--slate-500)',
                  }}
                >
                  {opt.key}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 28,
            paddingTop: 18,
            borderTop: '1px solid var(--ink-a10)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={exam.prev}
            disabled={exam.currentIndex === 0}
            style={{
              ...buttonGhost,
              opacity: exam.currentIndex === 0 ? 0.4 : 1,
              cursor: exam.currentIndex === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← PREVIOUS
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={exam.finish}
              disabled={!allAnswered}
              style={{
                ...buttonPrimary,
                opacity: allAnswered ? 1 : 0.5,
                cursor: allAnswered ? 'pointer' : 'not-allowed',
              }}
            >
              SUBMIT EXAM
            </button>
          ) : (
            <button
              type="button"
              onClick={exam.next}
              disabled={!selected}
              style={{
                ...buttonPrimary,
                opacity: selected ? 1 : 0.5,
                cursor: selected ? 'pointer' : 'not-allowed',
              }}
            >
              NEXT →
            </button>
          )}
        </div>
      </section>
    );
  }

  // Results phase
  return <ResultsPhase exam={exam} submitState={submitState} />;
}

function IntroPhase({ onStart }: { readonly onStart: () => void }) {
  return (
    <section>
      <p style={{ ...kickerStyle, margin: '0 0 14px' }}>Final Exam</p>
      <h1
        style={{
          fontFamily: INTER_STACK,
          fontWeight: 700,
          fontSize: 'clamp(2.25rem, 5vw, 3.375rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          margin: '0 0 14px',
          color: 'var(--ink)',
        }}
      >
        AiBI-Foundation proficiency exam.
      </h1>
      <p
        style={{
          fontFamily: INTER_STACK,
          fontSize: '1.0625rem',
          fontWeight: 400,
          lineHeight: 1.55,
          color: 'var(--slate-600)',
          margin: '0 0 26px',
          maxWidth: '60ch',
        }}
      >
        Twelve questions drawn at random across the five proficiency
        topics. No time limit. Answer each question once. Submit when
        every question has a response.
      </p>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 30px',
          display: 'grid',
          gap: 8,
          maxWidth: '52ch',
        }}
      >
        {[
          'Gen AI Fundamentals',
          'Prompting and the RTFC Framework',
          'Safe Use in Regulated Institutions',
          'Use Case Identification',
          'Measurement and Accountability',
        ].map((label) => (
          <li
            key={label}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              fontFamily: INTER_STACK,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--slate-600)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: 'var(--gold)',
                borderRadius: 999,
                flex: 'none',
                marginTop: 5,
              }}
              aria-hidden="true"
            />
            {label}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onStart} style={buttonPrimary}>
        BEGIN EXAM
      </button>
    </section>
  );
}

function ProgressBar({
  current,
  total,
  answered,
}: {
  readonly current: number;
  readonly total: number;
  readonly answered: number;
}) {
  const pct = Math.round((answered / total) * 100);
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: INTER_STACK,
          fontSize: '0.6563rem',
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--slate-500)',
          marginBottom: 8,
        }}
      >
        <span>
          On {current} of {total}
        </span>
        <span>{answered} answered</span>
      </div>
      <div
        style={{
          width: '100%',
          height: 4,
          background: 'var(--ink-a10)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Exam progress"
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'var(--gold)',
            transition: 'width .25s ease',
          }}
        />
      </div>
    </div>
  );
}

function ResultsPhase({
  exam,
  submitState,
}: {
  readonly exam: ReturnType<typeof useExam>;
  readonly submitState: 'idle' | 'submitting' | 'submitted' | 'error';
}) {
  const proficiency = exam.proficiency;
  if (!proficiency) return null;

  return (
    <section>
      <p style={{ ...kickerStyle, margin: '0 0 14px' }}>Results</p>
      <h1
        style={{
          fontFamily: INTER_STACK,
          fontWeight: 700,
          fontSize: 'clamp(2.125rem, 4.5vw, 3rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          margin: '0 0 16px',
          color: 'var(--ink)',
        }}
      >
        {proficiency.headline}
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 28,
          alignItems: 'center',
          marginBottom: 30,
          padding: '24px 26px',
          border: '1px solid var(--ink-a10)',
          borderRadius: 24,
          background: 'var(--cream-2)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.6563rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            Score
          </div>
          <div
            style={{
              fontFamily: INTER_STACK,
              fontSize: '3.5rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginTop: 4,
              color: 'var(--ink)',
            }}
          >
            {exam.pctCorrect}%
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: INTER_STACK,
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
            }}
          >
            {proficiency.label}
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: INTER_STACK,
            fontSize: '0.9375rem',
            fontWeight: 500,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
          }}
        >
          {proficiency.summary}
        </p>
      </div>

      <h2
        style={{
          fontFamily: INTER_STACK,
          fontSize: '1.375rem',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          margin: '0 0 14px',
          color: 'var(--ink)',
        }}
      >
        Topic breakdown
      </h2>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 28px',
          display: 'grid',
          gap: 8,
        }}
      >
        {exam.topicScores.map((t) => (
          <li
            key={t.topic}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: 14,
              alignItems: 'center',
              padding: '14px 18px',
              border: '1px solid var(--ink-a10)',
              borderRadius: 16,
              background: 'var(--cream)',
            }}
          >
            <span
              style={{
                fontFamily: INTER_STACK,
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              {t.label}
            </span>
            <span
              style={{
                fontFamily: INTER_STACK,
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--slate-500)',
              }}
            >
              {t.correct} / {t.total}
            </span>
            <span
              style={{
                fontFamily: INTER_STACK,
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--ink)',
                minWidth: 44,
                textAlign: 'right',
              }}
            >
              {t.pct}%
            </span>
          </li>
        ))}
      </ul>

      <div
        style={{
          padding: '22px 24px',
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
          background: 'var(--cream-2)',
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            margin: '0 0 10px',
          }}
        >
          Recommendation
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: INTER_STACK,
            fontSize: '0.9375rem',
            fontWeight: 500,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
          }}
        >
          {proficiency.recommendation}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={exam.retake} style={buttonGhost}>
          RETAKE EXAM
        </button>
        {submitState === 'submitting' && (
          <span
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            Saving attempt…
          </span>
        )}
        {submitState === 'submitted' && (
          <span
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--emerald-700)',
            }}
          >
            Attempt saved
          </span>
        )}
        {submitState === 'error' && (
          <span
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
            }}
          >
            Could not save attempt (your result is still on screen).
          </span>
        )}
      </div>
    </section>
  );
}
