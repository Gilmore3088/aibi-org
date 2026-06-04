'use client';

// ClaimReviewLab — Module 2 Activity 2.1 ("Spot the AI hallucination").
//
// Three AI banking answers, each with inline claims the learner clicks to
// flag. One answer is clean; two contain fabricated facts (invented
// frequencies, dollar thresholds, non-existent registries, a fictional Reg B
// amendment). After submitting, the lab reveals which flags were right, scores
// the learner, and saves the AI Claim Review artifact.
//
// It produces the SAME response shape the generic form did
// (output_{a,b,c}_verdict + _reasoning + reviewer_lesson) and posts to
// /api/courses/submit-activity, so completion, validation, and the
// aibi-p-m2-hallucination-log artifact all work with no backend change.

import React, { useMemo, useState, useCallback } from 'react';
import type { Activity } from '@content/courses/foundation-program';

const FONT =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

type ClaimType = 'number' | 'date' | 'name' | 'policy' | 'regulatory' | 'assumption';

interface Claim {
  readonly id: string;
  readonly text: string;
  readonly type: ClaimType;
  readonly fabricated: boolean;
  readonly why: string; // shown after submit
}

type Segment = string | Claim;

interface OutputDef {
  readonly id: 'a' | 'b' | 'c';
  readonly label: string;
  readonly question: string;
  readonly segments: readonly Segment[];
}

const CLAIM_TYPE_LABEL: Record<ClaimType, string> = {
  number: 'Number',
  date: 'Date',
  name: 'Name',
  policy: 'Policy claim',
  regulatory: 'Regulatory reference',
  assumption: 'Unsupported assumption',
};

const isClaim = (s: Segment): s is Claim => typeof s !== 'string';

// --- Content: three synthetic AI answers (no real PII) -----------------------
const OUTPUTS: readonly OutputDef[] = [
  {
    id: 'a',
    label: 'Output A',
    question: 'Can we use a public AI tool to draft an internal meeting summary?',
    segments: [
      'Yes — for ',
      { id: 'a1', text: 'non-sensitive internal notes', type: 'policy', fabricated: false, why: 'Accurate: low-risk internal use is the standard starting point.' },
      '. Strip ',
      { id: 'a2', text: 'customer names and account numbers', type: 'policy', fabricated: false, why: 'Accurate: sanitize identifiers before pasting.' },
      ' first, keep the summary grounded in what you provide, and have an ',
      { id: 'a3', text: 'accountable owner review it before use', type: 'policy', fabricated: false, why: 'Accurate: human review before use is required.' },
      '. Treat the output as a draft, not a system of record.',
    ],
  },
  {
    id: 'b',
    label: 'Output B',
    question: 'What does SR 11-7 require for generative AI models?',
    segments: [
      { id: 'b1', text: 'SR 11-7', type: 'regulatory', fabricated: false, why: 'Real: the Fed/OCC model risk management guidance.' },
      ' (issued in ',
      { id: 'b2', text: '2011', type: 'date', fabricated: false, why: 'Accurate: SR 11-7 was issued in 2011.' },
      ') requires that generative AI models be ',
      { id: 'b3', text: 're-validated every 90 days', type: 'number', fabricated: true, why: 'Fabricated: SR 11-7 sets no fixed re-validation interval.' },
      ' and that banks hold a ',
      { id: 'b4', text: 'minimum model-risk reserve of 2% of assets', type: 'number', fabricated: true, why: 'Fabricated: no such capital reserve exists in SR 11-7.' },
      '. It also mandates ',
      { id: 'b5', text: 'registration with the FFIEC AI Registry', type: 'regulatory', fabricated: true, why: 'Fabricated: there is no FFIEC AI Registry.' },
      '.',
    ],
  },
  {
    id: 'c',
    label: 'Output C',
    question: 'Can AI issue a loan adverse-action decision?',
    segments: [
      'AI can send adverse-action notices automatically once the model was ',
      { id: 'c1', text: 'approved by your board on or after January 1, 2024', type: 'date', fabricated: true, why: 'Fabricated: no rule ties automated denials to a board-approval date.' },
      '. ',
      { id: 'c2', text: 'ECOA Reg B', type: 'regulatory', fabricated: false, why: 'Real: ECOA / Reg B governs adverse action.' },
      ' was ',
      { id: 'c3', text: 'amended in 2023 to permit fully automated denials', type: 'policy', fabricated: true, why: 'Fabricated: Reg B was not amended to permit automated denials; specific reasons + human accountability still apply.' },
      '. ',
      { id: 'c4', text: 'Most community banks already do this', type: 'assumption', fabricated: true, why: 'Fabricated: an unsupported assumption with no source.' },
      '.',
    ],
  },
];

const ALL_CLAIMS = OUTPUTS.flatMap((o) => o.segments.filter(isClaim));
const FABRICATED_IDS = new Set(ALL_CLAIMS.filter((c) => c.fabricated).map((c) => c.id));

export interface ClaimReviewLabProps {
  readonly activity: Activity;
  readonly enrollmentId: string;
  readonly moduleNumber: number;
  readonly existingResponse?: Record<string, string> | null;
  readonly onSubmitSuccess?: (activityId: string) => void;
}

export function ClaimReviewLab({
  activity,
  enrollmentId,
  moduleNumber,
  existingResponse,
  onSubmitSuccess,
}: ClaimReviewLabProps) {
  const alreadyDone = existingResponse != null;
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [lesson, setLesson] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyDone);
  const [serverError, setServerError] = useState<string | null>(null);

  const reveal = submitted; // after submit, show the answer key

  const toggle = useCallback(
    (id: string) => {
      if (reveal) return;
      setFlagged((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [reveal],
  );

  const score = useMemo(() => {
    let caught = 0;
    let falsePositives = 0;
    for (const c of ALL_CLAIMS) {
      if (flagged.has(c.id)) {
        if (c.fabricated) caught += 1;
        else falsePositives += 1;
      }
    }
    return { caught, total: FABRICATED_IDS.size, falsePositives };
  }, [flagged]);

  const verdictFor = useCallback(
    (outputId: 'a' | 'b' | 'c'): 'clean' | 'flagged' => {
      const out = OUTPUTS.find((o) => o.id === outputId)!;
      const anyFlagged = out.segments.filter(isClaim).some((c) => flagged.has(c.id));
      return anyFlagged ? 'flagged' : 'clean';
    },
    [flagged],
  );

  const reasoningFor = useCallback(
    (outputId: 'a' | 'b' | 'c'): string => {
      const out = OUTPUTS.find((o) => o.id === outputId)!;
      const picked = out.segments.filter(isClaim).filter((c) => flagged.has(c.id));
      if (picked.length === 0) {
        return 'Marked clean — no fabricated numbers, dates, names, citations, or unsupported assumptions found.';
      }
      return `Flagged: ${picked.map((c) => `"${c.text}" (${CLAIM_TYPE_LABEL[c.type]})`).join('; ')}.`;
    },
    [flagged],
  );

  const canSubmit = lesson.trim().length >= 20 && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setServerError(null);
    const response: Record<string, string> = {
      output_a_verdict: verdictFor('a'),
      output_a_reasoning: reasoningFor('a'),
      output_b_verdict: verdictFor('b'),
      output_b_reasoning: reasoningFor('b'),
      output_c_verdict: verdictFor('c'),
      output_c_reasoning: reasoningFor('c'),
      reviewer_lesson: lesson.trim(),
    };
    try {
      const res = await fetch('/api/courses/submit-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, moduleNumber, activityId: activity.id, response }),
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
  }, [canSubmit, verdictFor, reasoningFor, lesson, enrollmentId, moduleNumber, activity.id, onSubmitSuccess]);

  // Chip appearance: neutral → flagged (gold) → after reveal: correct (emerald) / wrong (red)
  function chipStyle(c: Claim): React.CSSProperties {
    const base: React.CSSProperties = {
      display: 'inline',
      border: 'none',
      borderRadius: 6,
      padding: '1px 5px',
      margin: '0 1px',
      font: 'inherit',
      cursor: reveal ? 'default' : 'pointer',
      borderBottom: '2px dotted var(--slate-400)',
      background: 'transparent',
      color: 'inherit',
    };
    const isFlagged = flagged.has(c.id);
    if (!reveal) {
      return isFlagged
        ? { ...base, background: 'var(--gold-a20)', borderBottom: '2px solid var(--gold-deep)' }
        : base;
    }
    // revealed
    if (c.fabricated && isFlagged) return { ...base, background: 'rgba(4,120,87,0.16)', borderBottom: '2px solid var(--emerald-700)', cursor: 'default' };
    if (c.fabricated && !isFlagged) return { ...base, background: 'rgba(180,35,24,0.14)', borderBottom: '2px solid var(--red, #B42318)', cursor: 'default' };
    if (!c.fabricated && isFlagged) return { ...base, background: 'rgba(180,35,24,0.10)', borderBottom: '2px dashed var(--red, #B42318)', cursor: 'default' };
    return { ...base, borderBottom: '2px dotted var(--slate-200)', cursor: 'default' };
  }

  return (
    <section
      aria-label="AI Claim Review Lab"
      style={{ marginTop: 32, fontFamily: FONT }}
    >
      <h2
        style={{
          fontFamily: FONT,
          fontSize: 'clamp(22px,2.4vw,28px)',
          fontWeight: 700,
          letterSpacing: '-0.015em',
          color: 'var(--ink)',
          margin: '0 0 6px',
        }}
      >
        Claim Review Lab
      </h2>
      <p style={{ fontSize: 15, color: 'var(--slate-600)', lineHeight: 1.55, margin: '0 0 20px', maxWidth: '70ch' }}>
        {activity.description} Click any claim that looks fabricated or unsupported. AI sounds
        confident either way — your job is to verify before you trust.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,320px)', gap: 20, alignItems: 'start' }}>
        {/* LEFT — the three outputs */}
        <div style={{ display: 'grid', gap: 16 }}>
          {OUTPUTS.map((out) => (
            <article
              key={out.id}
              style={{
                background: '#fff',
                border: '1px solid var(--ink-a10)',
                borderRadius: 16,
                padding: '18px 20px',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-deep)' }}>
                  {out.label}
                </span>
                {reveal && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: verdictFor(out.id) === 'flagged' ? 'var(--gold-deep)' : 'var(--slate-500)' }}>
                    You marked: {verdictFor(out.id)}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: '0 0 10px' }}>
                Q: {out.question}
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink)', margin: 0 }}>
                {out.segments.map((seg, i) =>
                  isClaim(seg) ? (
                    <button
                      key={seg.id}
                      type="button"
                      onClick={() => toggle(seg.id)}
                      aria-pressed={flagged.has(seg.id)}
                      aria-label={`${seg.text} — ${CLAIM_TYPE_LABEL[seg.type]}${flagged.has(seg.id) ? ', flagged' : ''}`}
                      style={chipStyle(seg)}
                    >
                      {seg.text}
                    </button>
                  ) : (
                    <span key={i}>{seg}</span>
                  ),
                )}
              </p>
              {reveal && (
                <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
                  {out.segments.filter(isClaim).filter((c) => c.fabricated || flagged.has(c.id)).map((c) => (
                    <li key={c.id} style={{ fontSize: 12.5, lineHeight: 1.45, color: c.fabricated ? 'var(--ink)' : 'var(--slate-500)' }}>
                      <strong style={{ color: c.fabricated ? 'var(--red, #B42318)' : 'var(--slate-600)' }}>
                        {c.fabricated ? (flagged.has(c.id) ? '✓ Caught' : '✗ Missed') : 'False flag'}:
                      </strong>{' '}
                      {c.why}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        {/* RIGHT — checklist, score, verdict, lesson, submit */}
        <aside
          style={{
            position: 'sticky',
            top: 96,
            background: 'var(--cream-2)',
            border: '1px solid var(--ink-a10)',
            borderRadius: 16,
            padding: '18px 18px 20px',
            display: 'grid',
            gap: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-deep)', marginBottom: 8 }}>
              Verify before you trust
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 5 }}>
              {(Object.keys(CLAIM_TYPE_LABEL) as ClaimType[]).map((t) => (
                <li key={t} style={{ fontSize: 13, color: 'var(--slate-600)', display: 'flex', gap: 8 }}>
                  <span aria-hidden style={{ color: 'var(--gold-deep)' }}>•</span> {CLAIM_TYPE_LABEL[t]}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ borderTop: '1px solid var(--ink-a10)', paddingTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: 4 }}>
              {reveal ? 'Your score' : 'Flags placed'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>
              {reveal ? `${score.caught} / ${score.total} fabrications caught` : `${flagged.size} flagged`}
            </div>
            {reveal && score.falsePositives > 0 && (
              <div style={{ fontSize: 12.5, color: 'var(--red, #B42318)', marginTop: 2 }}>
                {score.falsePositives} false flag{score.falsePositives === 1 ? '' : 's'} on clean claims
              </div>
            )}
          </div>

          {!reveal && (
            <div style={{ borderTop: '1px solid var(--ink-a10)', paddingTop: 12 }}>
              <label htmlFor="cr-lesson" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
                One verification habit you&rsquo;ll use going forward
              </label>
              <textarea
                id="cr-lesson"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                rows={3}
                placeholder="One sentence, specific to your role."
                style={{ width: '100%', fontFamily: FONT, fontSize: 14, padding: '8px 10px', borderRadius: 10, border: '1px solid var(--slate-200)', resize: 'vertical' }}
              />
              <div style={{ fontSize: 11, color: lesson.trim().length >= 20 ? 'var(--emerald-700)' : 'var(--slate-500)', marginTop: 4 }}>
                {lesson.trim().length >= 20 ? 'Ready to submit' : `${20 - lesson.trim().length} more characters`}
              </div>
            </div>
          )}

          {serverError && (
            <p role="alert" style={{ fontSize: 13, color: 'var(--red, #B42318)', margin: 0 }}>{serverError}</p>
          )}

          {reveal ? (
            <div style={{ fontSize: 13, color: 'var(--emerald-700)', fontWeight: 600 }}>
              AI Claim Review saved to your Foundation Packet.
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                fontFamily: FONT,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '12px 18px',
                borderRadius: 12,
                border: 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                background: canSubmit ? 'var(--ink)' : 'var(--slate-200)',
                color: canSubmit ? 'var(--cream)' : 'var(--slate-500)',
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Claim Review'}
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}
