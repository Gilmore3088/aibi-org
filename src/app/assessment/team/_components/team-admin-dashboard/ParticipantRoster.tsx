import { labelForDepartment, labelForRole } from '@/lib/team-assessment/constants';
import type { CompletedTeamAssessmentResponse } from '@/lib/team-assessment/aggregate';
import type { TeamAssessmentCohort } from '@/lib/team-assessment/db';
import { SectionHeading } from './SectionHeading';

export function ParticipantRoster({
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
