import type { Metadata } from 'next';
import { AibiSeal } from '@/components/AibiSeal';
import { WaitlistForm, type WaitlistInterest } from './WaitlistForm';

export const metadata: Metadata = {
  title: { absolute: 'The AI Banking Institute — Coming Soon' },
  description:
    'The AI Banking Institute helps community banks and credit unions adopt AI safely and put it to work. Tell us what you are looking for and we will let you know when it opens.',
  robots: { index: false, follow: false },
};

interface ComingSoonPageProps {
  readonly searchParams?: Promise<{ readonly interest?: string }>;
}

function getInterest(value: string | undefined): WaitlistInterest {
  if (
    value === 'assessment' ||
    value === 'course' ||
    value === 'institutional' ||
    value === 'consulting'
  ) {
    return value;
  }
  return 'assessment';
}

export default async function ComingSoonPage({ searchParams }: ComingSoonPageProps) {
  const sp = await searchParams;
  const interest = getInterest(sp?.interest);

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)] text-[color:var(--color-ink)] flex flex-col">
      <div className="h-[3px] bg-[color:var(--color-terra)]" />

      <header className="mx-auto w-full max-w-5xl flex items-center justify-between px-6 md:px-10 py-5 border-b border-[color:var(--color-ink)]/15">
        <div className="flex items-center gap-3">
          <AibiSeal size={28} />
          <span className="font-serif text-[15px] tracking-tight leading-none mt-0.5">
            The AI Banking Institute
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/60">
          Coming soon
        </span>
      </header>

      <section className="flex-1 mx-auto w-full max-w-5xl px-6 md:px-10 py-12 md:py-16">
        <div className="grid gap-12 md:gap-16 md:grid-cols-12">
          <div className="md:col-span-6 md:pr-4">
            <h1 className="font-serif text-[36px] leading-[1.08] md:text-[48px] md:leading-[1.05] tracking-[-0.01em]">
              AI proficiency for community banks and credit unions.
            </h1>

            <p className="mt-6 text-[16px] md:text-[17px] leading-[1.6] text-[color:var(--color-ink)]/80">
              The AI Banking Institute helps community banks and credit unions
              adopt AI safely and put it to work — readiness assessment,
              practitioner education, enterprise rollout, and advisory.
            </p>


            <div className="mt-8 pt-6 border-t border-[color:var(--color-ink)]/15">
              <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 mb-4">
                Why this is different
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-[14px] leading-[1.5] text-[color:var(--color-ink)]/85">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                  <span>
                    <span className="font-serif text-[15px]">Built for community banks</span>
                    <span className="text-[color:var(--color-ink)]/65"> — not retrofitted enterprise content.</span>
                  </span>
                </li>
                <li className="flex gap-3 text-[14px] leading-[1.5] text-[color:var(--color-ink)]/85">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                  <span>
                    <span className="font-serif text-[15px]">Regulator-ready outputs</span>
                    <span className="text-[color:var(--color-ink)]/65"> — artifacts your compliance team can defend.</span>
                  </span>
                </li>
                <li className="flex gap-3 text-[14px] leading-[1.5] text-[color:var(--color-ink)]/85">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
                  <span>
                    <span className="font-serif text-[15px]">Skills, not principles</span>
                    <span className="text-[color:var(--color-ink)]/65"> — bankers leave with things they use Monday.</span>
                  </span>
                </li>
              </ul>
              <p className="mt-5 text-[12px] leading-[1.55] text-[color:var(--color-ink)]/55">
                Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon.
              </p>
            </div>
          </div>

          <div className="md:col-span-6 md:pl-4">
            <WaitlistForm initialInterest={interest} />
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-6 md:px-10 py-6 border-t border-[color:var(--color-ink)]/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55">
          AIBankingInstitute.com
        </span>
        <a
          href="mailto:hello@aibankinginstitute.com"
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 hover:text-[color:var(--color-terra)] transition-colors"
        >
          hello@aibankinginstitute.com
        </a>
      </footer>
    </main>
  );
}
