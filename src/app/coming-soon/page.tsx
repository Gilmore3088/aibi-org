import type { Metadata } from 'next';
import Link from 'next/link';
import { AibiSeal } from '@/components/AibiSeal';
import { ROICalculatorBody } from '@/components/sections/ROICalculatorBody';
import { WaitlistForm, type WaitlistInterest } from './WaitlistForm';

export const metadata: Metadata = {
  title: { absolute: 'The AI Banking Institute — Pre-launch' },
  description:
    'AI is already in your bank. Your team just isn\'t trained to use it safely. Get your 3-minute AI Readiness Score for free.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'The AI Banking Institute',
    description:
      'Regulator-aligned AI training for community banks and credit unions. Get your 3-minute Readiness Score.',
    type: 'website',
    siteName: 'The AI Banking Institute',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The AI Banking Institute',
    description:
      'Regulator-aligned AI training for community banks and credit unions.',
  },
};

const TENSION_POINTS: ReadonlyArray<{ readonly title: string; readonly body: string }> = [
  {
    title: 'Your staff are already using AI.',
    body:
      'ChatGPT, Copilot, and Gemini are running through staff browsers right now. Every prompt is a data-handling decision your compliance team would want to know about — and most of them happen with no audit trail at all.',
  },
  {
    title: 'Your compliance team is behind.',
    body:
      'A vendor PDF tells you what the model can do. Your team needs to know what they should do — under SR 11-7, the AIEOG Lexicon, and the regulator that examines you. That answer takes more than a policy memo.',
  },
  {
    title: 'Policy lives on paper. Risk lives in workflow.',
    body:
      'A loan officer summarizing a member email on Monday needs steps, examples, and a review process — not a paragraph from the AI policy. The gap between what is written and what is done is where both risk and adoption live.',
  },
];

const DELIVERABLES: ReadonlyArray<{ readonly title: string; readonly body: string }> = [
  {
    title: 'A safe AI workflow for your role',
    body:
      'Concrete examples — rewriting a messy internal email, summarizing a policy without leaking PII, drafting a compliant member response. Useful in your next workday.',
  },
  {
    title: 'A reusable prompt system',
    body:
      'Not one-off prompts. A system you apply across tasks, with structure your team can audit and improve. Built on the SAFE framework.',
  },
  {
    title: 'A documented review process compliance can support',
    body:
      'Every artifact you produce comes with the review log, the human checkpoints, and the regulatory rationale. Hand it to your audit team without translation.',
  },
];

interface ComingSoonPageProps {
  readonly searchParams?: Promise<{ readonly interest?: string }>;
}

function getInterest(value: string | undefined): WaitlistInterest {
  if (
    value === 'assessment' ||
    value === 'course' ||
    value === 'institutional' ||
    value === 'consulting'
  ) {
    return value;
  }
  return 'course';
}

export default async function ComingSoonPage({ searchParams }: ComingSoonPageProps) {
  const sp = await searchParams;
  const interest = getInterest(sp?.interest);

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)] text-[color:var(--color-ink)]">
      <div className="h-[3px] bg-[color:var(--color-terra)]" />

      <header className="mx-auto w-full max-w-5xl flex items-center justify-between px-6 md:px-10 py-5 border-b border-[color:var(--color-ink)]/15">
        <div className="flex items-center gap-3">
          <AibiSeal size={28} />
          <span className="font-serif text-[15px] tracking-tight leading-none mt-0.5">
            The AI Banking Institute
          </span>
        </div>
      </header>

      {/* HERO — tension headline + single primary CTA */}
      <section className="mx-auto w-full max-w-5xl px-6 md:px-10 pt-14 md:pt-20 pb-16 md:pb-24">
        <p className="font-serif-sc text-[11px] tracking-[0.28em] uppercase text-[color:var(--color-terra)]">
          Regulator-aligned AI training · For community banks
        </p>
        <h1 className="mt-5 font-serif text-[40px] leading-[1.05] md:text-[64px] md:leading-[1.02] tracking-[-0.015em] max-w-4xl">
          AI is already in your bank.
          <br />
          <span className="text-[color:var(--color-terra)]">Your team just isn&apos;t trained to use it safely.</span>
        </h1>

        <p className="mt-7 max-w-2xl text-[17px] md:text-[18px] leading-[1.6] text-[color:var(--color-ink)]/80">
          The AI Banking Institute helps community banks and credit unions
          adopt AI with regulator-ready frameworks, practical training, and
          real workflows. Built specifically for the institutions FDIC, NCUA,
          and the Federal Reserve supervise.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:items-center">
          <Link
            href="/assessment"
            className="inline-flex items-center justify-between gap-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-6 py-4 font-sans text-[13px] font-semibold uppercase tracking-[1.4px] hover:bg-[color:var(--color-terra-light)] transition-colors group"
          >
            <span>Get your 3-minute AI Readiness Score</span>
            <span aria-hidden className="font-mono text-[15px] transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>

        </div>
      </section>

      {/* THE SHIFT — three tension panels */}
      <section className="bg-[color:var(--color-parch)] border-y border-[color:var(--color-ink)]/10">
        <div className="mx-auto w-full max-w-5xl px-6 md:px-10 py-16 md:py-20">
          <p className="font-serif-sc text-[11px] tracking-[0.28em] uppercase text-[color:var(--color-terra)]">
            Why now
          </p>
          <h2 className="mt-3 font-serif text-[28px] md:text-[36px] leading-[1.15] tracking-[-0.01em] max-w-3xl">
            AI did not wait for your AI policy. It is already in branch operations, lending, and member service.
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {TENSION_POINTS.map((point, i) => (
              <div key={point.title}>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 font-serif text-[20px] md:text-[22px] leading-[1.2] text-[color:var(--color-ink)]">
                  {point.title}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-[color:var(--color-ink)]/75">
                  {point.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU ACTUALLY GET — outcomes, not features */}
      <section className="mx-auto w-full max-w-5xl px-6 md:px-10 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif-sc text-[11px] tracking-[0.28em] uppercase text-[color:var(--color-terra)]">
              What you leave with
            </p>
            <h2 className="mt-3 font-serif text-[28px] md:text-[40px] leading-[1.1] tracking-[-0.01em]">
              You leave with systems your team uses Monday morning.
            </h2>
            <p className="mt-5 text-[15px] leading-[1.6] text-[color:var(--color-ink)]/75">
              Practitioner training is finished when you have a workflow your compliance team will sign off on and your front-line staff will actually use.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/55">
              12 modules · 5–7 min reps · SAFE framework · regulator-aligned
            </p>
          </div>

          <ul className="md:col-span-7 md:pl-8 space-y-8 md:border-l md:border-[color:var(--color-ink)]/10">
            {DELIVERABLES.map((d, i) => (
              <li key={d.title} className="md:pl-8 relative">
                <span
                  aria-hidden
                  className="md:absolute md:-left-[7px] md:top-1.5 inline-block h-3 w-3 rounded-full bg-[color:var(--color-terra)] mb-3 md:mb-0"
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-2 font-serif text-[22px] md:text-[24px] leading-[1.2]">
                  {d.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-ink)]/75">
                  {d.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PROOF — concrete examples */}
      <section className="bg-[color:var(--color-parch)] border-y border-[color:var(--color-ink)]/10">
        <div className="mx-auto w-full max-w-5xl px-6 md:px-10 py-14 md:py-16">
          <p className="font-serif-sc text-[11px] tracking-[0.28em] uppercase text-[color:var(--color-terra)]">
            Concrete reps from the curriculum
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="border border-[color:var(--color-ink)]/15 bg-[color:var(--color-linen)] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">Module 03 · 6 min</p>
              <p className="mt-3 font-serif text-[18px] leading-[1.25]">Rewrite a messy internal email</p>
              <p className="mt-2 text-[13px] leading-[1.55] text-[color:var(--color-ink)]/70">Without leaking customer PII or violating Reg E disclosures.</p>
            </div>
            <div className="border border-[color:var(--color-ink)]/15 bg-[color:var(--color-linen)] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">Module 06 · 7 min</p>
              <p className="mt-3 font-serif text-[18px] leading-[1.25]">Summarize a policy safely</p>
              <p className="mt-2 text-[13px] leading-[1.55] text-[color:var(--color-ink)]/70">With the human checkpoint and audit log your compliance team needs.</p>
            </div>
            <div className="border border-[color:var(--color-ink)]/15 bg-[color:var(--color-linen)] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">Module 09 · 5 min</p>
              <p className="mt-3 font-serif text-[18px] leading-[1.25]">Draft a compliant member response</p>
              <p className="mt-2 text-[13px] leading-[1.55] text-[color:var(--color-ink)]/70">Aligned with ECOA/Reg B and your institution&apos;s tone of voice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI — quantify the gap with the visitor's own numbers */}
      <section className="mx-auto w-full max-w-5xl px-6 md:px-10 py-16 md:py-24">
        <div className="grid gap-10 md:gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif-sc text-[11px] tracking-[0.28em] uppercase text-[color:var(--color-terra)]">
              Run your own numbers
            </p>
            <h2 className="mt-3 font-serif text-[28px] md:text-[40px] leading-[1.08] tracking-[-0.01em]">
              How many staff hours could AI give your institution back?
            </h2>
            <p className="mt-5 text-[15px] leading-[1.6] text-[color:var(--color-ink)]/75">
              Conservative model: staff count × loaded cost × weekly hours
              recovered. Not a forecast — a way to frame the value of better
              daily workflows before a bigger AI investment.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/55">
              Math matches CLAUDE.md spec · numbers stay on your device
            </p>
          </div>

          <div className="md:col-span-7">
            <ROICalculatorBody
              ctaLabel="Save my analysis"
              ctaHref="#waitlist"
            />
          </div>
        </div>
      </section>

      {/* SECONDARY CTA — generic waitlist for any of the four entry points */}
      <section
        id="waitlist"
        className="bg-[color:var(--color-parch)] border-y border-[color:var(--color-ink)]/15 scroll-mt-8"
      >
        <div className="mx-auto w-full max-w-5xl px-6 md:px-10 py-16 md:py-20">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-6">
              <p className="font-serif-sc text-[11px] tracking-[0.28em] uppercase text-[color:var(--color-terra)]">
                Get notified
              </p>
              <h2 className="mt-3 font-serif text-[28px] md:text-[36px] leading-[1.1] tracking-[-0.01em]">
                We&apos;ll email when your track opens.
              </h2>
              <p className="mt-5 text-[15px] leading-[1.6] text-[color:var(--color-ink)]/75">
                Your ROI numbers stay on your device. We just send the launch note.
              </p>
            </div>

            <div className="md:col-span-6">
              <WaitlistForm initialInterest={interest} />
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-6 md:px-10 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-[color:var(--color-ink)]/15">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
          AIBankingInstitute.com
        </span>
        <a
          href="mailto:hello@aibankinginstitute.com"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 hover:text-[color:var(--color-terra)] transition-colors"
        >
          hello@aibankinginstitute.com
        </a>
      </footer>
    </main>
  );
}
