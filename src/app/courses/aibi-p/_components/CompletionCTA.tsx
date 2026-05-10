'use client';

// CompletionCTA — shown after a learner marks a module complete.
// M1-4: brief encouragement message only.
// M5: prominent Executive Briefing CTA via Calendly (Understanding pillar complete).
// M6-8: brief encouragement for Creation/Application pillar progress.
// M9 / isLastModule: work product submission CTA (Application pillar complete).
// FUNL-01/02: funnel touchpoint for learners who have completed the Understanding pillar.
// A11Y-01: keyboard accessible links with visible focus rings.
// TimeSavingsCard is appended after each contextual message.

import { TimeSavingsCard } from './TimeSavingsCard';
import { JourneyBanner } from '@/components/JourneyBanner';

interface CompletionCTAProps {
  readonly moduleNumber: number;
  readonly isLastModule: boolean;
}

function ArrowIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CompletionCTA({ moduleNumber, isLastModule }: CompletionCTAProps) {
  const calendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL ??
    'https://calendly.com/aibankinginstitute/executive-briefing';

  // M9 or final module — Application pillar complete, work product submission CTA
  // and post-course assessment CTA (measure transformation).
  if (moduleNumber === 9 || isLastModule) {
    return (
      <>
        <div
          className="mt-8 p-6 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm"
          style={{ borderLeftColor: 'var(--color-terra)' }}
          aria-label="Course complete — next steps"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-2">
            All modules complete
          </p>
          <p className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-3">
            Ready for your assessed work product.
          </p>
          <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed mb-5">
            You have completed all 12 modules of the AiBI Foundations course. Your final step is to
            submit a four-item work product package demonstrating your professional AI capability.
            This is not a test — it is a demonstration of the skills you have built throughout
            this course.
          </p>
          <a
            href="/courses/aibi-p/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
          >
            Begin Work Product Submission
            <ArrowIcon />
          </a>
          <p className="mt-3 font-mono text-[10px] text-[color:var(--color-slate)]">
            Four items required. Reviewed against a five-dimension rubric.
          </p>
        </div>

        {/* Post-course assessment CTA — measure transformation */}
        <div
          className="mt-4 p-5 bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/10 rounded-sm"
          aria-label="Measure your growth"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-2">
            Optional — Measure Your Growth
          </p>
          <p className="font-sans text-sm text-[color:var(--color-ink)] mb-1">
            See how far you&rsquo;ve come.
          </p>
          <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed mb-4">
            Take the same readiness assessment you completed before the course. The side-by-side
            comparison shows your AI readiness improvement — dimension by dimension.
          </p>
          <a
            href="/courses/aibi-p/post-assessment"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[color:var(--color-terra)]/30 hover:border-[color:var(--color-terra)] text-[color:var(--color-ink)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
          >
            Measure Your Growth
            <ArrowIcon />
          </a>
        </div>

        <TimeSavingsCard moduleNumber={moduleNumber} />

        {/* Cross-course journey banner — continue to AiBI-S */}
        <div className="mt-6">
          <JourneyBanner from="aibi-p" />
        </div>
      </>
    );
  }

  // M5 — Understanding pillar complete, Executive Briefing CTA
  if (moduleNumber === 5) {
    return (
      <>
        <div
          className="mt-8 p-6 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] border-l-4 rounded-sm"
          style={{ borderLeftColor: 'var(--color-terra)' }}
          aria-label="Module complete — next steps"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] mb-2">
            Understanding pillar complete
          </p>
          <p className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-3">
            You have the foundation. Now see the full picture.
          </p>
          <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed mb-5">
            You now know how to classify data, recognise hallucination patterns, and build
            your own Acceptable Use Card. An Executive Briefing maps that knowledge to your
            institution&rsquo;s specific workflows, vendors, and risk profile.
          </p>
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[color:var(--color-terra)] hover:bg-[color:var(--color-terra-light)] text-[color:var(--color-linen)] text-[11px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-2"
          >
            Book an Executive Briefing
            <ArrowIcon />
          </a>
          <p className="mt-3 font-mono text-[10px] text-[color:var(--color-slate)]">
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
        className="mt-8 p-4 bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm"
        aria-label="Module complete"
      >
        <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">{message}</p>
      </div>
      <TimeSavingsCard moduleNumber={moduleNumber} />
    </>
  );
}
