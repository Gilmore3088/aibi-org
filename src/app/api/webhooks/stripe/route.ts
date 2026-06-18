// POST /api/webhooks/stripe
// Handles Stripe webhook events for AiBI-Foundation course enrollment provisioning.
//
// Security: Every request is verified via stripe.webhooks.constructEvent before
// any processing occurs. Unverified requests are rejected with 400.
//
// Events handled:
//   checkout.session.completed (individual)   → creates course_enrollments row
//   checkout.session.completed (institution)  → creates institution_enrollments row
//   payment_intent.payment_failed             → logs + purchase_failed analytics
//   charge.refunded                           → deletes course_enrollments row
//                                                (entitlements trigger revokes)
//   payment_intent.succeeded                  → ack (provisioning lives on
//                                                checkout.session.completed)
//
// Every received event is logged at info-level on entry so unknown event
// types still leave a forensic trail.
// Idempotency: duplicate deliveries of the same stripe_session_id are skipped.

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { track as trackServer } from '@vercel/analytics/server';
import { provisionEnrollment } from '@/lib/stripe/provision-enrollment';
import { isFullyRefunded } from '@/lib/stripe/refund';
import { ensureAuthUser, generateMagicLink } from '@/lib/supabase/auth-admin';
import { createServiceRoleClient } from '@/lib/supabase/client';
import {
  sendCoursePurchaseIndividual,
  sendCoursePurchaseInstitution,
  sendIndepthAssessmentPurchase,
  sendTeamAssessmentPurchase,
} from '@/lib/resend';

function nextPathForProduct(
  product: string | undefined,
  result?: { cohortId?: string },
): string {
  if (product === 'team-assessment' && result?.cohortId) {
    return `/assessment/team/admin/${result.cohortId}`;
  }
  if (product === 'team-assessment') return '/assessment/team';
  if (product === 'in-depth-assessment') return '/assessment/in-depth/take';
  // Institution leaders land on the same course page as individuals for now;
  // dedicated leader-dashboard surface is tracked in issue #48.
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
// Fulfillment runs synchronously before we ack (provisionEnrollment +
// ensureAuthUser, which pages auth users + a transactional email). Give it
// headroom so a slow Supabase/Resend call can't trip Stripe's timeout and
// get the event marked failed.
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Dual-secret support: one deployed endpoint frequently has to validate BOTH
  // a live-mode and a test-mode Stripe webhook (e.g. QA'ing payments in test
  // mode against the production URL, or running both a live and a test endpoint
  // pointed at the same path). Each mode signs with its own secret, so we accept
  // STRIPE_WEBHOOK_SECRET (primary/live) AND an optional STRIPE_WEBHOOK_SECRET_TEST,
  // trying each until one verifies. This removes a whole class of silent
  // "signature verification failed" rejections that surface in Stripe's
  // dashboard only as generic "other errors". Live secret is tried first; blanks
  // are filtered so a defined-but-empty env var can't shadow a real one.
  const webhookSecrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_WEBHOOK_SECRET_TEST,
  ].filter((s): s is string => typeof s === 'string' && s.length > 0);

  if (webhookSecrets.length === 0) {
    console.error(
      '[webhook] No signing secret configured (STRIPE_WEBHOOK_SECRET / STRIPE_WEBHOOK_SECRET_TEST).',
    );
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

  let event: Stripe.Event | null = null;
  let lastErr: unknown = null;
  for (const secret of webhookSecrets) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, secret);
      break; // verified against this secret — stop trying
    } catch (err) {
      lastErr = err;
    }
  }
  if (!event) {
    console.error(
      `[webhook] Signature verification failed against ${webhookSecrets.length} secret(s):`,
      lastErr,
    );
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  // Log every received event so failed payments, refunds, and unknown
  // event types leave a forensic trail. Previously these all silently 200'd.
  console.info('[webhook] received', { type: event.type, id: event.id });

  // payment_intent.payment_failed — buyer attempted a charge that failed.
  // We never created a course_enrollments row (provisioning only fires on
  // checkout.session.completed), so there's nothing to revoke. Logging
  // + analytics is sufficient for now; surface it for ops visibility.
  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent;
    console.warn('[webhook] payment_intent.payment_failed', {
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      last_payment_error: pi.last_payment_error?.code ?? null,
    });
    void trackServer('purchase_failed', {
      stripePaymentIntentId: pi.id,
      reason: pi.last_payment_error?.code ?? 'unknown',
    }).catch((err) => console.warn('[webhook] analytics track failed', err));
    return NextResponse.json({ received: true });
  }

  // charge.refunded — buyer refunded. Revoke the matching course_enrollments
  // row; the entitlements trigger (00015) flips entitlements.active to false
  // and stamps revoked_at. Stripe's charge object carries payment_intent;
  // we look up the checkout session via that and match by stripe_session_id.
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;

    // F3 — only revoke on a FULL refund. charge.refunded fires for partial
    // refunds too; a partial credit must not pull a paid buyer's access.
    if (!isFullyRefunded(charge)) {
      console.info('[webhook] charge.refunded partial — access retained', {
        id: charge.id,
        amount: charge.amount,
        amountRefunded: charge.amount_refunded ?? 0,
      });
      return NextResponse.json({ received: true });
    }

    const paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (!paymentIntentId) {
      // F6 — a refunded charge we cannot map back to access. Surfaced at error
      // level so it leaves an alertable trail instead of a silent ack.
      console.error('[webhook] charge.refunded missing payment_intent — access NOT revoked', {
        id: charge.id,
      });
      return NextResponse.json({ received: true });
    }
    try {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
        limit: 1,
      });
      const sessionId = sessions.data[0]?.id;
      if (!sessionId) {
        // F6 — paid charge fully refunded but no Checkout Session maps to it
        // (e.g. a payment created outside Checkout). Access was NOT revoked;
        // log at error level for operator follow-up.
        console.error('[webhook] charge.refunded: no Checkout Session for PI — access NOT revoked', {
          paymentIntentId,
          chargeId: charge.id,
        });
        return NextResponse.json({ received: true });
      }
      const supabase = createServiceRoleClient();

      // Individual purchase: delete the course_enrollments row; the entitlements
      // trigger flips entitlements.active=false.
      const { error: delErr, count } = await supabase
        .from('course_enrollments')
        .delete({ count: 'exact' })
        .eq('stripe_session_id', sessionId);
      if (delErr) {
        console.error('[webhook] charge.refunded revoke failed', delErr);
        return NextResponse.json({ error: 'Revoke failed.' }, { status: 500 });
      }

      // F4 — institution master purchase: there is no course_enrollments row for
      // its session, so the delete above matches nothing. Release the persistent
      // discount lock so future per-seat purchases stop inheriting team pricing.
      // UPDATE (not DELETE): learner course_enrollments reference this row via a
      // RESTRICT foreign key, and revoking seated-staff access is a separate
      // product decision.
      const { error: instErr, count: instCount } = await supabase
        .from('institution_enrollments')
        .update({ discount_locked: false }, { count: 'exact' })
        .eq('stripe_session_id', sessionId)
        .eq('discount_locked', true);
      if (instErr) {
        console.error('[webhook] charge.refunded institution unlock failed', instErr);
      }

      const { error: teamErr, count: teamCount } = await supabase
        .from('team_assessment_cohorts')
        .update({ status: 'refunded' }, { count: 'exact' })
        .eq('stripe_session_id', sessionId);
      if (teamErr) {
        console.error('[webhook] charge.refunded team assessment revoke failed', teamErr);
      }

      // F2 — record the refunded session so a replayed checkout.session.completed
      // cannot re-provision it. provisionEnrollment consults this table (fail-open).
      const { error: rfErr } = await supabase
        .from('refunded_checkout_sessions')
        .upsert({ stripe_session_id: sessionId }, { onConflict: 'stripe_session_id' });
      if (rfErr) {
        console.warn('[webhook] refunded-session record failed:', rfErr.message);
      }

      console.info('[webhook] charge.refunded processed', {
        sessionId,
        enrollmentsRevoked: count ?? 0,
        institutionDiscountsReleased: instCount ?? 0,
        teamAssessmentsRefunded: teamCount ?? 0,
      });
      void trackServer('purchase_refunded', {
        stripeSessionId: sessionId,
        amountRefunded: (charge.amount_refunded ?? 0) / 100,
      }).catch((err) => console.warn('[webhook] analytics track failed', err));
    } catch (err) {
      console.error('[webhook] charge.refunded handler error', err);
      return NextResponse.json({ error: 'Revoke handler error.' }, { status: 500 });
    }
    return NextResponse.json({ received: true });
  }

  // payment_intent.succeeded — informational; the actual provisioning fires
  // off checkout.session.completed which carries the metadata. Log and ack.
  if (event.type === 'payment_intent.succeeded') {
    return NextResponse.json({ received: true });
  }

  // Anything else (subscription events, balance updates, etc.) — ack but
  // the top-of-handler log already recorded the type.
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
    const amountUsd = (session.amount_total ?? 0) / 100;

    // Server-side analytics: purchase_completed fires once per provisioned
    // enrollment. Names + props match src/lib/analytics/events.ts so client
    // and server events aggregate to one funnel.
    void trackServer('purchase_completed', {
      product: (session.metadata?.product as string) ?? 'unknown',
      amountUsd,
      mode: result.type,
    }).catch((err) => console.warn('[webhook] analytics track failed', err));
    const product = session.metadata?.product;

    if (email) {
      // Provision a Supabase auth account for the buyer (idempotent) and
      // generate a magic link so the buyer's welcome email is one-click into
      // an authenticated session — no separate sign-up step. ensureAuthUser
      // and generateMagicLink both swallow errors and return null, so a
      // failure here doesn't block the rest of the response.
      let magicLinkUrl: string | null = null;
      const nextPath = nextPathForProduct(product, result);
      try {
        await ensureAuthUser(email);
        magicLinkUrl = await generateMagicLink(email, nextPath);
      } catch (err) {
        console.warn('[webhook] auth-admin magic-link skip', err);
      }
      // F8 (journey audit 2026-06-10): never send a purchase email without a
      // working entry path. The templates' own fallbacks point at gated pages
      // (e.g. the in-depth fallback lands on /assessment/in-depth/purchased,
      // which bounces session-less visitors to "purchase required"), so a
      // failed magic link stranded the buyer. Fall back to a signup deep link
      // with the email pre-filled and next= preserved.
      if (!magicLinkUrl) {
        const siteUrl = (
          process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com'
        ).replace(/\/+$/, '');
        magicLinkUrl = `${siteUrl}/auth/signup?next=${encodeURIComponent(
          nextPath,
        )}&email=${encodeURIComponent(email)}`;
        console.error(
          '[webhook] magic link unavailable — purchase email sent with signup fallback',
          { product },
        );
      }

      if (result.type === 'team-assessment') {
        const siteUrl = (
          process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com'
        ).replace(/\/+$/, '');
        const institutionName = session.metadata?.institution_name ?? 'Your institution';
        const seatsPurchased = session.metadata?.quantity
          ? parseInt(session.metadata.quantity, 10)
          : 0;
        const participantUrl = result.publicToken
          ? `${siteUrl}/assessment/team/${result.publicToken}`
          : `${siteUrl}/assessment/team`;
        sendTeamAssessmentPurchase({
          email,
          institutionName,
          seatsPurchased,
          amountPaid,
          adminUrl: magicLinkUrl ?? `${siteUrl}${nextPath}`,
          participantUrl,
        }).catch((err) =>
          console.warn('[webhook] resend team-assessment skip', err),
        );
      } else if (result.type === 'individual') {
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
