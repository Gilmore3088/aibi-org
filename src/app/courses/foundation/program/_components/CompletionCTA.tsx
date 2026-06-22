'use client';

// CompletionCTA — shown after a learner marks a module complete.
// Every module gets a compact adult-learning debrief: retrieval, feedback,
// transfer, and spaced replay. Module 5 keeps the Executive Briefing CTA.
// The final module adds the assessed work-product submission CTA.
// FUNL-01/02: funnel touchpoint for learners who have completed the Understanding pillar.
// A11Y-01: keyboard accessible links with visible focus rings.
// TimeSavingsCard is appended after each contextual message.
// Mockup chrome: cream surface, gold primary CTA on ink fill, slate body.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TimeSavingsCard } from './TimeSavingsCard';
import { trackBriefingBooked } from '@/lib/analytics/events';
import {
  getArtifactFirst,
  modules,
} from '@content/courses/foundation-program';
import { getFoundationLabBrief } from '@content/courses/foundation-program/lab-first';

interface CompletionCTAProps {
  readonly moduleNumber: number;
  readonly isLastModule: boolean;
}

const fontStack = 'Inter, ui-sans-serif, system-ui, sans-serif';

const ctaPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px 22px',
  background: 'var(--gold)',
  color: 'var(--ink)',
  fontFamily: fontStack,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  borderRadius: 12,
  transition: 'background var(--t-fast) var(--ease)',
};

const ctaSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 18px',
  background: 'transparent',
  color: 'var(--ink)',
  fontFamily: fontStack,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  borderRadius: 12,
  border: '1px solid var(--ink-a15)',
  transition: 'border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease)',
};

const eyebrow: React.CSSProperties = {
  fontFamily: fontStack,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: '0 0 8px',
};

const debriefShell: React.CSSProperties = {
  marginTop: 32,
  background: '#fff',
  border: '1px solid var(--ink-a10)',
  borderRadius: 18,
  overflow: 'hidden',
  boxShadow: 'var(--shadow-soft)',
};

const debriefGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 10,
};

type CompletionCueId = 'retrieve' | 'check' | 'transfer' | 'revisit';
type CompletionEvidence = {
  readonly target: string;
  readonly handoffNote: string;
  readonly transferPlan: string;
};

const COMPLETION_CUE_IDS: readonly CompletionCueId[] = [
  'retrieve',
  'check',
  'transfer',
  'revisit',
] as const;

function completionCueStorageKey(moduleNumber: number) {
  return `foundation-completion-debrief-${moduleNumber}`;
}

function readLocalValue(key: string) {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function readCompletionEvidence(moduleNumber: number): CompletionEvidence {
  return {
    target: readLocalValue(`foundation-module-start-target-${moduleNumber}`),
    handoffNote: readLocalValue(`foundation-module-handoff-${moduleNumber}`),
    transferPlan: readLocalValue(`foundation-transfer-plan-${moduleNumber}`),
  };
}

function parseCompletionCuePayload(raw: string | null): ReadonlySet<CompletionCueId> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return new Set(
      parsed.filter((item): item is CompletionCueId =>
        typeof item === 'string' && COMPLETION_CUE_IDS.includes(item as CompletionCueId),
      ),
    );
  } catch {
    return null;
  }
}

function readCompletionCueCookie(moduleNumber: number): string | null {
  if (typeof document === 'undefined') return null;
  const name = `${completionCueStorageKey(moduleNumber)}=`;
  const entry = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(name));
  if (!entry) return null;
  return decodeURIComponent(entry.slice(name.length));
}

function readSavedCompletionCues(moduleNumber: number): ReadonlySet<CompletionCueId> {
  if (typeof window === 'undefined') return new Set();
  try {
    const saved = parseCompletionCuePayload(
      window.localStorage.getItem(completionCueStorageKey(moduleNumber)),
    );
    if (saved) return saved;
  } catch {
    // Fall back to the cookie below.
  }
  return parseCompletionCuePayload(readCompletionCueCookie(moduleNumber)) ?? new Set();
}

function saveCompletionCues(moduleNumber: number, cues: ReadonlySet<CompletionCueId>) {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify(COMPLETION_CUE_IDS.filter((cue) => cues.has(cue)));
  try {
    window.localStorage.setItem(completionCueStorageKey(moduleNumber), payload);
  } catch {
    // Cookie fallback below keeps the replay cue durable in stricter browser contexts.
  }
  try {
    document.cookie = `${completionCueStorageKey(moduleNumber)}=${encodeURIComponent(payload)}; max-age=31536000; path=/; SameSite=Lax`;
  } catch {
    // Local persistence is a learning aid; completion should not depend on it.
  }
}

function CompletionDebrief({
  moduleNumber,
  isLastModule,
}: {
  readonly moduleNumber: number;
  readonly isLastModule: boolean;
}) {
  const brief = getFoundationLabBrief(moduleNumber);
  const currentArtifact = getArtifactFirst(moduleNumber);
  const nextArtifact = moduleNumber < modules.length ? getArtifactFirst(moduleNumber + 1) : undefined;
  const nextHref = isLastModule
    ? '/courses/foundation/program/toolkit'
    : `/courses/foundation/program/${moduleNumber + 1}`;
  const nextLabel = isLastModule ? 'Open packet' : `Module ${String(moduleNumber + 1).padStart(2, '0')}`;
  const [evidence, setEvidence] = useState<CompletionEvidence>(() => ({
    target: '',
    handoffNote: '',
    transferPlan: '',
  }));
  const savedTarget = evidence.target.trim();
  const savedHandoff = evidence.handoffNote.trim();
  const savedTransfer = evidence.transferPlan.trim();
  const evidenceItems = [
    savedTarget ? { label: 'Target', body: savedTarget } : undefined,
    savedHandoff ? { label: 'Review note', body: savedHandoff } : undefined,
    savedTransfer ? { label: 'Next use', body: savedTransfer } : undefined,
  ].filter((item): item is { label: string; body: string } => Boolean(item));
  const cues = [
    {
      id: 'retrieve',
      label: 'Remember',
      body: brief?.learningLoop.recallPrompt ?? 'Name the rule you just practiced before you move on.',
    },
    {
      id: 'check',
      label: 'Check',
      body:
        savedHandoff ||
        (brief?.learningLoop.feedbackCue ??
          'Compare your artifact against the review bar before you reuse it.'),
    },
    {
      id: 'transfer',
      label: 'Reuse',
      body:
        savedTransfer ||
        (brief?.learningLoop.transferPrompt ?? 'Use the artifact on one realistic work task.'),
    },
    {
      id: 'revisit',
      label: 'Revisit',
      body: nextArtifact
        ? `Before ${nextArtifact.saved}, reopen this artifact and restate the rule from memory.`
        : 'Tomorrow, reopen the packet and name the safety boundary from memory.',
    },
  ] as const;
  const [checkedCues, setCheckedCues] = useState<ReadonlySet<CompletionCueId>>(
    () => new Set(),
  );
  const checkedCount = cues.filter((cue) => checkedCues.has(cue.id)).length;
  const remainingCount = cues.length - checkedCount;

  useEffect(() => {
    setCheckedCues(readSavedCompletionCues(moduleNumber));
  }, [moduleNumber]);

  useEffect(() => {
    function refreshEvidence() {
      setEvidence(readCompletionEvidence(moduleNumber));
    }

    function refreshForModule(event: Event) {
      const detail = (event as CustomEvent<unknown>).detail as
        | { moduleNumber?: unknown }
        | undefined;
      if (!detail || detail.moduleNumber === moduleNumber) {
        refreshEvidence();
      }
    }

    refreshEvidence();
    window.addEventListener('storage', refreshEvidence);
    window.addEventListener('foundation-module-start-target-updated', refreshForModule);
    window.addEventListener('foundation-module-handoff-updated', refreshForModule);
    window.addEventListener('foundation-learning-signal-updated', refreshForModule);
    return () => {
      window.removeEventListener('storage', refreshEvidence);
      window.removeEventListener('foundation-module-start-target-updated', refreshForModule);
      window.removeEventListener('foundation-module-handoff-updated', refreshForModule);
      window.removeEventListener('foundation-learning-signal-updated', refreshForModule);
    };
  }, [moduleNumber]);

  function toggleCue(cueId: CompletionCueId) {
    setCheckedCues((previous) => {
      const next = new Set(previous);
      if (next.has(cueId)) {
        next.delete(cueId);
      } else {
        next.add(cueId);
      }
      saveCompletionCues(moduleNumber, next);
      return next;
    });
  }

  return (
    <section
      aria-label="Module debrief"
      data-testid="foundation-completion-debrief"
      style={debriefShell}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 18,
          alignItems: 'center',
          padding: 'clamp(18px, 2.4vw, 24px)',
          borderBottom: '1px solid var(--ink-a10)',
          background: 'var(--cream-2)',
        }}
        className="foundation-completion-debrief__header"
      >
        <div>
          <p style={eyebrow}>Module debrief</p>
          <h3
            style={{
              fontFamily: fontStack,
              fontSize: 'clamp(22px, 2.2vw, 30px)',
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: 'var(--ink)',
              margin: 0,
            }}
          >
            Save the learning before you leave.
          </h3>
          {currentArtifact && (
            <p
              style={{
                fontFamily: fontStack,
                fontSize: 15,
                fontWeight: 650,
                lineHeight: 1.45,
                color: 'var(--slate-600)',
                margin: '8px 0 0',
              }}
            >
              Packet item: {currentArtifact.saved}
            </p>
          )}
          <p
            aria-live="polite"
            style={{
              fontFamily: fontStack,
              fontSize: 12,
              fontWeight: 850,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
              margin: '10px 0 0',
            }}
          >
            Replay checks: {checkedCount}/{cues.length}
          </p>
        </div>
        <Link href={nextHref} style={ctaSecondary}>
          {nextLabel}
          <ArrowIcon />
        </Link>
      </div>

      <div style={{ padding: 'clamp(16px, 2.2vw, 22px)' }}>
        {evidenceItems.length > 0 ? (
          <div
            className="foundation-completion-evidence"
            data-testid="foundation-completion-evidence"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${evidenceItems.length}, minmax(0, 1fr))`,
              gap: 10,
              marginBottom: 12,
            }}
          >
            {evidenceItems.map((item) => (
              <div
                key={item.label}
                style={{
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 14,
                  background: 'var(--cream-2)',
                  padding: '12px 14px',
                  minHeight: 86,
                }}
              >
                <p style={{ ...eyebrow, color: 'var(--slate-500)', marginBottom: 6 }}>
                  {item.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--ink)',
                    fontFamily: fontStack,
                    fontSize: 14,
                    fontWeight: 725,
                    lineHeight: 1.4,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        ) : null}
        <div className="foundation-completion-debrief__grid" style={debriefGrid}>
          {cues.map((cue, index) => {
            const isChecked = checkedCues.has(cue.id);
            return (
            <button
              key={cue.id}
              type="button"
              aria-pressed={isChecked}
              onClick={() => toggleCue(cue.id)}
              style={{
                textAlign: 'left',
                border: '1px solid var(--ink-a10)',
                borderRadius: 14,
                background: isChecked ? 'var(--ink)' : 'var(--cream)',
                padding: '12px 14px',
                cursor: 'pointer',
                minHeight: 118,
                display: 'grid',
                alignContent: 'start',
                gap: 6,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-grid',
                  placeItems: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: isChecked ? 'var(--gold)' : '#fff',
                  color: 'var(--ink)',
                  border: isChecked ? '1px solid var(--gold)' : '1px solid var(--ink-a10)',
                  fontFamily: fontStack,
                  fontSize: 11,
                  fontWeight: 900,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {isChecked ? '✓' : index + 1}
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: fontStack,
                  fontSize: 10,
                  fontWeight: 850,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: isChecked ? 'var(--gold)' : 'var(--gold-deep)',
                }}
              >
                {cue.label}
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: fontStack,
                  fontSize: 14,
                  fontWeight: 725,
                  lineHeight: 1.4,
                  color: isChecked ? '#fff' : 'var(--ink)',
                }}
              >
                {cue.body}
              </span>
            </button>
            );
          })}
        </div>
        <div
          className="foundation-completion-debrief__replay"
          data-testid="foundation-completion-replay"
          style={{
            marginTop: 12,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 12,
            alignItems: 'center',
            padding: '12px 14px',
            borderRadius: 14,
            border: '1px solid var(--ink-a10)',
            background: checkedCount === cues.length ? 'rgba(4,120,87,0.08)' : '#fff',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: 'var(--ink)',
                fontFamily: fontStack,
                fontSize: 14,
                fontWeight: 825,
                lineHeight: 1.25,
              }}
            >
              {checkedCount === cues.length
                ? 'Replay plan saved for this module.'
                : `${remainingCount} replay ${remainingCount === 1 ? 'cue' : 'cues'} left.`}
            </p>
            <p
              style={{
                margin: '4px 0 0',
                color: 'var(--slate-600)',
                fontFamily: fontStack,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              {isLastModule
                ? 'Reopen the packet tomorrow and name the safety boundary from memory.'
                : `${nextLabel} starts stronger when this rule comes back from memory first.`}
            </p>
          </div>
          <span
            aria-live="polite"
            style={{
              display: 'inline-grid',
              placeItems: 'center',
              minWidth: 72,
              height: 38,
              borderRadius: 999,
              background: checkedCount === cues.length ? 'var(--ink)' : 'var(--cream)',
              color: checkedCount === cues.length ? 'var(--gold)' : 'var(--ink)',
              border: '1px solid var(--ink-a10)',
              fontFamily: fontStack,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {checkedCount}/{cues.length}
          </span>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 760px) {
              .foundation-completion-debrief__header {
                grid-template-columns: 1fr !important;
                align-items: start !important;
              }
              .foundation-completion-evidence {
                grid-template-columns: 1fr !important;
              }
              .foundation-completion-debrief__grid {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
              }
              .foundation-completion-debrief__grid > button {
                display: grid !important;
                grid-template-columns: 38px 82px minmax(0, 1fr) !important;
                gap: 10px !important;
                align-items: center !important;
                padding: 10px 12px !important;
                min-height: 56px !important;
              }
              .foundation-completion-debrief__grid > button > span:last-child {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
              .foundation-completion-debrief__replay {
                grid-template-columns: 1fr !important;
              }
              .foundation-completion-debrief__replay > span {
                width: 100% !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CompletionCTA({ moduleNumber, isLastModule }: CompletionCTAProps) {
  const briefingMailto =
    'mailto:hello@aibankinginstitute.com?subject=Executive%20Briefing%20%E2%80%94%20Foundation%20learner%20follow-up';

  // Final module — Application pillar complete: work product submission CTA
  // and post-course assessment CTA.
  if (isLastModule) {
    return (
      <>
        <CompletionDebrief moduleNumber={moduleNumber} isLastModule={isLastModule} />
        <div
          aria-label="Course complete — next steps"
          style={{
            marginTop: 16,
            padding: 28,
            background: 'var(--cream-2)',
            border: '1px solid var(--ink-a10)',
            borderLeft: '4px solid var(--gold)',
            borderRadius: 16,
          }}
        >
          <p style={eyebrow}>All modules complete</p>
          <p
            style={{
              fontFamily: fontStack,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
              margin: '0 0 12px',
            }}
          >
            Ready for your assessed work product.
          </p>
          <p
            style={{
              fontFamily: fontStack,
              fontSize: 16,
              color: 'var(--slate-600)',
              lineHeight: 1.65,
              margin: '0 0 20px',
            }}
          >
            Submit one reviewed work product backed by the prompt, verification,
            limits, and human-judgment notes you built across the course.
          </p>
          <Link href="/courses/foundation/program/submit" style={ctaPrimary}>
            Begin work product submission
            <ArrowIcon />
          </Link>
          <p
            style={{
              marginTop: 12,
              fontFamily: fontStack,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            One work product required. Reviewer scores four parts against a five-dimension rubric.
          </p>
        </div>

        {/* Post-course assessment CTA */}
        <div
          aria-label="Measure your growth"
          style={{
            marginTop: 16,
            padding: 22,
            background: 'var(--cream)',
            border: '1px solid var(--ink-a10)',
            borderRadius: 16,
          }}
        >
          <p style={{ ...eyebrow, color: 'var(--slate-500)' }}>Optional — measure your growth</p>
          <p
            style={{
              fontFamily: fontStack,
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--ink)',
              margin: '0 0 4px',
            }}
          >
            See how far you&rsquo;ve come.
          </p>
          <p
            style={{
              fontFamily: fontStack,
              fontSize: 16,
              color: 'var(--slate-600)',
              lineHeight: 1.6,
              margin: '0 0 16px',
            }}
          >
            Take the same readiness assessment you completed before the course. The side-by-side
            comparison shows your AI readiness improvement — dimension by dimension.
          </p>
          <Link href="/courses/foundation/program/post-assessment" style={ctaSecondary}>
            Measure your growth
            <ArrowIcon />
          </Link>
        </div>

        <TimeSavingsCard moduleNumber={moduleNumber} />
      </>
    );
  }

  // M9 — Understanding pillar complete, Executive Briefing CTA
  if (moduleNumber === 9) {
    return (
      <>
        <CompletionDebrief moduleNumber={moduleNumber} isLastModule={isLastModule} />
        <div
          aria-label="Module complete — next steps"
          style={{
            marginTop: 16,
            padding: 28,
            background: 'var(--cream-2)',
            border: '1px solid var(--ink-a10)',
            borderLeft: '4px solid var(--gold)',
            borderRadius: 16,
          }}
        >
          <p style={eyebrow}>Understanding pillar complete</p>
          <p
            style={{
              fontFamily: fontStack,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
              margin: '0 0 12px',
            }}
          >
            You have the foundation. Now see the full picture.
          </p>
          <p
            style={{
              fontFamily: fontStack,
              fontSize: 16,
              color: 'var(--slate-600)',
              lineHeight: 1.65,
              margin: '0 0 20px',
            }}
          >
            Map what you built to your institution&rsquo;s workflows, vendors, and risk profile.
          </p>
          <a
            href={briefingMailto}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackBriefingBooked({ source: 'cta' })}
            style={ctaPrimary}
          >
            Book an Executive Briefing
            <ArrowIcon />
          </a>
          <p
            style={{
              marginTop: 12,
              fontFamily: fontStack,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            No obligation. 30 minutes. Specific to your institution.
          </p>
        </div>
        <TimeSavingsCard moduleNumber={moduleNumber} />
      </>
    );
  }

  return (
    <>
      <CompletionDebrief moduleNumber={moduleNumber} isLastModule={isLastModule} />
      <TimeSavingsCard moduleNumber={moduleNumber} />
    </>
  );
}
