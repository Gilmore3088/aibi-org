'use client';

// CompletionCTA — shown after a learner marks a module complete.
// M1-4: brief encouragement message only.
// M5: prominent Executive Briefing CTA via mailto (Understanding pillar complete).
// M6-8: brief encouragement for Creation/Application pillar progress.
// M9 / isLastModule: work product submission CTA (Application pillar complete).
// FUNL-01/02: funnel touchpoint for learners who have completed the Understanding pillar.
// A11Y-01: keyboard accessible links with visible focus rings.
// TimeSavingsCard is appended after each contextual message.
// Mockup chrome: cream surface, gold primary CTA on ink fill, slate body.

import Link from 'next/link';
import { TimeSavingsCard } from './TimeSavingsCard';
import { trackBriefingBooked } from '@/lib/analytics/events';

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
  fontSize: 11,
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
  fontSize: 11,
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
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: '0 0 8px',
};

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

  // M9 or final module — Application pillar complete: work product submission CTA
  // and post-course assessment CTA.
  if (moduleNumber === 9 || isLastModule) {
    return (
      <>
        <div
          aria-label="Course complete — next steps"
          style={{
            marginTop: 32,
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
              fontSize: 15,
              color: 'var(--slate-600)',
              lineHeight: 1.65,
              margin: '0 0 20px',
            }}
          >
            You have completed all 12 modules of the AiBI-Foundation course. Your final step is
            to submit a four-item work product package demonstrating your professional AI
            capability. This is not a test — it is a demonstration of the skills you have built
            throughout this course.
          </p>
          <Link href="/courses/foundation/program/submit" style={ctaPrimary}>
            Begin work product submission
            <ArrowIcon />
          </Link>
          <p
            style={{
              marginTop: 12,
              fontFamily: fontStack,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            Four items required. Reviewed against a five-dimension rubric.
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
              fontSize: 15,
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
              fontSize: 13,
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

  // M5 — Understanding pillar complete, Executive Briefing CTA
  if (moduleNumber === 5) {
    return (
      <>
        <div
          aria-label="Module complete — next steps"
          style={{
            marginTop: 32,
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
              fontSize: 15,
              color: 'var(--slate-600)',
              lineHeight: 1.65,
              margin: '0 0 20px',
            }}
          >
            You now know how to classify data, recognise hallucination patterns, and build your
            own Acceptable Use Card. An Executive Briefing maps that knowledge to your
            institution&rsquo;s specific workflows, vendors, and risk profile.
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
              fontSize: 11,
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

  // Brief learner-facing encouragement after each module.
  const encouragementByModule: Record<number, string> = {
    1: 'Module 1 complete. You have a first practical view of how AI can help your workday.',
    2: 'Module 2 complete. You understand what AI is, what it is not, and why human review matters.',
    3: 'Module 3 complete. You can now structure a prompt with role, task, context, format, and constraints.',
    4: 'Module 4 complete. Your AI work profile gives you reusable context without exposing sensitive data.',
    5: 'Module 5 complete. You can brief AI on a project without making it guess or overreach.',
    6: 'Module 6 complete. You can use approved documents for summaries, extraction, and reviewable workflows.',
    7: 'Module 7 complete. You can choose the right tool category for the task and data boundary.',
    8: 'Module 8 complete. You can map an AI workflow with clear human checkpoints.',
    9: 'Module 9 complete. You can classify AI uses with the SAFE rule and red/yellow/green boundaries.',
    10: 'Module 10 complete. You have identified a practical role-based AI use case.',
    11: 'Module 11 complete. Your personal prompt library is becoming a reusable work asset.',
    12: 'Module 12 complete. You are ready to submit your final practitioner lab package.',
  };

  const message =
    encouragementByModule[moduleNumber] ?? `Module ${moduleNumber} complete. Keep going.`;

  return (
    <>
      <div
        aria-label="Module complete"
        style={{
          marginTop: 32,
          padding: 18,
          background: 'var(--cream-2)',
          border: '1px solid var(--ink-a10)',
          borderRadius: 12,
        }}
      >
        <p
          style={{
            fontFamily: fontStack,
            fontSize: 14,
            color: 'var(--slate-600)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {message}
        </p>
      </div>
      <TimeSavingsCard moduleNumber={moduleNumber} />
    </>
  );
}
