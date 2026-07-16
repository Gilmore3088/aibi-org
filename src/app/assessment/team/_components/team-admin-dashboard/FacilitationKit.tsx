import Link from 'next/link';
import type { DimensionAggregate } from '@/lib/team-assessment/aggregate';
import { TeamCopyButton } from '../TeamCopyButton';
import { SectionHeading } from './SectionHeading';
import {
  buildLeadershipAgenda,
  buildWorkshopAgenda,
  dimensionActionFor,
} from './helpers';

export function FacilitationKit({
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
