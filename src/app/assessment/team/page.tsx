import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/mockup';
import { TEAM_ASSESSMENT_MIN_SEATS } from '@/lib/team-assessment/constants';
import { isTeamAssessmentSelfServeEnabled } from '@/lib/team-assessment/self-serve';
import { TeamCheckoutForm } from './_components/TeamCheckoutForm';

export const metadata: Metadata = {
  title: 'Team AI Readiness Assessment | The AI Banking Institute',
  description:
    'An assisted 48-question AI readiness assessment for teams, departments, and institution-wide rollout planning.',
  alternates: { canonical: '/assessment/team' },
};

const ASSISTED_ROLLOUT_MAILTO =
  'mailto:hello@aibankinginstitute.com?subject=Assisted%20Team%20Assessment%20rollout';

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
        .team-assisted {
          display: grid;
          gap: 18px;
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          padding: 26px;
          box-shadow: 0 24px 70px rgba(7, 26, 47, 0.1);
        }
        .team-assisted-k {
          margin: 0;
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .team-assisted h2 {
          margin: 0;
          color: var(--ink);
          font-size: 30px;
          line-height: 1.08;
        }
        .team-assisted p {
          margin: 0;
          color: var(--slate-600);
          font-size: 15px;
          line-height: 1.55;
        }
        .team-assisted ul {
          display: grid;
          gap: 10px;
          margin: 0;
          padding: 16px 0;
          border-top: 1px solid var(--ink-a10);
          border-bottom: 1px solid var(--ink-a10);
          list-style: none;
        }
        .team-assisted li {
          display: grid;
          grid-template-columns: 16px 1fr;
          gap: 10px;
          color: var(--ink);
          font-size: 14px;
          line-height: 1.45;
        }
        .team-assisted li::before {
          content: "—";
          color: var(--gold-deep);
          font-weight: 900;
        }
        .team-assisted a {
          display: inline-flex;
          min-height: 52px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: var(--ink);
          color: var(--cream);
          padding: 0 20px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
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
          .team-detail {
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
        }
      `}</style>
    </div>
  );
}

function TeamAssistedRolloutCard(): JSX.Element {
  return (
    <aside className="team-assisted" aria-label="Request assisted team assessment rollout">
      <p className="team-assisted-k">Assisted rollout only</p>
      <h2>Start with a scoped team rollout.</h2>
      <p>
        Team Assessment checkout is intentionally gated until two production-like
        cohorts pass end-to-end QA. We set up the cohort with you instead of
        opening public self-serve payment.
      </p>
      <ul>
        <li>{TEAM_ASSESSMENT_MIN_SEATS}+ seat cohort planning</li>
        <li>Privacy threshold and department slices confirmed before launch</li>
        <li>Admin handoff, support owner, and report timing agreed up front</li>
      </ul>
      <a href={ASSISTED_ROLLOUT_MAILTO}>Request assisted rollout</a>
    </aside>
  );
}
