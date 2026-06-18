'use client';

// PromptWizard — Module 3 Activity 3.1.
//
// The learner writes a freeform prompt for a banking task and runs it. The
// "AI answer" is assembled from authored fragments keyed to the four CORE
// elements (Context · Objective · Resources · Expectations) the prompt does
// or doesn't contain — so a lazy prompt visibly degrades (invented numbers,
// buried answers) instead of being quietly rescued by a smart model. Six
// iterations per scenario, echoing the v0–v5 eval grid. Two scenarios: a
// scaffolded warm-up (hints on) then a graded one (hints off).
//
// House style: mockup tokens, Inter, sentence-case headings, UPPERCASE
// buttons, no italics. Status is never color-only — every ✓/✗ has a glyph.

import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import type { Activity } from '@content/courses/foundation-program';
import {
  WIZARD_SCENARIOS,
  gradePrompt,
  MAX_TRIES,
  type CoreKey,
  type WizardScenario,
} from '../_lib/promptWizardData';

const INK = '#071A2F';
const GOLD_DEEP = '#9A7A2F';
const CREAM = 'var(--cream)'; // inherits the course soft-slate override (CourseShell)
const LINE = 'rgba(7,26,47,.12)';
const SLATE = '#475569';
const EMERALD = '#047857';
const RED = '#B91C1C';
const INTER = 'Inter, ui-sans-serif, system-ui, sans-serif';

export interface PromptWizardProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

interface Attempt {
  readonly prompt: string;
  readonly present: Record<CoreKey, boolean>;
  readonly score: number;
}

const eyebrow: CSSProperties = {
  fontFamily: INTER,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: GOLD_DEEP,
};

export function PromptWizard({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: PromptWizardProps) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<readonly Attempt[]>([]);
  const [submitted, setSubmitted] = useState(Boolean(existingResponse));
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const scenario: WizardScenario = WIZARD_SCENARIOS[scenarioIdx];
  const isGraded = scenario.kind === 'graded';
  const last = history[history.length - 1] ?? null;
  const solved = last?.score === scenario.elements.length;
  const exhausted = history.length >= MAX_TRIES;
  const done = solved || exhausted;

  const bestPrompt = useMemo(() => {
    let best = '';
    let bestScore = -1;
    for (const a of history) {
      if (a.score > bestScore || (a.score === bestScore && a.prompt.length > best.length)) {
        best = a.prompt;
        bestScore = a.score;
      }
    }
    return best;
  }, [history]);

  const run = useCallback(() => {
    if (prompt.trim().length < 4 || done) return;
    const { present, score } = gradePrompt(scenario, prompt);
    setHistory((h) => [...h, { prompt, present, score }]);
  }, [prompt, scenario, done]);

  const nextScenario = useCallback(() => {
    setScenarioIdx((i) => Math.min(i + 1, WIZARD_SCENARIOS.length - 1));
    setPrompt('');
    setHistory([]);
  }, []);

  const submit = useCallback(async () => {
    const finalPrompt = (bestPrompt || prompt).trim();
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch('/api/courses/submit-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          moduleNumber,
          activityId: activity.id,
          response: { final_prompt: finalPrompt },
        }),
      });
      if (res.ok || res.status === 409) {
        setSubmitted(true);
        onSubmitSuccess?.(activity.id);
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setServerError(data.error ?? 'Submission failed. Please try again.');
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [bestPrompt, prompt, enrollmentId, moduleNumber, activity.id, onSubmitSuccess]);

  if (submitted) {
    return (
      <div style={card}>
        <div style={eyebrow}>Prompt wizard · complete</div>
        <p style={{ color: INK, fontSize: 17, fontWeight: 700, lineHeight: 1.6, margin: '10px 0 4px' }}>
          You built a prompt that gets to the CORE. ✓
        </p>
        <p style={{ color: SLATE, fontSize: 16, lineHeight: 1.6, margin: '0 0 14px' }}>
          You watched the answer change as each element clicked into place — Context,
          Objective, Resources, Expectations. That is the whole craft: a complete prompt
          is a usable answer. Module 9 adds the two moves that make it <strong>safe</strong>.
        </p>
        <a href="/api/courses/cards/core" style={downloadLink} download>
          Download the CORE card (PDF)
        </a>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={eyebrow}>Prompt wizard · {activity.title}</div>

      {/* How it works — the widget has to explain itself when read cold */}
      <p style={{ color: SLATE, fontSize: 16, lineHeight: 1.6, margin: '8px 0 14px' }}>
        Write the prompt you would actually send an AI to handle the task below — using only the
        source provided. Press <strong style={{ color: INK }}>Run the prompt</strong> and the wizard
        scores it on the four <strong style={{ color: INK }}>CORE</strong> parts —{' '}
        <strong style={{ color: INK }}>C</strong>ontext,{' '}
        <strong style={{ color: INK }}>O</strong>bjective,{' '}
        <strong style={{ color: INK }}>R</strong>esources,{' '}
        <strong style={{ color: INK }}>E</strong>xpectations — and shows how the AI’s answer changes
        as a result. Revise and Run again until all four turn green.
      </p>

      {/* Which task */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '0 0 18px' }}>
        {WIZARD_SCENARIOS.map((s, i) => (
          <span
            key={s.id}
            style={{
              fontFamily: INTER,
              fontSize: 12,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 999,
              border: `1px solid ${LINE}`,
              background: i === scenarioIdx ? INK : 'transparent',
              color: i === scenarioIdx ? CREAM : SLATE,
            }}
          >
            Task {i + 1} · {s.kind === 'warmup' ? 'Warm-up' : 'Graded'}
          </span>
        ))}
      </div>

      {/* The task */}
      <div style={eyebrow}>The task</div>
      <p style={{ color: INK, fontSize: 16, fontWeight: 700, lineHeight: 1.4, margin: '4px 0 16px' }}>
        {scenario.memberQuestion}
      </p>

      {/* The source */}
      <div style={eyebrow}>Your only source — tell the AI to use this, and nothing else</div>
      <p style={{ color: INK, fontSize: 16, lineHeight: 1.6, margin: '4px 0 0', background: CREAM, padding: 14, borderRadius: 10, border: `1px solid ${LINE}` }}>
        {scenario.sourceMaterial}
      </p>

      {/* Two-pane: editor on the left, results + attempt grid on the right.
          flex-wrap stacks them on narrow screens. */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', marginTop: 14 }}>
        {/* Editor pane */}
        {!done && (
        <div style={{ flex: '1 1 320px', minWidth: 280 }}>
          <label htmlFor="pw-input" style={{ display: 'block', fontFamily: INTER, fontSize: 14, fontWeight: 700, color: INK, marginBottom: 6 }}>
            Write your prompt to the AI (attempt {history.length + 1} of {MAX_TRIES})
          </label>
          <textarea
            id="pw-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Type the full prompt you would send the AI for this task…"
            style={{
              width: '100%',
              fontFamily: INTER,
              fontSize: 16,
              lineHeight: 1.6,
              color: INK,
              padding: 12,
              border: `1px solid ${LINE}`,
              borderRadius: 12,
              resize: 'vertical',
            }}
          />
          <button
            type="button"
            onClick={run}
            disabled={prompt.trim().length < 4}
            style={{
              marginTop: 10,
              fontFamily: INTER,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: CREAM,
              background: prompt.trim().length < 4 ? 'rgba(7,26,47,.4)' : INK,
              border: 'none',
              borderRadius: 12,
              padding: '11px 20px',
              cursor: prompt.trim().length < 4 ? 'not-allowed' : 'pointer',
            }}
          >
            Run the prompt
          </button>
        </div>
        )}

        {/* Results pane */}
        <div style={{ flex: '1 1 420px', minWidth: 300 }}>
          <div style={{ ...eyebrow, marginBottom: 8 }}>Your attempts · scored on C · O · R · E</div>
          <AttemptGrid scenario={scenario} history={history} />
          {last && (
            <div aria-live="polite" style={{ marginTop: 16 }}>
              <Scorecard scenario={scenario} attempt={last} showHints={!isGraded && !solved} />
              <AnswerPreview scenario={scenario} attempt={last} />
            </div>
          )}
        </div>
      </div>

      {/* Advance / submit */}
      {done && (
        <div style={{ marginTop: 18, borderTop: `1px solid ${LINE}`, paddingTop: 14 }}>
          {solved ? (
            <p style={{ color: EMERALD, fontSize: 16, lineHeight: 1.6, fontWeight: 700, margin: '0 0 12px' }}>
              ✓ {scenario.winLine}
            </p>
          ) : (
            <p style={{ color: SLATE, fontSize: 16, lineHeight: 1.6, margin: '0 0 12px' }}>
              Out of attempts for this one — no penalty. The closest a complete prompt gets:
              name the role, state the exact task, point to the source below and forbid guessing,
              and set the format. Carry that into the next scenario.
            </p>
          )}
          {!isGraded ? (
            <button type="button" onClick={nextScenario} style={primaryBtn}>
              Next scenario
            </button>
          ) : (
            <>
              <button type="button" onClick={submit} disabled={submitting} style={primaryBtn}>
                {submitting ? 'Saving…' : 'Save my prompt & complete'}
              </button>
              {serverError && (
                <p style={{ color: RED, fontSize: 14, marginTop: 10 }}>{serverError}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────

function AttemptGrid({
  scenario,
  history,
}: {
  scenario: WizardScenario;
  history: readonly Attempt[];
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 4, width: '100%', minWidth: 420 }}>
        <thead>
          <tr>
            <th style={gridHeadCell} />
            {scenario.elements.map((el) => (
              <th key={el.key} style={{ ...gridHeadCell, textAlign: 'center' }}>
                {el.key.charAt(0).toUpperCase()}
              </th>
            ))}
            <th style={{ ...gridHeadCell, textAlign: 'center' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: MAX_TRIES }).map((_, i) => {
            const a = history[i];
            return (
              <tr key={i}>
                <td style={{ ...gridLabelCell }}>v{i}</td>
                {scenario.elements.map((el) => {
                  const present = a ? a.present[el.key] : null;
                  return (
                    <td
                      key={el.key}
                      style={{
                        ...gridCell,
                        background:
                          present === null ? '#F1F5F9' : present ? '#D1FAE5' : '#FEE2E2',
                        color: present ? EMERALD : present === false ? RED : '#94A3B8',
                      }}
                      title={el.label}
                    >
                      {present === null ? '·' : present ? '✓' : '✗'}
                    </td>
                  );
                })}
                <td
                  style={{
                    ...gridCell,
                    fontWeight: 800,
                    background: a && a.score === scenario.elements.length ? '#D1FAE5' : '#F8FAFC',
                    color: a ? INK : '#94A3B8',
                  }}
                >
                  {a ? `${a.score}/${scenario.elements.length}` : '–'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Scorecard({
  scenario,
  attempt,
  showHints,
}: {
  scenario: WizardScenario;
  attempt: Attempt;
  showHints: boolean;
}) {
  return (
    <div>
      <div style={{ ...eyebrow, marginBottom: 8 }}>CORE scorecard</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
        {scenario.elements.map((el) => {
          const ok = attempt.present[el.key];
          return (
            <li key={el.key} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ color: ok ? EMERALD : RED, fontWeight: 800, fontSize: 16 }}>
                {ok ? '✓' : '✗'}
              </span>
              <span style={{ fontFamily: INTER, fontSize: 16, lineHeight: 1.6, color: INK }}>
                <strong>{el.label}.</strong> {el.oneLiner}
                {!ok && showHints && (
                  <span style={{ color: GOLD_DEEP, display: 'block', fontSize: 13, marginTop: 2 }}>
                    Try: {el.missingHint}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AnswerPreview({ scenario, attempt }: { scenario: WizardScenario; attempt: Attempt }) {
  const anyBroken = scenario.elements.some((el) => !attempt.present[el.key]);
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ ...eyebrow, marginBottom: 8 }}>The reply you’d get back</div>
      <div style={{ background: CREAM, borderRadius: 12, padding: 14, borderLeft: `3px solid ${GOLD_DEEP}` }}>
        <p style={{ margin: 0, fontFamily: INTER, fontSize: 16, lineHeight: 1.65 }}>
          {scenario.elements.map((el) => {
            const ok = attempt.present[el.key];
            return (
              <span key={el.key} style={{ color: ok ? INK : RED, fontWeight: ok ? 400 : 600 }}>
                {ok ? el.good : el.bad}{' '}
              </span>
            );
          })}
        </p>
      </div>
      {anyBroken && (
        <p style={{ fontSize: 13, color: RED, margin: '6px 0 0', fontFamily: INTER }}>
          Red = where a missing CORE part broke the answer. Fix that part of your prompt and Run again.
        </p>
      )}
    </div>
  );
}

// ── shared styles ─────────────────────────────────────────────────────────
const card: CSSProperties = {
  background: 'white',
  border: `1px solid ${LINE}`,
  borderRadius: 18,
  padding: 22,
  margin: '28px 0',
};
const downloadLink: CSSProperties = {
  display: 'inline-block',
  fontFamily: INTER,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: INK,
  background: 'transparent',
  border: `1px solid ${LINE}`,
  borderRadius: 12,
  padding: '10px 18px',
  textDecoration: 'none',
};
const primaryBtn: CSSProperties = {
  fontFamily: INTER,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: CREAM,
  background: INK,
  border: 'none',
  borderRadius: 12,
  padding: '11px 20px',
  cursor: 'pointer',
};
const gridHeadCell: CSSProperties = {
  fontFamily: INTER,
  fontSize: 11,
  fontWeight: 700,
  color: SLATE,
  padding: '2px 6px',
};
const gridLabelCell: CSSProperties = {
  fontFamily: INTER,
  fontSize: 11,
  fontWeight: 700,
  color: SLATE,
  padding: '4px 8px',
};
const gridCell: CSSProperties = {
  textAlign: 'center',
  fontFamily: INTER,
  fontSize: 13,
  fontWeight: 700,
  borderRadius: 8,
  padding: '6px 8px',
  minWidth: 34,
};
