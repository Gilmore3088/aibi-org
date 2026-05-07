// POST /api/subscribe-newsletter
// Validates, logs, and subscribes the visitor to the newsletter form.
// No-op when CONVERTKIT_NEWSLETTER_FORM_ID is unset (returns ok=true
// so the UI does not block on missing config).

import { NextResponse } from 'next/server';
import { subscribeToNewsletterForm } from '@/lib/convertkit';
import { ensureAuthUser } from '@/lib/supabase/auth-admin';

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

  // Provision a Supabase Auth account for this email so newsletter
  // subscribers have a real identity if they later take the assessment,
  // log in, or buy a course. Idempotent and non-blocking.
  ensureAuthUser(email).catch((err) =>
    console.warn('[subscribe-newsletter] auth-admin skip', err),
  );

  await subscribeToNewsletterForm({ email, tags: ['newsletter', `source:${source}`] }).catch(
    (err) => console.warn('[subscribe-newsletter] skip', err)
  );

  return NextResponse.json({ ok: true });
}
