// GET /api/health/stripe
//
// Reports Stripe key mode (test vs live) and presence without exposing
// the key itself. Lets the operator confirm that live keys are wired in
// production before going live.
//
// Example response:
//   { "mode": "live", "configured": true }
//   { "mode": "test", "configured": true }
//   { "mode": null, "configured": false }

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const key = process.env.STRIPE_SECRET_KEY ?? '';
  const configured = key.length > 0;
  const mode = configured
    ? key.startsWith('sk_live_') ? 'live' : 'test'
    : null;

  return NextResponse.json({ mode, configured });
}
