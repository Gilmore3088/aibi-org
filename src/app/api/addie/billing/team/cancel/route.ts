// POST /api/addie/billing/team/cancel
//
// Team admin cancels the team. Every active seat is revoked, the prorated
// unused portion of the seat block is refunded (capped at 12 months), and
// every seated learner gets a notification. Destructive — UI must confirm.

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  createServerClientWithCookies,
  isSupabaseConfigured,
} from '@/lib/supabase/client';
import { cancelTeam } from '@/lib/addie/billing/teamRefund';
import { recordBillingAudit } from '@/lib/addie/billing/audit';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';

export const runtime = 'nodejs';

const BodySchema = z
  .object({
    team_id: z.string().min(1).max(64),
    confirm: z.literal(true),
  })
  .strict();

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-billing-team-cancel',
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
      action: 'team_cancelled',
      user_id: userRes.user.id,
      team_id: parsed.team_id,
      status: 'skipped',
      detail: { reason: 'SKIP_STRIPE' },
    });
    return NextResponse.json({
      cancelled: true,
      seats_revoked: 0,
      refund: { refunded: false, amount_cents: 0, stripe_refund_id: null, reason: 'SKIP_STRIPE' },
      notified_emails: [],
      skipped: true,
    });
  }

  try {
    const result = await cancelTeam({
      team_id: parsed.team_id,
      admin_user_id: userRes.user.id,
    });
    await recordBillingAudit({
      action: 'team_cancelled',
      user_id: userRes.user.id,
      team_id: parsed.team_id,
      stripe_event_id: result.refund.stripe_refund_id,
      amount_cents: result.refund.amount_cents,
      currency: 'usd',
      status: 'ok',
      detail: {
        seats_revoked: result.seats_revoked,
        notified: result.notified_emails.length,
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    const status = /forbidden|not team admin/i.test(message)
      ? 403
      : /not_found/i.test(message)
        ? 404
        : 500;
    await recordBillingAudit({
      action: 'team_cancelled',
      user_id: userRes.user.id,
      team_id: parsed.team_id,
      status: 'error',
      detail: { message },
    });
    return NextResponse.json({ error: 'cancel_failed', detail: message }, { status });
  }
}
