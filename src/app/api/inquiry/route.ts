// POST /api/inquiry
// Certification inquiry form — validates, logs, sends ack email.

import { NextResponse } from 'next/server';
import { sendInquiryAck } from '@/lib/resend';
import { ensureAuthUser } from '@/lib/supabase/auth-admin';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { subscribeToPlaybookForm } from '@/lib/mailerlite';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Input-length caps. The pre-existing validator only checked non-empty;
// any unbounded field could be emailed to ops via Resend or templated
// into MailerLite. These limits comfortably exceed legit input.
const MAX_NAME = 120;
const MAX_EMAIL = 254; // RFC 5321 path-length bound
const MAX_INSTITUTION = 200;
const MAX_TRACK = 64;
const MAX_NOTES = 2000;
const MAX_TYPE = 32;

// Inquiry `type` allowlist. Each value matches a known caller (the
// playbook download modal, the safe-AI-use guide form, the certifications
// inquiry form). Unknown types reach the API but get rejected here so an
// attacker cannot inject arbitrary segmentation tags into MailerLite.
const ALLOWED_TYPES = new Set([
  'guide-request',
  'playbook-request',
  'certification-inquiry',
  'briefing-request',
]);

// Role allowlist for playbook-request `track` (which is "{role}-playbook").
// Mirrors PLAYBOOK_INDEX in src/app/playbooks/data.ts.
const ALLOWED_PLAYBOOK_ROLES = new Set([
  'compliance',
  'retail',
  'marketing',
  'lending',
  'bsa-aml',
  'infosec',
]);

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
  if (typeof p.name !== 'string' || p.name.trim().length === 0 || p.name.length > MAX_NAME) return false;
  if (typeof p.email !== 'string' || !EMAIL_RE.test(p.email) || p.email.length > MAX_EMAIL) return false;
  if (typeof p.institution !== 'string' || p.institution.trim().length === 0 || p.institution.length > MAX_INSTITUTION) return false;
  if (typeof p.track !== 'string' || p.track.length > MAX_TRACK) return false;
  if (typeof p.notes !== 'string' || p.notes.length > MAX_NOTES) return false;
  if (typeof p.type !== 'string' || p.type.length > MAX_TYPE) return false;
  if (!ALLOWED_TYPES.has(p.type)) return false;
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

  // Playbook PDF requests route to the playbook MailerLite group with
  // role stored as a custom field so per-role segments can fan out.
  // Track is "{role}-playbook" e.g. "compliance-playbook". Role is
  // allowlisted to the six canonical playbooks so an attacker cannot
  // inject arbitrary segmentation labels into MailerLite.
  if (body.type === 'playbook-request') {
    const role = body.track.replace(/-playbook$/, '');
    if (ALLOWED_PLAYBOOK_ROLES.has(role)) {
      subscribeToPlaybookForm({
        email: body.email,
        firstName: body.name.split(' ')[0] ?? body.name,
        role,
        institution: body.institution,
      }).catch((err) => console.warn('[inquiry] mailerlite skip', err));
    } else {
      console.warn('[inquiry] playbook-request with disallowed role:', role);
    }
  }

  return NextResponse.json({ ok: true });
}
