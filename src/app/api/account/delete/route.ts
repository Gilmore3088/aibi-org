// Stub — 30-day soft-delete request endpoint (PRD §6.8).
// Wave 2a: surface a 501. Real implementation arrives with the operator
// runbook and the cron-driven hard-delete reaper.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'not_implemented',
      message: 'Account deletion will be available in a later release. Email hello@aibankinginstitute.com to request deletion.',
    },
    { status: 501 },
  );
}
