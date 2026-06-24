import type { Metadata } from 'next';
import { PurchaseAccessLinkForm, PurchaseHelpForm } from './PurchaseHelpForm';
import { SiteHeader } from '@/components/mockup';
import './purchase-help.css';

export const metadata: Metadata = {
  title: 'Purchase Help',
  robots: { index: false, follow: false },
};

interface PurchaseHelpPageProps {
  readonly searchParams?: Promise<{ readonly email?: string }>;
}

function supportEmailParam(value: string | undefined): string {
  if (!value || value.length > 254 || !value.includes('@')) return '';
  return value;
}

export default async function PurchaseHelpPage({ searchParams }: PurchaseHelpPageProps) {
  const sp = (await searchParams) ?? {};
  const prefillEmail = supportEmailParam(sp.email);

  return (
    <div className="mockup-scope">
      <SiteHeader activePath={undefined} cta={{ label: 'Start free assessment', href: '/assessment/take' }} />
      <main className="purchase-help">
        <section className="purchase-help__shell">
          <div className="purchase-help__intro">
            <p>Purchase support</p>
            <h1>Help with access, receipts, refunds, or team seats.</h1>
            <span>
              Send the purchase email you used and any checkout reference you have. Access issues are
              triaged first; refund requests are reviewed within 1 business day from
              hello@aibankinginstitute.com.
            </span>
            <div className="purchase-help__policy" aria-label="Refund and response expectations">
              <h2>Refund self-check</h2>
              <p>
                Refunds are reviewed by a human before any Stripe action. Use this checklist before
                submitting a request.
              </p>
              <ul>
                <li>Request is within 7 days of purchase.</li>
                <li>Duplicate purchases and access failures we cannot resolve are refundable.</li>
                <li>In-Depth refund requests should be before the paid assessment is submitted.</li>
                <li>Foundation seats should have fewer than two modules completed and no certificate issued.</li>
              </ul>
              <p>
                Approved refunds are issued manually in Stripe after the support case is reviewed.
                Partial refunds keep access active; full refunds remove access.
              </p>
            </div>
          </div>
          <div className="purchase-help__stack">
            <PurchaseAccessLinkForm prefillEmail={prefillEmail} />
            <PurchaseHelpForm prefillEmail={prefillEmail} />
          </div>
        </section>
      </main>
    </div>
  );
}
