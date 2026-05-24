// POST /api/addie/billing/portal-session
//
// Returns a Stripe Customer Portal URL for the signed-in learner. The
// portal handles payment-method update, invoice download, and refund/
// cancel requests natively — we just frame the link. Stripe will throw
// if the operator has not configured the portal in the Stripe Dashboard
// (Settings → Billing → Customer portal) — surface the message verbatim.

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  createServerClientWithCookies,
  isSupabaseConfigured,
} from '@/lib/supabase/client';
import { createPortalSession } from '@/lib/addie/billing/portal';
import { recordBillingAudit } from '@/lib/addie/billing/audit';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';

export const runtime = 'nodejs';

const BodySchema = z
  .object({
    return_url: z.string().url().max(2048).optional(),
  })
  .strict();

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com';
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-billing-portal',
    limit: 10,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'auth_unconfigured' }, { status: 503 });
  }
  const supabase = createServerClientWithCookies(cookies());
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user || !userRes.user.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    const raw = await req.json().catch(() => ({}));
    parsed = BodySchema.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const return_url =
    parsed.return_url ?? `${siteUrl().replace(/\/$/, '')}/account/billing`;

  if (process.env.SKIP_STRIPE === 'true') {
    await recordBillingAudit({
      action: 'portal_session_opened',
      user_id: userRes.user.id,
      status: 'skipped',
      detail: { reason: 'SKIP_STRIPE' },
    });
    return NextResponse.json({ url: return_url, skipped: true });
  }

  try {
    const result = await createPortalSession({
      user_id: userRes.user.id,
      email: userRes.user.email,
      return_url,
    });
    if ('error' in result) {
      await recordBillingAudit({
        action: 'portal_session_opened',
        user_id: userRes.user.id,
        status: 'error',
        detail: { reason: result.error },
      });
      const status = result.error === 'no_stripe_customer' ? 404 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }
    await recordBillingAudit({
      action: 'portal_session_opened',
      user_id: userRes.user.id,
      status: 'ok',
      detail: { customer_id: result.customer_id },
    });
    return NextResponse.json({ url: result.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[addie/billing/portal-session] failed:', message);
    await recordBillingAudit({
      action: 'portal_session_opened',
      user_id: userRes.user.id,
      status: 'error',
      detail: { message },
    });
    return NextResponse.json(
      { error: 'portal_failed', detail: message },
      { status: 500 },
    );
  }
}
