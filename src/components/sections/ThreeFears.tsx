interface Fear {
  readonly number: string;
  readonly fear: string;
  readonly answer: string;
  readonly accent: string;
}

const FEARS: readonly Fear[] = [
  {
    number: '01',
    fear: 'My people can\u2019t do this.',
    answer:
      'Start with personal experimentation. Every banker on your team uses AI for their own workflow before we touch anything production. Confidence before capability. Once the teller who saves 90 minutes on Tuesdays tells the teller next to her, adoption stops being a change-management problem.',
    accent: 'var(--color-sage)',
  },
  {
    number: '02',
    fear: 'It is not safe for a regulated institution.',
    answer:
      'Every recommendation maps to a specific framework: SR 11-7 for model risk, Interagency TPRM Guidance for vendors, ECOA/Reg B for fair lending, and the AIEOG AI Lexicon (US Treasury, February 2026) for shared vocabulary. We bring the governance posture to the first meeting, not to the last one.',
    accent: 'var(--color-cobalt)',
  },
  {
    number: '03',
    fear: 'I cannot justify the cost.',
    answer:
      'Every engagement leads with the math. The ROI calculator above is your starting position. A Quick Win Sprint carries a 90-day ROI guarantee — if the three implemented automations do not deliver measured time savings within a quarter, we refund the engagement fee. The cost of not acting is the efficiency ratio gap your competitors are already closing.',
    accent: 'var(--color-terra)',
  },
];

export function ThreeFears() {
  return (
    <section className="px-6 py-14 md:py-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 md:gap-16">
        <div className="md:col-span-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-4">
            The three fears
          </p>
          <h2 className="font-serif italic text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            Every bank CEO has the same three questions.
          </h2>
          <p className="text-lg text-[color:var(--color-ink)]/75 mt-6 leading-relaxed">
            We answer them before you ask.
          </p>
        </div>

        <ol className="md:col-span-3 space-y-10">
          {FEARS.map((fear) => (
            <li key={fear.number} className="flex gap-6">
              <div className="flex-shrink-0 pt-1">
                <span
                  className="font-mono text-xs tracking-[0.2em]"
                  style={{ color: fear.accent }}
                >
                  {fear.number}
                </span>
              </div>
              <div className="flex-1">
                <h3
                  className="font-serif text-2xl md:text-3xl leading-tight mb-3"
                  style={{ color: fear.accent }}
                >
                  &ldquo;{fear.fear}&rdquo;
                </h3>
                <p className="text-[color:var(--color-ink)]/80 leading-relaxed">
                  {fear.answer}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
