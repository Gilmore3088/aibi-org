import type {
  CompletedTeamAssessmentResponse,
  TeamAssessmentAggregate,
} from '@/lib/team-assessment/aggregate';
import type { TeamAssessmentCohort } from '@/lib/team-assessment/db';
import {
  dimensionActionFor,
  getWidestDimension,
  lowestSlice,
  strongestSlice,
} from './helpers';

export function TeamCommandCenter({
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
