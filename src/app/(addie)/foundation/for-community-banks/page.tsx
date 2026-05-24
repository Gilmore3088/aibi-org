// /foundation/for-community-banks — B2B landing for community banks and
// credit unions evaluating the Team SKU (10-seat minimum). Sales-assisted
// by design; CTA flows to /foundation/contact-sales for human follow-up.
//
// PRD §2 (audience), §6 (offerings — Team $199/seat min 10), Auth Spec.
// Editorial-ledger aesthetic; same chrome as the rest of /foundation/*.

import type { Metadata } from 'next';
import Link from 'next/link';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export const metadata: Metadata = {
  title: 'For community banks & credit unions · The AI Banking Institute',
  description:
    'Train your bench, not your tech. A banker-grade AI Foundation course built for community banks and credit unions, with per-seat billing, an aggregate dashboard, and examiner-aligned content.',
  alternates: { canonical: '/foundation/for-community-banks' },
};

interface Pillar {
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
}

const PILLARS: readonly Pillar[] = [
  {
    kicker: 'Built where your people work',
    title: 'Five role tracks. One course.',
    body: 'The lesson a BSA analyst sees is not the lesson a teller sees. Branched at the applied moments — risk and compliance, customer-facing, back-office, technical, leadership — so the same course fits the lending desk and the audit function without watering either one down.',
  },
  {
    kicker: 'Examiner-aligned',
    title: 'The rules before the tools.',
    body: 'Aligned with SR 11-7, the Interagency Third-Party Risk Management Guidance, ECOA / Regulation B, and the AIEOG AI Lexicon. Your governance, model risk, and compliance teams can read the curriculum and recognise the references.',
  },
  {
    kicker: 'Bounded by design',
    title: 'Customer data never reaches a model.',
    body: 'The practice sandbox blocks PII patterns at input, scrubs prompts before dispatch, and never trains the model on your work. Every prompt is logged. The discipline is structural, not a checkbox in a policy.',
  },
];

interface Inclusion {
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
}

const INCLUSIONS: readonly Inclusion[] = [
  {
    kicker: '01 · Aggregate progress',
    title: 'A dashboard your champion can defend.',
    body: 'Rolled-up completion by module, by track, and by seat. Counts only — never a learner artifact, never a sandbox transcript. What L&D needs to report up, without ever surfacing what a teller wrote in a draft.',
  },
  {
    kicker: '02 · Seat management',
    title: 'Invite, revoke, reassign.',
    body: 'Buy a block of seats. Invite your people by work email. Reassign a seat when someone changes roles or leaves. No procurement loop required for the second cohort.',
  },
  {
    kicker: '03 · Per-role tracks',
    title: 'Five branches at applied lessons.',
    body: 'A seat is a seat — the learner picks their track on first login. The branched content lives at the lessons where role matters (M1.3, M2.4, M3.5, M4.3). Shared everywhere else, so the team has a common vocabulary.',
  },
  {
    kicker: '04 · Lifetime access',
    title: 'Once completed, kept.',
    body: 'A completer keeps access to the modules and their saved Toolbox artifacts for as long as the course exists. Refresh visits, year-two review, post-promotion brush-up — included.',
  },
  {
    kicker: '05 · L&D receipts',
    title: 'A receipt that survives audit.',
    body: 'Stripe-issued invoice with the institution as the bill-to. PO-friendly. Per-seat line items. Annual tax documentation on request.',
  },
];

interface Stat {
  readonly value: string;
  readonly label: string;
  readonly source: string;
}

const STATS: readonly Stat[] = [
  {
    value: '66%',
    label: 'of banks have AI in their budget conversation',
    source: 'Bank Director 2024 Technology Survey (via Jack Henry)',
  },
  {
    value: '57%',
    label: 'of financial institutions report AI skill gaps',
    source: 'Gartner Peer Community (via Jack Henry)',
  },
  {
    value: '55%',
    label: 'have no AI governance framework yet',
    source: 'Gartner (via Jack Henry)',
  },
  {
    value: '~65%',
    label: 'community-bank median efficiency ratio vs. 55.7% industry-wide',
    source: 'FDIC Quarterly Banking Profile, Q4 2024',
  },
];

export default function ForCommunityBanksPage() {
  return (
    <main className="bg-[var(--ledger-bg)] text-[var(--ledger-ink)]">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="addie-hero-parch">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[7fr_5fr] items-end">
            <div className="relative z-10">
              <KickerLabel tone="accent">For community banks &amp; credit unions</KickerLabel>
              <h1 className="mt-5 font-serif text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] leading-[1] tracking-[-0.02em] text-[var(--ledger-ink)]">
                Train your bench,
                <br />
                <span className="text-[var(--ledger-accent)]">not your tech.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg sm:text-xl leading-[1.55] text-[var(--ledger-ink-2)]">
                A short, banker-grade AI course built for the ~8,400 US
                community banks and credit unions. Same content the
                executives are using. Per-seat billing at ten or more.
                Aggregate dashboard for your champion. No platform to
                deploy, no vendor lock-in, no customer data ever
                touching the model.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/foundation/contact-sales"
                  className="inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-xs px-6 py-4 rounded-[2px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms]"
                >
                  Talk to us about your team
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/foundation/assessment"
                  className="font-mono font-semibold uppercase tracking-[0.14em] text-xs px-5 py-4 rounded-[2px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-paper)] transition-colors duration-[160ms]"
                >
                  Or take the $99 readiness assessment
                </Link>
              </div>
            </div>

            {/* Ledger-card aside: at-a-glance specs */}
            <aside
              className="relative rounded-[3px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] p-7"
              aria-label="At a glance"
            >
              <KickerLabel>At a glance</KickerLabel>
              <dl className="mt-5 divide-y divide-[var(--ledger-rule)]">
                {[
                  { k: 'Format', v: 'Self-paced, online' },
                  { k: 'Lesson length', v: 'Under fifteen minutes each' },
                  { k: 'Modules', v: 'Six · ~22 lessons' },
                  { k: 'Seat minimum', v: 'Ten' },
                  { k: 'Per-seat price', v: '$199' },
                  { k: 'Sandbox', v: 'On-rails, multi-provider' },
                ].map((row) => (
                  <div key={row.k} className="flex items-baseline justify-between gap-6 py-3">
                    <dt className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">
                      {row.k}
                    </dt>
                    <dd className="font-serif text-[var(--ledger-ink)] tabular-nums text-right">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Case for community banks ─────────────────────────────── */}
      <section className="border-t border-[var(--ledger-rule-strong)] bg-[var(--ledger-bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <KickerLabel>The case for community banks</KickerLabel>
            <h2 className="mt-4 font-serif text-[2rem] sm:text-[2.5rem] leading-[1.1] tracking-[-0.01em] text-[var(--ledger-ink)]">
              The course your examiner could read without flinching.
            </h2>
          </div>
          <div className="mt-12 grid gap-px bg-[var(--ledger-rule)] border border-[var(--ledger-rule-strong)] lg:grid-cols-3">
            {PILLARS.map((p) => (
              <article key={p.kicker} className="bg-[var(--ledger-paper)] p-7">
                <KickerLabel tone="accent">{p.kicker}</KickerLabel>
                <h3 className="mt-4 font-serif text-2xl leading-tight text-[var(--ledger-ink)]">
                  {p.title}
                </h3>
                <p className="mt-3 text-[var(--ledger-ink-2)] leading-[1.6]">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you get when you buy seats ──────────────────────── */}
      <section className="border-t border-[var(--ledger-rule-strong)] bg-[var(--ledger-parch)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 self-start">
              <KickerLabel>What you get when you buy seats</KickerLabel>
              <h2 className="mt-4 font-serif text-[2rem] sm:text-[2.5rem] leading-[1.1] tracking-[-0.01em] text-[var(--ledger-ink)]">
                Five things, no add-on modules, no upsells.
              </h2>
              <p className="mt-5 text-[var(--ledger-ink-2)] leading-[1.6]">
                The price is per seat. Everything below is included for
                every seat. There is no &ldquo;dashboard tier&rdquo; or
                &ldquo;analytics add-on&rdquo; — those exist because
                vendors sell platforms. We are not a platform.
              </p>
            </div>
            <ol className="space-y-px bg-[var(--ledger-rule)] border border-[var(--ledger-rule-strong)]">
              {INCLUSIONS.map((row) => (
                <li key={row.kicker} className="bg-[var(--ledger-paper)] p-7">
                  <KickerLabel tone="accent">{row.kicker}</KickerLabel>
                  <h3 className="mt-3 font-serif text-xl leading-tight text-[var(--ledger-ink)]">
                    {row.title}
                  </h3>
                  <p className="mt-3 text-[var(--ledger-ink-2)] leading-[1.6]">{row.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Numbers that earn their place ────────────────────────── */}
      <section className="border-t border-[var(--ledger-rule-strong)] bg-[var(--ledger-bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <KickerLabel>Numbers that earn their place</KickerLabel>
            <h2 className="mt-4 font-serif text-[2rem] sm:text-[2.5rem] leading-[1.1] tracking-[-0.01em] text-[var(--ledger-ink)]">
              The shape of the gap, sourced.
            </h2>
            <p className="mt-5 text-[var(--ledger-ink-2)] leading-[1.6]">
              Every figure here traces to a named publication. If a
              statistic does not have a citation, it does not appear on
              this site.
            </p>
          </div>
          <div className="mt-12 grid gap-px bg-[var(--ledger-rule)] border border-[var(--ledger-rule-strong)] sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <figure key={s.label} className="bg-[var(--ledger-paper)] p-7 flex flex-col">
                <div className="font-serif text-[3rem] leading-none text-[var(--ledger-ink)] tabular-nums">
                  {s.value}
                </div>
                <figcaption className="mt-4 text-sm leading-[1.5] text-[var(--ledger-ink-2)]">
                  {s.label}
                </figcaption>
                <cite className="mt-auto pt-5 not-italic font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)]">
                  {s.source}
                </cite>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who's behind this ─────────────────────────────────────── */}
      <section className="border-t border-[var(--ledger-rule-strong)] bg-[var(--ledger-parch)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <KickerLabel>Who is behind this</KickerLabel>
          <h2 className="mt-4 font-serif text-[2rem] sm:text-[2.5rem] leading-[1.1] tracking-[-0.01em] text-[var(--ledger-ink)]">
            Built by a banking technologist who has spent a career inside community institutions.
          </h2>
          <p className="mt-7 text-lg leading-[1.65] text-[var(--ledger-ink-2)]">
            The AI Banking Institute is the work of a small team that
            spent years inside community banks and credit unions before
            building this. The gap we kept seeing was not access to AI
            tools — the tools are everywhere — it was the absence of
            a course written for a teller, a BSA analyst, a CFO, that
            sounded like it was built by someone who had sat in their
            chair. So we built it.
          </p>
          <p className="mt-5 text-[var(--ledger-ink-2)] leading-[1.65]">
            The Foundation course is the same content the executives
            are taking. The team SKU is the same course, priced for
            the bench, with the dashboard a champion needs to defend
            the spend.
          </p>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────── */}
      <section className="border-t border-[var(--ledger-rule-strong)] bg-[var(--ledger-ink)] text-[var(--ledger-paper)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[7fr_5fr] items-center">
            <div>
              <KickerLabel tone="accent">Next step</KickerLabel>
              <h2 className="mt-4 font-serif text-[2.25rem] sm:text-[3rem] leading-[1.05] tracking-[-0.01em]">
                Tell us about your team.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-[1.6] text-[color-mix(in_srgb,var(--ledger-paper)_85%,var(--ledger-ink))]">
                Five fields. One business-day reply. We will scope a
                pilot for your institution and walk you through the
                dashboard before you commit a budget line.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/foundation/contact-sales"
                className="inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-xs px-6 py-4 rounded-[2px] bg-[var(--ledger-accent)] text-[var(--ledger-ink)] hover:opacity-90 transition-opacity duration-[160ms]"
              >
                Talk to us about your team
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/foundation/assessment"
                className="font-mono font-semibold uppercase tracking-[0.14em] text-xs px-5 py-4 rounded-[2px] border border-[var(--ledger-paper)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-paper)] hover:text-[var(--ledger-ink)] transition-colors duration-[160ms] text-center"
              >
                Or take the $99 readiness assessment first
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
