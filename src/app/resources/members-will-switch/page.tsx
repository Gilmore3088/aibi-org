import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Members Will Switch. The Question Is To Whom.',
  description:
    '84% of consumers say they would switch financial institutions for AI-driven financial insights. 76% would switch for a better digital experience. The community bank retention story in 2026.',
};

const STAT_CARDS = [
  {
    figure: '84%',
    label: 'would switch FIs for AI-driven financial insights',
    source: 'Personetics 2025 (via Apiture)',
  },
  {
    figure: '62%',
    label: 'open to AI-powered fee and spending alerts',
    source: '2025 consumer survey (via Apiture)',
  },
  {
    figure: '76%',
    label: 'would switch FIs for a better digital experience',
    source: 'Motley Fool (via Apiture)',
  },
  {
    figure: '55%',
    label: 'of millennial small business owners would switch',
    source: 'Apiture, Digital Transformation for Community Banks (2025)',
  },
] as const;

export default function MembersWillSwitchArticle() {
  return (
    <main className="px-6 py-20 md:py-28">
      <article className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            Industry Analysis &middot; April 2026
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-[1.05] mb-6">
            Members will switch. The question is to whom.
          </h1>
          <p className="text-xl text-[color:var(--color-ink)]/75 leading-relaxed">
            If your institution still thinks of AI as an internal efficiency
            project, the 2025 consumer survey data should reframe the
            conversation. For a growing share of your members, AI is not a
            back-office question. It is a retention question.
          </p>
        </header>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The headline: 84%.
          </h2>
          <p>
            Personetics&rsquo; 2025 consumer research, summarized in
            Apiture&rsquo;s Digital Loyalty Dividend report, found that{' '}
            <strong>84% of consumers</strong> would switch financial
            institutions for AI-driven financial insights. Not would consider.{' '}
            <em>Would</em>. Eighty-four percent.
          </p>
          <p>
            The corollary: <strong>76%</strong> would switch for a better
            digital experience overall (Motley Fool, via Apiture), and
            <strong> 62%</strong> are actively open to AI-powered fee and
            spending alerts. The story the data tells is that members do not
            need to be sold on AI. They are already looking for it. The only
            question is whether they find it at your institution or the one
            two blocks over.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Who is most at risk.
          </h2>
          <p>
            The switching propensity is not evenly distributed. Apiture&rsquo;s
            separate community bank research found that <strong>55% of
            millennial small business owners</strong> would switch
            institutions for better digital capabilities, and the
            youngest consumer cohorts are overwhelmingly digital-first in how
            they evaluate banking relationships.
          </p>
          <p>
            Community banks with heavy older-member books have more time. But
            time is not patience. The generational handoff is happening
            whether your technology strategy keeps pace or not.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The four numbers.
          </h2>
        </section>

        <dl className="grid sm:grid-cols-2 gap-4 my-10">
          {STAT_CARDS.map((stat) => (
            <div
              key={stat.label}
              className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-6"
            >
              <dt className="font-mono text-4xl md:text-5xl text-[color:var(--color-terra)] leading-none tabular-nums">
                {stat.figure}
              </dt>
              <dd className="text-sm text-[color:var(--color-ink)]/75 mt-3 leading-relaxed">
                {stat.label}
              </dd>
              <p className="font-mono text-[10px] text-[color:var(--color-ink)]/45 mt-3">
                {stat.source}
              </p>
            </div>
          ))}
        </dl>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            What &ldquo;AI-driven financial insights&rdquo; actually means.
          </h2>
          <p>
            When a consumer says they want AI-driven insights, they are rarely
            picturing a chatbot. They are picturing: a weekly summary of where
            their money actually went. A heads-up before a recurring charge
            they forgot about. A savings suggestion grounded in their cash
            flow reality. A clear explanation of a declined transaction.
          </p>
          <p>
            None of this requires a large language model trained from scratch.
            All of it requires a bank that is willing to take existing member
            data, apply sensible analysis, and surface the output where the
            member will actually see it. Community banks with direct member
            relationships and local context are structurally well-positioned
            for this work &mdash; if their staff know how to build it.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The community bank advantage.
          </h2>
          <p>
            The top-50 global banks win on scale and talent density. They do
            not win on member relationships. A member who calls their
            community bank and gets their loan officer on the second ring is
            not going to switch to a megabank for a chatbot. That member
            <em> will</em> switch for a community bank that combines the same
            relationship with the AI-driven insights the megabank is advertising.
          </p>
          <p>
            The retention play is not matching the megabank. It is building
            relationship-plus-AI faster than your community-bank peers. The
            bank in the next town over is your real competition for the
            millennial small business owner who moved away for college and
            came back to raise a family.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Three specific moves.
          </h2>
          <p>
            <strong>First</strong>, audit the digital experience a member
            actually sees. Not the marketing screenshots &mdash; the real
            experience on a 2019 iPhone with an intermittent connection.
          </p>
          <p>
            <strong>Second</strong>, identify the single highest-friction
            member interaction your staff handles every day. A fee dispute, a
            balance question, an account transfer. The one your tellers
            complain about. That is your first automation candidate, and the
            one most likely to become a member-facing feature later.
          </p>
          <p>
            <strong>Third</strong>, measure retention by cohort. The members
            you can see leaving are the ones who tell you. The dangerous
            members are the ones who stay dormant for six months before
            quietly moving their checking account. Your core processor can
            tell you which ones are drifting. Start there.
          </p>
        </section>

        <aside className="mt-16 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 md:p-10 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Start here
          </p>
          <h3 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            See where your institution stands in under three minutes.
          </h3>
          <p className="text-[color:var(--color-ink)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            Eight questions, one score, four tier placements. Your results
            come with a dimension breakdown and a clear view of what to do
            first.
          </p>
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Take the Free Assessment
          </Link>
        </aside>

        <footer className="mt-16 pt-8 border-t border-[color:var(--color-ink)]/10">
          <p className="font-mono text-xs text-[color:var(--color-ink)]/60 leading-relaxed">
            <strong>Sources:</strong> Apiture, The Digital Loyalty Dividend
            (2025), citing Personetics 2025 consumer research and Motley Fool
            survey data. Apiture, Digital Transformation for Community Banks
            (2025). Figures verified as of April 2026.
          </p>
        </footer>
      </article>
    </main>
  );
}
