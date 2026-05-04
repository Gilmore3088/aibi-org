import type { Metadata } from 'next';
import { AibiSeal } from '@/components/AibiSeal';
import { WaitlistForm, type WaitlistInterest } from './WaitlistForm';

export const metadata: Metadata = {
  title: { absolute: 'The AI Banking Institute — Coming Soon' },
  description:
    'AI proficiency for community banks and credit unions. The readiness assessment, Practitioner course, and institutional rollout are in active build. Reserve your place.',
  robots: { index: false, follow: false },
};

interface ComingSoonPageProps {
  readonly searchParams?: Promise<{ readonly interest?: string }>;
}

function getInterest(value: string | undefined): WaitlistInterest {
  if (value === 'assessment' || value === 'course' || value === 'newsletter' || value === 'institutional') {
    return value;
  }
  return 'assessment';
}

const ENTRIES: ReadonlyArray<{
  readonly numeral: string;
  readonly title: string;
  readonly body: string;
  readonly meta: string;
}> = [
  {
    numeral: 'I',
    title: 'Readiness Assessment',
    body:
      'Three-minute diagnostic for community-bank executives. Score your institution across eight dimensions, leave with a tailored starter artifact you can take to the team this week.',
    meta: 'Free · 8 questions · ~3 min',
  },
  {
    numeral: 'II',
    title: 'Practitioner Education',
    body:
      'Twelve self-paced modules on practical AI use for daily banking work. Hands-on practice, role-applied artifacts, regulatory boundaries built in. The AiBI-P credential sits on top.',
    meta: 'Twelve modules · self-paced',
  },
  {
    numeral: 'III',
    title: 'Institutional Counsel',
    body:
      'For executives building AI capability across a whole branch network or back office. Cohort enrollment, leadership advisory, regulator-ready artifacts, and a measurable readiness program your board can defend.',
    meta: 'Cohort · advisory · measurable',
  },
];

const TRUST_POINTS: ReadonlyArray<string> = [
  'Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon',
  'Built specifically for community banks and credit unions — not retrofitted enterprise content',
  'No PII required · human review required by default · designed for real workflows',
];

export default async function ComingSoonPage({ searchParams }: ComingSoonPageProps) {
  const sp = await searchParams;
  const interest = getInterest(sp?.interest);

  return (
    <main className="relative min-h-screen bg-[color:var(--color-linen)] text-[color:var(--color-ink)] overflow-hidden">
      <svg aria-hidden className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.035] mix-blend-multiply">
        <filter id="cs-paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.118  0 0 0 0 0.102  0 0 0 0 0.078  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cs-paper)" />
      </svg>

      <div className="h-[3px] bg-[color:var(--color-terra)]" />

      <header
        className="cs-rise mx-auto flex max-w-6xl items-center justify-between px-6 md:px-10 py-5 border-b border-[color:var(--color-ink)]/15"
        style={{ animationDelay: '40ms' }}
      >
        <div className="flex items-center gap-3 text-[color:var(--color-ink)]">
          <AibiSeal size={32} />
          <span className="font-serif text-[15px] tracking-tight leading-none mt-0.5">
            The AI Banking Institute
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/65">
          In active build
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 md:px-10 pt-10 md:pt-16 pb-20">
        <div className="grid gap-12 md:gap-10 md:grid-cols-12">
          <div className="md:col-span-7 md:pr-6">
            <p
              className="cs-rise font-serif-sc text-[11px] md:text-xs tracking-[0.28em] uppercase text-[color:var(--color-terra)]"
              style={{ animationDelay: '120ms' }}
            >
              Pre-launch · Reserve your place
            </p>

            <h1
              className="cs-rise font-serif text-[44px] leading-[1.04] tracking-[-0.01em] md:text-[68px] md:leading-[1.02] mt-5"
              style={{ animationDelay: '200ms' }}
            >
              AI proficiency,
              <br />
              <em className="not-italic md:italic font-light">made institutional,</em>
              <br />
              for community banks
              <br />
              <span className="text-[color:var(--color-terra)]">&amp;</span> credit unions.
            </h1>

            <p
              className="cs-rise mt-7 max-w-xl text-[16px] md:text-[17px] leading-[1.6] text-[color:var(--color-ink)]/75"
              style={{ animationDelay: '300ms' }}
            >
              Three things, in active build for community-bank workflows and the
              regulators who supervise them: a free readiness assessment,
              practitioner education, and institutional counsel. Tell us what you
              are looking for and we will write the moment it opens.
            </p>

          </div>

          <div
            className="cs-rise md:col-span-5"
            style={{ animationDelay: '460ms' }}
          >
            <WaitlistForm initialInterest={interest} />
          </div>
        </div>
      </section>

      <section
        className="relative mx-auto max-w-6xl px-6 md:px-10 pb-20"
        aria-labelledby="contents-heading"
      >
        <div className="flex items-baseline justify-between border-b border-[color:var(--color-ink)]/20 pb-3 mb-2">
          <h2
            id="contents-heading"
            className="font-serif-sc text-[11px] md:text-xs tracking-[0.28em] uppercase text-[color:var(--color-terra)]"
          >
            Contents
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
            Three offerings
          </span>
        </div>

        <ol className="divide-y divide-[color:var(--color-ink)]/10">
          {ENTRIES.map((entry) => (
            <li key={entry.numeral} className="grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_220px] gap-x-6 md:gap-x-10 py-7 md:py-8">
              <span
                aria-hidden
                className="font-serif text-3xl md:text-4xl text-[color:var(--color-terra)] leading-none tabular-nums"
              >
                {entry.numeral}
              </span>
              <div>
                <h3 className="font-serif text-[22px] md:text-[26px] leading-tight">
                  {entry.title}
                </h3>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[color:var(--color-ink)]/75">
                  {entry.body}
                </p>
              </div>
              <p className="hidden md:block self-start mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 text-right">
                {entry.meta}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 md:px-10 pb-16">
        <div className="border-t border-[color:var(--color-ink)]/15 pt-6">
          <p className="font-serif-sc text-[11px] tracking-[0.28em] uppercase text-[color:var(--color-terra)] mb-4">
            On the Record
          </p>
          <ul className="grid gap-4 md:grid-cols-3">
            {TRUST_POINTS.map((point, i) => (
              <li key={point} className="flex gap-3 text-[13px] leading-relaxed text-[color:var(--color-ink)]/80">
                <span
                  aria-hidden
                  className="font-mono text-[10px] tracking-[0.22em] text-[color:var(--color-terra)] mt-0.5 shrink-0"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="relative border-t border-[color:var(--color-ink)]/15">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[color:var(--color-ink)]/70">
            <AibiSeal size={22} />
            <span className="font-serif text-sm">The AI Banking Institute</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
            AIBankingInstitute.com
          </div>
        </div>
        <div className="h-[3px] bg-[color:var(--color-terra)]" />
      </footer>
    </main>
  );
}
