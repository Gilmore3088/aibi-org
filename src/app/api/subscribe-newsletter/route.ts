// POST /api/subscribe-newsletter
// MVP: validate, log, stub adapters. Real ConvertKit (or Loops) wiring
// added when CONVERTKIT_NEWSLETTER_FORM_ID is configured.

import { NextResponse } from 'next/server';
import { subscribeToAssessmentForm } from '@/lib/convertkit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribePayload {
  email?: unknown;
  source?: unknown;
}

export async function POST(request: Request) {
  let body: SubscribePayload;
  try {
    body = (await request.json()) as SubscribePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  const email = body.email;
  const source = typeof body.source === 'string' ? body.source : 'unknown';

  console.info('[subscribe-newsletter]', {
    email,
    source,
    at: new Date().toISOString(),
  });

  await subscribeToAssessmentForm({ email, tags: ['newsletter', `source:${source}`] }).catch(
    (err) => console.warn('[subscribe-newsletter] skip', err)
  );

  return NextResponse.json({ ok: true });
}
