import { NextResponse } from 'next/server';
import { subscribeToGroup } from '@/lib/mailerlite';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { EMAIL_RE } from '@/lib/email/validate';

// Opt-in for the weekly briefings digest. MailerLite only: the visitor joins
// the "Briefing Subscribers" group (MAILERLITE_GROUP_ID_BRIEFINGS). No
// automation is attached to that group; the digest is a campaign James
// reviews and sends by hand each week.

interface Body {
  readonly email?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await rateLimitOrFail({
    key: 'briefings-subscribe',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email.trim())) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const result = await subscribeToGroup(
    { email, fields: { lead_source: 'briefings-digest' } },
    process.env.MAILERLITE_GROUP_ID_BRIEFINGS,
  );

  if (result.status === 'failed') {
    console.error('[briefings/subscribe] mailerlite failed', result.reason);
    return NextResponse.json({ error: 'Could not subscribe right now.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
