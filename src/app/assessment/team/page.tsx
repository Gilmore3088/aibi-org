import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/mockup';
import { TeamLeadForm } from '@/components/inquiry/TeamLeadForm';
import { TEAM_ASSESSMENT_MIN_SEATS } from '@/lib/team-assessment/constants';
import { isTeamAssessmentSelfServeEnabled } from '@/lib/team-assessment/self-serve';
import { TeamCheckoutForm } from './_components/TeamCheckoutForm';

export const metadata: Metadata = {
  title: 'Team AI Readiness Assessment | The AI Banking Institute',
  description:
    'An assisted 48-question AI readiness assessment for teams, departments, and institution-wide rollout planning.',
  alternates: { canonical: '/assessment/team' },
};

export default function TeamAssessmentPage(): JSX.Element {
  const selfServeEnabled = isTeamAssessmentSelfServeEnabled();

  return (
    <div className="mockup-scope" style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <SiteHeader activePath="/assessment" />
      <main className="team-page">
        <section className="team-hero">
          <div>
            <p className="team-kicker">Team AI readiness assessment</p>
            <h1>Map AI readiness across your team.</h1>
            <p className="team-lede">
              One shared link. Full personal reports. An aggregate department
              view after 10 completions.
            </p>
            <div className="team-proof" aria-label="Team report preview">
              <div className="team-proof-head">
                <span>Team report preview</span>
                <strong>Median readiness</strong>
              </div>
              {([
                ['Operations', 68],
                ['Compliance / Risk', 74],
                ['Lending / Credit', 58],
                ['IT / InfoSec', 81],
              ] as const).map(([label, value]) => (
                <div className="team-proof-row" key={label}>
                  <span>{label}</span>
                  <i aria-hidden="true"><b style={{ width: `${value}%` }} /></i>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
          {selfServeEnabled ? <TeamCheckoutForm /> : <TeamAssistedRolloutCard />}
        </section>

        <section className="team-packet" aria-label="Cohort launch packet">
          <div>
            <p className="team-kicker">For HR and L&D</p>
            <h2>Cohort launch packet before seats go live.</h2>
            <p>
              The assisted path gives the internal owner enough structure to launch
              a pilot without inventing the training operation from scratch.
            </p>
          </div>
          <ul>
            <li>Cohort roster template with departments, roles, sponsor, and completion owner.</li>
            <li>Manager kickoff email and participant invite copy for the first cohort.</li>
            <li>Completion tracker plus aggregate report handoff once privacy thresholds are met.</li>
          </ul>
          <Link href="#team-assessment-inquiry">Plan an L&D cohort pilot</Link>
        </section>

        <section className="team-detail" aria-label="How it works">
          {[
            ['Scope the cohort', 'We confirm sponsor, departments, seat count, privacy thresholds, and support path before any checkout link is issued.'],
            ['Share one link', 'Each participant enters work email, department, and role before the 48-question assessment.'],
            ['Unlock the report', 'At 10 completions, the aggregate report opens with department and role slices; smaller samples are marked directional.'],
          ].map(([title, body], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </section>

        <section className="team-final">
          <h2>Need the individual diagnostic instead?</h2>
          <Link href="/assessment/in-depth">View the $99 In-Depth Assessment</Link>
        </section>
      </main>

      <style>{`
        .team-page {
          max-width: 1240px;
          margin: 0 auto;
          padding: 46px 28px 96px;
        }
        .team-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(360px, 440px);
          gap: 56px;
          align-items: start;
        }
        .team-kicker {
          margin: 0 0 16px;
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
        }
        h1 {
          max-width: 720px;
          margin: 0;
          color: var(--ink);
          font-size: clamp(48px, 6.6vw, 88px);
          line-height: 0.96;
          letter-spacing: -0.02em;
        }
        .team-lede {
          max-width: 560px;
          margin: 22px 0 0;
          color: var(--slate-600);
          font-size: 19px;
          line-height: 1.5;
        }
        .team-proof {
          max-width: 560px;
          margin-top: 32px;
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 18px 60px rgba(7, 26, 47, 0.07);
        }
        .team-proof-head,
        .team-proof-row {
          display: grid;
          grid-template-columns: minmax(120px, 0.9fr) 1fr 42px;
          gap: 14px;
          align-items: center;
        }
        .team-proof-head {
          padding-bottom: 12px;
          border-bottom: 1px solid var(--ink-a10);
        }
        .team-proof-head span,
        .team-proof-head strong {
          color: var(--gold-deep);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .team-proof-head strong {
          grid-column: 2 / -1;
          color: var(--slate-600);
        }
        .team-proof-row {
          padding: 13px 0;
          border-bottom: 1px solid var(--ink-a10);
        }
        .team-proof-row:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }
        .team-proof-row span,
        .team-proof-row strong {
          color: var(--ink);
          font-size: 13px;
          font-weight: 850;
        }
        .team-proof-row i {
          display: block;
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(7, 26, 47, 0.1);
        }
        .team-proof-row b {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--gold);
        }
        .team-detail {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin-top: 56px;
          border-top: 1px solid var(--ink-a10);
          padding-top: 34px;
        }
        .team-detail article {
          padding-right: 22px;
        }
        .team-detail span {
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.22em;
        }
        .team-detail h2,
        .team-final h2 {
          margin: 16px 0 10px;
          color: var(--ink);
          font-size: 26px;
          line-height: 1.1;
        }
        .team-detail p {
          margin: 0;
          color: var(--slate-600);
          font-size: 16px;
          line-height: 1.55;
        }
        .team-packet {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr);
          gap: 32px;
          align-items: start;
          margin-top: 46px;
          border: 1px solid var(--ink-a10);
          background: #fff;
          padding: 28px;
        }
        .team-packet h2 {
          margin: 0;
          color: var(--ink);
          font-size: clamp(30px, 3.5vw, 48px);
          line-height: 1.02;
          letter-spacing: 0;
        }
        .team-packet p {
          margin: 16px 0 0;
          color: var(--slate-600);
          font-size: 16px;
          line-height: 1.55;
        }
        .team-packet ul {
          display: grid;
          gap: 12px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .team-packet li {
          display: grid;
          grid-template-columns: 16px 1fr;
          gap: 10px;
          color: var(--ink);
          font-size: 15px;
          line-height: 1.45;
        }
        .team-packet li::before {
          content: "—";
          color: var(--gold-deep);
          font-weight: 900;
        }
        .team-packet a {
          grid-column: 2;
          width: fit-content;
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          text-decoration: none;
        }
        .team-final {
          margin-top: 72px;
          padding-top: 28px;
          border-top: 1px solid var(--ink-a10);
        }
        .team-final a {
          color: var(--gold-deep);
          font-weight: 800;
        }
        @media (max-width: 900px) {
          .team-page {
            padding: 28px 18px 72px;
          }
          .team-hero,
          .team-detail,
          .team-packet {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .team-detail {
            margin-top: 56px;
          }
          h1 {
            font-size: clamp(40px, 11vw, 54px);
            line-height: 0.98;
          }
          .team-lede {
            margin-top: 16px;
            font-size: 16px;
          }
          .team-proof {
            display: none;
          }
          .team-packet a {
            grid-column: 1;
          }
        }
      `}</style>
    </div>
  );
}

function TeamAssistedRolloutCard(): JSX.Element {
  return (
    <TeamLeadForm
      id="team-assessment-inquiry"
      compact
      eyebrow="Assisted rollout"
      title="Start with a scoped team rollout."
      description={`${TEAM_ASSESSMENT_MIN_SEATS}+ seats, privacy thresholds, reporting owner, and support path are confirmed before a checkout link is issued.`}
      defaultType="team-assessment-request"
    />
  );
}
