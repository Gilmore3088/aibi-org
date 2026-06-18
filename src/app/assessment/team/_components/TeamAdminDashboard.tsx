import Link from 'next/link';
import { Wordmark } from '@/components/brand';
import {
  TEAM_ASSESSMENT_SLICE_MIN,
  TEAM_ASSESSMENT_UNLOCK_COMPLETIONS,
  labelForDepartment,
  labelForRole,
} from '@/lib/team-assessment/constants';
import {
  aggregateTeamAssessment,
  type CompletedTeamAssessmentResponse,
  type DimensionAggregate,
  type SliceAggregate,
  type TeamAssessmentAggregate,
} from '@/lib/team-assessment/aggregate';
import type { TeamAssessmentCohort } from '@/lib/team-assessment/db';
import { TeamCopyButton } from './TeamCopyButton';
import { TeamPrintButton } from './TeamPrintButton';

interface TeamAdminDashboardProps {
  readonly cohort: TeamAssessmentCohort;
  readonly responses: readonly CompletedTeamAssessmentResponse[];
  readonly participantUrl: string;
  readonly printUrl?: string;
  readonly printMode?: boolean;
}

interface DimensionAction {
  readonly outcome: string;
  readonly owner: string;
  readonly firstMove: string;
  readonly shortMove: string;
  readonly artifact: string;
  readonly evidence: string;
}

const DIMENSION_ACTIONS: Record<DimensionAggregate['id'], DimensionAction> = {
  'ai-access-architecture': {
    outcome: 'Staff know which AI tools are approved, which uses are blocked, and where exceptions go.',
    owner: 'IT / InfoSec with Compliance',
    firstMove: 'Publish a one-page approved-tool register with data-use boundaries and exception routing.',
    shortMove: 'Publish approved-tool register',
    artifact: 'Approved AI access register',
    evidence: 'Tool list, access groups, exception log, and data class rules',
  },
  'model-risk-validation': {
    outcome: 'High-impact AI use cases have repeatable testing before they reach customers or regulated decisions.',
    owner: 'Risk with line-of-business owners',
    firstMove: 'Define the validation checklist for one model-assisted workflow and assign a review cadence.',
    shortMove: 'Define validation checklist',
    artifact: 'Model and output validation checklist',
    evidence: 'Test cases, reviewer notes, defect thresholds, and sign-off history',
  },
  'compliance-explainability': {
    outcome: 'Teams can explain where AI is used, what it influenced, and what policy standard applies.',
    owner: 'Compliance with business process owners',
    firstMove: 'Map the top five AI use cases to policies, disclosures, retention rules, and reviewer roles.',
    shortMove: 'Map top five AI uses',
    artifact: 'AI compliance traceability map',
    evidence: 'Policy citations, approval notes, and customer-impact classification',
  },
  'data-security-guardrails': {
    outcome: 'Employees have clear red, yellow, and green data rules before they paste or upload anything.',
    owner: 'InfoSec with Data Governance',
    firstMove: 'Convert data classes into allowed, restricted, and blocked AI handling rules.',
    shortMove: 'Set red/yellow/green data rules',
    artifact: 'AI data handling matrix',
    evidence: 'Data classification, DLP rules, approved prompts, and exception records',
  },
  'workflow-orchestration': {
    outcome: 'AI use moves from one-off prompting to reusable, reviewed workflows.',
    owner: 'Operations with department managers',
    firstMove: 'Select one high-frequency workflow and document inputs, review points, outputs, and re-use rules.',
    shortMove: 'Document one reusable workflow',
    artifact: 'AI workflow SOP',
    evidence: 'Workflow map, saved prompt, reviewer checkpoint, and time-saved baseline',
  },
  'bounded-autonomy-human-review': {
    outcome: 'People know when AI can draft, when it can recommend, and when a human must decide.',
    owner: 'Risk with department leaders',
    firstMove: 'Create a checkpoint matrix for low, moderate, and high-impact use cases.',
    shortMove: 'Set human-review checkpoints',
    artifact: 'Human review checkpoint matrix',
    evidence: 'Approval thresholds, reviewer roles, escalations, and exception examples',
  },
  'vendor-risk-interoperability': {
    outcome: 'Vendor AI capabilities are inventoried before teams rely on embedded automation.',
    owner: 'Vendor Management with IT',
    firstMove: 'Inventory AI features inside core, CRM, lending, fraud, marketing, and productivity platforms.',
    shortMove: 'Inventory vendor AI features',
    artifact: 'AI vendor inventory',
    evidence: 'Vendor attestations, data flow notes, contract terms, and interoperability constraints',
  },
  'governance-roles-human-capital': {
    outcome: 'AI ownership is visible by role, not trapped in a single champion or informal committee.',
    owner: 'Executive sponsor with Training / HR',
    firstMove: 'Name accountable owners for policy, tool approval, training, monitoring, and workflow review.',
    shortMove: 'Name owners and training path',
    artifact: 'AI roles and training map',
    evidence: 'Owner roster, training completion, meeting cadence, and adoption metrics',
  },
};

export function TeamAdminDashboard({
  cohort,
  responses,
  participantUrl,
  printUrl,
  printMode = false,
}: TeamAdminDashboardProps): JSX.Element {
  const aggregate = aggregateTeamAssessment(responses);
  const remainingToUnlock = Math.max(
    0,
    TEAM_ASSESSMENT_UNLOCK_COMPLETIONS - aggregate.completionCount,
  );
  const completionPct =
    cohort.seats_purchased > 0
      ? Math.min(100, Math.round((aggregate.completionCount / cohort.seats_purchased) * 100))
      : 0;
  const representedDepartments = new Set(
    responses.map((response) => labelForDepartment(response.department, response.department_other)),
  ).size;
  const directionalDepartmentCount = aggregate.departments.filter((slice) => slice.lowConfidence).length;
  const directionalRoleCount = aggregate.roles.filter((slice) => slice.lowConfidence).length;
  const inviteText = `Please complete the Team AI Readiness Assessment for ${cohort.institution_name}.

It takes about 12-15 minutes. You will receive a personal report. The organization sees aggregate results after the completion threshold is met. Department and role slices with fewer than ${TEAM_ASSESSMENT_SLICE_MIN} completions are marked directional.

Start here:
${participantUrl}`;
  const sharePanel = !printMode ? (
    <section className="share-panel" aria-label="Participant invitation">
      <div className="share-link-block">
        <p className="kicker">Participant link</p>
        <h2>Send one link to every participant.</h2>
        <code>{participantUrl}</code>
        <div className="share-actions">
          <TeamCopyButton text={participantUrl} label="Copy link" variant="dark" />
          <Link href={participantUrl}>Open participant view</Link>
        </div>
      </div>
      <div className="share-invite">
        <div>
          <p className="kicker">Invite copy</p>
          <pre>{inviteText}</pre>
        </div>
        <TeamCopyButton text={inviteText} label="Copy invite" variant="gold" />
      </div>
    </section>
  ) : null;

  return (
    <main className={`team-admin ${printMode ? 'is-print' : ''}`}>
      <div className="team-admin-brandbar">
        <Link href="/" aria-label="The AI Banking Institute home">
          <Wordmark variant="full" tone="dark" size={22} />
        </Link>
        <span>Team AI Readiness Assessment</span>
      </div>
      <header className="team-admin-top">
        <div>
          <p className="kicker">Admin dashboard</p>
          <h1>{cohort.institution_name}</h1>
          <p className="sub">
            {aggregate.completionCount} of {cohort.seats_purchased} seats completed.
            {aggregate.unlocked
              ? ' Aggregate report unlocked.'
              : ` ${remainingToUnlock} more completed responses needed to unlock.`}
          </p>
        </div>
        {printMode ? (
          <div className="top-actions">
            <TeamPrintButton />
          </div>
        ) : (
          <div className="top-actions">
            {printUrl && <Link href={printUrl}>Preview PDF</Link>}
          </div>
        )}
      </header>

      {!aggregate.unlocked && sharePanel}

      <section className="progress-panel" aria-label="Completion progress">
        <div className="metric">
          <span>{aggregate.completionCount}</span>
          <small>Completed</small>
        </div>
        <div className="metric">
          <span>{cohort.seats_purchased}</span>
          <small>Seats</small>
        </div>
        <div className="metric">
          <span>{completionPct}%</span>
          <small>Seat usage</small>
        </div>
        <div className="metric">
          <span>{aggregate.unlocked ? representedDepartments : remainingToUnlock}</span>
          <small>{aggregate.unlocked ? 'Departments' : 'Needed'}</small>
        </div>
        <div className="progress-track" aria-hidden="true">
          <i style={{ width: `${completionPct}%` }} />
        </div>
      </section>

      {!aggregate.unlocked ? (
        <>
          <ParticipantRoster cohort={cohort} responses={responses} />
          <section className="locked-panel">
            <p className="kicker">Aggregate locked</p>
            <h2>Keep collecting responses.</h2>
            <p>
              The team dashboard opens at {TEAM_ASSESSMENT_UNLOCK_COMPLETIONS} completions.
              Department and role slices with fewer than {TEAM_ASSESSMENT_SLICE_MIN}
              completions will be marked directional so admins can still see where follow-up is needed.
            </p>
            <div className="privacy-note">
              <strong>{representedDepartments || 0}</strong>
              <span>departments represented so far. Invite broad participation to make the aggregate view useful after unlock.</span>
            </div>
          </section>
        </>
      ) : (
        <>
          <TeamCommandCenter aggregate={aggregate} cohort={cohort} responses={responses} />

          <ParticipantRoster cohort={cohort} responses={responses} />

          <TeamActionQueue dimensions={aggregate.weakestDimensions} />

          <TeamComparisonBoard
            aggregate={aggregate}
            directionalDepartmentCount={directionalDepartmentCount}
            directionalRoleCount={directionalRoleCount}
          />

          <FacilitationKit
            focus={aggregate.weakestDimensions[0] ?? null}
            participantUrl={participantUrl}
            printUrl={printUrl}
          />

          <section className="detail-drawer-section" aria-labelledby="detail-drawer-heading">
            <details className="detail-drawer" open={printMode}>
              <summary>
                <span id="detail-drawer-heading">Detailed score tables</span>
                <small>Dimensions, departments, roles</small>
              </summary>
              <div className="detail-stack">
                <section aria-labelledby="dimensions-heading">
                  <SectionHeading
                    id="dimensions-heading"
                    eyebrow="Eight dimensions"
                    title="Dimension scores."
                  />
                  <DimensionTable dimensions={aggregate.dimensions} />
                </section>
                <section aria-labelledby="departments-heading">
                  <SectionHeading
                    id="departments-heading"
                    eyebrow="Departments"
                    title="Department scores."
                  />
                  <SliceTable slices={aggregate.departments} />
                </section>
                <section aria-labelledby="roles-heading">
                  <SectionHeading
                    id="roles-heading"
                    eyebrow="Roles"
                    title="Role scores."
                  />
                  <SliceTable slices={aggregate.roles} />
                </section>
              </div>
            </details>
          </section>

          {sharePanel}
        </>
      )}

      <style>{`
        .team-admin {
          min-height: 100vh;
          background: var(--cream);
          color: var(--ink);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          padding: 38px 28px 88px;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .team-admin-brandbar,
        .team-admin-top,
        .share-panel,
        .progress-panel,
        .command-center,
        .action-queue,
        .comparison-board,
        .facilitation-kit,
        .detail-drawer-section,
        .score-grid,
        .report-brief,
        .priority-brief,
        .slice-plays,
        .roster-section,
        .heatmap-section,
        .table-section,
        .locked-panel,
        .action-plan,
        .cadence-panel {
          max-width: 1180px;
          margin-left: auto;
          margin-right: auto;
        }
        .team-admin-brandbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 34px;
        }
        .team-admin-brandbar span {
          color: var(--slate-600);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .team-admin-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 28px;
          margin-bottom: 26px;
        }
        .kicker {
          margin: 0 0 10px;
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .team-admin h1 {
          margin: 0;
          color: var(--ink);
          font-size: clamp(42px, 6vw, 74px);
          line-height: 0.98;
          letter-spacing: -0.02em;
        }
        .sub {
          margin: 14px 0 0;
          color: var(--slate-600);
          font-size: 17px;
          line-height: 1.5;
        }
        .top-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .top-actions a,
        .share-actions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          border: 1px solid var(--ink-a10);
          border-radius: 12px;
          background: #fff;
          color: var(--ink);
          padding: 0 18px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
        }
        .share-panel {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 24px;
          align-items: stretch;
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 20px;
        }
        .cadence-panel + .share-panel,
        .detail-drawer-section + .share-panel {
          margin-top: 34px;
        }
        .share-link-block,
        .share-invite {
          display: grid;
          align-content: start;
          gap: 14px;
          min-width: 0;
        }
        .share-link-block h2 {
          margin: 0;
          color: var(--ink);
          font-size: 26px;
          line-height: 1.08;
        }
        .share-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .share-invite {
          border-left: 1px solid var(--ink-a10);
          padding-left: 24px;
        }
        .share-invite pre {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          margin: 0;
          color: var(--slate-600);
          font: 600 14px/1.5 Inter, ui-sans-serif, system-ui, sans-serif;
        }
        .team-admin code {
          display: block;
          max-width: 760px;
          overflow-wrap: anywhere;
          color: var(--slate-600);
          font-size: 14px;
        }
        .progress-panel {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 42px;
        }
        .metric {
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          padding: 22px;
        }
        .metric span {
          display: block;
          color: var(--ink);
          font-size: 42px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .metric small {
          display: block;
          margin-top: 8px;
          color: var(--slate-600);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .progress-track {
          grid-column: 1 / -1;
          height: 12px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(7, 26, 47, 0.1);
        }
        .progress-track i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--gold);
        }
        .locked-panel,
        .command-center,
        .action-queue,
        .comparison-board,
        .facilitation-kit,
        .detail-drawer-section,
        .report-brief,
        .priority-brief,
        .slice-plays,
        .roster-section,
        .heatmap-section,
        .table-section,
        .action-plan,
        .cadence-panel {
          margin-top: 34px;
          border-top: 1px solid var(--ink-a10);
          padding-top: 30px;
        }
        .locked-panel h2,
        .section-heading h2 {
          margin: 0;
          color: var(--ink);
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.05;
        }
        .locked-panel p,
        .section-heading p,
        .action-plan p,
        .report-brief p,
        .priority-matrix p,
        .slice-playbook p,
        .roster-section p,
        .cadence-panel p {
          color: var(--slate-600);
          font-size: 16px;
          line-height: 1.55;
        }
        .privacy-note {
          display: flex;
          gap: 16px;
          align-items: center;
          max-width: 760px;
          margin: 24px 0;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          background: #fff;
          padding: 18px;
        }
        .privacy-note strong {
          color: var(--gold-deep);
          font-size: 40px;
          line-height: 1;
        }
        .privacy-note span,
        .privacy-copy {
          color: var(--slate-600);
          font-size: 14px;
          line-height: 1.5;
        }
        .command-center {
          display: grid;
          grid-template-columns: minmax(220px, 0.78fr) minmax(0, 1.2fr) minmax(260px, 0.9fr);
          gap: 18px;
          align-items: stretch;
        }
        .command-score,
        .command-panel,
        .comparison-stat,
        .comparison-list,
        .kit-panel,
        .detail-drawer {
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
        }
        .command-score,
        .command-panel {
          padding: 24px;
        }
        .command-score-value {
          display: block;
          margin: 0;
          color: var(--ink);
          font-size: 92px;
          line-height: 0.86;
          letter-spacing: -0.04em;
        }
        .command-score strong,
        .command-panel h3,
        .kit-panel h3 {
          display: block;
          margin: 12px 0 0;
          color: var(--ink);
          font-size: 24px;
          line-height: 1.08;
        }
        .command-score span,
        .command-facts dt,
        .signal-row span,
        .comparison-stat span,
        .kit-panel span {
          color: var(--slate-600);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .command-score span {
          display: block;
          margin-top: 12px;
        }
        .command-facts,
        .signal-stack {
          display: grid;
          gap: 1px;
          margin: 18px 0 0;
          overflow: hidden;
          border: 1px solid var(--ink-a10);
          border-radius: 14px;
          background: var(--ink-a10);
        }
        .command-facts div,
        .signal-row {
          display: grid;
          grid-template-columns: 110px minmax(0, 1fr);
          gap: 14px;
          align-items: center;
          background: #fff;
          padding: 14px;
        }
        .command-facts dt,
        .command-facts dd {
          margin: 0;
        }
        .command-facts dd,
        .signal-row strong {
          color: var(--ink);
          font-size: 15px;
          font-weight: 850;
          line-height: 1.3;
        }
        .action-queue,
        .comparison-board,
        .facilitation-kit {
          display: grid;
          gap: 20px;
        }
        .action-board {
          display: grid;
          overflow: hidden;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          background: #fff;
        }
        .action-board-head,
        .action-board-row {
          display: grid;
          grid-template-columns: 120px minmax(180px, 0.8fr) minmax(150px, 0.8fr) minmax(240px, 1.3fr) minmax(160px, 0.85fr);
          min-width: 0;
        }
        .action-board-head {
          background: rgba(7, 26, 47, 0.06);
        }
        .action-board-head span {
          color: var(--slate-600);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          padding: 14px 16px;
          text-transform: uppercase;
        }
        .action-board-row {
          border-top: 1px solid var(--ink-a10);
        }
        .action-cell {
          min-width: 0;
          border-left: 1px solid var(--ink-a10);
          color: var(--ink);
          font-size: 14px;
          font-weight: 760;
          line-height: 1.35;
          overflow-wrap: anywhere;
          padding: 16px;
        }
        .action-cell:first-child {
          border-left: 0;
        }
        .action-cell strong,
        .action-cell small,
        .phase-cell span,
        .phase-cell i {
          display: block;
        }
        .action-cell strong {
          color: var(--ink);
          font-size: 16px;
          line-height: 1.18;
        }
        .action-cell small {
          margin-top: 6px;
          color: var(--slate-600);
          font-size: 12px;
          font-weight: 800;
        }
        .phase-cell span {
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .phase-cell i {
          width: max-content;
          margin-top: 10px;
          border-radius: 999px;
          background: rgba(200, 162, 74, 0.2);
          color: var(--ink);
          font-size: 10px;
          font-style: normal;
          font-weight: 900;
          letter-spacing: 0.1em;
          padding: 7px 10px;
          text-transform: uppercase;
        }
        .comparison-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .comparison-stat {
          padding: 18px;
        }
        .comparison-stat strong {
          display: block;
          margin-top: 10px;
          color: var(--ink);
          font-size: 21px;
          line-height: 1.12;
        }
        .comparison-grid,
        .kit-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .comparison-list {
          padding: 20px;
        }
        .comparison-rows {
          display: grid;
          gap: 1px;
          overflow: hidden;
          border: 1px solid var(--ink-a10);
          border-radius: 14px;
          background: var(--ink-a10);
        }
        .comparison-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 54px 112px;
          gap: 12px;
          align-items: center;
          background: #fff;
          padding: 13px;
        }
        .comparison-row strong,
        .comparison-row span {
          display: block;
        }
        .comparison-row strong {
          color: var(--ink);
          font-size: 15px;
          line-height: 1.18;
        }
        .comparison-row span {
          margin-top: 5px;
          color: var(--slate-600);
          font-size: 12px;
          font-weight: 700;
          line-height: 1.25;
        }
        .comparison-row b {
          color: var(--gold-deep);
          font-size: 26px;
          line-height: 1;
          text-align: right;
        }
        .comparison-row i {
          justify-self: end;
          border-radius: 999px;
          background: rgba(7, 26, 47, 0.08);
          color: var(--slate-600);
          font-size: 10px;
          font-style: normal;
          font-weight: 900;
          letter-spacing: 0.08em;
          padding: 7px 9px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .kit-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .kit-panel {
          display: grid;
          gap: 12px;
          align-content: start;
          padding: 20px;
        }
        .kit-panel h3 {
          margin-top: 0;
          font-size: 22px;
        }
        .kit-panel p {
          margin: 0;
          color: var(--slate-600);
          font-size: 14px;
          line-height: 1.4;
        }
        .kit-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          width: max-content;
          border: 1px solid var(--ink-a10);
          border-radius: 12px;
          background: #fff;
          color: var(--ink);
          padding: 0 18px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-decoration: none;
          text-transform: uppercase;
        }
        .kit-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .detail-drawer {
          overflow: hidden;
        }
        .detail-drawer summary {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          cursor: pointer;
          list-style: none;
          padding: 22px 24px;
        }
        .detail-drawer summary::-webkit-details-marker {
          display: none;
        }
        .detail-drawer summary span {
          color: var(--ink);
          font-size: 26px;
          font-weight: 900;
          line-height: 1.1;
        }
        .detail-drawer summary small {
          color: var(--slate-600);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .detail-stack {
          display: grid;
          gap: 28px;
          border-top: 1px solid var(--ink-a10);
          padding: 24px;
        }
        .score-grid {
          display: grid;
          grid-template-columns: minmax(260px, 0.85fr) 1fr 1fr;
          gap: 18px;
        }
        .score-hero,
        .mini-list {
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          padding: 24px;
        }
        .score-hero strong {
          display: block;
          color: var(--ink);
          font-size: 86px;
          line-height: 0.9;
          letter-spacing: -0.04em;
        }
        .score-hero span {
          display: block;
          margin-top: 12px;
          color: var(--ink);
          font-size: 22px;
          font-weight: 900;
        }
        .score-hero small {
          display: block;
          margin-top: 10px;
          color: var(--slate-600);
          font-size: 14px;
          line-height: 1.45;
        }
        .mini-list-rows {
          display: grid;
          gap: 1px;
          overflow: hidden;
          border: 1px solid var(--ink-a10);
          border-radius: 14px;
          background: var(--ink-a10);
        }
        .mini-list-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: center;
          background: #fff;
          padding: 14px;
        }
        .mini-list-row span {
          color: var(--ink);
          font-size: 14px;
          font-weight: 800;
          line-height: 1.3;
        }
        .mini-list-row strong {
          color: var(--gold-deep);
          font-size: 22px;
          line-height: 1;
        }
        .report-brief {
          display: grid;
          grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.1fr);
          gap: 28px;
          align-items: stretch;
        }
        .brief-panel {
          background: var(--ink);
          color: var(--cream);
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 18px 60px rgba(7, 26, 47, 0.14);
        }
        .brief-panel .kicker {
          color: var(--gold);
        }
        .brief-panel h2 {
          margin: 0;
          color: var(--cream);
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1.04;
          letter-spacing: 0;
        }
        .brief-panel p {
          color: rgba(247, 243, 234, 0.78);
          margin-bottom: 0;
        }
        .brief-facts {
          display: grid;
          gap: 1px;
          overflow: hidden;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          background: var(--ink-a10);
        }
        .brief-facts div {
          display: grid;
          grid-template-columns: 170px 1fr;
          gap: 18px;
          background: #fff;
          padding: 18px 20px;
        }
        .brief-facts span {
          color: var(--gold-deep);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .brief-facts strong {
          color: var(--ink);
          font-size: 18px;
          line-height: 1.25;
        }
        .priority-brief {
          display: grid;
          gap: 20px;
        }
        .priority-matrix {
          display: grid;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          background: #fff;
          overflow: hidden;
        }
        .priority-matrix-head,
        .priority-matrix-row {
          display: grid;
          grid-template-columns: minmax(220px, 1.35fr) minmax(120px, 0.75fr) minmax(180px, 1.05fr) minmax(150px, 0.85fr) minmax(180px, 1fr);
          align-items: stretch;
          min-width: 0;
        }
        .priority-matrix-head {
          background: rgba(7, 26, 47, 0.06);
        }
        .priority-matrix-head span {
          color: var(--slate-600);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          padding: 14px 16px;
          text-transform: uppercase;
        }
        .priority-matrix-row {
          border-top: 1px solid var(--ink-a10);
        }
        .priority-cell {
          color: var(--ink);
          font-size: 14px;
          font-weight: 750;
          line-height: 1.4;
          overflow-wrap: anywhere;
          padding: 18px 16px;
          border-left: 1px solid var(--ink-a10);
        }
        .priority-cell:first-child {
          border-left: 0;
        }
        .priority-focus {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 14px;
        }
        .priority-rank {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: var(--gold);
          color: var(--ink);
          font-size: 14px;
          font-weight: 900;
        }
        .priority-focus h3,
        .slice-playbook h3,
        .roster-section h3,
        .cadence-panel h3 {
          margin: 0;
          color: var(--ink);
          font-size: 24px;
          line-height: 1.12;
          letter-spacing: 0;
        }
        .priority-focus p {
          margin: 8px 0 0;
          font-size: 14px;
          line-height: 1.45;
        }
        .priority-focus small {
          display: block;
          margin-top: 10px;
          color: var(--slate-600);
          font-size: 13px;
          font-weight: 800;
          line-height: 1.35;
        }
        .slice-plays {
          display: grid;
          gap: 22px;
        }
        .slice-plays-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .slice-playbook {
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          padding: 22px;
        }
        .slice-playbook-list {
          display: grid;
          gap: 14px;
          margin-top: 18px;
        }
        .slice-play {
          display: grid;
          gap: 8px;
          padding-top: 14px;
          border-top: 1px solid var(--ink-a10);
        }
        .slice-play:first-child {
          padding-top: 0;
          border-top: 0;
        }
        .slice-play-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: baseline;
        }
        .slice-play-top strong {
          color: var(--ink);
          font-size: 18px;
          line-height: 1.2;
        }
        .slice-play-top span {
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .slice-play p {
          margin: 0;
          font-size: 14px;
        }
        .roster-section {
          display: grid;
          gap: 20px;
        }
        .roster-section .section-heading h2 {
          font-size: clamp(24px, 3vw, 34px);
        }
        .roster-summary {
          display: grid;
          grid-template-columns: 150px 150px minmax(0, 1fr);
          gap: 14px;
          align-items: stretch;
        }
        .roster-summary div,
        .roster-summary p {
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 16px;
          margin: 0;
          padding: 18px;
        }
        .roster-summary strong,
        .roster-summary span {
          display: block;
        }
        .roster-summary strong {
          color: var(--ink);
          font-size: 42px;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .roster-summary span {
          margin-top: 8px;
          color: var(--slate-600);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .roster-summary p {
          color: var(--slate-600);
          font-size: 15px;
          line-height: 1.5;
        }
        .roster-wrap {
          overflow-x: auto;
        }
        .roster-drawer {
          overflow: hidden;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          background: #fff;
        }
        .roster-drawer summary {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          cursor: pointer;
          list-style: none;
          padding: 18px 20px;
        }
        .roster-drawer summary::-webkit-details-marker {
          display: none;
        }
        .roster-drawer summary span {
          color: var(--ink);
          font-size: 18px;
          font-weight: 900;
          line-height: 1.15;
        }
        .roster-drawer summary small {
          color: var(--slate-600);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .roster-drawer[open] .roster-wrap {
          border-top: 1px solid var(--ink-a10);
        }
        .team-admin .roster-table {
          min-width: 880px;
        }
        .status-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          border-radius: 999px;
          background: rgba(7, 26, 47, 0.08);
          color: var(--slate-600);
          padding: 0 12px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .status-chip.is-complete {
          background: rgba(200, 162, 74, 0.22);
          color: var(--ink);
        }
        .sample-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          border-radius: 999px;
          padding: 0 10px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .sample-chip.is-stable {
          background: rgba(200, 162, 74, 0.2);
          color: var(--ink);
        }
        .sample-chip.is-directional {
          background: rgba(7, 26, 47, 0.08);
          color: var(--slate-600);
        }
        .open-seat-row td {
          background: rgba(255, 252, 246, 0.58);
        }
        .cadence-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
          gap: 18px;
          margin-top: 20px;
        }
        .cadence-steps,
        .artifact-stack {
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          padding: 22px;
        }
        .cadence-steps {
          display: grid;
          gap: 1px;
        }
        .cadence-row {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 20px;
          padding: 16px 0;
          border-bottom: 1px solid var(--ink-a10);
        }
        .cadence-row:last-child {
          border-bottom: 0;
        }
        .cadence-row span {
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .cadence-row strong {
          display: block;
          color: var(--ink);
          font-size: 18px;
          line-height: 1.25;
        }
        .cadence-row p {
          margin: 6px 0 0;
          font-size: 14px;
        }
        .artifact-stack ul {
          display: grid;
          gap: 12px;
          margin: 16px 0 0;
          padding: 0;
          list-style: none;
        }
        .artifact-stack li {
          color: var(--ink);
          font-size: 14px;
          font-weight: 750;
          line-height: 1.35;
          padding-left: 16px;
          position: relative;
        }
        .artifact-stack li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--gold);
        }
        .heatmap-wrap,
        .table-wrap {
          width: 100%;
          overflow-x: auto;
        }
        .heatmap {
          min-width: 840px;
          display: grid;
          gap: 8px;
          margin-top: 18px;
        }
        .heatmap-row {
          display: grid;
          grid-template-columns: 210px repeat(8, minmax(70px, 1fr));
          gap: 8px;
          align-items: stretch;
        }
        .heatmap-cell,
        .heatmap-label {
          border-radius: 12px;
          padding: 10px;
          min-height: 52px;
        }
        .heatmap-head .heatmap-cell,
        .heatmap-label {
          background: rgba(7, 26, 47, 0.06);
          color: var(--slate-600);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .heatmap-label {
          display: grid;
          align-content: center;
          gap: 4px;
          color: var(--ink);
          letter-spacing: 0;
          text-transform: none;
        }
        .heatmap-label strong {
          color: var(--ink);
          font-size: 12px;
          line-height: 1.15;
        }
        .heatmap-label small {
          color: var(--slate-600);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.08em;
          line-height: 1.2;
          text-transform: uppercase;
        }
        .heatmap-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ink);
          font-size: 14px;
          font-weight: 900;
        }
        .team-admin table {
          width: 100%;
          min-width: 820px;
          border-collapse: collapse;
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          overflow: hidden;
        }
        .team-admin th,
        .team-admin td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--ink-a10);
          text-align: left;
          vertical-align: middle;
        }
        .team-admin th {
          color: var(--slate-600);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .team-admin td {
          color: var(--ink);
          font-size: 14px;
          font-weight: 700;
        }
        .team-admin tr:last-child td {
          border-bottom: 0;
        }
        .bar {
          min-width: 160px;
          height: 10px;
          border-radius: 999px;
          background: rgba(7, 26, 47, 0.1);
          overflow: hidden;
        }
        .bar i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--gold);
        }
        .muted {
          color: var(--slate-600);
          font-weight: 600;
        }
        .action-plan {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .action-plan .section-heading {
          grid-column: 1 / -1;
        }
        .action-plan article {
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 18px;
          padding: 22px;
        }
        .action-plan article span {
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .action-plan h3 {
          margin: 14px 0 8px;
          color: var(--ink);
          font-size: 23px;
          line-height: 1.12;
        }
        @media (max-width: 900px) {
          .team-admin {
            padding: 28px 18px 72px;
          }
          .team-admin-top,
          .share-panel {
            flex-direction: column;
            align-items: stretch;
          }
          .team-admin-brandbar {
            align-items: flex-start;
            flex-direction: column;
          }
          .share-panel {
            display: grid;
            grid-template-columns: 1fr;
          }
          .share-invite {
            border-left: 0;
            border-top: 1px solid var(--ink-a10);
            padding-left: 0;
            padding-top: 22px;
          }
          .top-actions {
            flex-wrap: wrap;
          }
          .priority-matrix {
            overflow-x: auto;
            overflow-y: hidden;
          }
          .priority-matrix-head,
          .priority-matrix-row {
            min-width: 920px;
          }
          .action-board {
            overflow-x: auto;
            overflow-y: hidden;
          }
          .action-board-head,
          .action-board-row {
            min-width: 980px;
          }
          .progress-panel,
          .command-center,
          .comparison-strip,
          .comparison-grid,
          .kit-grid,
          .score-grid,
          .report-brief,
          .slice-plays-grid,
          .roster-summary,
          .cadence-grid,
          .action-plan {
            grid-template-columns: 1fr;
          }
          .brief-facts div,
          .cadence-row {
            grid-template-columns: 1fr;
            gap: 6px;
          }
          .slice-play-top {
            align-items: flex-start;
            flex-direction: column;
            gap: 6px;
          }
        }
        @media print {
          .team-admin {
            background: #fff;
            padding: 0;
          }
          .share-panel,
          .top-actions {
            display: none;
          }
          .team-admin-top,
          .progress-panel,
          .score-grid,
          .heatmap-section,
          .table-section,
          .report-brief,
          .priority-brief,
          .slice-plays,
          .roster-section,
          .action-plan,
          .cadence-panel {
            max-width: none;
            page-break-inside: avoid;
          }
          .score-grid,
          .progress-panel,
          .command-center,
          .comparison-strip,
          .comparison-grid,
          .kit-grid,
          .action-plan {
            grid-template-columns: repeat(3, 1fr);
          }
          .report-brief,
          .slice-plays-grid,
          .roster-summary,
          .cadence-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
}: {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
}): JSX.Element {
  return (
    <div className="section-heading">
      <p className="kicker">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

function TeamCommandCenter({
  aggregate,
  cohort,
  responses,
}: {
  readonly aggregate: TeamAssessmentAggregate;
  readonly cohort: TeamAssessmentCohort;
  readonly responses: readonly CompletedTeamAssessmentResponse[];
}): JSX.Element {
  const weakest = aggregate.weakestDimensions[0] ?? null;
  const strongest = aggregate.strongestDimensions[0] ?? null;
  const widest = getWidestDimension(aggregate.dimensions);
  const focus = weakest ? dimensionActionFor(weakest) : null;
  const lowestDepartment = lowestSlice(aggregate.departments);
  const strongestDepartment = strongestSlice(aggregate.departments);
  const completionPct =
    cohort.seats_purchased > 0
      ? Math.min(100, Math.round((responses.length / cohort.seats_purchased) * 100))
      : 0;

  return (
    <section className="command-center" aria-labelledby="command-center-heading">
      <div className="command-score">
        <p className="kicker">Command center</p>
        <h2 id="command-center-heading" className="sr-only">Team readiness command center</h2>
        <strong className="command-score-value">{aggregate.overall?.median ?? 0}</strong>
        <strong>{aggregate.overall?.band.label ?? 'Not scored'}</strong>
        <span>
          {responses.length}/{cohort.seats_purchased} complete · {completionPct}% seat usage
        </span>
      </div>
      <div className="command-panel">
        <p className="kicker">Next decision</p>
        <h3>{focus?.artifact ?? 'Name the first control artifact'}</h3>
        <dl className="command-facts">
          <div>
            <dt>Gap</dt>
            <dd>{weakest ? `${weakest.label} · ${weakest.median}` : 'Not available'}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{focus?.owner ?? 'Assign owner'}</dd>
          </div>
          <div>
            <dt>First move</dt>
            <dd>{focus?.shortMove ?? 'Choose one governed workflow.'}</dd>
          </div>
        </dl>
      </div>
      <div className="command-panel">
        <p className="kicker">Team signal</p>
        <div className="signal-stack">
          <SignalRow label="Borrow from" value={strongestDepartment ? `${strongestDepartment.label} · ${strongestDepartment.median}` : strongest?.label ?? 'Not available'} />
          <SignalRow label="Work first" value={lowestDepartment ? `${lowestDepartment.label} · ${lowestDepartment.median}` : weakest?.label ?? 'Not available'} />
          <SignalRow label="Alignment watch" value={widest ? `${widest.label} · spread ${widest.p25}-${widest.p75}` : 'Not available'} />
        </div>
      </div>
    </section>
  );
}

function SignalRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): JSX.Element {
  return (
    <div className="signal-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TeamActionQueue({
  dimensions,
}: {
  readonly dimensions: readonly DimensionAggregate[];
}): JSX.Element {
  return (
    <section className="action-queue" aria-labelledby="action-queue-heading">
      <SectionHeading
        id="action-queue-heading"
        eyebrow="Execution queue"
        title="What leadership should run next."
      />
      <div className="action-board" role="table" aria-label="Team execution queue">
        <div className="action-board-head" role="row">
          <span role="columnheader">Phase</span>
          <span role="columnheader">Gap</span>
          <span role="columnheader">Owner</span>
          <span role="columnheader">Move</span>
          <span role="columnheader">Output</span>
        </div>
        {dimensions.map((dimension, index) => (
          <ActionQueueRow key={dimension.id} dimension={dimension} index={index} />
        ))}
      </div>
    </section>
  );
}

function ActionQueueRow({
  dimension,
  index,
}: {
  readonly dimension: DimensionAggregate;
  readonly index: number;
}): JSX.Element {
  const action = dimensionActionFor(dimension);
  const phases = ['Week 1', 'Days 8-30', 'Days 31-60'] as const;
  return (
    <div className="action-board-row" role="row">
      <div className="action-cell phase-cell" role="cell">
        <span>{phases[index] ?? 'Next'}</span>
        <i>Ready</i>
      </div>
      <div className="action-cell" role="cell">
        <strong>{dimension.label}</strong>
        <small>Median {dimension.median}</small>
      </div>
      <div className="action-cell" role="cell">{action.owner}</div>
      <div className="action-cell" role="cell">{action.shortMove}</div>
      <div className="action-cell" role="cell">{action.artifact}</div>
    </div>
  );
}

function TeamComparisonBoard({
  aggregate,
  directionalDepartmentCount,
  directionalRoleCount,
}: {
  readonly aggregate: TeamAssessmentAggregate;
  readonly directionalDepartmentCount: number;
  readonly directionalRoleCount: number;
}): JSX.Element {
  const roleLow = lowestSlice(aggregate.roles);
  const roleHigh = strongestSlice(aggregate.roles);
  const roleSpread = roleLow && roleHigh ? roleHigh.median - roleLow.median : 0;

  return (
    <section className="comparison-board" aria-labelledby="comparison-heading">
      <SectionHeading
        id="comparison-heading"
        eyebrow="Compare teams"
        title="Where readiness differs."
      />
      <div className="comparison-strip">
        <ComparisonStat label="Lowest department" value={lowestSlice(aggregate.departments)?.label ?? 'Not available'} />
        <ComparisonStat label="Strongest department" value={strongestSlice(aggregate.departments)?.label ?? 'Not available'} />
        <ComparisonStat label="Role spread" value={roleSpread > 0 ? `${roleSpread} pts` : 'Not available'} />
        <ComparisonStat
          label="Directional slices"
          value={`${directionalDepartmentCount + directionalRoleCount}`}
        />
      </div>
      <DepartmentHeatmap slices={aggregate.departments} />
      {(directionalDepartmentCount > 0 || directionalRoleCount > 0) && (
        <p className="privacy-copy">
          Directional sample: {directionalDepartmentCount} department slice
          {directionalDepartmentCount === 1 ? '' : 's'} and {directionalRoleCount} role slice
          {directionalRoleCount === 1 ? '' : 's'} below {TEAM_ASSESSMENT_SLICE_MIN} completions.
        </p>
      )}
      <div className="comparison-grid">
        <ComparisonList title="Department queue" slices={aggregate.departments} />
        <ComparisonList title="Role queue" slices={aggregate.roles} />
      </div>
    </section>
  );
}

function ComparisonStat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): JSX.Element {
  return (
    <div className="comparison-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ComparisonList({
  title,
  slices,
}: {
  readonly title: string;
  readonly slices: readonly SliceAggregate[];
}): JSX.Element {
  const sorted = sortSlicesByMedian(slices).slice(0, 5);
  return (
    <article className="comparison-list">
      <p className="kicker">{title}</p>
      <div className="comparison-rows">
        {sorted.map((slice) => (
          <div className="comparison-row" key={slice.id}>
            <div>
              <strong>{slice.label}</strong>
              <span>{slice.weakest?.label ?? 'No dimension signal'}</span>
            </div>
            <b>{slice.median}</b>
            <i>{slice.lowConfidence ? 'Directional' : 'Stable'}</i>
          </div>
        ))}
      </div>
    </article>
  );
}

function FacilitationKit({
  focus,
  participantUrl,
  printUrl,
}: {
  readonly focus: DimensionAggregate | null;
  readonly participantUrl: string;
  readonly printUrl?: string;
}): JSX.Element {
  const action = focus ? dimensionActionFor(focus) : null;
  const agenda = buildLeadershipAgenda(focus, action);
  const workshop = buildWorkshopAgenda(focus, action);

  return (
    <section className="facilitation-kit" aria-labelledby="facilitation-heading">
      <SectionHeading
        id="facilitation-heading"
        eyebrow="Facilitation kit"
        title="Turn the dashboard into work."
      />
      <div className="kit-grid">
        <article className="kit-panel">
          <span>60 min</span>
          <h3>Leadership readout</h3>
          <p>Score, gap, owner, first artifact.</p>
          <TeamCopyButton text={agenda} label="Copy agenda" variant="dark" />
        </article>
        <article className="kit-panel">
          <span>45 min</span>
          <h3>Department workshop</h3>
          <p>Lowest slice, blocker, first control.</p>
          <TeamCopyButton text={workshop} label="Copy workshop" variant="light" />
        </article>
        <article className="kit-panel">
          <span>Template</span>
          <h3>Use-case inventory</h3>
          <p>Document tools, data, owner, review.</p>
          <Link className="kit-link" href="/resources/templates/ai-use-case-inventory">Open template</Link>
        </article>
        <article className="kit-panel">
          <span>Template</span>
          <h3>Workflow SOP</h3>
          <p>Input, output, retention, review.</p>
          <Link className="kit-link" href="/resources/templates/ai-workflow-sop">Open template</Link>
        </article>
        <article className="kit-panel">
          <span>Template</span>
          <h3>Board briefing</h3>
          <p>Translate findings into decisions.</p>
          <Link className="kit-link" href="/resources/templates/board-briefing-checklist">Open checklist</Link>
        </article>
        <article className="kit-panel">
          <span>Admin</span>
          <h3>Invite and PDF</h3>
          <p>Keep collecting responses or save the report.</p>
          <div className="kit-actions">
            <TeamCopyButton text={participantUrl} label="Copy link" variant="gold" />
            {printUrl && <Link className="kit-link" href={printUrl}>Preview PDF</Link>}
          </div>
        </article>
      </div>
    </section>
  );
}

function ExecutiveBrief({
  aggregate,
}: {
  readonly aggregate: TeamAssessmentAggregate;
}): JSX.Element {
  const weakest = aggregate.weakestDimensions[0] ?? null;
  const strongest = aggregate.strongestDimensions[0] ?? null;
  const widest = getWidestDimension(aggregate.dimensions);
  const focus = weakest ? dimensionActionFor(weakest) : null;

  return (
    <section className="report-brief" aria-labelledby="report-brief-heading">
      <div className="brief-panel">
        <p className="kicker">Executive readout</p>
        <h2 id="report-brief-heading">
          {aggregate.overall?.band.label ?? 'Not scored'} readiness with a clear first control gap.
        </h2>
        <p>
          The median score shows the current operating level. The priority is not
          another survey; it is converting the lowest dimension into an assigned
          artifact, review owner, and evidence trail.
        </p>
      </div>
      <div className="brief-facts" aria-label="Report interpretation">
        <div>
          <span>Primary gap</span>
          <strong>{weakest ? `${weakest.label} at ${weakest.median}` : 'Not available'}</strong>
        </div>
        <div>
          <span>Strongest signal</span>
          <strong>{strongest ? `${strongest.label} at ${strongest.median}` : 'Not available'}</strong>
        </div>
        <div>
          <span>Spread to review</span>
          <strong>{widest ? `${widest.label}: ${widest.p25}-${widest.p75}` : 'Not available'}</strong>
        </div>
        <div>
          <span>First owner</span>
          <strong>{focus?.owner ?? 'Assign from the lowest-scoring dimension'}</strong>
        </div>
      </div>
    </section>
  );
}

function PriorityBrief({
  dimensions,
}: {
  readonly dimensions: readonly DimensionAggregate[];
}): JSX.Element {
  return (
    <section className="priority-brief" aria-labelledby="priority-brief-heading">
      <SectionHeading
        id="priority-brief-heading"
        eyebrow="Priority actions"
        title="The first three remediation briefs."
      />
      <div className="priority-matrix" role="table" aria-label="Priority remediation matrix">
        <div className="priority-matrix-head" role="row">
          <span role="columnheader">Priority</span>
          <span role="columnheader">Owner</span>
          <span role="columnheader">First move</span>
          <span role="columnheader">Artifact</span>
          <span role="columnheader">Evidence</span>
        </div>
        {dimensions.map((dim, index) => (
          <DimensionPriorityRow key={dim.id} dimension={dim} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}

function DimensionPriorityRow({
  dimension,
  rank,
}: {
  readonly dimension: DimensionAggregate;
  readonly rank: number;
}): JSX.Element {
  const action = dimensionActionFor(dimension);
  return (
    <div className="priority-matrix-row" role="row">
      <div className="priority-cell priority-focus" role="cell">
        <span className="priority-rank">{rank}</span>
        <div>
          <h3>{dimension.label}</h3>
          <p>{action.outcome}</p>
          <small>
            Median {dimension.median}. Middle 50%: {dimension.p25}-{dimension.p75}.
          </small>
        </div>
      </div>
      <div className="priority-cell" role="cell">{action.owner}</div>
      <div className="priority-cell" role="cell">{action.firstMove}</div>
      <div className="priority-cell" role="cell">{action.artifact}</div>
      <div className="priority-cell" role="cell">{action.evidence}</div>
    </div>
  );
}

function SlicePlaybook({
  title,
  slices,
  kind,
}: {
  readonly title: string;
  readonly slices: readonly SliceAggregate[];
  readonly kind: 'department' | 'role';
}): JSX.Element {
  const visible = slices.slice(0, 3);
  return (
    <article className="slice-playbook">
      <p className="kicker">{title}</p>
      <h3>{visible.length > 0 ? 'Start with the lowest slices.' : 'Waiting for completed responses.'}</h3>
      {visible.length === 0 ? (
        <p>
          This view appears after completed responses exist in a {kind}.
        </p>
      ) : (
        <div className="slice-playbook-list">
          {visible.map((slice) => (
            <div className="slice-play" key={slice.id}>
              <div className="slice-play-top">
                <strong>{slice.label}</strong>
                <span>
                  {slice.count} responses
                  {slice.lowConfidence ? ' · directional' : ''}
                </span>
              </div>
              <p>
                Median {slice.median}. Focus first on {slice.weakest?.label ?? 'the lowest dimension'};
                protect {slice.strongest?.label ?? 'the strongest dimension'} as the local habit to copy.
              </p>
              <p>{slicePlayMove(slice, kind)}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function ParticipantRoster({
  cohort,
  responses,
}: {
  readonly cohort: TeamAssessmentCohort;
  readonly responses: readonly CompletedTeamAssessmentResponse[];
}): JSX.Element {
  const openSeats = Math.max(0, cohort.seats_purchased - responses.length);
  const sortedResponses = [...responses].sort(
    (a, b) => Date.parse(b.completed_at) - Date.parse(a.completed_at),
  );

  return (
    <section className="roster-section" aria-labelledby="roster-heading">
      <SectionHeading
        id="roster-heading"
        eyebrow="Participant status"
        title="Completion roster."
      />
      <div className="roster-summary">
        <div>
          <strong>{responses.length}</strong>
          <span>completed</span>
        </div>
        <div>
          <strong>{openSeats}</strong>
          <span>{openSeats === 1 ? 'open seat' : 'open seats'}</span>
        </div>
        <p>
          Shared link: completed participants are listed; open seats are unclaimed.
        </p>
      </div>
      <details className="roster-drawer">
        <summary>
          <span>View participant list</span>
          <small>{responses.length} complete · {openSeats} open</small>
        </summary>
        <div className="roster-wrap">
          <table className="roster-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Department</th>
                <th>Role</th>
                <th>Completed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedResponses.map((response) => (
                <tr key={response.id}>
                  <td>{response.participant_email ?? 'Unknown participant'}</td>
                  <td>{labelForDepartment(response.department, response.department_other)}</td>
                  <td>{labelForRole(response.role)}</td>
                  <td>{new Date(response.completed_at).toLocaleDateString()}</td>
                  <td><span className="status-chip is-complete">Complete</span></td>
                </tr>
              ))}
              {Array.from({ length: openSeats }).map((_, index) => (
                <tr key={`open-seat-${index + 1}`} className="open-seat-row">
                  <td>Open seat {index + 1}</td>
                  <td className="muted">Not claimed</td>
                  <td className="muted">Not claimed</td>
                  <td className="muted">-</td>
                  <td><span className="status-chip">Not complete</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

function OperatingCadence({
  focus,
}: {
  readonly focus: DimensionAggregate | null;
}): JSX.Element {
  const action = focus ? dimensionActionFor(focus) : null;
  return (
    <section className="cadence-panel" aria-labelledby="cadence-heading">
      <SectionHeading
        id="cadence-heading"
        eyebrow="Operating cadence"
        title="What the buyer should run after the report."
      />
      <div className="cadence-grid">
        <div className="cadence-steps">
          <div className="cadence-row">
            <span>Week 1</span>
            <div>
              <strong>Hold a 60-minute findings review.</strong>
              <p>
                Confirm the lowest dimension, name the accountable owner, and decide
                which policy or workflow artifact will be produced first.
              </p>
            </div>
          </div>
          <div className="cadence-row">
            <span>Weeks 2-4</span>
            <div>
              <strong>Build the first control artifact.</strong>
              <p>
                {action
                  ? `Draft the ${action.artifact.toLowerCase()} and collect ${action.evidence.toLowerCase()}.`
                  : 'Draft the first AI control artifact and collect evidence before broad rollout.'}
              </p>
            </div>
          </div>
          <div className="cadence-row">
            <span>Days 31-60</span>
            <div>
              <strong>Run department working sessions.</strong>
              <p>
                Start with the lowest slice and treat any sub-{TEAM_ASSESSMENT_SLICE_MIN}
                result as directional until more people complete.
              </p>
            </div>
          </div>
          <div className="cadence-row">
            <span>Days 61-90</span>
            <div>
              <strong>Report adoption, evidence, and remaining risk.</strong>
              <p>
                Summarize artifact completion, departments trained, unresolved
                exceptions, and the next diagnostic focus.
              </p>
            </div>
          </div>
        </div>
        <div className="artifact-stack">
          <p className="kicker">Deliverables</p>
          <h3>Minimum board-ready packet</h3>
          <ul>
            <li>Executive summary with median, spread, and maturity band</li>
            <li>Eight-dimension scorecard with owners for the lowest two dimensions</li>
            <li>Department heatmap with small-sample notes</li>
            <li>One approved AI workflow SOP or data handling matrix</li>
            <li>30/60/90 progress tracker for training, controls, and evidence</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function DimensionList({
  title,
  items,
}: {
  readonly title: string;
  readonly items: readonly DimensionAggregate[];
}): JSX.Element {
  return (
    <div className="mini-list">
      <p className="kicker">{title}</p>
      <div className="mini-list-rows">
        {items.map((item) => (
          <div className="mini-list-row" key={item.id}>
            <span>{item.label}</span>
            <strong>{item.median}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function DimensionTable({
  dimensions,
}: {
  readonly dimensions: readonly DimensionAggregate[];
}): JSX.Element {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Dimension</th>
            <th>Median</th>
            <th>Middle 50%</th>
            <th>Distribution</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((dim) => (
            <tr key={dim.id}>
              <td>{dim.label}</td>
              <td>{dim.median}</td>
              <td className="muted">
                {dim.p25}-{dim.p75}
              </td>
              <td>
                <Bar value={dim.median} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SliceTable({ slices }: { readonly slices: readonly SliceAggregate[] }): JSX.Element {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Slice</th>
            <th>Completed</th>
            <th>Signal</th>
            <th>Median</th>
            <th>Weakest</th>
            <th>Strongest</th>
          </tr>
        </thead>
        <tbody>
          {slices.map((slice) => (
            <tr key={slice.id}>
              <td>{slice.label}</td>
              <td>{slice.count}</td>
              <td>
                <span className={`sample-chip ${slice.lowConfidence ? 'is-directional' : 'is-stable'}`}>
                  {slice.lowConfidence ? 'Directional' : 'Stable'}
                </span>
              </td>
              <td>{slice.median}</td>
              <td>{slice.weakest?.label ?? '-'}</td>
              <td>{slice.strongest?.label ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DepartmentHeatmap({
  slices,
}: {
  readonly slices: readonly SliceAggregate[];
}): JSX.Element {
  const dimensions = slices[0]?.dimensions ?? [];

  if (slices.length === 0 || dimensions.length === 0) {
    return (
      <p className="privacy-copy">
        Department heatmap appears after at least one department has a completed response.
      </p>
    );
  }

  return (
    <div className="heatmap-wrap">
      <div className="heatmap" role="table" aria-label="Department dimension heatmap">
        <div className="heatmap-row heatmap-head" role="row">
          <div className="heatmap-label" role="columnheader">Department</div>
          {dimensions.map((dim) => (
            <div className="heatmap-cell" role="columnheader" key={dim.id}>
              {shortDimension(dim.label)}
            </div>
          ))}
        </div>
        {slices.map((slice) => (
          <div className="heatmap-row" role="row" key={slice.id}>
            <div className="heatmap-label" role="rowheader">
              <strong>{slice.label}</strong>
              <small>
                {slice.count} response{slice.count === 1 ? '' : 's'}
                {slice.lowConfidence ? ' · directional' : ''}
              </small>
            </div>
            {slice.dimensions.map((dim) => (
              <div
                className="heatmap-cell"
                role="cell"
                key={dim.id}
                style={heatmapStyle(dim.median)}
                aria-label={`${slice.label}, ${dim.label}: ${dim.median}${slice.lowConfidence ? ', directional small sample' : ''}`}
              >
                {dim.median}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({ value }: { readonly value: number }): JSX.Element {
  return (
    <span className="bar">
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
  );
}

function shortDimension(label: string): string {
  return label
    .replace('Readiness', '')
    .replace('Governance', 'Gov.')
    .replace('Operations', 'Ops.')
    .replace('Implementation', 'Impl.')
    .replace(/\s+/g, ' ')
    .trim();
}

function heatmapStyle(value: number): { background: string; color: string } {
  if (value >= 75) return { background: '#dce8da', color: '#18351f' };
  if (value >= 60) return { background: '#f1e4bf', color: '#5f4815' };
  return { background: '#ead7d3', color: '#61231f' };
}

function dimensionActionFor(dim: DimensionAggregate): DimensionAction {
  return DIMENSION_ACTIONS[dim.id];
}

function getWidestDimension(
  dimensions: readonly DimensionAggregate[],
): DimensionAggregate | null {
  return [...dimensions].sort((a, b) => (b.p75 - b.p25) - (a.p75 - a.p25))[0] ?? null;
}

function sortSlicesByMedian(slices: readonly SliceAggregate[]): readonly SliceAggregate[] {
  return [...slices].sort((a, b) => a.median - b.median);
}

function lowestSlice(slices: readonly SliceAggregate[]): SliceAggregate | null {
  return sortSlicesByMedian(slices)[0] ?? null;
}

function strongestSlice(slices: readonly SliceAggregate[]): SliceAggregate | null {
  return [...slices].sort((a, b) => b.median - a.median)[0] ?? null;
}

function buildLeadershipAgenda(
  focus: DimensionAggregate | null,
  action: DimensionAction | null,
): string {
  const gap = focus ? `${focus.label} (${focus.median})` : 'lowest readiness dimension';
  return [
    'Team AI Readiness Leadership Readout',
    '',
    '1. Confirm the score and completion coverage.',
    `2. Name the primary gap: ${gap}.`,
    `3. Assign owner: ${action?.owner ?? 'TBD'}.`,
    `4. Approve first artifact: ${action?.artifact ?? 'TBD'}.`,
    `5. Decide first move: ${action?.firstMove ?? 'choose one governed workflow'}.`,
    `6. Evidence to collect: ${action?.evidence ?? 'owner, review, artifact, and status trail'}.`,
    '7. Schedule the first department working session.',
  ].join('\n');
}

function buildWorkshopAgenda(
  focus: DimensionAggregate | null,
  action: DimensionAction | null,
): string {
  return [
    'Department AI Readiness Workshop',
    '',
    `Focus: ${focus?.label ?? 'lowest team gap'}`,
    '1. Pick one real workflow from this department.',
    '2. Identify the approved tool, data class, owner, and reviewer.',
    `3. Build: ${action?.artifact ?? 'one control artifact'}.`,
    `4. Capture evidence: ${action?.evidence ?? 'decision notes, reviewer, and retained artifact'}.`,
    '5. Return in two weeks with the artifact and blockers.',
  ].join('\n');
}

function slicePlayMove(slice: SliceAggregate, kind: 'department' | 'role'): string {
  const action = slice.weakest ? dimensionActionFor(slice.weakest) : null;
  if (!action) return 'Assign an owner and review the underlying responses before selecting a play.';

  if (kind === 'department') {
    return `Run a ${slice.label} working session with ${action.owner}. Output: ${action.artifact}.`;
  }

  return `Give this role group a focused enablement session. Output: ${action.firstMove}`;
}

function planTitle(index: number, dim: DimensionAggregate): string {
  if (index === 0) return `Stabilize ${dim.label}.`;
  if (index === 1) return `Standardize ${dim.label}.`;
  return `Scale ${dim.label}.`;
}

function planBody(index: number, dim: DimensionAggregate): string {
  const action = dimensionActionFor(dim);
  if (index === 0) {
    return `Use ${dim.label} as the first executive working session. Owner: ${action.owner}. Deliverable: ${action.artifact}. Evidence target: ${action.evidence}.`;
  }
  if (index === 1) {
    return `Turn the first month into a reusable department playbook. Move the median from ${dim.median} toward ${Math.min(100, dim.median + 10)} by standardizing the first move: ${action.firstMove}`;
  }
  return `Re-read ${dim.label}, report the delta, and decide whether the next cohort needs training, controls, or workflow redesign. Keep ${action.artifact.toLowerCase()} current.`;
}
