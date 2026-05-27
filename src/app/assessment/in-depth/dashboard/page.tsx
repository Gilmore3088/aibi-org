// /assessment/in-depth/dashboard — institution-leader dashboard for the
// In-Depth Assessment cohort. Ported to the mockup design system 2026-05-27.
// Invite + aggregate surfaces remain scaffolded as "Coming soon" sections
// until institution_invites + Stripe seat-tier land.

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

const PAGE_STYLE = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  background: 'var(--cream)',
  minHeight: '100vh',
} as const;

export default async function InDepthDashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect('/auth/login?next=/assessment/in-depth/dashboard');
  }

  const enrollment = await getInDepthEnrollment();
  if (!enrollment) {
    redirect('/assessment/in-depth?reason=no-purchase');
  }

  return (
    <main style={PAGE_STYLE}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px 80px' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            margin: '0 0 8px',
          }}
        >
          In-Depth · Cohort dashboard
        </p>
        <h1
          style={{
            fontSize: 'clamp(36px, 4vw, 52px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 8px',
            color: 'var(--ink)',
          }}
        >
          Your institution&rsquo;s cohort
        </h1>
        <p
          style={{
            fontSize: 17,
            color: 'var(--slate-600)',
            margin: '0 0 40px',
            lineHeight: 1.55,
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
          ctaLabel="EMAIL THE INSTITUTE"
        />

        <ScaffoldCard
          kicker="Aggregate report"
          title="Anonymized cohort readout"
          body="Per-dimension cohort medians, p25/p75 bands, and completion rate are scaffold-pending. The /api/indepth/aggregate endpoint will compute these in pure logic over completed roster takes once the schema is in place. The output mirrors the eight readiness dimensions used in the individual Briefing."
          ctaHref="/assessment/in-depth/results/preview"
          ctaLabel="SEE THE INDIVIDUAL BRIEFING FORMAT"
        />

        <ScaffoldCard
          kicker="AI Starter Toolkit"
          title="Read-only Toolbox for cohort members"
          body="In-Depth buyers get the AI Starter Toolkit tier — read-only Library and Cookbook access, plus the In-Depth Briefing. Full Playground and Build tabs open with AiBI-Foundation. This tier currently routes through manual access provisioning; the entitlement check on the Toolbox surface will gate it automatically once /api/indepth/aggregate is live."
          ctaHref="/dashboard/toolbox"
          ctaLabel="OPEN THE TOOLBOX"
        />

        <p
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid var(--ink-a10)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'var(--slate-500)',
          }}
        >
          Your enrollment is active. Reference:{' '}
          <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{enrollment.id}</span>
          {' · Purchased '}
          <span style={{ color: 'var(--ink)', fontWeight: 700 }}>
            {new Date(enrollment.enrolled_at).toLocaleDateString()}
          </span>
        </p>

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--slate-500)' }}>
          <Link
            href="/dashboard/assessments"
            style={{ color: 'var(--gold-deep)', fontWeight: 600 }}
          >
            See your assessment history →
          </Link>
        </p>
      </div>
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
        border: '1px solid var(--ink-a10)',
        background: '#fff',
        padding: '28px 32px',
        marginBottom: 20,
        borderRadius: 24,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 6px',
        }}
      >
        {props.kicker} · Coming soon
      </p>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.2,
          color: 'var(--ink)',
          margin: '0 0 8px',
          letterSpacing: '-0.01em',
        }}
      >
        {props.title}
      </h2>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: 'var(--slate-600)',
          margin: '0 0 14px',
          maxWidth: '70ch',
        }}
      >
        {props.body}
      </p>
      <Link
        href={props.ctaHref}
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          textDecoration: 'none',
        }}
      >
        {props.ctaLabel} →
      </Link>
    </section>
  );
}
