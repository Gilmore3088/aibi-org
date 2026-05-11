import Link from 'next/link';
import type { Metadata } from 'next';
import { ROICalculatorBody } from '@/components/sections/ROICalculatorBody';

export const metadata: Metadata = {
  title: 'Efficiency Ratio Workbook | For Institutions · The AI Banking Institute',
  description:
    'Model your community bank or credit union’s automation ceiling with your own FTE, cost, and hours estimates. The same labor-reallocation math we walk through in an Executive Briefing — free, no email required.',
};

export default function EfficiencyRatioWorkbookPage() {
  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-14 pb-10 md:pt-20 md:pb-14">
        <div className="max-w-4xl mx-auto">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-4">
            <Link
              href="/for-institutions"
              className="hover:text-[color:var(--color-terra)] transition-colors"
            >
              For institutions
            </Link>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Sample · Free</span>
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight mb-6">
            The efficiency ratio workbook.
          </h1>
          <p className="text-lg text-[color:var(--color-ink)]/75 max-w-2xl leading-relaxed">
            Model your institution’s automation ceiling with your own FTE
            count, loaded cost, and a candid range of how many hours per week
            the average employee spends on work AI can plausibly absorb. Same
            math we walk through in every Executive Briefing. No email
            required.
          </p>
        </div>
      </section>

      {/* The four numbers */}
      <section
        aria-labelledby="four-numbers-heading"
        className="px-6 py-12 md:py-16 border-t border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]"
      >
        <div className="max-w-4xl mx-auto">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            The four inputs
          </p>
          <h2
            id="four-numbers-heading"
            className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-6"
          >
            Four numbers, one defensible estimate.
          </h2>
          <p className="text-base text-[color:var(--color-ink)]/80 leading-relaxed mb-8 max-w-2xl">
            The estimate is only as honest as the inputs. Two minutes with
            your CFO and HR lead is enough to source all four.
          </p>

          <dl className="grid md:grid-cols-2 gap-6">
            <div>
              <dt className="font-serif text-lg text-[color:var(--color-ink)] mb-2">
                Full-time employees
              </dt>
              <dd className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                Total FTE across the institution. Pull from your most recent
                quarterly Call Report, or your HR system. Include branch and
                back-office staff; exclude part-time contractors unless they
                represent a meaningful share of operational hours.
              </dd>
            </div>
            <div>
              <dt className="font-serif text-lg text-[color:var(--color-ink)] mb-2">
                Loaded cost per FTE
              </dt>
              <dd className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                Total compensation including benefits, taxes, and overhead —
                not just base salary. The default of $85,000 is a community-
                bank-typical loaded figure; replace it with your CFO’s number.
                The math divides by 2,080 hours/year to derive an hourly
                rate.
              </dd>
            </div>
            <div>
              <dt className="font-serif text-lg text-[color:var(--color-ink)] mb-2">
                Hours automatable per FTE per week — low
              </dt>
              <dd className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                Your conservative estimate of how many hours of repeatable,
                low-discretion work AI could plausibly absorb. For most
                community institutions, 1–3 hours/week is defensible without
                further investigation.
              </dd>
            </div>
            <div>
              <dt className="font-serif text-lg text-[color:var(--color-ink)] mb-2">
                Hours automatable per FTE per week — high
              </dt>
              <dd className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                Your aspirational ceiling. Cornerstone Advisors’ 2025 AI
                Playbook documents 30–50% reduction in alert volumes for
                BSA/AML, 40–60% reduction in loan processing time. 4–6
                hours/week is the upper bound most cohorts converge on.
              </dd>
            </div>
          </dl>

          <p className="font-mono text-[10px] text-[color:var(--color-slate)] mt-8 leading-relaxed">
            Sources: FDIC Quarterly Banking Profile · Cornerstone Advisors,
            <em> AI Playbook for Banks and Credit Unions</em> (2025).
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section
        aria-labelledby="calculator-heading"
        className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10"
      >
        <div className="max-w-4xl mx-auto">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Calculator
          </p>
          <h2
            id="calculator-heading"
            className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-8"
          >
            Move the sliders. The number is yours.
          </h2>
          <ROICalculatorBody
            ctaLabel="Discuss your number"
            ctaHref={
              process.env.NEXT_PUBLIC_CALENDLY_URL ??
              'https://calendly.com/aibi/executive-briefing'
            }
          />
        </div>
      </section>

      {/* How to read the result */}
      <section
        aria-labelledby="reading-result-heading"
        className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]"
      >
        <div className="max-w-3xl mx-auto">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            How to read your result
          </p>
          <h2
            id="reading-result-heading"
            className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-6"
          >
            What the number is — and what it isn’t.
          </h2>

          <div className="space-y-5 text-base text-[color:var(--color-ink)]/80 leading-relaxed">
            <p>
              <strong className="text-[color:var(--color-ink)]">It is</strong>{' '}
              the annual dollar value of the staff hours AI could plausibly
              recapture across your full headcount, given your inputs.
              Multiply your low and high hour estimates by total FTE, your
              hourly rate, and 50 working weeks; that is the math.
            </p>
            <p>
              <strong className="text-[color:var(--color-ink)]">It isn’t</strong>{' '}
              a projected change in your efficiency ratio. The efficiency
              ratio moves only when those recaptured hours are reinvested or
              eliminated — not when they are recaptured. The ratio improvement
              follows from <em>what your team does next</em>, not from the
              automation itself.
            </p>
            <p>
              <strong className="text-[color:var(--color-ink)]">It isn’t</strong>{' '}
              guaranteed. The estimate assumes your institution can identify,
              build, and adopt the automations within a year. That is what a
              Foundations cohort and (optionally) a Pilot Advisory engagement
              are designed to deliver.
            </p>
            <p>
              <strong className="text-[color:var(--color-ink)]">It is</strong>{' '}
              defensible. Every input is yours. Every assumption is documented.
              The math is the same simple labor-rate calculation a CFO would
              run on the back of a napkin — which is exactly why it works in a
              board meeting.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-14 md:py-20 border-t border-[color:var(--color-ink)]/10">
        <div className="max-w-3xl mx-auto bg-[color:var(--color-ink)] text-[color:var(--color-linen)] p-10 md:p-14 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra-pale)] mb-3">
            Next step
          </p>
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Bring your number to an Executive Briefing.
          </h2>
          <p className="text-[color:var(--color-linen)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            Thirty minutes. We’ll pressure-test your inputs, identify the
            three departments most likely to deliver the recaptured hours,
            and recommend whether a Foundations cohort, a Specialist cohort,
            or an institution-wide capability program is the right starting
            point. No pitch.
          </p>
          <a
            href={
              process.env.NEXT_PUBLIC_CALENDLY_URL ??
              'https://calendly.com/aibi/executive-briefing'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Book an Executive Briefing
          </a>
        </div>
      </section>
    </main>
  );
}
