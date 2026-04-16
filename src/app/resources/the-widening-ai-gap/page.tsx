import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Widening AI Gap — What the Evident AI Index Means for Community Banks',
  description:
    'The October 2025 Evident AI Index shows the top-10 global banks accelerating AI maturity 2.3× faster than the rest of the industry. Here is what that means for community banks and credit unions.',
};

const STAT_CARDS = [
  { figure: '2.3×', label: 'faster AI maturity growth at top-10 banks vs. wider Index' },
  { figure: '+25%', label: 'YoY AI talent growth across 50 largest global banks' },
  { figure: '+7.0', label: 'point YoY gain for top-10 banks' },
  { figure: '+1.3', label: 'point YoY gain for bottom-10 banks' },
  { figure: '2×', label: 'documented AI use cases at top-10 vs. Index average' },
  { figure: '75%', label: 'of responsible-AI partnerships now producing case studies' },
] as const;

export default function WideningGapArticle() {
  return (
    <main className="px-6 py-14 md:py-20">
      <article className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            Industry Analysis &middot; April 2026
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-[1.05] mb-6">
            The widening AI gap &mdash; and what it means for community banks.
          </h1>
          <p className="text-xl text-[color:var(--color-ink)]/75 leading-relaxed">
            The October 2025 Evident AI Index is the fourth consecutive annual
            benchmark of AI maturity at the 50 largest banks in North America,
            Europe, and APAC. For community banks and credit unions, the
            headline finding is not who placed first. It is how fast the top is
            pulling away.
          </p>
        </header>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The top-10 are accelerating 2.3× faster than the rest.
          </h2>
          <p>
            Year-over-year, the top-10 banks in the Evident Index added an
            average of <strong>+7.0 points</strong> to their overall AI maturity
            score. The bottom-10 added <strong>+1.3 points</strong>. The Index
            average was <strong>+3.7 points</strong>. Said plainly: the
            institutions already leading are extending their lead
            disproportionately.
          </p>
          <p>
            JPMorganChase (79.0) and Capital One (78.1) retain the top two
            positions for the third consecutive year &mdash; and the gap that once
            separated them has effectively halved. Royal Bank of Canada moved
            to #3. Commonwealth Bank, Morgan Stanley, Wells Fargo, UBS, HSBC,
            Goldman Sachs, and Bank of America round out a top-10 that moved
            as a cohort.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Talent is the flywheel.
          </h2>
          <p>
            Across the 50 banks tracked, the AI talent pool grew{' '}
            <strong>+25% year-over-year</strong> &mdash; the largest spike Evident
            has recorded. Without exception, the top-5 banks expanding their AI
            talent were all US players: Capital One (via the Discover
            acquisition), JPMC, Citigroup, Bank of America, and Wells Fargo.
          </p>
          <p>
            Talent volume correlates almost linearly with documented use cases.
            Top-10 banks by talent disclosed roughly <strong>twice</strong> as
            many AI use cases as the wider Index average. This is not
            coincidence. It is the flywheel: talent builds use cases,
            successful use cases justify more talent, more talent produces more
            use cases.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Community banks cannot hire their way to parity.
          </h2>
          <p>
            Here is the uncomfortable arithmetic. A community bank with 50
            full-time employees cannot win a bidding war with Capital One for
            an AI engineer. The top 50 banks are absorbing the AI talent
            pipeline before community institutions get a seat at the table.
          </p>
          <p>
            But parity on headcount was never the right target. Community banks
            do not compete with JPMC on scale. They compete on speed,
            proximity, and accountability to a specific community of members.
            The right question is not &ldquo;how do we match Capital One&apos;s
            AI spend?&rdquo; It is &ldquo;how do we deploy AI in the Tuesday
            morning workflow of our five-person operations team before our
            peer across town does?&rdquo;
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The numbers, in one table.
          </h2>
        </section>

        <dl className="grid sm:grid-cols-2 gap-4 my-10">
          {STAT_CARDS.map((stat) => (
            <div
              key={stat.label}
              className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-6"
            >
              <dt className="font-mono text-4xl md:text-5xl text-[color:var(--color-terra)] leading-none">
                {stat.figure}
              </dt>
              <dd className="text-sm text-[color:var(--color-ink)]/75 mt-3 leading-relaxed">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            What community banks should do about it.
          </h2>
          <p>
            Three moves, in order. <strong>First</strong>, stop benchmarking
            against the top-10. The maturity distance is now so large that the
            comparison only produces paralysis. Benchmark against your
            community-bank peer group, which the FDIC Quarterly Banking Profile
            publishes every quarter, free.
          </p>
          <p>
            <strong>Second</strong>, invest in your existing people first. The
            bank that teaches its tellers, its loan officers, and its
            compliance team to use AI for their own workflows will see more
            operational lift than the bank that hires one expensive AI
            director. The Evident data confirms it: talent volume drives use
            cases, and talent does not have to mean new hires.
          </p>
          <p>
            <strong>Third</strong>, pick one workflow and measure it. The
            Evident Index reports that only three banks in the top 50 &mdash; BNP
            Paribas, DBS, and JPMC &mdash; can currently report both present and
            projected ROI across their full AI use case portfolio. The gap
            between &ldquo;we are doing AI&rdquo; and &ldquo;we can prove AI is
            working&rdquo; is enormous even at the top. Community banks that
            measure will outperform community banks that do not.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Where The AI Banking Institute fits.
          </h2>
          <p>
            The Institute&rsquo;s approach is community-bank-scaled from the
            first conversation. The Operational Quick Win Sprint implements
            three measurable automations in four to six weeks, with a 90-day
            ROI guarantee, priced between $5,000 and $15,000. The Efficiency
            and Process Audit gives you the board-ready full-institution
            roadmap. The AiBI fCAIO engagement installs a monthly operating
            system with capability transfer baked in &mdash; so when the
            engagement ends, your team runs AI transformation independently.
          </p>
          <p>
            None of this requires you to hire an AI engineer. It requires a
            free 45-minute Executive Briefing, an honest look at where your
            institution actually sits, and three specific next steps you can
            start on Monday.
          </p>
        </section>

        <aside className="mt-16 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Start here
          </p>
          <h3 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            See where your institution stands in under three minutes.
          </h3>
          <p className="text-[color:var(--color-ink)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            The free AI readiness assessment scores you on eight dimensions,
            places you in one of four tiers, and shows you the highest-leverage
            next move for the next 90 days.
          </p>
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Take the Free Assessment
          </Link>
        </aside>

        <footer className="mt-16 pt-8 border-t border-[color:var(--color-ink)]/10">
          <p className="font-mono text-xs text-[color:var(--color-ink)]/70 leading-relaxed">
            <strong>Sources:</strong> Evident AI Index &mdash; Key Findings Report,
            October 2025 (Evident Insights Ltd, n=50 banks). FDIC Quarterly
            Banking Profile Q4 2024. Bank Director 2024 Technology Survey (via
            Jack Henry). Gartner Peer Community AI skill gap data (via Jack
            Henry). Figures verified as of April 2026.
          </p>
        </footer>
      </article>
    </main>
  );
}
