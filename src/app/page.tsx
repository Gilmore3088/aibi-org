import Link from 'next/link';
import { ROICalculator } from '@/components/sections/ROICalculator';
import { InteractiveSkillsPreview } from '@/components/sections/InteractiveSkillsPreview';

const HOW_IT_WORKS = [
  {
    label: 'Assess',
    body: 'See your readiness level and top gaps.',
    icon: 'score',
  },
  {
    label: 'Learn',
    body: 'Take short lessons built for banking work.',
    icon: 'book',
  },
  {
    label: 'Practice',
    body: 'Complete short reps that build safe habits.',
    icon: 'practice',
  },
  {
    label: 'Apply',
    body: 'Save prompts and artifacts you can reuse.',
    icon: 'artifact',
  },
] as const;

const PRODUCT_PATHS = [
  {
    label: 'Individual',
    title: 'Practitioner',
    body: 'AiBI-P foundation course.',
    href: '/courses/aibi-p',
    cta: 'Explore Course',
  },
  {
    label: 'Teams',
    title: 'Training',
    body: 'Staff baseline and rollout support.',
    href: '/education',
    cta: 'View Training',
  },
  {
    label: 'Institutions',
    title: 'Consulting',
    body: 'Readiness, governance, and ROI planning.',
    href: '/for-institutions',
    cta: 'For Institutions',
  },
] as const;

const TRUST_POINTS = [
  'No PII required',
  'Human review required',
  'Designed for real workflows, not experiments',
  'Aligned with banking expectations',
] as const;

export const metadata = {
  title: 'Teach Your Team How to Use AI Safely at Work | The AI Banking Institute',
  description:
    'Practical AI training for community banks and credit unions, built around assessment, short lessons, practice reps, and useful artifacts.',
};

export default function HomePage() {
  return (
    <main>
      <section className="px-6 pt-16 pb-14 md:pt-24 md:pb-20 bg-[color:var(--color-linen)] border-b border-[color:var(--color-ink)]/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
            For community banks and credit unions
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.08] text-[color:var(--color-ink)] mt-5">
            Teach your team how to use AI safely at work.
          </h1>
          <p className="font-serif-sc text-base md:text-lg tracking-[0.08em] text-[color:var(--color-terra)] mt-5">
            Turning bankers into builders.
          </p>
          <p className="text-base md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed mt-5">
            Practical AI training for community banks and credit unions.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/assessment/start"
              className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
            >
              Take the Assessment
            </Link>
            <Link
              href="/courses/aibi-p"
              className="inline-block px-8 py-4 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
            >
              Explore Course
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:py-16 border-y border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
        <div className="max-w-6xl mx-auto">
          <SectionIntro
            eyebrow="How it works"
            title="A simple learning loop."
            body="Assess, learn, practice, and apply without losing the thread."
          />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[color:var(--color-ink)]/10 border border-[color:var(--color-ink)]/10">
            {HOW_IT_WORKS.map((step, index) => (
              <article key={step.label} className="bg-[color:var(--color-parch)] p-6">
                <StepIcon name={step.icon} />
                <p className="font-mono text-[11px] uppercase tracking-widest text-[color:var(--color-terra)] mt-5">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="font-serif text-2xl text-[color:var(--color-ink)] mt-2">
                  {step.label}
                </h2>
                <p className="text-sm text-[color:var(--color-slate)] leading-relaxed mt-2">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <InteractiveSkillsPreview />

      <ROICalculator />

      <section className="px-6 py-14 md:py-20 bg-[color:var(--color-linen)] border-b border-[color:var(--color-ink)]/10">
        <div className="max-w-6xl mx-auto">
          <SectionIntro
            eyebrow="Product path"
            title="Start small. Scale when ready."
            body="Choose the path that matches the decision in front of you today."
          />
          <div className="mt-10 grid lg:grid-cols-3 gap-px bg-[color:var(--color-ink)]/10 border border-[color:var(--color-ink)]/10">
            {PRODUCT_PATHS.map((path) => (
              <article key={path.label} className="bg-[color:var(--color-parch)] p-7">
                <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
                  {path.label}
                </p>
                <h2 className="font-serif text-3xl text-[color:var(--color-ink)] mt-4">
                  {path.title}
                </h2>
                <p className="text-sm text-[color:var(--color-slate)] leading-relaxed mt-4">
                  {path.body}
                </p>
                <Link
                  href={path.href}
                  className="inline-block mt-6 font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)]"
                >
                  {path.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:py-16 bg-[color:var(--color-parch)] border-b border-[color:var(--color-ink)]/10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-start">
          <SectionIntro
            eyebrow="Trust"
            title="Built for regulated institutions."
            body="Compliance stays in the product as a guardrail, not as a lecture."
          />
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {TRUST_POINTS.map((point) => (
              <div key={point} className="border-l-2 border-[color:var(--color-terra)] pl-4">
                <p className="font-serif text-xl text-[color:var(--color-ink)]">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-24 bg-[color:var(--color-terra)] text-[color:var(--color-linen)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.22em] text-[color:var(--color-linen)]/80">
            Ready when you are
          </p>
          <h2 className="font-serif text-4xl md:text-6xl text-[color:var(--color-linen)] leading-tight mt-5">
            Start with the assessment.
          </h2>
          <p className="text-base md:text-lg text-[color:var(--color-linen)]/85 leading-relaxed mt-5">
            In a few minutes, you will know your readiness level, your top gaps,
            and the first practical exercise to complete.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/assessment/start"
              className="inline-block px-8 py-4 bg-[color:var(--color-linen)] text-[color:var(--color-terra)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-parch)] active:scale-[0.98] transition-all"
            >
              Take the Assessment
            </Link>
            <Link
              href="/courses/aibi-p"
              className="inline-block px-8 py-4 border border-[color:var(--color-linen)]/60 text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-linen)] hover:text-[color:var(--color-terra)] transition-colors"
            >
              Explore Course
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
}) {
  return (
    <div>
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
        {eyebrow}
      </p>
      <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
        {title}
      </h2>
      <p className="text-base text-[color:var(--color-ink)]/70 leading-relaxed mt-5 max-w-xl">
        {body}
      </p>
    </div>
  );
}

function StepIcon({ name }: { readonly name: string }) {
  const paths: Record<string, string> = {
    score: 'M5 17h14M7 13l3 3 7-8',
    book: 'M5 5h8a4 4 0 0 1 4 4v10H9a4 4 0 0 0-4 4V5z',
    practice: 'M12 5v14M5 12h14M7 7l10 10',
    artifact: 'M7 3h7l5 5v13H7V3zM14 3v6h5',
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-9 w-9 text-[color:var(--color-terra)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name] ?? paths.score} />
    </svg>
  );
}
