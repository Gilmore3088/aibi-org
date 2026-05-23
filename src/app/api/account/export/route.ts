// Stub — full data-export endpoint (PRD §6.8, Security Spec §8 retention).
// Wave 2a: surface a 501 so the UI flow can be linked end-to-end; the
// real implementation arrives in Wave 2/3 along with the operator runbook.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'not_implemented',
      message: 'Data export will be available in a later release. Email hello@aibankinginstitute.com to request your data.',
    },
    { status: 501 },
  );
}

export const GET = POST;
