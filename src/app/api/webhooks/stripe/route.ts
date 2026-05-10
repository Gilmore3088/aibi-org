// POST /api/webhooks/stripe
// Handles Stripe webhook events for AiBI-Foundation course enrollment provisioning.
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
import { ensureAuthUser, generateMagicLink } from '@/lib/supabase/auth-admin';
import {
  sendCoursePurchaseIndividual,
  sendCoursePurchaseInstitution,
  sendIndepthAssessmentPurchase,
} from '@/lib/resend';

function nextPathForProduct(product: string | undefined, mode: string | undefined): string {
  if (product === 'in-depth-assessment') return '/assessment/in-depth/take';
  // Accept both legacy 'aibi-p' (Stripe webhook retries from 2026-Q1) and
  // canonical 'foundation' (post-Phase 6 sessions). Both map to the same
  // active program at /courses/foundation/program.
  if ((product === 'aibi-p' || product === 'foundation') && mode === 'institution') return '/admin';
  return '/courses/foundation/program';
}

function formatAmount(amountCents: number | null | undefined, currency: string | null | undefined): string {
  if (typeof amountCents !== 'number') return '—';
  const amount = amountCents / 100;
  const code = (currency ?? 'usd').toUpperCase();
  if (code === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${code}`;
}

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

  // Send transactional email — only on first-time creation, not idempotent dupes.
  if (result.action === 'created') {
    const email = session.customer_details?.email ?? session.metadata?.user_email ?? null;
    const amountPaid = formatAmount(session.amount_total, session.currency);
    const product = session.metadata?.product;
    const mode = session.metadata?.mode;

    if (email) {
      // Provision a Supabase auth account for the buyer (idempotent) and
      // generate a magic link so the buyer's welcome email is one-click into
      // an authenticated session — no separate sign-up step. ensureAuthUser
      // and generateMagicLink both swallow errors and return null, so a
      // failure here doesn't block the rest of the response.
      let magicLinkUrl: string | null = null;
      try {
        await ensureAuthUser(email);
        magicLinkUrl = await generateMagicLink(email, nextPathForProduct(product, mode));
      } catch (err) {
        console.warn('[webhook] auth-admin magic-link skip', err);
      }

      if (result.type === 'individual') {
        if (product === 'in-depth-assessment') {
          sendIndepthAssessmentPurchase({
            email,
            amountPaid,
            magicLinkUrl: magicLinkUrl ?? undefined,
          }).catch((err) =>
            console.warn('[webhook] resend in-depth-assessment skip', err),
          );
        } else {
          sendCoursePurchaseIndividual({
            email,
            amountPaid,
            magicLinkUrl: magicLinkUrl ?? undefined,
          }).catch((err) => console.warn('[webhook] resend individual skip', err));
        }
      } else if (result.type === 'institution') {
        const institutionName = session.metadata?.institution_name ?? 'Your institution';
        const seatsPurchased = session.metadata?.quantity
          ? parseInt(session.metadata.quantity, 10)
          : 0;
        sendCoursePurchaseInstitution({
          email,
          institutionName,
          seatsPurchased,
          amountPaid,
          magicLinkUrl: magicLinkUrl ?? undefined,
        }).catch((err) => console.warn('[webhook] resend institution skip', err));
      }
    }
  }

  return NextResponse.json({ received: true, ...result });
}
