// POST /api/addie/billing/team/seats/revoke
//
// Billing-flavored seat revoke. Wraps the existing
// /api/addie/team/seats/revoke endpoint with prorated-refund handling
// against the team's original Stripe charge. The non-billing endpoint
// remains for admin-only seat hygiene without refund semantics.

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  createServerClientWithCookies,
  isSupabaseConfigured,
} from '@/lib/supabase/client';
import { revokeSeatWithRefund } from '@/lib/addie/billing/teamRefund';
import { recordBillingAudit } from '@/lib/addie/billing/audit';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';

export const runtime = 'nodejs';

const BodySchema = z
  .object({
    seat_id: z.string().min(1).max(64),
  })
  .strict();

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-billing-seat-revoke',
    limit: 10,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'auth_unconfigured' }, { status: 503 });
  }
  const supabase = createServerClientWithCookies(cookies());
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    const raw = await req.json();
    parsed = BodySchema.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (process.env.SKIP_STRIPE === 'true') {
    await recordBillingAudit({
      action: 'seat_revoked_no_refund',
      user_id: userRes.user.id,
      status: 'skipped',
      detail: { seat_id: parsed.seat_id, reason: 'SKIP_STRIPE' },
    });
    return NextResponse.json({
      revoked: true,
      refund: { refunded: false, amount_cents: 0, stripe_refund_id: null, reason: 'SKIP_STRIPE' },
    });
  }

  try {
    const result = await revokeSeatWithRefund({
      seat_id: parsed.seat_id,
      admin_user_id: userRes.user.id,
    });
    await recordBillingAudit({
      action: result.refund.refunded
        ? 'seat_revoked_with_refund'
        : 'seat_revoked_no_refund',
      user_id: userRes.user.id,
      stripe_event_id: result.refund.stripe_refund_id,
      amount_cents: result.refund.amount_cents,
      currency: 'usd',
      status: 'ok',
      detail: { seat_id: parsed.seat_id, reason: result.refund.reason ?? null },
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    const status = /forbidden|not team admin/i.test(message)
      ? 403
      : /not_found/i.test(message)
        ? 404
        : 400;
    await recordBillingAudit({
      action: 'seat_revoked_no_refund',
      user_id: userRes.user.id,
      status: 'error',
      detail: { seat_id: parsed.seat_id, message },
    });
    return NextResponse.json({ error: 'revoke_failed', detail: message }, { status });
  }
}
