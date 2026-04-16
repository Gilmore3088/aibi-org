// POST /api/webhooks/stripe
// Handles Stripe webhook events for AiBI-P course enrollment provisioning.
//
// Security: Every request is verified via stripe.webhooks.constructEvent before
// any processing occurs. Unverified requests are rejected with 400.
//
// Events handled:
//   checkout.session.completed (individual mode) → creates course_enrollments row
//   checkout.session.completed (institution mode) → creates institution_enrollments row
//
// All other event types are acknowledged with 200 and ignored.
// Idempotency: duplicate deliveries of the same stripe_session_id are skipped.

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { provisionEnrollment } from '@/lib/stripe/provision-enrollment';

// Webhook needs raw body access; nodejs runtime required.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not configured.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  // Read raw body — signature verification requires the exact bytes received.
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  // Lazy-import to avoid module-level throw at build time when env var not set.
  const { stripe } = await import('@/lib/stripe');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  // Only process checkout.session.completed; acknowledge everything else.
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const result = await provisionEnrollment(session);

  if ('error' in result) {
    // Permanent failures (missing metadata) → 400, Stripe stops retrying.
    // Transient failures (db_error) → 500, Stripe retries for up to 3 days.
    const status = result.code === 'missing_metadata' ? 400 : 500;
    console.error(`[webhook] Provisioning failed (${result.code}):`, result.error);
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ received: true, ...result });
}
