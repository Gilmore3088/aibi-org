// GET /api/health/email
//
// Returns current email-sending config status without exposing secret values.
// Lets the operator verify config in one HTTP request rather than digging
// through Vercel function logs.
//
// Example response:
//   { "resendKeyPresent": true, "skipResend": false, "fromAddress": "hello@aibankinginstitute.com" }

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return NextResponse.json({
    resendKeyPresent: !!process.env.RESEND_API_KEY,
    skipResend: process.env.SKIP_RESEND === 'true',
    fromAddress: process.env.RESEND_FROM ?? 'hello@aibankinginstitute.com',
  });
}
