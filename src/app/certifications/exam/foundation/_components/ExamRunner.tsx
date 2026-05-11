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

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useExam } from '../../_lib/useExam';

const buttonPrimary: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 22px',
  borderRadius: 2,
  background: 'var(--ledger-ink)',
  color: 'var(--ledger-paper)',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--ledger-mono)',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const buttonGhost: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '11px 20px',
  borderRadius: 2,
  background: 'transparent',
  color: 'var(--ledger-ink)',
  border: '1px solid var(--ledger-rule-strong)',
  cursor: 'pointer',
  fontFamily: 'var(--ledger-mono)',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const kickerStyle: CSSProperties = {
  fontFamily: 'var(--ledger-mono)',
  fontSize: 10.5,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--ledger-accent)',
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
        <div style={{ marginTop: 24, ...kickerStyle }}>
          Question {exam.currentIndex + 1} of {exam.questions.length}
        </div>
        <h2
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontSize: 'clamp(22px, 2.6vw, 28px)',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            margin: '10px 0 22px',
            color: 'var(--ledger-ink)',
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
                  background: active ? 'var(--ledger-paper)' : 'var(--ledger-bg)',
                  border: `1px solid ${active ? 'var(--ledger-ink)' : 'var(--ledger-rule)'}`,
                  borderRadius: 3,
                  cursor: 'pointer',
                  fontFamily: 'var(--ledger-sans)',
                  fontSize: 14.5,
                  color: 'var(--ledger-ink)',
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: active ? 'var(--ledger-accent)' : 'var(--ledger-muted)',
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
            borderTop: '1px solid var(--ledger-rule)',
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
            ← Previous
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
              Submit Exam →
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
              Next →
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
      <p style={{ ...kickerStyle, margin: '0 0 14px' }}>Final exam</p>
      <h1
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontWeight: 500,
          fontSize: 'clamp(40px, 5vw, 58px)',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          margin: '0 0 14px',
          color: 'var(--ledger-ink)',
        }}
      >
        AiBI-Foundation{' '}
        <em
          style={{
            color: 'var(--ledger-accent)',
            fontStyle: 'italic',
            fontWeight: 400,
          }}
        >
          proficiency exam.
        </em>
      </h1>
      <p
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontStyle: 'italic',
          fontSize: 19,
          lineHeight: 1.5,
          color: 'var(--ledger-ink-2)',
          margin: '0 0 26px',
          maxWidth: '60ch',
        }}
      >
        Twelve questions drawn at random across the five proficiency
        topics. No time limit. Take your time.
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
          'Prompting & the RTFC Framework',
          'Safe Use in Regulated Institutions',
          'Use Case Identification',
          'Measurement & Accountability',
        ].map((label) => (
          <li
            key={label}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              fontFamily: 'var(--ledger-sans)',
              fontSize: 14,
              color: 'var(--ledger-ink-2)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: 'var(--ledger-accent)',
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
        Begin Exam →
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
          fontFamily: 'var(--ledger-mono)',
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ledger-muted)',
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
          background: 'var(--ledger-parch)',
          borderRadius: 2,
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
            background: 'var(--ledger-accent)',
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
          fontFamily: 'var(--ledger-serif)',
          fontWeight: 500,
          fontSize: 'clamp(36px, 4.5vw, 52px)',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          margin: '0 0 16px',
          color: 'var(--ledger-ink)',
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
          border: '1px solid var(--ledger-rule)',
          borderRadius: 3,
          background: 'var(--ledger-paper)',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 9.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ledger-muted)',
            }}
          >
            Score
          </div>
          <div
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontSize: 56,
              fontWeight: 500,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginTop: 4,
              color: 'var(--ledger-ink)',
            }}
          >
            {exam.pctCorrect}%
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ledger-accent)',
            }}
          >
            {proficiency.label}
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--ledger-sans)',
            fontSize: 14.5,
            lineHeight: 1.6,
            color: 'var(--ledger-ink-2)',
          }}
        >
          {proficiency.summary}
        </p>
      </div>

      <h2
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          margin: '0 0 14px',
          color: 'var(--ledger-ink)',
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
              padding: '12px 16px',
              border: '1px solid var(--ledger-rule)',
              borderRadius: 3,
              background: 'var(--ledger-bg)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--ledger-serif)',
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--ledger-ink)',
              }}
            >
              {t.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 12,
                letterSpacing: '0.04em',
                color: 'var(--ledger-slate)',
              }}
            >
              {t.correct} / {t.total}
            </span>
            <span
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 12,
                letterSpacing: '0.04em',
                color: 'var(--ledger-ink)',
                fontWeight: 600,
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
          padding: '20px 22px',
          border: '1px solid var(--ledger-rule)',
          borderRadius: 3,
          background: 'var(--ledger-parch)',
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--ledger-mono)',
            fontSize: 10.5,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ledger-accent)',
            margin: '0 0 10px',
          }}
        >
          Recommendation
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--ledger-sans)',
            fontSize: 14.5,
            lineHeight: 1.6,
            color: 'var(--ledger-ink-2)',
          }}
        >
          {proficiency.recommendation}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={exam.retake} style={buttonGhost}>
          Retake exam
        </button>
        {submitState === 'submitting' && (
          <span
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ledger-muted)',
            }}
          >
            Saving attempt…
          </span>
        )}
        {submitState === 'error' && (
          <span
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ledger-weak)',
            }}
          >
            Could not save attempt (your result is still on screen).
          </span>
        )}
      </div>
    </section>
  );
}
