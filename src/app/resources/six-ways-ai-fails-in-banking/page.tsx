import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Six Ways AI Fails in Banking — The Hallucination Patterns Every Banker Must Know',
  description:
    'The AIEOG AI Lexicon defines hallucination as an AI output that is factually incorrect, fabricated, or misleading, presented with apparent confidence. Here are the six patterns that surface specifically in banking — and what to do about each one.',
};

const PATTERNS = [
  {
    number: '01',
    name: 'Prompt Blindness',
    danger: 'Silent degradation of oversight over time',
    defense: 'Apply the first-day verification standard to every output, regardless of how long you have used the tool',
  },
  {
    number: '02',
    name: 'Data Exfiltration',
    danger: 'Customer PII flowing to external AI systems without institutional knowledge',
    defense: 'Three-tier data classification before every prompt — free-tier tools are public infrastructure',
  },
  {
    number: '03',
    name: 'Recursive Logic Bias',
    danger: 'Algorithmic amplification of historical discriminatory lending patterns',
    defense: 'Human review by someone trained in disparate impact analysis before any credit AI output is acted upon',
  },
  {
    number: '04',
    name: 'Prompt Injection',
    danger: 'External documents manipulating AI behavior without staff awareness',
    defense: 'Independent verification of key AI findings when analyzing externally-sourced documents',
  },
  {
    number: '05',
    name: 'Hallucination Drift',
    danger: 'Fabricated regulatory citations, wrong thresholds, invented case law',
    defense: 'Verify every specific number, regulation reference, or case name against the primary source',
  },
  {
    number: '06',
    name: 'Over-Reliance on Confidence',
    danger: 'AI generates authoritative-sounding answers to questions it cannot reliably answer',
    defense: 'Prompt explicitly for uncertainty: "If you are not confident about any part of this, tell me"',
  },
] as const;

export default function SixWaysAIFailsArticle() {
  return (
    <main className="px-6 py-14 md:py-20">
      <article className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            Risk &amp; Governance &middot; April 2026
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-[1.05] mb-6">
            Six ways AI fails in banking &mdash; and what to do about each one.
          </h1>
          <p className="text-xl text-[color:var(--color-ink)]/75 leading-relaxed">
            The AIEOG AI Lexicon, published jointly by the US Treasury, FBIIC,
            and FSSCC in February 2026, defines hallucination as &ldquo;an AI
            output that is factually incorrect, fabricated, or misleading,
            presented with apparent confidence.&rdquo; In banking, that definition
            maps onto six specific failure patterns. Practitioners who cannot
            name them are not yet safe to use AI in consequential workflows.
          </p>
        </header>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Why banking is different.
          </h2>
          <p>
            Every industry has AI failure risk. Banking has regulatory
            consequence attached to it. A marketing AI that gets a product
            description wrong wastes time and erodes trust. A compliance AI
            that gets a FinCEN threshold wrong puts the institution at
            examination risk. A lending AI that amplifies historical bias
            creates ECOA exposure. The stakes create a different standard of
            vigilance.
          </p>
          <p>
            The GAO confirmed in its May 2025 report (GAO-25-107197) that
            there is no comprehensive AI-specific banking regulation yet
            &mdash; what exists is a set of extensions: SR&nbsp;11-7 applied to
            AI models, TPRM guidance extended to AI vendors, ECOA enforced
            against algorithmic decisions. Those extensions do not relax
            the requirement for accuracy; they add regulatory accountability
            on top of it.
          </p>
          <p>
            The six patterns below come from the AiBI-P curriculum&rsquo;s
            Safe Use module, which draws on the AIEOG AI Lexicon definitions.
            Each pattern has a name, a real-world example of what it looks
            like in a banking workflow, why it is dangerous, and the practical
            defense.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Pattern 1 &mdash; Prompt Blindness.
          </h2>
          <p>
            As users become more familiar with an AI tool&rsquo;s fluency and
            confidence, they stop scrutinizing outputs. The tool has been
            right many times before. The output sounds authoritative. So the
            output gets used without verification.
          </p>
          <p>
            <strong>What it looks like:</strong> A compliance officer uses an
            AI tool to summarize regulatory updates. After six months of
            accurate summaries, they stop checking the source document. On
            the seventh use, the AI mischaracterizes a key FinCEN reporting
            threshold &mdash; and the mischaracterization gets written into the
            institution&rsquo;s policy memo.
          </p>
          <p>
            <strong>Why it is dangerous:</strong> Prompt blindness is the most
            common failure pattern and the hardest to self-diagnose. The tool
            did not change. The staff member&rsquo;s vigilance eroded. The two
            facts are unrelated &mdash; but the compliance exposure is the
            same either way.
          </p>
          <p>
            <strong>The defense:</strong> Apply the same verification standard
            to every AI output that you would apply to a document from a
            junior staff member on their first day &mdash; regardless of how
            long you have used the tool.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Pattern 2 &mdash; Data Exfiltration.
          </h2>
          <p>
            Inadvertent disclosure of proprietary, non-public, or
            customer-identifying data into AI prompts that flow to a model
            provider&rsquo;s systems. This is not hallucination in the classical
            sense &mdash; the AI does not fabricate anything. But the AIEOG
            Lexicon&rsquo;s category of Third-Party AI Risk applies directly:
            data governance failure that AI makes technically easy.
          </p>
          <p>
            <strong>What it looks like:</strong> A loan officer pastes a
            borrower&rsquo;s full financial statement into a free-tier ChatGPT
            prompt to &ldquo;quickly summarize the key numbers.&rdquo; The data
            flows to OpenAI&rsquo;s systems without enterprise protections.
            Customer PII &mdash; name, income, account balances &mdash; is now
            outside the institution&rsquo;s data governance perimeter.
          </p>
          <p>
            <strong>Why it is dangerous:</strong> Free-tier consumer AI tools
            are public infrastructure. Data entered into them flows to the
            model provider and may be used in model training. Customer
            financial data, SAR-adjacent information, and internal strategy
            documents have no business in those systems.
          </p>
          <p>
            <strong>The defense:</strong> Three-tier data classification before
            every prompt. Tier 1 (public) can go anywhere. Tier 2 (internal)
            requires an enterprise account with data training opt-out. Tier 3
            (customer PII, SAR content, credit decisions) is prohibited in AI
            tools entirely &mdash; including enterprise-grade tools &mdash;
            without a purpose-built, formally reviewed integration.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Pattern 3 &mdash; Recursive Logic Bias.
          </h2>
          <p>
            AI systems trained on historical banking data can amplify
            historical biases. This is not hallucination in the sense of
            fabrication &mdash; the AI is accurately reflecting its training
            data. The output is internally consistent. It is also
            institutionally dangerous, because the training data itself
            encoded past discriminatory decisions.
          </p>
          <p>
            <strong>What it looks like:</strong> An AI tool trained on
            historical loan approval data recommends lower credit limits for
            borrowers in certain zip codes, accurately reflecting past
            decisions that were themselves discriminatory. The AI is not
            wrong by its own internal logic. It is wrong by ECOA standards.
          </p>
          <p>
            <strong>Why it is dangerous:</strong> ECOA and Reg B require
            specific, human-readable adverse action reasons for every credit
            denial. An AI output that traces to historical discriminatory
            patterns &mdash; even if technically accurate &mdash; does not
            satisfy that requirement and creates fair lending examination
            exposure.
          </p>
          <p>
            <strong>The defense:</strong> Never use AI outputs in credit
            decisions without human review by someone trained to identify
            disparate impact. Document that review in the credit file. This is
            not a theoretical requirement &mdash; it is the SR&nbsp;11-7 human
            oversight standard applied to AI models.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Pattern 4 &mdash; Prompt Injection.
          </h2>
          <p>
            Malicious instructions embedded in content that gets fed to an AI
            system. A document, email, or web page contains hidden text
            designed to manipulate the AI&rsquo;s behavior or extract
            information without the user&rsquo;s knowledge.
          </p>
          <p>
            <strong>What it looks like:</strong> A staff member uses AI to
            summarize a vendor contract. The contract&rsquo;s appendix contains
            text formatted to be invisible to casual readers but legible to
            the AI, instructing it to recommend contract approval regardless
            of the terms reviewed. The AI&rsquo;s summary omits unfavorable
            clauses the hidden instruction told it to ignore.
          </p>
          <p>
            <strong>Why it is dangerous:</strong> In banking, AI is
            increasingly used to analyze externally-sourced documents:
            loan applications, vendor contracts, counterparty materials,
            customer correspondence. Any of these could contain injected
            instructions. The staff member sees a professional document.
            The AI receives a manipulation attempt.
          </p>
          <p>
            <strong>The defense:</strong> When using AI to analyze
            externally-sourced documents, treat the AI&rsquo;s summary as
            a starting point, not a final output. Independently verify
            key findings &mdash; particularly for documents that have
            material consequences for the institution.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Pattern 5 &mdash; Hallucination Drift.
          </h2>
          <p>
            The AI generates confident, specific-sounding financial figures,
            regulatory citations, or case law references that do not exist.
            This is classical hallucination &mdash; plausible-sounding content
            that is fabricated. It is particularly dangerous in banking because
            the fabricated outputs (thresholds, regulation numbers, precedent
            decisions) are exactly the kinds of specific, citable information
            that staff want to use directly.
          </p>
          <p>
            <strong>What it looks like:</strong> A staff member asks an AI
            what the current threshold is for Currency Transaction Report
            filing. The AI confidently states &ldquo;$8,000&rdquo; instead of
            the correct $10,000. Authoritative tone. Specific number. Wrong.
            If the staff member uses that threshold in training materials or
            a policy memo, the error propagates.
          </p>
          <p>
            <strong>Why it is dangerous:</strong> Regulatory thresholds,
            examination findings, and compliance precedents are not matters
            of interpretation. They are matters of fact. An AI that
            fabricates a FinCEN threshold does not know it has fabricated
            anything &mdash; it is producing the most statistically plausible
            response given its training data. The examination consequence
            falls on the institution, not the model.
          </p>
          <p>
            <strong>The defense:</strong> Always verify any specific number,
            citation, regulation reference, or case name against the primary
            source. AI can help you find things. It cannot reliably
            guarantee they exist.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Pattern 6 &mdash; Over-Reliance on Confidence.
          </h2>
          <p>
            AI systems express uncertainty poorly. When a model does not know
            something, it often generates a plausible-sounding answer rather
            than a clear admission of uncertainty. The AIEOG Lexicon&rsquo;s
            definition of explainability &mdash; &ldquo;the capacity of an AI
            system to provide human-understandable reasons for its
            outputs&rdquo; &mdash; is precisely what fails in this pattern.
          </p>
          <p>
            <strong>What it looks like:</strong> A staff member asks an AI
            about a specific regulatory examination finding from 2019 at a
            named institution. The AI generates a detailed, confident-sounding
            account &mdash; with specific dates, violation categories, and
            remediation steps &mdash; for an examination that never occurred.
            The staff member has no examination data to cross-reference and
            includes the AI&rsquo;s account in a board briefing.
          </p>
          <p>
            <strong>Why it is dangerous:</strong> Confidence is not accuracy.
            AI models are trained to sound authoritative. They are not trained
            to say &ldquo;I do not know&rdquo; &mdash; that phrasing is
            statistically underrepresented in the training data relative to
            confident answers. The model defaults to generating plausible
            content.
          </p>
          <p>
            <strong>The defense:</strong> Explicitly prompt the AI to express
            uncertainty: &ldquo;If you are not confident about any part of
            this response, tell me which parts and why.&rdquo; Then treat the
            uncertain portions as requiring independent verification. This
            prompt does not eliminate the problem, but it surfaces the
            model&rsquo;s own uncertainty signals more reliably.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The six patterns, in summary.
          </h2>
        </section>

        <dl className="grid sm:grid-cols-2 gap-4 my-10">
          {PATTERNS.map((p) => (
            <div
              key={p.number}
              className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-6"
            >
              <dt className="font-mono text-4xl md:text-5xl text-[color:var(--color-terra)] leading-none tabular-nums">
                {p.number}
              </dt>
              <dd className="font-serif text-lg text-[color:var(--color-ink)] mt-2 mb-3 leading-snug">
                {p.name}
              </dd>
              <p className="text-xs text-[color:var(--color-ink)]/60 leading-relaxed">
                <strong>Risk:</strong> {p.danger}
              </p>
            </div>
          ))}
        </dl>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The institutional implication.
          </h2>
          <p>
            Community banks and credit unions operate in a regulatory
            environment that requires documentation, validation, and
            human-in-the-loop oversight for any AI system that influences
            a material decision. The Gartner Peer Community survey (via
            Jack Henry &amp; Associates, 2025) found that 55% of financial
            institutions have no AI governance framework yet. That means
            more than half of community institutions have staff using AI
            tools without an institutional standard for recognizing and
            responding to these six patterns.
          </p>
          <p>
            The six patterns are not equally likely to appear in every
            workflow. Hallucination Drift and Prompt Blindness are the
            most common in everyday operations. Recursive Logic Bias is
            the most consequential in lending. Data Exfiltration is
            the most operationally simple to prevent &mdash; if staff
            know the three-tier classification framework. Prompt Injection
            is the least understood and the fastest-growing risk as AI
            is applied to document analysis at scale.
          </p>
          <p>
            Knowing the patterns is the first layer of defense. Building
            institutional skills &mdash; reusable, constraint-embedded AI
            configurations that enforce safe use by design &mdash; is the
            second. Both are teachable. Neither requires hiring an AI
            engineer.
          </p>
        </section>

        <aside className="mt-16 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            AiBI-P Certification
          </p>
          <h3 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            Train your team on the six patterns.
          </h3>
          <p className="text-[color:var(--color-ink)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            The AiBI-P Practitioner certification covers all six hallucination
            patterns, the three-tier data classification framework, the five
            regulatory frameworks, and hands-on skill building &mdash; in under
            four hours. Built exclusively for community bank and credit union staff.
          </p>
          <Link
            href="/education"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            View the AiBI-P Certification
          </Link>
        </aside>

        <footer className="mt-16 pt-8 border-t border-[color:var(--color-ink)]/10">
          <p className="font-mono text-xs text-[color:var(--color-ink)]/70 leading-relaxed">
            <strong>Sources:</strong> AIEOG AI Lexicon, US Treasury / FBIIC /
            FSSCC, February 2026 (hallucination, third-party AI risk, HITL,
            explainability definitions). GAO-25-107197, US Government
            Accountability Office, May 2025 (no comprehensive AI-specific
            banking framework confirmed). Getting Started in AI, Jack Henry &amp;
            Associates, 2025, citing Gartner Peer Community data (55% of FIs
            have no AI governance framework). SR 11-7, Federal Reserve / OCC,
            2011 (model risk management requirements). ECOA / Regulation B,
            CFPB (adverse action requirements). Figures verified as of
            April 2026.
          </p>
        </footer>
      </article>
    </main>
  );
}
