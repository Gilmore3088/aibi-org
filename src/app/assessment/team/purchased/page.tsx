import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/mockup';
import { getValidatedPaidSession } from '@/lib/stripe/get-validated-paid-session';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { TEAM_ASSESSMENT_SLICE_MIN, TEAM_ASSESSMENT_UNLOCK_COMPLETIONS } from '@/lib/team-assessment/constants';
import { TeamCopyButton } from '../_components/TeamCopyButton';

export const metadata: Metadata = {
  title: 'Team Assessment Purchased | The AI Banking Institute',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  readonly searchParams: Promise<{ readonly session_id?: string }>;
}

interface PurchasedCohort {
  readonly id: string;
  readonly institution_name: string;
  readonly public_token: string;
  readonly buyer_email: string;
}

async function origin(): Promise<string> {
  if (process.env.VERCEL_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  const h = await headers();
  const host = h.get('host') ?? 'aibankinginstitute.com';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export default async function TeamAssessmentPurchasedPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;
  const session = await getValidatedPaidSession(sessionId);
  if (!session || session.metadata?.product !== 'team-assessment') {
    redirect('/assessment/team');
  }

  let cohort: PurchasedCohort | null = null;
  if (isSupabaseConfigured()) {
    const client = createServiceRoleClient();
    const { data } = await client
      .from('team_assessment_cohorts')
      .select('id, institution_name, public_token, buyer_email')
      .eq('stripe_session_id', session.id)
      .maybeSingle();
    cohort = data as PurchasedCohort | null;
  }

  const siteOrigin = await origin();
  const participantPath = cohort ? `/assessment/team/${cohort.public_token}` : '';
  const participantUrl = cohort ? `${siteOrigin}${participantPath}` : '';
  const inviteText = cohort
    ? `Please complete the Team AI Readiness Assessment for ${cohort.institution_name}.

It takes about 12-15 minutes. You will receive a personal report. The organization sees aggregate results after the completion threshold is met. Department and role slices with fewer than ${TEAM_ASSESSMENT_SLICE_MIN} completions are marked directional.

Start here:
${participantUrl}`
    : '';

  return (
    <div className="mockup-scope team-purchased-page">
      <SiteHeader activePath="/assessment" cta={{ label: 'Team assessment', href: '/assessment/team' }} />
      <main className="team-purchased-main">
        <section className="team-purchased-hero">
          <p className="team-kicker">Purchase confirmed</p>
          <h1>{cohort ? 'Your team assessment is ready.' : 'Setting up your team assessment.'}</h1>
          <p>
            {cohort
              ? `Share the participant link with staff, then use the admin dashboard to monitor progress. The aggregate report unlocks at ${TEAM_ASSESSMENT_UNLOCK_COMPLETIONS} completed responses.`
              : 'Stripe confirmed payment. The assessment cohort is still being created; refresh this page in a moment.'}
          </p>
        </section>

        {cohort ? (
          <section className="team-purchased-grid" aria-label="Team assessment next steps">
            <article>
              <span>01</span>
              <h2>Open the dashboard</h2>
              <p>Track completions, copy the participant link, and review the aggregate report after unlock.</p>
              <Link className="team-primary-link" href={`/assessment/team/admin/${cohort.id}`}>
                Open admin dashboard
              </Link>
            </article>
            <article>
              <span>02</span>
              <h2>Share the participant link</h2>
              <p className="team-url">{participantUrl}</p>
              <div className="team-action-row">
                <TeamCopyButton text={participantUrl} label="Copy link" variant="dark" />
                <Link href={participantPath}>Open participant view</Link>
              </div>
            </article>
            <article className="team-invite-card">
              <span>03</span>
              <h2>Send this invite</h2>
              <pre>{inviteText}</pre>
              <TeamCopyButton text={inviteText} label="Copy invite" variant="gold" />
            </article>
          </section>
        ) : (
          <Link
            className="team-primary-link"
            href={`/assessment/team/purchased?session_id=${encodeURIComponent(session.id)}`}
          >
            Refresh status
          </Link>
        )}
      </main>
      <style>{`
        .team-purchased-page {
          min-height: 100vh;
          background: var(--cream);
          color: var(--ink);
        }
        .team-purchased-main {
          max-width: 1180px;
          margin: 0 auto;
          padding: 56px 28px 96px;
        }
        .team-kicker {
          margin: 0 0 14px;
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .team-purchased-hero {
          max-width: 820px;
        }
        .team-purchased-hero h1 {
          margin: 0;
          color: var(--ink);
          font-size: clamp(44px, 7vw, 80px);
          line-height: 0.96;
          letter-spacing: -0.02em;
        }
        .team-purchased-hero p,
        .team-purchased-grid p {
          color: var(--slate-600);
          font-size: 17px;
          line-height: 1.55;
        }
        .team-purchased-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 42px;
        }
        .team-purchased-grid article {
          display: grid;
          align-content: start;
          gap: 14px;
          min-height: 320px;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          background: #fff;
          padding: 24px;
          box-shadow: 0 18px 55px rgba(7, 26, 47, 0.06);
        }
        .team-purchased-grid span {
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.2em;
        }
        .team-purchased-grid h2 {
          margin: 0;
          color: var(--ink);
          font-size: 27px;
          line-height: 1.08;
        }
        .team-primary-link,
        .team-action-row a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
          min-height: 46px;
          border-radius: 12px;
          background: var(--ink);
          color: var(--cream);
          padding: 0 18px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-decoration: none;
          text-transform: uppercase;
        }
        .team-action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .team-action-row a {
          border: 1px solid var(--ink-a10);
          background: #fff;
          color: var(--ink);
        }
        .team-url {
          overflow-wrap: anywhere;
          font-size: 14px !important;
        }
        .team-invite-card {
          grid-column: span 1;
        }
        .team-invite-card pre {
          white-space: pre-wrap;
          color: var(--slate-600);
          font: 600 14px/1.55 Inter, ui-sans-serif, system-ui, sans-serif;
          margin: 0;
        }
        @media (max-width: 900px) {
          .team-purchased-main {
            padding: 38px 18px 72px;
          }
          .team-purchased-grid {
            grid-template-columns: 1fr;
          }
          .team-purchased-grid article {
            min-height: 0;
          }
        }
      `}</style>
    </div>
  );
}
