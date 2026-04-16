import type { Metadata } from 'next';
import { GuideRequestForm } from './_components/GuideRequestForm';

export const metadata: Metadata = {
  title: 'Security — AI governance built for regulated institutions',
  description:
    'Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon. Free Safe AI Use Guide for community banks and credit unions.',
};

const GUIDE_CHAPTERS = [
  {
    title: 'The never-paste list',
    description:
      'The non-negotiable data types that must never touch a public LLM: PII, member records, non-public examination data, and the compliance reasoning behind each exclusion.',
  },
  {
    title: 'Private cloud vs. public model',
    description:
      'When private inference is required, when a public model is acceptable, and the decision tree every staff member should run before pasting anything into a tool.',
  },
  {
    title: 'Mapping to SR 11-7',
    description:
      'How model risk management guidance applies to generative AI, with specific language you can drop into your AI governance framework.',
  },
  {
    title: 'Vendor evaluation scoring',
    description:
      'The five-question framework for evaluating AI vendors against your risk posture, including concentration risk thresholds.',
  },
  {
    title: 'Shadow AI discovery',
    description:
      'A structured method for identifying the AI tools your staff are already using without your knowledge, and bringing them inside a governance perimeter without killing adoption.',
  },
  {
    title: 'Examiner readiness',
    description:
      'What to have on the table when an examiner walks in. Based on the AIEOG AI Lexicon vocabulary (US Treasury, FBIIC, FSSCC, February 2026).',
  },
] as const;

export default function SecurityPage() {
  return (
    <main>
      <section className="px-6 py-14 md:py-20 bg-[color:var(--color-cobalt)] text-[color:var(--color-linen)]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 md:gap-16 items-start">
          <div className="md:col-span-3">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-linen)]/60 mb-4">
              Boundary-Safe
            </p>
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.05]">
              AI governance built for institutions that get examined.
            </h1>
            <p className="text-xl text-[color:var(--color-linen)]/80 mt-6 leading-relaxed">
              Every recommendation from The AI Banking Institute is grounded
              in the shared vocabulary of the AIEOG AI Lexicon, published by
              the US Treasury, FBIIC, and FSSCC in February 2026 &mdash; the
              first official cross-agency vocabulary for financial AI
              governance.
            </p>
            <p className="text-xl text-[color:var(--color-linen)]/80 mt-4 leading-relaxed">
              If your board has been asking whether AI is safe for a regulated
              institution, the answer is not a brochure. It is a framework.
              Specifically, it is SR 11-7 for model risk, Interagency TPRM
              Guidance for vendor oversight, and ECOA with Reg B for fair
              lending &mdash; applied to generative AI through the AIEOG
              vocabulary.
            </p>
          </div>
          <div className="md:col-span-2 border border-[color:var(--color-linen)]/20 bg-[color:var(--color-linen)]/5 p-8">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra-pale)] mb-2">
              Free download
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-[color:var(--color-linen)] leading-tight mb-4">
              The Safe AI Use Guide.
            </h2>
            <p className="text-[color:var(--color-linen)]/80 mb-6 text-sm leading-relaxed">
              Six chapters. Written for community banks and credit unions. One
              page per chapter. Maps directly to SR 11-7 and the AIEOG AI
              Lexicon.
            </p>
            <GuideRequestForm />
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-4">
              What is inside
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] max-w-2xl mx-auto leading-tight">
              Six chapters your compliance officer will actually read.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {GUIDE_CHAPTERS.map((chapter, idx) => (
              <article
                key={chapter.title}
                className="border-t border-[color:var(--color-ink)]/15 pt-6"
              >
                <p className="font-mono text-sm text-[color:var(--color-terra)] tabular-nums mb-3">
                  {String(idx + 1).padStart(2, '0')}
                </p>
                <h3 className="font-serif text-2xl text-[color:var(--color-ink)] leading-tight mb-3">
                  {chapter.title}
                </h3>
                <p className="text-[color:var(--color-ink)]/75 leading-relaxed">
                  {chapter.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-10 md:p-14 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Not just a PDF
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            The guide is the starting point. The engagement is how it gets
            operationalized.
          </h2>
          <p className="text-[color:var(--color-ink)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            A governance guide is not the same as a governance framework. An
            engagement with The AI Banking Institute installs the framework
            inside your institution &mdash; with named owners, a review
            cadence, and documented alignment to every applicable regulatory
            reference.
          </p>
          <a
            href="/services"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            See how we work
          </a>
        </div>
      </section>
    </main>
  );
}
