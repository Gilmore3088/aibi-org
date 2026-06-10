'use client';

// SafetyLab — Module 9 Activity 9.1.
//
// Inverts the Module 3 wizard. The learner is shown a prompt that already
// works — polished output, task done — and must (1) spot what makes it
// dangerous, (2) pick the repair, (3) see the re-run come back safe. Four
// scenarios: confident-wrong (ungrounded), the leak (PII), the line-crosser
// (red-zone decision), the hidden instruction (prompt injection). Finishing
// all four completes the two moves Module 3 left dark — Check and Escalate.
//
// House style: mockup tokens, Inter, sentence-case headings, UPPERCASE
// buttons, status never color-only.

import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import type { Activity } from '@content/courses/foundation-program';
import {
  SAFETY_SCENARIOS,
  type Choice,
  type Phase,
  type SafetyScenario,
} from '../_lib/safetyLabData';

const INK = '#071A2F';
const GOLD_DEEP = '#9A7A2F';
const CREAM = '#F7F3EA';
const LINE = 'rgba(7,26,47,.12)';
const SLATE = '#475569';
const EMERALD = '#047857';
const RED = '#B91C1C';
const INTER = 'Inter, ui-sans-serif, system-ui, sans-serif';

export interface SafetyLabProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

export function SafetyLab({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: SafetyLabProps) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('spot');
  const [spotPick, setSpotPick] = useState<string | null>(null);
  const [repairPick, setRepairPick] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [submitted, setSubmitted] = useState(Boolean(existingResponse));
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const s: SafetyScenario = SAFETY_SCENARIOS[idx];

  const choose = useCallback(
    (which: 'spot' | 'repair', choice: Choice) => {
      if (which === 'spot') {
        setSpotPick(choice.id);
        if (choice.correct) setPhase('repair');
      } else {
        setRepairPick(choice.id);
        if (choice.correct) setPhase('fixed');
      }
    },
    [],
  );

  const next = useCallback(() => {
    if (idx + 1 >= SAFETY_SCENARIOS.length) {
      setAllDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setPhase('spot');
    setSpotPick(null);
    setRepairPick(null);
  }, [idx]);

  const responseSummary = useMemo(
    () => SAFETY_SCENARIOS.map((x) => `${x.title} — ${x.move}`).join('; '),
    [],
  );

  const submit = useCallback(async () => {
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
          response: { safeguards_practiced: responseSummary },
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
  }, [enrollmentId, moduleNumber, activity.id, responseSummary, onSubmitSuccess]);

  if (submitted) {
    return (
      <div style={card}>
        <div style={eyebrow}>Safety lab · complete</div>
        <p style={{ color: INK, fontSize: 15, fontWeight: 700, margin: '10px 0 4px' }}>
          The 5-move card is complete. State · Ground · Constrain · Check · Escalate. ✓
        </p>
        <p style={{ color: SLATE, fontSize: 14, lineHeight: 1.55, margin: '0 0 14px' }}>
          You caught an invented figure, a needless data leak, a red-zone decision, and a
          hidden instruction — and repaired each one. An effective prompt is not enough; a
          banker ships prompts that are effective <strong>and</strong> safe.
        </p>
        <a href="/api/courses/cards/five-move-zones" style={downloadLink}>
          Download the 5-Move + Zones card (PDF)
        </a>
      </div>
    );
  }

  if (allDone) {
    return (
      <div style={card}>
        <div style={eyebrow}>Safety lab · the card is complete</div>
        <FiveMoveCard />
        <p style={{ color: SLATE, fontSize: 14, lineHeight: 1.55, margin: '12px 0 14px' }}>
          Module 3 lit the first three moves. You just earned the last two — Check and
          Escalate. Save your work to complete the module.
        </p>
        <button type="button" onClick={submit} disabled={submitting} style={primaryBtn}>
          {submitting ? 'Saving…' : 'Save & complete module'}
        </button>
        {serverError && <p style={{ color: RED, fontSize: 13, marginTop: 10 }}>{serverError}</p>}
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={eyebrow}>Safety lab · {activity.title}</div>

      {/* progress dots */}
      <div style={{ display: 'flex', gap: 6, margin: '8px 0 14px', flexWrap: 'wrap' }}>
        {SAFETY_SCENARIOS.map((x, i) => (
          <span
            key={x.id}
            style={{
              fontFamily: INTER,
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 999,
              border: `1px solid ${LINE}`,
              background: i === idx ? INK : i < idx ? '#D1FAE5' : 'transparent',
              color: i === idx ? CREAM : i < idx ? EMERALD : SLATE,
            }}
          >
            {i < idx ? '✓ ' : ''}{i + 1}
          </span>
        ))}
        <span style={zoneTag(s.zone)}>{s.zone} zone</span>
      </div>

      <p style={{ color: INK, fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>{s.title}</p>
      <p style={{ color: SLATE, fontSize: 13, margin: '0 0 10px' }}>{s.task}</p>

      <Labeled label="The prompt (it works)">{s.unsafePrompt}</Labeled>
      <Labeled label="What the AI returned — and it looks fine" tone="warn">
        {s.dangerousOutput}
      </Labeled>

      {/* SPOT */}
      {phase === 'spot' && (
        <Question
          eyebrowText="Step 1 · Spot the danger"
          question={s.spotQuestion}
          choices={s.spotChoices}
          picked={spotPick}
          onPick={(c) => choose('spot', c)}
          explainOnCorrect={s.spotExplain}
        />
      )}

      {/* REPAIR */}
      {phase === 'repair' && (
        <>
          <Resolved text={s.spotExplain} />
          <Question
            eyebrowText="Step 2 · Repair the prompt"
            question={s.repairQuestion}
            choices={s.repairChoices}
            picked={repairPick}
            onPick={(c) => choose('repair', c)}
          />
        </>
      )}

      {/* FIXED */}
      {phase === 'fixed' && (
        <div style={{ marginTop: 16 }}>
          <Labeled label="Re-run — same task, now safe" tone="good">
            {s.safeOutput}
          </Labeled>
          <p style={{ color: EMERALD, fontSize: 13, fontWeight: 700, margin: '12px 0 0' }}>
            ✓ {s.lesson}
          </p>
          <button type="button" onClick={next} style={{ ...primaryBtn, marginTop: 14 }}>
            {idx + 1 >= SAFETY_SCENARIOS.length ? 'Finish the card' : 'Next scenario'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────

function Question({
  eyebrowText,
  question,
  choices,
  picked,
  onPick,
  explainOnCorrect,
}: {
  eyebrowText: string;
  question: string;
  choices: readonly Choice[];
  picked: string | null;
  onPick: (c: Choice) => void;
  explainOnCorrect?: string;
}) {
  const pickedChoice = choices.find((c) => c.id === picked) ?? null;
  const pickedWrong = pickedChoice ? !pickedChoice.correct : false;
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ ...eyebrow, marginBottom: 6 }}>{eyebrowText}</div>
      <p style={{ color: INK, fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>{question}</p>
      <div style={{ display: 'grid', gap: 8 }}>
        {choices.map((c) => {
          const isPicked = picked === c.id;
          const reveal = isPicked;
          const bg = reveal ? (c.correct ? '#D1FAE5' : '#FEE2E2') : 'white';
          const bd = reveal ? (c.correct ? EMERALD : RED) : LINE;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c)}
              style={{
                textAlign: 'left',
                fontFamily: INTER,
                fontSize: 13.5,
                lineHeight: 1.5,
                color: INK,
                background: bg,
                border: `1px solid ${bd}`,
                borderRadius: 12,
                padding: '11px 14px',
                cursor: 'pointer',
              }}
            >
              {reveal && <strong>{c.correct ? '✓ ' : '✗ '}</strong>}
              {c.text}
            </button>
          );
        })}
      </div>
      {pickedWrong && (
        <p style={{ color: RED, fontSize: 12.5, margin: '8px 0 0' }}>
          Not the core issue — look again at what the prompt did and did not give the AI.
        </p>
      )}
      {pickedChoice?.correct && explainOnCorrect && <Resolved text={explainOnCorrect} />}
    </div>
  );
}

function Resolved({ text }: { text: string }) {
  return (
    <p
      style={{
        color: INK,
        fontSize: 13,
        lineHeight: 1.55,
        background: CREAM,
        borderLeft: `3px solid ${GOLD_DEEP}`,
        padding: '10px 12px',
        borderRadius: 8,
        margin: '10px 0 0',
      }}
    >
      {text}
    </p>
  );
}

function Labeled({
  label,
  children,
  tone = 'neutral',
}: {
  label: string;
  children: React.ReactNode;
  tone?: 'neutral' | 'warn' | 'good';
}) {
  const border = tone === 'warn' ? RED : tone === 'good' ? EMERALD : LINE;
  return (
    <div style={{ margin: '10px 0 0' }}>
      <div style={{ ...eyebrow, color: tone === 'good' ? EMERALD : GOLD_DEEP, marginBottom: 4 }}>
        {label}
      </div>
      <p
        style={{
          margin: 0,
          fontFamily: INTER,
          fontSize: 13,
          lineHeight: 1.55,
          color: INK,
          background: 'white',
          border: `1px solid ${border}`,
          borderRadius: 10,
          padding: 12,
        }}
      >
        {children}
      </p>
    </div>
  );
}

function FiveMoveCard() {
  const moves: { label: string; on: boolean }[] = [
    { label: 'State', on: true },
    { label: 'Ground', on: true },
    { label: 'Constrain', on: true },
    { label: 'Check', on: true },
    { label: 'Escalate', on: true },
  ];
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0' }}>
      {moves.map((m, i) => (
        <span
          key={m.label}
          style={{
            fontFamily: INTER,
            fontSize: 12,
            fontWeight: 800,
            padding: '6px 12px',
            borderRadius: 10,
            background: INK,
            color: i < 3 ? CREAM : '#FCE9B8',
            border: i < 3 ? 'none' : `1px solid ${GOLD_DEEP}`,
          }}
        >
          {i + 1}. {m.label}
        </span>
      ))}
    </div>
  );
}

function zoneTag(zone: string): CSSProperties {
  const red = zone === 'Red';
  return {
    fontFamily: INTER,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '3px 9px',
    borderRadius: 999,
    marginLeft: 'auto',
    background: red ? '#FEE2E2' : '#FEF3C7',
    color: red ? RED : '#92400E',
  };
}

// ── shared styles ─────────────────────────────────────────────────────────
const card: CSSProperties = {
  background: 'white',
  border: `1px solid ${LINE}`,
  borderRadius: 18,
  padding: 22,
  margin: '28px 0',
};
const eyebrow: CSSProperties = {
  fontFamily: INTER,
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: GOLD_DEEP,
};
const downloadLink: CSSProperties = {
  display: 'inline-block',
  fontFamily: INTER,
  fontSize: 11,
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
  fontSize: 11,
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
