// /assessment/in-depth/dashboard — institution-leader dashboard for the
// In-Depth Assessment cohort. Scoped in PR #44 and carried forward via
// #48. This page ships as the leader-side shell. Invite + aggregate
// surfaces are scaffolded as explicit "Coming soon" sections until the
// supporting schema (institution_invites table), email-send wiring
// (mailerlite / resend templates), and Stripe seat-tier pricing land.
//
// Access gate today: any In-Depth Assessment buyer can reach this page;
// the scaffold messaging makes clear that invite + aggregate are not
// yet active. Once schema lands, the gate tightens to
// institution_enrollments.role = 'leader'.

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
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px 80px' }}>
      <p
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ledger-accent)',
          margin: '0 0 8px',
        }}
      >
        In-Depth · Cohort dashboard
      </p>
      <h1
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontSize: 'clamp(36px, 4vw, 52px)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '0 0 8px',
          color: 'var(--ledger-ink)',
        }}
      >
        Your institution&rsquo;s cohort
      </h1>
      <p
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontStyle: 'italic',
          fontSize: 17,
          color: 'var(--ledger-ink-2)',
          margin: '0 0 40px',
        }}
      >
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
        body="In-Depth buyers get the AI Starter Toolkit tier — read-only Library and Cookbook access, plus the In-Depth Briefing. Full Playground and Build tabs unlock with AiBI-Foundation. This tier currently routes through manual access provisioning; the entitlement check on the Toolbox surface will gate it automatically once /api/indepth/aggregate is live."
        ctaHref="/dashboard/toolbox"
        ctaLabel="Open the Toolbox"
      />

      <p
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid var(--ledger-rule)',
          fontFamily: 'var(--ledger-mono)',
          fontSize: 11,
          letterSpacing: '0.04em',
          color: 'var(--ledger-muted)',
        }}
      >
        Your enrollment is active. Reference:{' '}
        <span style={{ color: 'var(--ledger-ink)' }}>{enrollment.id}</span>
        {' · Purchased '}
        <span style={{ color: 'var(--ledger-ink)' }}>
          {new Date(enrollment.enrolled_at).toLocaleDateString()}
        </span>
      </p>

      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--ledger-muted)' }}>
        <Link href="/dashboard/assessments" style={{ color: 'var(--ledger-accent)' }}>
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
    <section
      style={{
        border: '1px solid var(--ledger-rule)',
        background: 'var(--ledger-paper)',
        padding: '24px 28px',
        marginBottom: 20,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ledger-muted)',
          margin: '0 0 6px',
        }}
      >
        {props.kicker} · Coming soon
      </p>
      <h2
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontSize: 24,
          lineHeight: 1.2,
          color: 'var(--ledger-ink)',
          margin: '0 0 8px',
        }}
      >
        {props.title}
      </h2>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--ledger-ink-2)',
          margin: '0 0 12px',
          maxWidth: '70ch',
        }}
      >
        {props.body}
      </p>
      <Link
        href={props.ctaHref}
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ledger-accent)',
          textDecoration: 'none',
        }}
      >
        {props.ctaLabel} →
      </Link>
    </section>
  );
}
