// POST /api/inquiry
// Certification inquiry form — validates, logs, sends ack email.

import { NextResponse } from 'next/server';
import { sendInquiryAck } from '@/lib/resend';
import { ensureAuthUser } from '@/lib/supabase/auth-admin';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InquiryPayload {
  name?: unknown;
  email?: unknown;
  institution?: unknown;
  track?: unknown;
  notes?: unknown;
  type?: unknown;
}

function isValid(p: InquiryPayload): p is {
  name: string;
  email: string;
  institution: string;
  track: string;
  notes: string;
  type: string;
} {
  if (typeof p.name !== 'string' || p.name.trim().length === 0) return false;
  if (typeof p.email !== 'string' || !EMAIL_RE.test(p.email)) return false;
  if (typeof p.institution !== 'string' || p.institution.trim().length === 0) return false;
  if (typeof p.track !== 'string') return false;
  if (typeof p.notes !== 'string') return false;
  if (typeof p.type !== 'string') return false;
  return true;
}

export async function POST(request: Request) {
  const limited = await rateLimitOrFail({
    key: 'inquiry',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 5,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  let body: InquiryPayload;
  try {
    body = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  console.info('[inquiry]', {
    ...body,
    at: new Date().toISOString(),
  });

  // Provision a Supabase Auth account for the inquirer so they have a
  // real identity if they later take the assessment or buy a course.
  // Idempotent and non-blocking.
  ensureAuthUser(body.email).catch((err) =>
    console.warn('[inquiry] auth-admin skip', err),
  );

  // Acknowledgement email — fire-and-forget, never blocks the response.
  sendInquiryAck({
    email: body.email,
    name: body.name.split(' ')[0] ?? body.name,
    institution: body.institution,
    track: body.track || 'AiBI',
  }).catch((err) => console.warn('[inquiry] resend skip', err));

  return NextResponse.json({ ok: true });
}
