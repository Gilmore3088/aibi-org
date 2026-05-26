// /assessment/in-depth/dashboard — institution-leader dashboard for the
// In-Depth Assessment cohort. Scoped in PR #44 and carried forward via
// #48. This page ships as the leader-side shell. Invite + aggregate
// surfaces are scaffolded as explicit "Coming soon" sections until the
// supporting schema (institution_invites table), email-send wiring
// (mailerlite / resend templates), and Stripe seat-tier pricing land.

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getInDepthEnrollment } from '../_lib/getInDepthEnrollment';

export const metadata: Metadata = {
  title: 'Cohort dashboard | The AI Banking Institute',
  description: 'Manage your institution’s In-Depth Assessment cohort.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function InDepthDashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect('/auth/login?next=/assessment/in-depth/dashboard');
  }

  const enrollment = await getInDepthEnrollment();
  if (!enrollment) {
    redirect('/assessment/in-depth?reason=no-purchase');
  }

  return (
    <main className="mx-auto max-w-[980px] px-6 py-12 md:py-16">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--gold)] mb-2">
        In-Depth · Cohort dashboard
      </p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-ink)] mb-2">
        Your institution&rsquo;s cohort
      </h1>
      <p className="text-base md:text-lg text-[color:var(--color-ink)]/75 leading-relaxed mb-10 max-w-2xl">
        Invite staff, monitor completion, and review aggregate readiness
        across the eight dimensions.
      </p>

      <ScaffoldCard
        kicker="Invite staff"
        title="Magic-link invites"
        body="Leader invites with seat-cap enforcement and one-time-use magic-link sign-up are wiring-pending. The schema (institution_invites table) and email template integration land together in the follow-up tracked under #48. Until then, contact the Institute directly to add seats to your cohort."
        ctaHref="mailto:hello@aibankinginstitute.com"
        ctaLabel="Email the Institute"
      />

      <ScaffoldCard
        kicker="Aggregate report"
        title="Anonymized cohort readout"
        body="Per-dimension cohort medians, p25/p75 bands, and completion rate are scaffold-pending. The /api/indepth/aggregate endpoint will compute these in pure logic over completed roster takes once the schema is in place. The output mirrors the eight readiness dimensions used in the individual Briefing."
        ctaHref="/assessment/in-depth/results/preview"
        ctaLabel="See the individual Briefing format"
      />

      <ScaffoldCard
        kicker="AI Starter Toolkit"
        title="Read-only Toolbox for cohort members"
        body="In-Depth buyers get the AI Starter Toolkit tier — read-only Library and Cookbook access, plus the In-Depth Briefing. Full Playground and Build tabs open with AiBI-Foundation. This tier currently routes through manual access provisioning; the entitlement check on the Toolbox surface will gate it automatically once /api/indepth/aggregate is live."
        ctaHref="/dashboard/toolbox"
        ctaLabel="Open the Toolbox"
      />

      <p className="mt-12 pt-6 border-t border-[color:var(--color-ink)]/10 font-mono text-[11px] tracking-[0.04em] text-[color:var(--color-ink)]/60">
        Your enrollment is active. Reference:{' '}
        <span className="text-[color:var(--color-ink)]">{enrollment.id}</span>
        {' · Purchased '}
        <span className="text-[color:var(--color-ink)]">
          {new Date(enrollment.enrolled_at).toLocaleDateString()}
        </span>
      </p>

      <p className="mt-6 text-sm text-[color:var(--color-ink)]/60">
        <Link
          href="/dashboard/assessments"
          className="text-[color:var(--gold)] hover:text-[color:var(--gold-2)] underline"
        >
          See your assessment history →
        </Link>
      </p>
    </main>
  );
}

function ScaffoldCard(props: {
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  readonly ctaHref: string;
  readonly ctaLabel: string;
}) {
  return (
    <section className="rounded-[3px] border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] px-7 py-6 mb-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/60 mb-1.5">
        {props.kicker} · Coming soon
      </p>
      <h2 className="font-serif text-2xl leading-tight text-[color:var(--color-ink)] mb-2">
        {props.title}
      </h2>
      <p className="text-[15px] leading-[1.55] text-[color:var(--color-ink)]/80 mb-3 max-w-[70ch]">
        {props.body}
      </p>
      <Link
        href={props.ctaHref}
        className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--gold)] hover:text-[color:var(--gold-2)] no-underline"
      >
        {props.ctaLabel} →
      </Link>
    </section>
  );
}
