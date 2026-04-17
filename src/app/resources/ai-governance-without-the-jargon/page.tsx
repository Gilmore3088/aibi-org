import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Governance Without the Jargon — A Plain-Language Guide for Community Bankers',
  description:
    'Five regulatory frameworks govern AI use at community banks and credit unions today. Here is what each one actually means for your daily work — no law degree required.',
};

const FRAMEWORKS = [
  {
    code: 'SR 11-7',
    fullName: 'Model Risk Management Guidance',
    body: 'Federal Reserve / OCC',
    level: 'Critical',
    oneLiner: 'If the AI touches a credit decision, you must be able to explain it.',
  },
  {
    code: 'TPRM',
    fullName: 'Third-Party Risk Management',
    body: 'Interagency',
    level: 'High',
    oneLiner: 'Every AI vendor requires a risk review before deployment — including tools already running.',
  },
  {
    code: 'ECOA / Reg B',
    fullName: 'Equal Credit Opportunity Act',
    body: 'CFPB',
    level: 'Critical',
    oneLiner: '"Score too low" from a black-box model is not a legal adverse action reason.',
  },
  {
    code: 'BSA / AML',
    fullName: 'Bank Secrecy Act / Anti-Money Laundering',
    body: 'FinCEN',
    level: 'Critical',
    oneLiner: 'AI-generated SAR recommendations require human review before filing. The AI is not accountable. You are.',
  },
  {
    code: 'AIEOG Lexicon',
    fullName: 'AI in Financial Services Vocabulary',
    body: 'US Treasury / FBIIC / FSSCC',
    level: 'High',
    oneLiner: 'Regulators will use these definitions in examinations. Align your policy language now.',
  },
] as const;

export default function AIGovernanceWithoutJargonArticle() {
  return (
    <main className="px-6 py-14 md:py-20">
      <article className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            Regulatory Guidance &middot; April 2026
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-[1.05] mb-6">
            AI governance without the jargon.
          </h1>
          <p className="text-xl text-[color:var(--color-ink)]/75 leading-relaxed">
            There is no single AI banking law. What exists is a set of
            extensions: five existing regulatory frameworks that have been
            stretched to cover artificial intelligence. The US Government
            Accountability Office confirmed this in its May 2025 report
            (GAO-25-107197): no comprehensive AI-specific banking regulation
            exists yet. What exists is a patchwork, and that patchwork is
            what governs your institution today. Here is what each piece
            actually means for the people doing the work.
          </p>
        </header>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The five frameworks, in plain language.
          </h2>
          <p>
            Most regulatory guidance is written for lawyers and examiners, not
            for the compliance officer who needs to know whether their
            institution can use Microsoft Copilot to help draft a loan memo,
            or the loan officer who wants to know if running a borrower
            summary through an AI tool creates ECOA exposure. The translations
            below are practical &mdash; they are not legal advice, and they do
            not substitute for your institution&rsquo;s counsel. But they are
            a starting point for having the right conversations.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            SR&nbsp;11-7 &mdash; Model Risk Management.
          </h2>
          <p>
            SR&nbsp;11-7 was published by the Federal Reserve and OCC in 2011
            as guidance on managing the risk of quantitative models used in
            credit underwriting, risk scoring, and investment analysis. The
            guidance requires that models be validated, documented, and
            monitored through their full lifecycle.
          </p>
          <p>
            When AI arrived, regulators applied SR&nbsp;11-7 by extension:
            any AI system that produces outputs used in credit, risk, or
            compliance decisions is a &ldquo;model&rdquo; under this framework.
            The SR&nbsp;11-7 requirements follow.
          </p>
          <p>
            <strong>What this means for your daily work:</strong> If an AI
            tool touches a credit decision &mdash; at any point in the
            process, even just to summarize a loan file &mdash; you must be
            able to explain what the tool does, what its limitations are,
            and how its outputs were validated. &ldquo;We used ChatGPT to
            help review the application&rdquo; is not documentation. A
            record of what was reviewed, what the AI produced, and how
            it was checked before being used in the decision &mdash; that
            is documentation.
          </p>
          <p>
            SR&nbsp;11-7 also requires <em>conceptual soundness</em> and
            <em>transparency</em>. Black-box AI outputs that cannot be traced
            to specific input factors fail this test for credit use cases.
            The model must be explainable &mdash; a word the AIEOG Lexicon
            defines precisely as &ldquo;the capacity of an AI system to
            provide human-understandable reasons for its outputs.&rdquo;
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            TPRM &mdash; Third-Party Risk Management.
          </h2>
          <p>
            Interagency TPRM guidance requires that institutions assess and
            manage risk from outsourced services and third-party vendors.
            The framework was extended to AI when it became apparent that
            most community banks would deploy AI primarily through vendor
            tools &mdash; core banking AI features, Microsoft Copilot,
            document processing platforms, loan origination software with
            AI scoring &mdash; rather than building models in-house.
          </p>
          <p>
            <strong>What this means for your daily work:</strong> Every AI
            tool from a vendor requires a TPRM assessment before deployment.
            This includes AI features that activate automatically in tools
            already licensed by your institution. It includes the
            &ldquo;free tier&rdquo; tools staff are using without IT&rsquo;s
            knowledge. It includes the AI-assisted document feature your
            core banking vendor quietly enabled in last quarter&rsquo;s
            update.
          </p>
          <p>
            The practical test is simple: if an AI tool processes any
            institutional data &mdash; even non-customer operational data
            &mdash; IT and compliance need to have reviewed it before
            widespread staff use begins. The review does not need to take
            months. It needs to happen.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            ECOA / Reg B &mdash; Equal Credit Opportunity.
          </h2>
          <p>
            ECOA and its implementing regulation, Reg B, prohibit
            discrimination in credit decisions and require that applicants
            who are denied credit receive specific, written reasons for
            the denial. This was designed for human underwriters. Applied
            to AI, it creates a strict explainability requirement.
          </p>
          <p>
            <strong>What this means for your daily work:</strong> If an AI
            system influences a credit decision &mdash; whether it scores
            an applicant, flags a risk, or suggests terms &mdash; the
            adverse action notice must provide reasons that trace to
            specific, explainable factors from the application. &ldquo;AI
            score too low&rdquo; is not a legally adequate reason.
            &ldquo;Insufficient collateral relative to loan amount&rdquo;
            or &ldquo;income-to-debt ratio exceeds policy threshold&rdquo;
            &mdash; those are legally adequate reasons, and they must be
            traceable to actual input variables, not just AI outputs.
          </p>
          <p>
            The CFPB has been explicit about this. Algorithmic lending
            decisions are subject to the same adverse action requirements
            as manual ones. The institution, not the AI vendor, is
            responsible for satisfying them.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            BSA / AML &mdash; Bank Secrecy Act.
          </h2>
          <p>
            BSA and its Anti-Money Laundering requirements exist to ensure
            that financial institutions maintain records and file reports
            that support law enforcement in identifying financial crime.
            Suspicious Activity Reports are the primary instrument. AI is
            increasingly used in transaction monitoring to flag potential
            SAR candidates.
          </p>
          <p>
            <strong>What this means for your daily work:</strong>{' '}
            AI-generated SAR recommendations require human review before
            filing. This is not optional. The legal accountability for a
            filed SAR rests with the institution and the staff member who
            approves it &mdash; not with the AI that flagged the
            transaction. An examiner reviewing your SAR files will ask
            how the determination was made. &ldquo;The AI said so&rdquo; is
            not a satisfactory answer.
          </p>
          <p>
            AI transaction monitoring systems must also meet the same
            documentation and auditability standards as manual monitoring
            processes. Model performance must be validated. If your
            institution is using an AI-enabled monitoring system, the
            system itself is a model under SR&nbsp;11-7 and requires
            appropriate documentation.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The AIEOG AI Lexicon &mdash; the new vocabulary.
          </h2>
          <p>
            In February 2026, the US Treasury, FBIIC, and FSSCC published
            the AIEOG AI Lexicon &mdash; the first cross-regulator glossary
            for AI in financial services. It is not a regulation. But it is
            the vocabulary regulators will use in examinations. Institutions
            whose AI policies use different terminology for the same concepts
            create unnecessary examination risk.
          </p>
          <p>
            Six terms from the AIEOG Lexicon are directly relevant to daily
            operations. <strong>Hallucination</strong>: an AI output that is
            factually incorrect, fabricated, or misleading, presented with
            apparent confidence. <strong>AI Governance</strong>: the policies,
            processes, and structures that define how an institution develops,
            deploys, monitors, and retires AI systems.{' '}
            <strong>AI Use Case Inventory</strong>: a structured record of all
            AI systems in active use, treated by the Lexicon as a baseline
            governance requirement. <strong>HITL</strong>: human-in-the-loop,
            required for any AI that influences material decisions.{' '}
            <strong>Third-Party AI Risk</strong>: risks from vendor AI systems,
            assessed under TPRM. <strong>Explainability</strong>: the capacity
            to provide human-understandable reasons for AI outputs.
          </p>
          <p>
            <strong>What this means for your daily work:</strong> When
            reviewing or drafting AI governance documents, use the AIEOG
            Lexicon definitions verbatim. It is not about compliance theater
            &mdash; it is about alignment. Examiners who know the Lexicon
            will look for the Lexicon&rsquo;s terms. Policies that use
            equivalent but different language create avoidable friction.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The five frameworks, in one table.
          </h2>
        </section>

        <dl className="grid sm:grid-cols-2 gap-4 my-10">
          {FRAMEWORKS.map((f) => (
            <div
              key={f.code}
              className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-6"
            >
              <dt className="font-mono text-xl text-[color:var(--color-terra)] leading-none tabular-nums mb-1">
                {f.code}
              </dt>
              <dd className="font-serif text-base text-[color:var(--color-ink)] mb-3 leading-snug">
                {f.fullName}
              </dd>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/50 mb-3">
                {f.body} &middot; {f.level}
              </p>
              <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed italic">
                &ldquo;{f.oneLiner}&rdquo;
              </p>
            </div>
          ))}
        </dl>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The governance gap is not a knowledge gap.
          </h2>
          <p>
            The Gartner Peer Community survey (via Jack Henry &amp; Associates,
            2025) found that 55% of financial institutions have no AI
            governance framework yet. This is not primarily a knowledge
            problem &mdash; the frameworks described above are publicly
            available and free to read. It is a translation problem: the
            distance between a 40-page regulatory guidance document and a
            practical policy a loan officer can follow is not bridged by
            publishing more guidance.
          </p>
          <p>
            The most effective governance frameworks at community banks are
            the ones written for the people who do the work. A three-tier
            data classification that a teller can apply in 20 seconds. An
            adverse action checklist that a loan officer can complete before
            issuing a denial. An AI use case inventory that operations staff
            can maintain without a law degree. That is the translation work.
          </p>
          <p>
            The 55% of institutions without a governance framework are not
            waiting for more regulation. They are waiting for someone to make
            the existing frameworks usable.
          </p>
        </section>

        <aside className="mt-16 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Executive Briefing
          </p>
          <h3 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            Get a governance baseline in 45 minutes.
          </h3>
          <p className="text-[color:var(--color-ink)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            The free Executive Briefing maps your institution against all five
            frameworks, identifies your highest-priority governance gaps, and
            gives you three specific actions you can take before your next
            examiner visit. No obligation. No sales pitch. 45 minutes.
          </p>
          <Link
            href="/services"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            Book an Executive Briefing
          </Link>
        </aside>

        <footer className="mt-16 pt-8 border-t border-[color:var(--color-ink)]/10">
          <p className="font-mono text-xs text-[color:var(--color-ink)]/70 leading-relaxed">
            <strong>Sources:</strong> GAO-25-107197, US Government
            Accountability Office, May 2025 (no comprehensive AI-specific
            banking regulation confirmed). AIEOG AI Lexicon, US Treasury /
            FBIIC / FSSCC, February 2026 (definitions: hallucination, AI
            governance, HITL, third-party AI risk, explainability, AI use
            case inventory). SR 11-7: Guidance on Model Risk Management,
            Federal Reserve / OCC, 2011. Interagency Third-Party Risk
            Management Guidance, 2023. Equal Credit Opportunity Act /
            Regulation B, CFPB. Bank Secrecy Act / Anti-Money Laundering
            requirements, FinCEN. Getting Started in AI, Jack Henry &amp;
            Associates, 2025, citing Gartner Peer Community data. Figures
            verified as of April 2026.
          </p>
        </footer>
      </article>
    </main>
  );
}
