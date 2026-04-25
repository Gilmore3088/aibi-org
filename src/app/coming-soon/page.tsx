import type { Metadata } from 'next';
import { AibiSeal } from '@/components/AibiSeal';
import { WaitlistForm, type WaitlistInterest } from './WaitlistForm';

export const metadata: Metadata = {
  title: { absolute: 'Advanced AiBI Courses — Coming Soon' },
  description:
    'AiBI-S and AiBI-L are coming soon. Join the waitlist for advanced AI banking training.',
  robots: { index: false, follow: false },
};

interface ComingSoonPageProps {
  readonly searchParams?: {
    readonly interest?: string;
  };
}

function getInterest(value: string | undefined): WaitlistInterest {
  if (value === 'leader') return 'leader';
  return 'specialist';
}

export default function ComingSoonPage({ searchParams }: ComingSoonPageProps) {
  const interest = getInterest(searchParams?.interest);

  return (
    <main
      role="main"
      className="min-h-screen bg-[color:var(--color-linen)] flex items-center justify-center px-6 py-24"
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-8 text-[color:var(--color-ink)]">
          <AibiSeal size={72} />
        </div>
        <p className="font-serif-sc text-xs md:text-sm tracking-[0.22em] text-[color:var(--color-terra)] uppercase mb-5">
          Coming Soon
        </p>
        <h1 className="font-serif text-4xl md:text-5xl leading-tight text-[color:var(--color-ink)] mb-5">
          Advanced AI banking training is next.
        </h1>
        <p className="font-sans text-base md:text-lg leading-relaxed text-[color:var(--color-ink)]/75 max-w-xl mx-auto">
          Start with AiBI-P Practitioner now. AiBI-S and AiBI-L will expand into
          workflow automation, agents, internal AI systems, and team-level
          rollout.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 text-left mt-10 mb-10">
          {[
            'Workflow automation',
            'Agents and human checkpoints',
            'Internal AI systems',
            'Team-level rollout',
          ].map((item) => (
            <div key={item} className="border-l-2 border-[color:var(--color-terra)] pl-4">
              <p className="font-serif text-xl text-[color:var(--color-ink)]">
                {item}
              </p>
            </div>
          ))}
        </div>

        <WaitlistForm initialInterest={interest} />
      </div>
    </main>
  );
}
