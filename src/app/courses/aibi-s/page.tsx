// AiBI-S course landing — routed at /courses/aibi-s
// Self-paced prototype: 5-track selector.

import Link from 'next/link';
import type { TrackCode } from '@/lib/aibi-s/types';

interface TrackMeta {
  readonly code: TrackCode;
  readonly label: string;
  readonly tagline: string;
  readonly active: boolean;
}

const tracks: readonly TrackMeta[] = [
  { code: 'ops',        label: 'Operations',  tagline: 'Back-office efficiency. Throughput. Exception handling.', active: true },
  { code: 'lending',    label: 'Lending',     tagline: 'Loan-file analysis. Credit research. Pipeline insight.',   active: false },
  { code: 'compliance', label: 'Compliance',  tagline: 'Regulatory research. Policy corpus. BSA/AML support.',     active: false },
  { code: 'finance',    label: 'Finance',     tagline: 'Variance narrative. Board memos. ALCO support.',           active: false },
  { code: 'retail',     label: 'Retail',      tagline: 'Member comms. FAQ automation. Service recovery.',          active: false },
];

export default function AiBISPrototypeLanding() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <header className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-wider text-[color:var(--color-cobalt)]">
          AiBI-S · Banking AI Specialist · Prototype
        </p>
        <h1 className="font-serif text-5xl">Choose your track</h1>
        <p className="text-lg">
          AiBI-S includes all five role tracks. Complete one to earn
          <span className="font-mono"> AiBI-S/<span className="italic">track</span></span>.
          Complete all five to earn the <span className="font-semibold">Full Specialist</span> honorific.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-2">
        {tracks.map((t) => (
          <li key={t.code}>
            {t.active ? (
              <Link
                href={`/courses/aibi-s/${t.code}`}
                className="block border-2 border-[color:var(--color-cobalt)] p-6 rounded hover:bg-[color:var(--color-parch)] transition"
              >
                <p className="font-mono text-xs mb-1">AiBI-S/{t.code}</p>
                <p className="font-serif text-2xl">{t.label}</p>
                <p className="text-sm mt-2">{t.tagline}</p>
                <p className="text-xs mt-3 text-[color:var(--color-cobalt)] font-semibold">Active in prototype →</p>
              </Link>
            ) : (
              <div className="block border border-[color:var(--color-ink)]/15 p-6 rounded opacity-60 cursor-not-allowed">
                <p className="font-mono text-xs mb-1">AiBI-S/{t.code}</p>
                <p className="font-serif text-2xl">{t.label}</p>
                <p className="text-sm mt-2">{t.tagline}</p>
                <p className="text-xs mt-3 text-[color:var(--color-ink)]/50">Coming soon</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
