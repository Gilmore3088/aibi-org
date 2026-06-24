// POST /api/inquiry
// Certification inquiry form — validates, logs, sends ack email.

import { NextResponse } from 'next/server';
import { sendInquiryAck, sendInquiryNotification, sendResourceDelivery } from '@/lib/resend';
import { resolveDeliverableResource } from '@/lib/resources/resourceDelivery';
import { ensureAuthUser } from '@/lib/supabase/auth-admin';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { subscribeToPlaybookForm } from '@/lib/mailerlite';
import { createSupportCase } from '@/lib/support/cases';
import { getSupportInboxEmail } from '@/lib/support/admin';
import { setFreeResourceCaptureCookie } from '@/lib/resources/captureCookie';

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
  'partner-rollout-request',
  'cohort-pilot-request',
  'project-plan-request',
  'team-rollout-request',
  'team-assessment-request',
  'foundation-seats-request',
]);

const TEAM_SUPPORT_TYPES = new Set([
  'partner-rollout-request',
  'cohort-pilot-request',
  'project-plan-request',
  'team-rollout-request',
  'team-assessment-request',
  'foundation-seats-request',
]);
const RESOURCE_CAPTURE_INQUIRY_TYPES = new Set([
  'guide-request',
  'playbook-request',
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

function productForInquiryType(type: string): string {
  if (type === 'foundation-seats-request') return 'foundation-course-seats';
  if (type === 'partner-rollout-request') return 'partner-rollout';
  if (type === 'cohort-pilot-request') return 'cohort-pilot';
  if (type === 'project-plan-request') return 'project-plan';
  return 'team-assessment';
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

  const firstName = body.name.split(' ')[0] ?? body.name;
  const track = body.track || 'AiBI';
  const notes = body.notes.trim();

  // Provision a Supabase Auth account for the inquirer so they have a
  // real identity if they later take the assessment or buy a course.
  // Idempotent and non-blocking.
  ensureAuthUser(body.email).catch((err) =>
    console.warn('[inquiry] auth-admin skip', err),
  );

  // Resource requests (the Safe AI Use Guide and role playbooks) get the file
  // emailed to them, not a generic "we'll follow up" acknowledgement. The form
  // also triggers an immediate browser download; the email is the durable copy
  // the requester can find later. Other inquiry types keep the ack.
  //   guide-request    → track is a label; the artifact is the Safe AI Use Guide
  //   playbook-request → track is "{role}-playbook", which is the resource slug
  const deliverableSlug =
    body.type === 'guide-request'
      ? 'aibi-safe-ai-use-guide'
      : body.type === 'playbook-request'
        ? body.track
        : null;
  const deliverable = deliverableSlug ? resolveDeliverableResource(deliverableSlug) : null;

  if (deliverable) {
    sendResourceDelivery({
      email: body.email,
      title: deliverable.title,
      downloadUrl: deliverable.downloadUrl,
      firstName,
    }).catch((err) => console.warn('[inquiry] resource delivery skip', err));
  } else {
    // Acknowledgement email — fire-and-forget, never blocks the response.
    sendInquiryAck({
      email: body.email,
      name: firstName,
      institution: body.institution,
      track,
    }).catch((err) => console.warn('[inquiry] resend skip', err));
  }

  sendInquiryNotification({
    to: getSupportInboxEmail(),
    name: body.name,
    email: body.email,
    institution: body.institution,
    track,
    type: body.type,
    notes,
  }).catch((err) => console.warn('[inquiry] owner notification skip', err));

  if (TEAM_SUPPORT_TYPES.has(body.type)) {
    await createSupportCase({
      buyerEmail: body.email,
      subject: `Institution inquiry: ${track}`,
      summary: [
        `Name: ${body.name}`,
        `Institution: ${body.institution}`,
        `Track: ${track}`,
        '',
        notes || 'No notes provided.',
      ].join('\n'),
      category: 'team_seats',
      priority: body.type === 'team-assessment-request'
        || body.type === 'partner-rollout-request'
        || body.type === 'cohort-pilot-request'
        || body.type === 'project-plan-request'
        ? 'high'
        : 'normal',
      source: 'buyer_form',
      product: productForInquiryType(body.type),
      actorType: 'customer',
      actorEmail: body.email,
      metadata: {
        inquiryType: body.type,
        track,
      },
    }).catch((err) => console.warn('[inquiry] support case skip', err));
  }

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
        firstName,
        role,
        institution: body.institution,
      }).catch((err) => console.warn('[inquiry] mailerlite skip', err));
    } else {
      console.warn('[inquiry] playbook-request with disallowed role:', role);
    }
  }

  const response = NextResponse.json({ ok: true });
  return RESOURCE_CAPTURE_INQUIRY_TYPES.has(body.type)
    ? setFreeResourceCaptureCookie(response, body.email)
    : response;
}
