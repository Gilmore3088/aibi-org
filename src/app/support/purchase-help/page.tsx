import type { Metadata } from 'next';
import { PurchaseHelpForm } from './PurchaseHelpForm';
import './purchase-help.css';

export const metadata: Metadata = {
  title: 'Purchase Help',
  robots: { index: false, follow: false },
};

export default function PurchaseHelpPage() {
  return (
    <main className="purchase-help">
      <section className="purchase-help__shell">
        <div className="purchase-help__intro">
          <p>Purchase support</p>
          <h1>Help with access, receipts, refunds, or team seats.</h1>
          <span>
            Send the purchase email you used and any checkout reference you have. Support replies from
            hello@aibankinginstitute.com.
          </span>
        </div>
        <PurchaseHelpForm />
      </section>
    </main>
  );
}
