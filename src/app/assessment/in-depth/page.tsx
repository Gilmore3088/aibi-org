// /assessment/in-depth — landing page for the paid 48-question In-Depth
// AI Readiness Assessment.
//
// Pricing per CLAUDE.md 2026-05-05:
//   Individual: $99
//   Team (10+): $79/seat
//
// Until the Stripe Checkout route for this product is wired, the primary
// CTA is "Notify me when it ships" (routes through /api/waitlist with
// interest=assessment, which sends the assessment-options email).

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'In-Depth AI Readiness Assessment | The AI Banking Institute',
  description:
    'Forty-eight questions across the four dimensions, a 20-page benchmarked report, and a 30-day action plan tailored to your lowest-scoring areas.',
};

const HIGHLIGHTS = [
  '48 questions across the four readiness dimensions',
  '20-page personalized report with peer-band comparison',
  'Recommended starting playbook keyed to your gaps',
  '30-day action plan with concrete next steps',
  'One free retake within 12 months',
] as const;

export default function InDepthAssessmentPage() {
  return (
    <main className="px-6 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/education"
            className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-terra)]"
          >
            Education
          </Link>
          <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
          <Link
            href="/assessment"
            className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-terra)]"
          >
            Assessments
          </Link>
          <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
          <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)]">
            In-Depth
          </span>
        </nav>

        <p className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-3">
          In-Depth Assessment
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-[color:var(--color-ink)] mb-5">
          A consulting-grade diagnostic for your institution.
        </h1>
        <p className="text-base md:text-lg text-[color:var(--color-ink)]/75 leading-relaxed mb-8 max-w-2xl">
          The free 12-question assessment gives you a tier and a starter
          artifact in three minutes. The In-Depth version takes 20 minutes,
          covers all 48 calibration questions, and returns a 20-page
          personalized report you can take to your board.
        </p>

        <section className="border border-[color:var(--color-terra)]/20 bg-[color:var(--color-parch)] rounded-[3px] p-6 md:p-8 mb-8">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Pricing
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="font-mono text-2xl text-[color:var(--color-ink)] tabular-nums">$99</p>
              <p className="text-sm text-[color:var(--color-ink)]/70 mt-1">per individual</p>
            </div>
            <div>
              <p className="font-mono text-2xl text-[color:var(--color-ink)] tabular-nums">$79</p>
              <p className="text-sm text-[color:var(--color-ink)]/70 mt-1">per learner, 10+ seats</p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-4">
            What you get
          </p>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((line) => (
              <li
                key={line}
                className="flex gap-3 text-sm md:text-base text-[color:var(--color-ink)]/85"
              >
                <span className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="border-t border-[color:var(--color-ink)]/10 pt-8">
          <p className="text-sm text-[color:var(--color-ink)]/75 mb-5">
            The In-Depth Assessment launches shortly. Save your spot and
            we&rsquo;ll email you the moment it opens.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/coming-soon?interest=assessment"
              className="inline-block bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-8 py-3 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-terra-light)] transition-colors"
            >
              Notify me when it opens
            </Link>
            <Link
              href="/assessment"
              className="inline-block border border-[color:var(--color-ink)]/20 text-[color:var(--color-ink)] px-8 py-3 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-parch)] transition-colors"
            >
              Take the free assessment now
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
