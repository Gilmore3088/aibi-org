import type { Metadata } from 'next';
import { AibiSeal } from '@/components/AibiSeal';
import { WaitlistForm, type WaitlistInterest } from './WaitlistForm';

export const metadata: Metadata = {
  title: { absolute: 'AI Banking Institute — Coming Soon' },
  description:
    'Three certifications for community banks and credit unions, in active development. Join the waitlist to be notified at launch.',
  robots: { index: false, follow: false },
};

interface ComingSoonPageProps {
  readonly searchParams?: Promise<{ readonly interest?: string }>;
}

function getInterest(value: string | undefined): WaitlistInterest {
  if (value === 'practitioner') return 'practitioner';
  if (value === 'specialist') return 'specialist';
  if (value === 'leader') return 'leader';
  return 'practitioner';
}

const TRACKS: ReadonlyArray<{ readonly title: string; readonly body: string }> = [
  {
    title: 'AiBI-P Practitioner',
    body: 'Practical AI use for daily banking work. Twelve modules, hands-on practice, role-applied artifacts.',
  },
  {
    title: 'AiBI-S Specialist',
    body: 'Specialist tracks for Operations, Lending, and BSA/AML — deeper workflows, sector-specific guardrails.',
  },
  {
    title: 'AiBI-L Leader',
    body: 'For executives leading institution-wide AI capability. Governance, vendor risk, board-level oversight.',
  },
];

const TRUST_POINTS: ReadonlyArray<string> = [
  'Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon',
  'Built specifically for community banks and credit unions — not retrofitted enterprise content',
  'No PII required; human review required by default; designed for real workflows',
];

export default async function ComingSoonPage({ searchParams }: ComingSoonPageProps) {
  const sp = await searchParams;
  const interest = getInterest(sp?.interest);

  return (
    <main
      role="main"
      className="min-h-screen bg-[color:var(--color-linen)] flex items-center justify-center px-6 py-20 md:py-24"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-8 text-[color:var(--color-ink)]">
          <AibiSeal size={72} />
        </div>

        <p className="font-serif-sc text-xs md:text-sm tracking-[0.22em] text-[color:var(--color-terra)] uppercase text-center mb-5">
          In development
        </p>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight text-[color:var(--color-ink)] text-center max-w-2xl mx-auto">
          AI training built for community banks and credit unions.
        </h1>
        <p className="font-sans text-base md:text-lg leading-relaxed text-[color:var(--color-ink)]/75 max-w-xl mx-auto text-center mt-5">
          Three certifications — Practitioner, Specialist, and Leader — in active
          development. Join the waitlist for the track that matches your role and
          we will tell you the moment it opens.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mt-12">
          {TRACKS.map((track) => (
            <article
              key={track.title}
              className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-5"
            >
              <h2 className="font-serif text-xl text-[color:var(--color-ink)]">
                {track.title}
              </h2>
              <p className="text-sm text-[color:var(--color-slate)] leading-relaxed mt-2">
                {track.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <WaitlistForm initialInterest={interest} />
        </div>

        <ul className="mt-10 space-y-3 max-w-xl mx-auto">
          {TRUST_POINTS.map((point) => (
            <li
              key={point}
              className="flex gap-3 text-sm text-[color:var(--color-slate)] leading-relaxed"
            >
              <span className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
          The AI Banking Institute · AIBankingInstitute.com
        </p>
      </div>
    </main>
  );
}
