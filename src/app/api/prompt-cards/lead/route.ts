import { NextResponse } from 'next/server';
import { recordLead } from '@/lib/leads/recordLead';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { freeResourceCaptureResponse } from '@/lib/resources/captureCookie';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(['practitioner', 'compliance-risk', 'executive', 'training-buyer', 'other']);

interface LeadBody {
  readonly email?: unknown;
  readonly role?: unknown;
  readonly institutionType?: unknown;
  readonly assetSize?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await rateLimitOrFail({
    key: 'prompt-cards-lead',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email.trim())) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  }
  if (typeof body.role !== 'string' || !ROLES.has(body.role)) {
    return NextResponse.json({ error: 'Role is required.' }, { status: 400 });
  }

  const email = body.email.trim().toLowerCase();
  const institutionType = typeof body.institutionType === 'string' ? body.institutionType : null;
  const assetSize = typeof body.assetSize === 'string' ? body.assetSize : null;

  // Unified capture: Supabase `leads` row + MailerLite (Resource Library group)
  // with context fields that exist. The prompt_card_leads upsert below stays
  // for back-compat with existing funnel views.
  await recordLead({
    email,
    source: 'prompt-cards',
    role: body.role,
    ...(institutionType ? { institution: institutionType } : {}),
    ...(assetSize ? { metadata: { assetSize } } : {}),
  }).catch((err) => console.warn('[prompt-cards/lead] recordLead skip', err));

  if (isSupabaseConfigured()) {
    const client = createServiceRoleClient();
    const { error } = await client
      .from('prompt_card_leads')
      .upsert({
        email,
        role: body.role,
        institution_type: institutionType,
        asset_size: assetSize,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (error) {
      console.error('[prompt-cards/lead] insert failed:', error);
      return NextResponse.json({ error: 'Could not save lead.' }, { status: 500 });
    }
  }

  return freeResourceCaptureResponse({ ok: true }, email);
}
