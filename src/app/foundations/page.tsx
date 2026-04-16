import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Foundations — The $97 starter course for banking teams',
  description:
    'AI Foundations is the self-paced starter course for every banker in your institution. Five modules, five universal templates, and the safe-use guidelines every staff member needs before touching AI tools.',
};

interface Module {
  readonly number: string;
  readonly title: string;
  readonly summary: string;
  readonly lessons: readonly string[];
}

const MODULES: readonly Module[] = [
  {
    number: '01',
    title: 'What Gen AI actually is &mdash; and is not.',
    summary:
      'A plain-English explanation of how large language models work, what they are good at, and the failure modes every banker needs to recognize before pasting anything into a tool.',
    lessons: [
      'How LLMs generate text',
      'Why AI hallucinates, in 90 seconds',
      'The three questions every banker should ask before using AI output',
    ],
  },
  {
    number: '02',
    title: 'Prompting for professional banking output.',
    summary:
      'The RTFC framework: Role, Task, Format, Constraints. The single most important skill a banker can learn in an afternoon. Applied to real banking workflows.',
    lessons: [
      'Writing prompts that produce board-ready work',
      'Applying RTFC to loan memos, policy drafts, and member communication',
      'Five universal templates you can use Monday morning',
    ],
  },
  {
    number: '03',
    title: 'Safe use &mdash; what never goes in a public LLM.',
    summary:
      'The non-negotiable list of data types that must never touch a public model. PII, member records, non-public examination data, and the compliance reasoning behind each exclusion.',
    lessons: [
      'The never-paste list, with examples',
      'Private cloud vs. public model: when to use which',
      'What to do if staff have already shared sensitive data',
    ],
  },
  {
    number: '04',
    title: 'Identifying your highest-value use cases.',
    summary:
      'A structured method for spotting the repetitive workflows that are the best candidates for AI assistance. Not every task is worth automating. The course teaches the filter.',
    lessons: [
      'The five-question use case filter',
      'Estimating hours recaptured per workflow',
      'Building your personal automation inventory',
    ],
  },
  {
    number: '05',
    title: 'Measurement and accountability.',
    summary:
      'If you cannot measure it, you cannot justify it. The course closes with the single-page scorecard every staff member can use to quantify the time and dollar impact of their AI assistance.',
    lessons: [
      'The one-page AI scorecard',
      'Reporting outcomes to your supervisor',
      'Earning AiBI-P credential readiness',
    ],
  },
];

export default function FoundationsPage() {
  return (
    <main>
      <section className="px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            AI Foundations &middot; $97
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            The starter course every banker should take first.
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
            Five modules, self-paced, designed to be completed in a single
            afternoon. The minimum AI literacy every staff member in a
            community bank or credit union should have before touching a
            production workflow.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {MODULES.map((mod) => (
            <article
              key={mod.number}
              className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 md:p-10 flex gap-6"
            >
              <div className="flex-shrink-0">
                <span className="font-mono text-2xl text-[color:var(--color-terra)] tabular-nums">
                  {mod.number}
                </span>
              </div>
              <div className="flex-1">
                <h2
                  className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-3"
                  dangerouslySetInnerHTML={{ __html: mod.title }}
                />
                <p className="text-[color:var(--color-ink)]/75 leading-relaxed mb-5">
                  {mod.summary}
                </p>
                <ul className="space-y-2">
                  {mod.lessons.map((lesson) => (
                    <li
                      key={lesson}
                      className="text-sm text-[color:var(--color-ink)]/80 leading-snug pl-4 relative"
                    >
                      <span className="absolute left-0 top-2 w-2 h-[1px] bg-[color:var(--color-terra)]" />
                      {lesson}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto bg-[color:var(--color-ink)] text-[color:var(--color-linen)] p-10 md:p-14">
          <div className="text-center">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra-pale)] mb-3">
              Currently in cohort preparation
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">
              AI Foundations launches with the first cohort.
            </h2>
            <p className="text-[color:var(--color-linen)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
              Checkout opens shortly. In the meantime, request cohort
              information through the certification inquiry form and we will
              reserve a seat when enrollment opens.
            </p>
            <Link
              href="/certifications"
              className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
            >
              Request cohort information
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-3">
            Not ready to enroll?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            Start with the free assessment.
          </h2>
          <p className="text-[color:var(--color-ink)]/70 max-w-xl mx-auto mb-6 leading-relaxed">
            The AI readiness assessment tells you whether AI Foundations is the
            right first move for your institution, or whether a broader
            engagement fits better.
          </p>
          <Link
            href="/assessment"
            className="inline-block px-8 py-4 border border-[color:var(--color-terra)] text-[color:var(--color-terra)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)] transition-colors"
          >
            Take the Free Assessment
          </Link>
        </div>
      </section>
    </main>
  );
}
