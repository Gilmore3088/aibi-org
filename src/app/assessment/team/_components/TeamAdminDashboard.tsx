import Link from 'next/link';
import { Wordmark } from '@/components/brand';
import {
  TEAM_ASSESSMENT_SLICE_MIN,
  TEAM_ASSESSMENT_UNLOCK_COMPLETIONS,
  labelForDepartment,
} from '@/lib/team-assessment/constants';
import {
  aggregateTeamAssessment,
  type CompletedTeamAssessmentResponse,
} from '@/lib/team-assessment/aggregate';
import type { TeamAssessmentCohort } from '@/lib/team-assessment/db';
import { TeamCopyButton } from './TeamCopyButton';
import { TeamPrintButton } from './TeamPrintButton';
import { SectionHeading } from './team-admin-dashboard/SectionHeading';
import { TeamCommandCenter } from './team-admin-dashboard/TeamCommandCenter';
import { TeamActionQueue } from './team-admin-dashboard/TeamActionQueue';
import { TeamComparisonBoard } from './team-admin-dashboard/TeamComparisonBoard';
import { FacilitationKit } from './team-admin-dashboard/FacilitationKit';
import { ParticipantRoster } from './team-admin-dashboard/ParticipantRoster';
import { DimensionTable, SliceTable } from './team-admin-dashboard/ScoreTables';
import './team-admin-dashboard/team-admin-dashboard.css';

interface TeamAdminDashboardProps {
  readonly cohort: TeamAssessmentCohort;
  readonly responses: readonly CompletedTeamAssessmentResponse[];
  readonly participantUrl: string;
  readonly printUrl?: string;
  readonly printMode?: boolean;
}

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
    </main>
  );
}
