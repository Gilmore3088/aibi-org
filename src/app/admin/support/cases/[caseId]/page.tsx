import { notFound } from 'next/navigation';
import { getBuyerSnapshot } from '@/lib/support/buyer';
import { getSupportCaseWithEvents, supportCaseStripeDashboardUrl } from '@/lib/support/cases';
import { BuyerSnapshotPanel } from '../../BuyerSnapshotPanel';
import { CaseActions } from './CaseActions';

interface PageProps {
  readonly params: Promise<{ caseId: string }>;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default async function SupportCasePage({ params }: PageProps) {
  const { caseId } = await params;
  const supportCase = await getSupportCaseWithEvents(caseId);
  if (!supportCase) notFound();

  const snapshot = await getBuyerSnapshot(
    supportCase.case.buyerEmail,
    supportCase.case.stripeSessionId,
  );
  const stripeUrl = supportCaseStripeDashboardUrl(supportCase.case.stripeSessionId);

  return (
    <main className="support-admin__main">
      <section className="support-case-head">
        <div>
          <p className="support-kicker">{supportCase.case.category.replaceAll('_', ' ')}</p>
          <h2>{supportCase.case.subject}</h2>
          <p>{supportCase.case.summary}</p>
        </div>
        <div className="support-case-head__meta">
          <span className="support-pill">{supportCase.case.status.replaceAll('_', ' ')}</span>
          <span className="support-pill">{supportCase.case.priority}</span>
          {stripeUrl ? <a href={stripeUrl} target="_blank" rel="noreferrer">Open Stripe</a> : null}
        </div>
      </section>

      <section className="support-case-layout">
        <div className="support-panel">
          <div className="support-section-head">
            <div>
              <p className="support-kicker">Timeline</p>
              <h2>{supportCase.events.length} events</h2>
            </div>
          </div>
          <ol className="support-timeline">
            {supportCase.events.map((event) => (
              <li key={event.id}>
                <div>
                  <strong>{event.eventType.replaceAll('_', ' ')}</strong>
                  <span>{formatDateTime(event.createdAt)}</span>
                </div>
                <p>{event.message}</p>
                {event.actorEmail ? <small>{event.actorType}: {event.actorEmail}</small> : null}
              </li>
            ))}
          </ol>
        </div>

        <aside className="support-panel">
          <div className="support-section-head">
            <div>
              <p className="support-kicker">Actions</p>
              <h2>Case controls</h2>
            </div>
          </div>
          <CaseActions
            caseId={supportCase.case.id}
            initialStatus={supportCase.case.status}
            initialPriority={supportCase.case.priority}
          />
        </aside>
      </section>

      <BuyerSnapshotPanel snapshot={snapshot} />
    </main>
  );
}
