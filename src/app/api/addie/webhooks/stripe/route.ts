// POST /api/addie/webhooks/stripe
//
// Scoped to the ADDIE Foundation Course rebuild. INTENTIONALLY at a
// different path than the legacy /api/webhooks/stripe — operator must
// register a separate webhook endpoint at this URL in the Stripe
// dashboard (with its own STRIPE_WEBHOOK_SECRET if desired; for v1 the
// same secret works because we filter by addie_product metadata).

import { NextResponse, type NextRequest } from 'next/server';
import { processStripeEvent, verifyStripeEvent } from '@/lib/addie/stripe/webhook';

export const runtime = 'nodejs';
// Stripe requires the raw body; Next 14 App Router gives us req.text()
// which is the unparsed body string.

export async function POST(req: NextRequest): Promise<NextResponse> {
  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();

  let event;
  try {
    event = verifyStripeEvent(raw, sig);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[addie/webhooks/stripe] signature verification failed:', message);
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  try {
    const result = await processStripeEvent(event);
    return NextResponse.json({ received: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    // Return 500 so Stripe retries on transient failures.
    console.error('[addie/webhooks/stripe] handler error:', event.id, message);
    return NextResponse.json({ error: 'handler_error' }, { status: 500 });
  }
}
