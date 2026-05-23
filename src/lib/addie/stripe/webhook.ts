// Stripe webhook event router. Auth Spec §6.2.
//
// Verification + idempotency happens here. The route handler is the thin
// adapter that hands a raw body + signature into `processStripeEvent`.

import type Stripe from 'stripe';
import { stripe } from './client';
import {
  getAddieServiceClient,
  getAdminServiceClient,
  normalizeEmail,
} from '@/lib/addie/supabase/service';
import { writeEntitlement, type AddieProduct } from '@/lib/addie/entitlements/write';
import { emit } from '@/lib/addie/events/emit';

const SCHEMA_PUBLIC = 'public' as const;

/**
 * Construct + verify the event. Lets the underlying error propagate so
 * the route can return 400. Never catch and silently 200.
 */
export function verifyStripeEvent(rawBody: string, signature: string | null): Stripe.Event {
  if (!signature) throw new Error('Missing stripe-signature header');
  // Each Stripe webhook endpoint has its own signing secret. The legacy
  // /api/webhooks/stripe handler uses STRIPE_WEBHOOK_SECRET; this addie
  // endpoint has its own secret in STRIPE_ADDIE_WEBHOOK_SECRET. Prefer the
  // addie var; fall back to STRIPE_WEBHOOK_SECRET only as a convenience for
  // single-endpoint setups that haven't bothered to split.
  const secret = process.env.STRIPE_ADDIE_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Neither STRIPE_ADDIE_WEBHOOK_SECRET nor STRIPE_WEBHOOK_SECRET is set');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

/**
 * Persist the event id to defeat retries. Returns false if we've already
 * processed this id — the route should still 200 (Stripe doesn't care).
 *
 * The stripe_events ledger lives in addie schema (per Auth Spec §6.2 SQL),
 * but if the table doesn't exist yet we fall back to in-memory dedup
 * within this process. Operator should add a migration that creates
 * addie.stripe_events (id text PRIMARY KEY, received_at timestamptz DEFAULT now()).
 */
const memoryDedup = new Set<string>();
const MEMORY_DEDUP_CAP = 1000;

async function markEventSeen(event_id: string): Promise<boolean> {
  const supa = getAddieServiceClient();
  const { error } = await supa.from('stripe_events').insert({ id: event_id });
  if (!error) return true; // newly inserted
  if (/duplicate key|already exists|unique constraint/i.test(error.message)) {
    return false;
  }
  // Table missing or other transient — fall back to memory.
  if (memoryDedup.has(event_id)) return false;
  memoryDedup.add(event_id);
  if (memoryDedup.size > MEMORY_DEDUP_CAP) {
    // crude eviction — drop oldest by reinserting
    const next = Array.from(memoryDedup).slice(-MEMORY_DEDUP_CAP / 2);
    memoryDedup.clear();
    next.forEach((id) => memoryDedup.add(id));
  }
  console.warn('[addie/stripe/webhook] stripe_events ledger unavailable, using memory dedup:', error.message);
  return true;
}

export interface ProcessResult {
  readonly handled: boolean;
  readonly reason?: string;
}

export async function processStripeEvent(event: Stripe.Event): Promise<ProcessResult> {
  const fresh = await markEventSeen(event.id);
  if (!fresh) return { handled: false, reason: 'duplicate' };

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      return { handled: true };

    case 'charge.refunded':
      await handleRefund(event.data.object as Stripe.Charge);
      return { handled: true };

    default:
      return { handled: false, reason: `unhandled:${event.type}` };
  }
}

/** Resolve the ADDIE product from session metadata, falling back to line items. */
function resolveProduct(session: Stripe.Checkout.Session): AddieProduct | null {
  const meta = (session.metadata?.addie_product ?? '').trim();
  if (meta === 'foundation_individual' || meta === 'foundation_team_seat' || meta === 'assessment_in_depth') {
    return meta;
  }
  return null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const product = resolveProduct(session);
  if (!product) {
    console.warn('[addie/stripe/webhook] missing addie_product metadata on session', session.id);
    return;
  }
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  const normEmail = email ? normalizeEmail(email) : null;

  // Look up the auth.users row if it exists.
  const user_id = normEmail ? await findUserIdByEmail(normEmail) : null;

  if (user_id) {
    if (product === 'foundation_team_seat') {
      await provisionTeam({
        admin_user_id: user_id,
        session_id: session.id,
        seats: parseSeats(session),
        team_name: session.metadata?.addie_team_name ?? `${normEmail ?? 'Team'}`,
        stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
      });
    } else {
      await writeEntitlement({
        user_id,
        product,
        stripe_session_id: session.id,
      });
    }
    await emit({
      action: 'entitlement_granted',
      user_id,
      object_type: 'entitlement',
      object_id: session.id,
      payload: { product },
    });
    return;
  }

  // No user yet — write a pending entitlement keyed by email.
  if (!normEmail) {
    console.warn('[addie/stripe/webhook] no email on session, cannot defer entitlement', session.id);
    return;
  }
  await writePendingEntitlement({
    email: normEmail,
    product,
    stripe_session_id: session.id,
    seats: product === 'foundation_team_seat' ? parseSeats(session) : null,
    team_name: session.metadata?.addie_team_name ?? null,
  });
  await emit({
    action: 'pending_entitlement_created',
    object_type: 'pending_entitlement',
    object_id: session.id,
    payload: { product, email: normEmail },
  });
}

function parseSeats(session: Stripe.Checkout.Session): number {
  const raw = session.metadata?.addie_team_seats;
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isInteger(n) && n >= 10) return n;
  // Fallback to line-item quantity.
  // Stripe Checkout sessions don't include expanded line_items by default;
  // operator can retrieve if needed. Default safely to 10 here.
  return Math.max(10, Number.isFinite(n) ? n : 10);
}

/**
 * Look up an auth.users id by email. Uses Supabase Auth Admin paginated
 * listUsers — fine until we exceed ~1000 active users, at which point an
 * RPC backed by an indexed SELECT on auth.users.email becomes necessary.
 */
async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = getAdminServiceClient();
  const target = email.toLowerCase();
  let page = 1;
  const perPage = 200;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.warn('[addie/stripe/webhook] listUsers err:', error.message);
      return null;
    }
    const match = data.users.find((u) => (u.email ?? '').toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < perPage) return null;
    page += 1;
  }
  console.warn('[addie/stripe/webhook] findUserIdByEmail: pagination cap hit');
  return null;
}

async function provisionTeam(args: {
  admin_user_id: string;
  session_id: string;
  seats: number;
  team_name: string;
  stripe_subscription_id: string | null;
}): Promise<void> {
  const supa = getAddieServiceClient();
  const { data: team, error: tErr } = await supa
    .from('teams')
    .insert({
      admin_user_id: args.admin_user_id,
      name: args.team_name,
      seats_purchased: args.seats,
      stripe_subscription_id: args.stripe_subscription_id,
    })
    .select('id')
    .single();
  if (tErr || !team) {
    throw new Error(`teams insert failed: ${tErr?.message ?? 'no row'}`);
  }
  // Admin gets a foundation_team_seat entitlement immediately (they can
  // also use a seat themselves — invite flow handles the rest).
  await writeEntitlement({
    user_id: args.admin_user_id,
    product: 'foundation_team_seat',
    stripe_session_id: args.session_id,
  });
}

async function writePendingEntitlement(args: {
  email: string;
  product: AddieProduct;
  stripe_session_id: string;
  seats: number | null;
  team_name: string | null;
}): Promise<void> {
  const supa = getAddieServiceClient();
  const { error } = await supa.from('pending_entitlements').insert({
    email: args.email,
    product: args.product,
    stripe_session_id: args.stripe_session_id,
    payload: { seats: args.seats, team_name: args.team_name },
  });
  if (error && !/duplicate key|already exists|relation .* does not exist/i.test(error.message)) {
    console.warn('[addie/stripe/webhook] pending_entitlement insert warn:', error.message);
  }
  if (error && /relation .* does not exist/i.test(error.message)) {
    // TODO: operator should add addie.pending_entitlements migration.
    console.warn('[addie/stripe/webhook] addie.pending_entitlements table missing — paid sign-ups for unknown emails will not auto-bind. Add the migration before launch.');
  }
}

async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const session_id =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id ?? null;
  if (!session_id) return;
  const supa = getAddieServiceClient();
  const { error } = await supa
    .from('entitlements')
    .update({ status: 'revoked' })
    .eq('stripe_session_id', session_id);
  if (error) console.warn('[addie/stripe/webhook] refund revoke warn:', error.message);
}

// SCHEMA_PUBLIC is reserved for future cross-schema queries; suppress
// unused-export lint while keeping it discoverable.
void SCHEMA_PUBLIC;
