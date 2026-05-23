// POST /api/addie/checkout/assessment — $99 In-Depth Assessment.

import { NextResponse, type NextRequest } from 'next/server';
import { createAssessmentCheckout } from '@/lib/addie/stripe/checkout';
import { isValidEmail } from '@/lib/addie/supabase/service';
import { readAnonSession } from '@/lib/addie/auth/anonSession';
import { emit } from '@/lib/addie/events/emit';

export const runtime = 'nodejs';

interface Body {
  email?: unknown;
  success_url?: unknown;
  cancel_url?: unknown;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    // empty body is ok
  }
  const email = isValidEmail(body.email) ? (body.email as string) : null;

  try {
    const session = await createAssessmentCheckout({
      email,
      success_url: typeof body.success_url === 'string' ? body.success_url : undefined,
      cancel_url: typeof body.cancel_url === 'string' ? body.cancel_url : undefined,
    });
    await emit({
      action: 'checkout_started',
      anon_session_id: readAnonSession(req).id,
      object_type: 'checkout_session',
      object_id: session.id,
      payload: { product: 'assessment_in_depth', email },
    });
    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[addie/checkout/assessment] failed:', message);
    return NextResponse.json({ error: 'checkout_failed', detail: message }, { status: 500 });
  }
}
