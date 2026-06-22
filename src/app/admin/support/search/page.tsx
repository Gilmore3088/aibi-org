import { BuyerSnapshotPanel } from '../BuyerSnapshotPanel';
import { findBuyerEmailByStripeSession, getBuyerSnapshot } from '@/lib/support/buyer';

interface PageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function value(params: Record<string, string | string[] | undefined>, key: string): string {
  const raw = params[key];
  return (Array.isArray(raw) ? raw[0] : raw) ?? '';
}

export default async function SupportSearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = value(params, 'email');
  const stripeSessionId = value(params, 'stripeSessionId');
  const hasLookup = email.length > 0 || stripeSessionId.length > 0;
  const resolvedEmail =
    email || (stripeSessionId ? await findBuyerEmailByStripeSession(stripeSessionId) : null);
  const snapshot = hasLookup && resolvedEmail
    ? await getBuyerSnapshot(resolvedEmail, stripeSessionId || null)
    : null;

  return (
    <main className="support-admin__main">
      <section className="support-panel">
        <div className="support-section-head">
          <div>
            <p className="support-kicker">Lookup</p>
            <h2>Buyer search</h2>
          </div>
        </div>
        <form className="support-search support-search--wide" action="/admin/support/search">
          <input name="email" type="email" placeholder="buyer@example.com" defaultValue={email} />
          <input name="stripeSessionId" placeholder="cs_live_..." defaultValue={stripeSessionId} />
          <button type="submit">Search</button>
        </form>
      </section>

      {hasLookup && !snapshot ? (
        <section className="support-panel">
          <p className="support-muted">No buyer record found for that lookup.</p>
        </section>
      ) : null}
      {snapshot ? <BuyerSnapshotPanel snapshot={snapshot} /> : null}
    </main>
  );
}
