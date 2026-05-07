// POST /api/inquiry
// Certification inquiry form — validates, logs, stubs HubSpot adapter.

import { NextResponse } from 'next/server';
import { upsertContact } from '@/lib/hubspot';
import { sendInquiryAck } from '@/lib/resend';

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

  await upsertContact({
    email: body.email,
    assessmentScore: 0,
    scoreTier: 'inquiry-only',
    institutionName: body.institution,
  }).catch((err) => console.warn('[inquiry] hubspot skip', err));

  // Acknowledgement email — fire-and-forget, never blocks the response.
  sendInquiryAck({
    email: body.email,
    name: body.name.split(' ')[0] ?? body.name,
    institution: body.institution,
    track: body.track || 'AiBI',
  }).catch((err) => console.warn('[inquiry] resend skip', err));

  return NextResponse.json({ ok: true });
}
