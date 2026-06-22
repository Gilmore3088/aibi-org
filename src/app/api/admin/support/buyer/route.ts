import { NextResponse } from 'next/server';
import { getSupportAdminSession } from '@/lib/support/auth';
import { findBuyerEmailByStripeSession, getBuyerSnapshot } from '@/lib/support/buyer';
import { isValidSupportEmail, normalizeBuyerEmail } from '@/lib/support/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authError(status: number, reason: string): NextResponse {
  return NextResponse.json({ ok: false, error: reason }, { status });
}

export async function GET(request: Request): Promise<NextResponse> {
  const session = await getSupportAdminSession();
  if (!session.ok) return authError(session.status, session.reason);

  const url = new URL(request.url);
  const stripeSessionId = url.searchParams.get('stripeSessionId')?.trim() || null;
  let email = url.searchParams.get('email')?.trim() || null;

  if (!email && stripeSessionId) {
    email = await findBuyerEmailByStripeSession(stripeSessionId);
  }

  if (!email || !isValidSupportEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'A valid email or known Stripe session ID is required.' },
      { status: 400 },
    );
  }

  const buyer = await getBuyerSnapshot(normalizeBuyerEmail(email), stripeSessionId);
  return NextResponse.json({ ok: true, buyer });
}
