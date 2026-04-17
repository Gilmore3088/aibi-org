// /courses/aibi-s/resources — Exclusive Advanced Frameworks library
// Server Component: enrollment gate + content listing
// Access: AiBI-S enrolled learners only
// Cobalt accent color throughout (AiBI-S color discipline)
//
// AiBI-P completers can see this page exists via the certifications page
// but the layout's enrollment gate redirects non-enrolled visitors to /courses/aibi-s/purchase.

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getEnrollment } from '@/app/courses/aibi-s/_lib/getEnrollment';
import { ADVANCED_FRAMEWORKS } from '@content/courses/aibi-s/advanced-frameworks';
import type { AdvancedFramework } from '@content/courses/aibi-s/advanced-frameworks';

export const metadata: Metadata = {
  title: 'Advanced Resources | AiBI-S',
  description:
    'Exclusive advanced frameworks for AiBI-S enrolled learners: multi-step skill architecture, workflow orchestration, vendor evaluation, team adoption, and advanced prompt engineering.',
};

// ---- Static metadata for each framework resource ----

interface ResourceMeta {
  readonly frameworkId: string;
  readonly prerequisiteLabel: string;
  readonly sectionCount: number;
  readonly hasTemplates: boolean;
  readonly accentLabel: string;   // Short descriptor for the badge
}

const RESOURCE_META: Record<string, ResourceMeta> = {
  'multi-step-skill-architecture': {
    frameworkId: 'multi-step-skill-architecture',
    prerequisiteLabel: 'Week 3+',
    sectionCount: 5,
    hasTemplates: true,
    accentLabel: 'Architecture',
  },
  'departmental-workflow-orchestration': {
    frameworkId: 'departmental-workflow-orchestration',
    prerequisiteLabel: 'Week 3+',
    sectionCount: 7,
    hasTemplates: false,
    accentLabel: 'Playbook',
  },
  'vendor-ai-evaluation-toolkit': {
    frameworkId: 'vendor-ai-evaluation-toolkit',
    prerequisiteLabel: 'Week 4+',
    sectionCount: 4,
    hasTemplates: true,
    accentLabel: 'Toolkit',
  },
  'team-adoption-playbook': {
    frameworkId: 'team-adoption-playbook',
    prerequisiteLabel: 'Week 5+',
    sectionCount: 5,
    hasTemplates: false,
    accentLabel: 'Playbook',
  },
  'advanced-prompt-engineering-banking': {
    frameworkId: 'advanced-prompt-engineering-banking',
    prerequisiteLabel: 'Week 3+',
    sectionCount: 5,
    hasTemplates: true,
    accentLabel: 'Engineering',
  },
} as const;

// ---- Resource card component ----

interface ResourceCardProps {
  readonly framework: AdvancedFramework;
  readonly meta: ResourceMeta;
  readonly index: number;
}

function ResourceCard({ framework, meta, index }: ResourceCardProps) {
  const ordinal = String(index + 1).padStart(2, '0');

  return (
    <article
      className="bg-[color:var(--color-parch)] border border-[color:var(--color-cobalt)]/15 rounded-sm p-8 flex flex-col gap-6"
      aria-labelledby={`resource-${framework.id}-heading`}
    >
      {/* Header row */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em] tabular-nums"
            style={{ color: 'var(--color-cobalt)' }}
            aria-hidden="true"
          >
            {ordinal}
          </span>
          <div
            className="h-px w-6 bg-[color:var(--color-cobalt)]/20"
            aria-hidden="true"
          />
          <span
            className="font-mono text-[9px] uppercase tracking-[0.25em] px-2 py-0.5 rounded-sm"
            style={{
              color: 'var(--color-cobalt)',
              border: '1px solid color-mix(in srgb, var(--color-cobalt) 25%, transparent)',
            }}
          >
            {meta.accentLabel}
          </span>
        </div>
        <span
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-slate)] whitespace-nowrap"
          aria-label={`Available from ${meta.prerequisiteLabel}`}
        >
          {meta.prerequisiteLabel}
        </span>
      </header>

      {/* Title and subtitle */}
      <div>
        <h2
          id={`resource-${framework.id}-heading`}
          className="font-serif text-xl font-bold leading-snug text-[color:var(--color-ink)] mb-2"
        >
          {framework.title}
        </h2>
        <p className="font-serif italic text-sm text-[color:var(--color-slate)] leading-relaxed">
          {framework.subtitle}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {[
          { label: 'Sections', value: String(meta.sectionCount) },
          { label: 'Read time', value: `${framework.estimatedMinutes} min` },
          { label: 'Templates', value: meta.hasTemplates ? 'Included' : 'None' },
          { label: 'Key output', value: framework.keyOutput.length > 60
            ? `${framework.keyOutput.slice(0, 57)}...`
            : framework.keyOutput
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-baseline gap-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-slate)]">
              {label}
            </span>
            <span className="font-mono text-[10px] text-[color:var(--color-cobalt)] tabular-nums">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Section list */}
      <ol
        className="space-y-1.5"
        aria-label={`Sections in ${framework.title}`}
      >
        {framework.sections.map((section, sIdx) => (
          <li
            key={section.id}
            className="flex items-baseline gap-2.5"
          >
            <span
              className="font-mono text-[9px] tabular-nums text-[color:var(--color-slate)] w-4 shrink-0"
              aria-hidden="true"
            >
              {sIdx + 1}.
            </span>
            <span className="font-sans text-xs text-[color:var(--color-slate)] leading-snug">
              {section.title}
            </span>
          </li>
        ))}
      </ol>

      {/* Read link */}
      <footer className="pt-2 border-t border-[color:var(--color-cobalt)]/10">
        <Link
          href={`/courses/aibi-s/resources/${framework.id}`}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[color:var(--color-cobalt)] hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2 rounded-sm"
          aria-label={`Read ${framework.title}`}
        >
          Read framework
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </footer>
    </article>
  );
}

// ---- Page ----

export default async function AiBISResourcesPage() {
  const enrollment = await getEnrollment();

  // Enrollment gate — non-enrolled users are already redirected by the layout,
  // but we also guard here so a direct server render cannot bypass the layout gate.
  if (!enrollment) {
    redirect('/courses/aibi-s/purchase');
  }

  const currentWeek = enrollment.current_module ?? 1;
  const completedWeeks = enrollment.completed_modules ?? [];
  const totalCompleted = completedWeeks.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16">

      {/* Page header */}
      <section className="mb-16" aria-labelledby="resources-heading">
        <div className="flex items-center gap-3 mb-6">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: 'var(--color-cobalt)' }}
          >
            AiBI-S
          </span>
          <div
            className="h-px w-8 bg-[color:var(--color-cobalt)]/30"
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-slate)]">
            Advanced Resources
          </span>
        </div>

        <h1
          id="resources-heading"
          className="font-serif text-4xl lg:text-5xl font-bold leading-[1.05] mb-6 text-[color:var(--color-ink)]"
        >
          Advanced<br />
          <span
            className="italic"
            style={{ color: 'var(--color-cobalt)' }}
          >
            Frameworks
          </span>
        </h1>

        <p className="font-serif italic text-base text-[color:var(--color-slate)] max-w-2xl leading-relaxed mb-6">
          Five standalone reference frameworks exclusive to AiBI-S. These are the materials that
          close the gap between personal productivity and institutional capability — the practical
          architecture behind what you are building in the course.
        </p>

        {/* Progress context */}
        <div
          className="inline-flex items-center gap-3 px-4 py-2.5 rounded-sm"
          style={{ border: '1px solid color-mix(in srgb, var(--color-cobalt) 20%, transparent)' }}
        >
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-cobalt)' }}
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] text-[color:var(--color-cobalt)]">
            {totalCompleted === 6
              ? 'Course complete'
              : `Week ${currentWeek} of 6`}
          </span>
          <div
            className="h-3 w-px bg-[color:var(--color-cobalt)]/20"
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] text-[color:var(--color-slate)]">
            All 5 frameworks unlocked
          </span>
        </div>
      </section>

      {/* Exclusivity notice */}
      <aside
        className="mb-12 p-5 rounded-sm"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-cobalt) 5%, transparent)',
          border: '1px solid color-mix(in srgb, var(--color-cobalt) 15%, transparent)',
        }}
        aria-label="Access notice"
      >
        <div className="flex items-start gap-3">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            style={{ color: 'var(--color-cobalt)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10.5c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.531-.27-3.004-.76-4.365a11.958 11.958 0 01-2.674-.634L12 2.714z"
            />
          </svg>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-cobalt)] mb-1">
              AiBI-S Exclusive Content
            </p>
            <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
              These frameworks are available only to enrolled AiBI-S learners. AiBI-P holders can
              see that this library exists but cannot access the content — it is part of what
              the $1,495 Specialist enrollment provides. Each framework is a complete, standalone
              reference designed to be used alongside your weekly assignments, not as a replacement for them.
            </p>
          </div>
        </div>
      </aside>

      {/* Framework grid */}
      <section aria-labelledby="frameworks-heading">
        <h2 id="frameworks-heading" className="sr-only">
          Advanced framework resources
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ADVANCED_FRAMEWORKS.map((framework, index) => {
            const meta = RESOURCE_META[framework.id];
            if (!meta) return null;
            return (
              <ResourceCard
                key={framework.id}
                framework={framework}
                meta={meta}
                index={index}
              />
            );
          })}
        </div>
      </section>

      {/* Usage guidance */}
      <section className="mt-16 pt-12 border-t border-[color:var(--color-cobalt)]/10" aria-labelledby="guidance-heading">
        <h2
          id="guidance-heading"
          className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-6"
        >
          How to use these frameworks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              label: 'Read alongside the weekly assignment',
              description:
                'Each framework is referenced in its prerequisite week. Read it before the assignment, not after. The framework provides the architecture; the assignment provides the practice.',
            },
            {
              label: 'Use the templates directly',
              description:
                'The templates in each framework are production-ready. Copy them into your skill library, adapt the institution-specific fields, and submit them as part of your weekly work product.',
            },
            {
              label: 'Return after the course',
              description:
                'Your AiBI-S access continues for 12 months after course completion. These frameworks are designed to be referenced repeatedly as your department\'s skill library grows.',
            },
            {
              label: 'Cite the source in your capstone',
              description:
                'When your capstone references the vendor evaluation framework, A/B testing methodology, or adoption playbook, cite "AiBI-S Advanced Frameworks, The AI Banking Institute, 2026" in your documentation.',
            },
          ].map(({ label, description }) => (
            <div
              key={label}
              className="flex gap-3"
            >
              <div
                className="h-1 w-1 rounded-full mt-2 shrink-0"
                style={{ backgroundColor: 'var(--color-cobalt)' }}
                aria-hidden="true"
              />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-cobalt)] mb-1.5">
                  {label}
                </p>
                <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation footer */}
      <nav
        className="mt-16 pt-8 border-t border-[color:var(--color-cobalt)]/10 flex items-center justify-between"
        aria-label="Course navigation"
      >
        <Link
          href="/courses/aibi-s"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[color:var(--color-slate)] hover:text-[color:var(--color-cobalt)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2 rounded-sm"
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Course overview
        </Link>
        <Link
          href={`/courses/aibi-s/${currentWeek}`}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[color:var(--color-cobalt)] hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2 rounded-sm"
          aria-label={`Continue Week ${currentWeek}`}
        >
          Continue Week {currentWeek}
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </nav>
    </div>
  );
}
