// PaywallPreview — replaces the bare "you can't see this" PaywallScreen
// with a richer locked-module preview. Shows what the learner WOULD get
// (module title, what-you-build, lesson outline, illustration teaser),
// then three doors to keep going.

import Link from 'next/link';
import { ModuleIllustration } from '@/components/addie/illustrations/ModuleIllustration';

type ModuleKey = 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

interface LessonPreview {
  readonly ordinal: number;
  readonly title: string;
  readonly duration_min: number;
}

interface PaywallPreviewProps {
  readonly moduleId: string;
  readonly moduleOrdinal: number;
  readonly moduleTitle: string;
  readonly moduleSummary?: string | null;
  readonly lessons: ReadonlyArray<LessonPreview>;
  readonly takeawayLabel?: string;
}

export function PaywallPreview({
  moduleId,
  moduleOrdinal,
  moduleTitle,
  moduleSummary,
  lessons,
  takeawayLabel,
}: PaywallPreviewProps) {
  const moduleKey = moduleId as ModuleKey;
  const totalMin = lessons.reduce((n, l) => n + l.duration_min, 0);

  return (
    <main>
      {/* Hero — locked module preview */}
      <section className="addie-hero-parch">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/foundation"
              className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
            >
              ← Foundation
            </Link>
          </nav>
          <div className="grid gap-8 lg:grid-cols-[5fr_4fr] items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="addie-chip" data-tone="accent">
                  Module {moduleOrdinal} · Locked · Paid
                </span>
                <span className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] tabular-nums">
                  {lessons.length} lessons · {totalMin} min
                </span>
              </div>
              <h1 className="font-serif text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] leading-[1.02] tracking-[-0.02em] text-[var(--ledger-ink)]">
                {moduleTitle}
              </h1>
              {moduleSummary ? (
                <p className="mt-4 max-w-xl text-lg leading-[1.55] text-[var(--ledger-ink-2)]">
                  {moduleSummary}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/foundation/pricing"
                  className="group inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-xs px-6 py-4 rounded-[4px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms]"
                >
                  See your options
                  <span className="transition-transform duration-[200ms] group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="/foundation/gate"
                  className="font-mono font-semibold uppercase tracking-[0.14em] text-xs px-5 py-4 rounded-[4px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)] transition-colors duration-[160ms]"
                >
                  Choose your path
                </Link>
              </div>
            </div>

            {/* Illustration preview with a lock overlay */}
            <div className="relative">
              <div className="relative rounded-[4px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] p-5 shadow-[var(--ledger-shadow)]">
                <div className="relative">
                  <ModuleIllustration module={moduleKey} variant="hero" />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[var(--ledger-paper)] opacity-60 rounded-[3px]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--ledger-ink)] text-[var(--ledger-paper)]">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="5" y="10" width="12" height="9" rx="1" />
                        <path d="M7 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section className="border-t border-[var(--ledger-rule)] bg-[var(--ledger-bg)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 grid gap-10 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)]">
              What&apos;s inside
            </h2>
            <ol className="mt-4 space-y-3">
              {lessons.map((l) => (
                <li key={l.ordinal} className="flex items-start gap-4">
                  <span className="shrink-0 font-serif text-[1.5rem] leading-none text-[var(--ledger-muted)] tabular-nums w-8">
                    {String(l.ordinal).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    {/* List items, not headings — they belong in the lesson
                        outline, not the page's heading hierarchy. (Was h3,
                        which created an h1→h3 jump per the a11y audit.) */}
                    <p className="font-serif text-lg leading-snug text-[var(--ledger-ink-2)] pt-0.5">
                      {l.title}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)] tabular-nums pt-1">
                    {l.duration_min} min
                  </span>
                </li>
              ))}
            </ol>
          </div>
          {takeawayLabel ? (
            <div>
              <h2 className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)]">
                What you&apos;d build
              </h2>
              <div className="mt-4 rounded-[4px] bg-[var(--ledger-tape)] border border-[var(--ledger-rule)] p-5">
                <div className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] mb-2">
                  Takeaway
                </div>
                <p className="font-serif text-xl text-[var(--ledger-ink)] leading-snug">
                  {takeawayLabel}
                </p>
                <p className="mt-3 text-sm text-[var(--ledger-ink-2)]">
                  Saved to your Toolbox, exportable as Markdown.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Three doors */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <span className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)]">
            Three doors
          </span>
          <h2 className="mt-2 font-serif text-3xl text-[var(--ledger-ink)]">
            Pick how you want to keep going.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <DoorCard
            kicker="Continue"
            title="Foundation Course"
            price="$295"
            sub="M4 + M5 access. Unlimited Toolbox. Lifetime access. One learner."
            href="/foundation/pricing"
            cta="Pay $295"
            primary
          />
          <DoorCard
            kicker="For teams"
            title="Foundation for your team"
            price="$199 / seat"
            sub="Same course, billed by seat (10-seat minimum). Per-seat progress for admins."
            href="/foundation/contact-sales"
            cta="Talk to us"
          />
          <DoorCard
            kicker="Maybe later"
            title="Readiness Assessment"
            price="$99"
            sub="48 questions. Scorecard, plan, ideas, prompts. Use it now, course later."
            href="/foundation/assessment"
            cta="Take the assessment"
          />
        </div>
      </section>
    </main>
  );
}

function DoorCard({
  kicker,
  title,
  price,
  sub,
  href,
  cta,
  primary,
}: {
  kicker: string;
  title: string;
  price: string;
  sub: string;
  href: string;
  cta: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="addie-module-card group flex flex-col gap-3"
      data-tier={primary ? 'paid' : undefined}
    >
      <span className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-accent)]">
        {kicker}
      </span>
      <h3 className="font-serif text-xl text-[var(--ledger-ink)] leading-tight">{title}</h3>
      <div className="font-serif text-2xl text-[var(--ledger-ink)] tabular-nums">{price}</div>
      <p className="text-sm text-[var(--ledger-ink-2)] leading-relaxed flex-1">{sub}</p>
      <span
        className={
          'mt-3 inline-flex items-center justify-center gap-2 font-mono font-semibold uppercase tracking-[0.14em] text-[0.7rem] px-4 py-2.5 rounded-[3px] transition-colors duration-[160ms] ' +
          (primary
            ? 'bg-[var(--ledger-ink)] text-[var(--ledger-paper)] group-hover:bg-[var(--ledger-ink-2)]'
            : 'border border-[var(--ledger-ink)] text-[var(--ledger-ink)] group-hover:bg-[var(--ledger-paper)]')
        }
      >
        {cta}
        <span aria-hidden className="transition-transform duration-[160ms] group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
