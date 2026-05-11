import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Resources — Analysis, guides, and references for community bank leaders',
  description:
    'Curated guides, original analysis, and authoritative publications for community banks and credit unions navigating AI adoption. From The AI Banking Institute.',
};

interface Article {
  readonly slug: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly dek: string;
  readonly readTime: string;
}

interface Guide {
  readonly title: string;
  readonly dek: string;
  readonly href: string;
  readonly cta: string;
}

interface Publication {
  readonly title: string;
  readonly publisher: string;
  readonly year: string;
  readonly usedFor: string;
}

const ARTICLES: readonly Article[] = [
  {
    slug: 'the-widening-ai-gap',
    eyebrow: 'Industry Analysis',
    title: 'The widening AI gap — and what it means for community banks.',
    dek: 'The October 2025 Evident AI Index shows the top-10 global banks accelerating AI maturity 2.3× faster than the rest of the industry. Here is what that means for community banks and credit unions.',
    readTime: '8 min read',
  },
  {
    slug: 'members-will-switch',
    eyebrow: 'Retention',
    title: 'Members will switch. The question is to whom.',
    dek: '84% of consumers would switch financial institutions for AI-driven financial insights. 76% would switch for a better digital experience. The community bank retention story in 2026.',
    readTime: '7 min read',
  },
  {
    slug: 'six-ways-ai-fails-in-banking',
    eyebrow: 'Risk & Governance',
    title: 'Six ways AI fails in banking — and what to do about each one.',
    dek: 'The AIEOG AI Lexicon defines six hallucination patterns that surface specifically in banking workflows. Prompt Blindness, Data Exfiltration, Recursive Logic Bias, Prompt Injection, Hallucination Drift, and Over-Reliance on Confidence. Here is what each looks like and how to defend against it.',
    readTime: '10 min read',
  },
  {
    slug: 'ai-governance-without-the-jargon',
    eyebrow: 'Regulatory Guidance',
    title: 'AI governance without the jargon.',
    dek: 'Five regulatory frameworks govern AI use at community banks today: SR 11-7, TPRM, ECOA/Reg B, BSA/AML, and the AIEOG AI Lexicon. Here is what each one actually means for your daily work — in plain language, without a law degree.',
    readTime: '9 min read',
  },
  {
    slug: 'what-your-efficiency-ratio-is-hiding',
    eyebrow: 'Financial Performance',
    title: 'What your efficiency ratio is hiding.',
    dek: 'Community bank median efficiency ratio: ~65%. Industry-wide: ~55.7% (FDIC Q4 2024). The nine-point gap is not fate — it is a measurement of where the opportunity lives. Here is where AI can move the needle, and how to calculate what it is worth to your institution.',
    readTime: '9 min read',
  },
  {
    slug: 'the-skill-not-the-prompt',
    eyebrow: 'Foundations Guide',
    title: 'The skill, not the prompt.',
    dek: 'Prompting is a one-time act. A skill is a persistent, reusable, institution-grade AI instruction that executes reliably every time you need it. Here is why the distinction matters for community banks — and how to build your first one in 20 minutes.',
    readTime: '8 min read',
  },
];

const GUIDES: readonly Guide[] = [
  {
    title: 'The Safe AI Use Guide',
    dek: 'Six chapters written for community banks and credit unions. The never-paste list, private cloud vs. public model, SR 11-7 mapping, vendor scoring, shadow AI discovery, and examiner readiness. Free.',
    href: '/security',
    cta: 'Request the guide',
  },
];

const PUBLICATIONS: readonly Publication[] = [
  {
    title: 'Evident AI Index — Key Findings Report',
    publisher: 'Evident Insights',
    year: 'October 2025',
    usedFor:
      'Talent, Innovation, Leadership, and Transparency benchmarks across the 50 largest global banks. Source of the 2.3× maturity acceleration figure cited in the Widening AI Gap analysis.',
  },
  {
    title: 'AIEOG AI Lexicon',
    publisher: 'US Treasury, FBIIC, FSSCC',
    year: 'February 2026',
    usedFor:
      'The first official cross-agency vocabulary for financial AI governance. Anchors every AI governance recommendation in this Institute&rsquo;s work.',
  },
  {
    title: 'FDIC Quarterly Banking Profile',
    publisher: 'Federal Deposit Insurance Corporation',
    year: 'Ongoing',
    usedFor:
      'Source of the community bank median efficiency ratio (~65%) and industry-wide Q4 2024 figure (~55.7%) used in the ROI calculator and throughout our analysis.',
  },
  {
    title: 'SR 11-7: Guidance on Model Risk Management',
    publisher: 'Federal Reserve / OCC',
    year: '2011',
    usedFor:
      'The foundational model risk guidance applied to AI and generative AI systems in every governance framework we install.',
  },
  {
    title: 'Getting Started in AI',
    publisher: 'Jack Henry &amp; Associates',
    year: '2025',
    usedFor:
      'Source of the 66% / 57% / 55% / 48% community-bank AI attitude statistics (via Gartner and Bank Director) cited on our homepage proof strip.',
  },
  {
    title: 'The Digital Loyalty Dividend',
    publisher: 'Apiture (now part of CSI)',
    year: '2025',
    usedFor:
      'Source of the 84% / 76% / 62% consumer switching statistics cited in the Members Will Switch analysis.',
  },
  {
    title: 'AI Playbook for Banks and Credit Unions',
    publisher: 'Cornerstone Advisors',
    year: '2025',
    usedFor:
      'Department-level AI use case inventory and tool taxonomy referenced in curriculum design for the Specialist and Leader credentials.',
  },
  {
    title: 'GAO-25-107197',
    publisher: 'US Government Accountability Office',
    year: 'May 2025',
    usedFor:
      'Confirms that no comprehensive AI-specific banking framework exists yet; SR 11-7, TPRM, and ECOA/Reg B apply by analogy. Shapes how we frame regulatory posture.',
  },
];

export default function ResourcesPage() {
  return (
    <main className="px-6 pt-20 pb-16 md:pt-28">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            Resources
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Analysis, guides, and the sources we cite.
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 leading-relaxed max-w-2xl mx-auto mt-6">
            Short, sourced, and specific to community banks and credit unions.
            Every statistic on this site traces to a publication below.
          </p>
        </header>

        {/* Guides */}
        <section className="mb-20">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
            Guides
          </p>
          <div className="space-y-6">
            {GUIDES.map((guide) => (
              <article
                key={guide.title}
                className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10"
              >
                <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-4">
                  {guide.title}
                </h2>
                <p className="text-[color:var(--color-ink)]/75 leading-relaxed mb-6">
                  {guide.dek}
                </p>
                <Link
                  href={guide.href}
                  className="inline-block font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)] pb-1 hover:text-[color:var(--color-terra-light)] hover:border-[color:var(--color-terra-light)] transition-colors"
                >
                  {guide.cta} &rarr;
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* Articles */}
        <section className="mb-20">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
            Articles
          </p>
          <div className="space-y-6">
            {ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/resources/${article.slug}`}
                className="block bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10 hover:border-[color:var(--color-terra)] transition-colors group"
              >
                <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
                  {article.eyebrow} &middot; {article.readTime}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight group-hover:text-[color:var(--color-terra)] transition-colors mb-4">
                  {article.title}
                </h2>
                <p className="text-[color:var(--color-ink)]/75 leading-relaxed">
                  {article.dek}
                </p>
                <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mt-6">
                  Read the analysis &rarr;
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Other publications */}
        <section className="mb-20">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
            Other publications we cite
          </p>
          <p className="text-[color:var(--color-ink)]/70 mb-8 max-w-2xl leading-relaxed">
            These are the authoritative sources behind every statistic, claim,
            and framework in the Institute&rsquo;s work. We do not host these
            documents &mdash; we attribute them so community bank leaders can
            go to the original and verify every number we cite.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {PUBLICATIONS.map((pub) => (
              <article
                key={pub.title}
                className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] p-6"
              >
                <h3
                  className="font-serif text-xl text-[color:var(--color-ink)] leading-tight mb-2"
                  dangerouslySetInnerHTML={{ __html: pub.title }}
                />
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/55 mb-4">
                  {pub.publisher} &middot; {pub.year}
                </p>
                <p
                  className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: pub.usedFor }}
                />
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter teaser */}
        <section className="border-t border-[color:var(--color-ink)]/10 pt-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
              Coming soon
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
              The AI Banking Brief.
            </h2>
            <p className="text-lg text-[color:var(--color-ink)]/75 leading-relaxed mb-8">
              A weekly read for community-bank and credit-union leaders.
              Short, sourced, and free. Here&rsquo;s what each issue carries:
            </p>
          </div>
          <ul className="max-w-xl mx-auto space-y-3 mb-10 text-left">
            {[
              'One regulatory or examiner-relevant signal — what changed, who it affects, what to do this week.',
              'One vendor or tool we have actually tested against community-bank workflows, with the verdict.',
              'One workflow you can run inside your institution before next Friday — built around the never-paste list.',
            ].map((line) => (
              <li
                key={line}
                className="flex gap-3 text-sm md:text-base text-[color:var(--color-ink)]/85 leading-relaxed"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0"
                  aria-hidden="true"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <Link
              href="/coming-soon?interest=newsletter"
              className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
            >
              Get the first issue
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
