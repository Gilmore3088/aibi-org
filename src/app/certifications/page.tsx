import { InquiryForm } from './_components/InquiryForm';

interface Certification {
  readonly id: 'aibi-p' | 'aibi-s' | 'aibi-l';
  readonly name: string;
  readonly fullName: string;
  readonly price: string;
  readonly audience: string;
  readonly learn: readonly string[];
  readonly format: string;
  readonly timeCommitment: string;
  readonly accent: string;
}

const CERTS: readonly Certification[] = [
  {
    id: 'aibi-p',
    name: 'AiBI-P',
    fullName: 'Banking AI Practitioner',
    price: '$295',
    audience: 'All staff',
    learn: [
      'What Gen AI is and why it fails in banking contexts',
      'Prompting for professional banking output (RTFC framework)',
      'Safe use — what never goes in a public LLM',
      'Five universal templates for banking roles',
      'Identifying the highest-value AI use cases in your role',
    ],
    format: 'Assessed by a real work output — something they would actually submit to a supervisor.',
    timeCommitment: 'Self-paced online',
    accent: 'var(--color-terra)',
  },
  {
    id: 'aibi-s',
    name: 'AiBI-S',
    fullName: 'Banking AI Specialist',
    price: '$1,495',
    audience: 'Department managers (5 role tracks: Operations, Lending, Compliance, Finance, Retail)',
    learn: [
      'Advanced prompt architecture for professional output',
      'Workflow mapping and automation design',
      'Power Automate and Copilot Studio for non-developers',
      'AI vendor evaluation — 5 questions, scoring framework',
      'Change management and staff adoption',
    ],
    format: 'Assessed by a submitted process improvement with measured time savings — not a test.',
    timeCommitment: 'Live cohort',
    accent: 'var(--color-cobalt)',
  },
  {
    id: 'aibi-l',
    name: 'AiBI-L',
    fullName: 'Banking AI Leader',
    price: '$2,800+ individual · $12,000 team of 8',
    audience: 'C-suite and board',
    learn: [
      'AI through a leadership accountability lens',
      'Efficiency ratio strategy — live modeling with your numbers',
      '3-year AI roadmap development for board presentation',
      'AI governance and examiner readiness',
      'Vendor evaluation and concentration risk',
    ],
    format: '1-day in-person workshop.',
    timeCommitment: '1 day (in-person)',
    accent: 'var(--color-sage)',
  },
];

export default function CertificationsPage() {
  return (
    <main>
      <section className="px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)]">
            AiBI Certifications
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Three credentials. One shared vocabulary.
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
            AiBI credentials give your staff, your managers, and your board
            the same framework for making AI decisions — so your teller,
            your CFO, and your examiner are speaking the same language.
          </p>
          <p className="font-mono text-xs text-[color:var(--color-ink)]/50 pt-2">
            Cohort enrollment is by inquiry only during Phase 1.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {CERTS.map((cert) => (
            <article
              key={cert.id}
              className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 flex flex-col"
            >
              <div className="flex items-baseline justify-between mb-4">
                <h2
                  className="font-serif text-3xl leading-none"
                  style={{ color: cert.accent }}
                >
                  {cert.name}
                </h2>
                <span className="font-mono text-xs text-[color:var(--color-ink)]/60">
                  {cert.price}
                </span>
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/60 mb-4">
                {cert.fullName}
              </p>
              <p className="text-sm text-[color:var(--color-ink)]/80 mb-5 leading-relaxed">
                <span className="font-medium">For:</span> {cert.audience}
              </p>

              <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)]/50 mb-2">
                What you will learn
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {cert.learn.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[color:var(--color-ink)]/80 leading-snug pl-4 relative"
                  >
                    <span
                      className="absolute left-0 top-2 w-2 h-[1px]"
                      style={{ background: cert.accent }}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="border-t border-[color:var(--color-ink)]/10 pt-4 space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)]/50">
                  Assessment
                </p>
                <p className="text-xs text-[color:var(--color-ink)]/70 leading-relaxed">
                  {cert.format}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <InquiryForm />
        </div>
      </section>
    </main>
  );
}
