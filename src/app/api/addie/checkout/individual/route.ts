// POST /api/addie/checkout/individual — $295 Foundation. Auth Spec §6.1.

import { NextResponse, type NextRequest } from 'next/server';
import { createIndividualCheckout } from '@/lib/addie/stripe/checkout';
import { isValidEmail } from '@/lib/addie/supabase/service';
import { readAnonSession } from '@/lib/addie/auth/anonSession';
import { emit } from '@/lib/addie/events/emit';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';

export const runtime = 'nodejs';

interface Body {
  email?: unknown;
  success_url?: unknown;
  cancel_url?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-checkout-individual',
    limit: 10,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    // empty body is acceptable
  }
  const email = isValidEmail(body.email) ? (body.email as string) : null;

  try {
    const session = await createIndividualCheckout({
      email,
      success_url: typeof body.success_url === 'string' ? body.success_url : undefined,
      cancel_url: typeof body.cancel_url === 'string' ? body.cancel_url : undefined,
    });
    const anon = readAnonSession(req).id;
    await emit({
      action: 'checkout_started',
      anon_session_id: anon,
      object_type: 'checkout_session',
      object_id: session.id,
      payload: { product: 'foundation_individual', email },
    });
    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[addie/checkout/individual] failed:', message);
    return NextResponse.json({ error: 'checkout_failed', detail: message }, { status: 500 });
  }
}
