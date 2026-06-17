// PATCH /api/assessment/in-depth/institution-context
// Saves institution context from the intake form on /assessment/in-depth/purchased.
//
// Auth model: the buyer supplies the Stripe checkout session_id (from the
// success URL query param). The endpoint validates it against Stripe, pulls the
// buyer email, and resolves the user_profiles row by email.
//
// Alternatively, buyers who are already signed in may supply their profileId
// (same bearer-token model as /api/assessment/in-depth/notes).
//
// Idempotent: repeated saves overwrite; callers may re-submit safely.

import { NextResponse } from 'next/server';
import { isSupabaseConfigured, createServiceRoleClient } from '@/lib/supabase/client';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f-]{36}$/i;
const STRIPE_SESSION_RE = /^cs_(test|live)_[A-Za-z0-9]+$/;

const ALLOWED_ASSET_BANDS = ['sub-300M', '300M-1B', '1B-10B', '10B-plus'] as const;
const ALLOWED_REGULATORS = ['OCC', 'FDIC', 'FRB', 'NCUA', 'state'] as const;

type AssetBand = typeof ALLOWED_ASSET_BANDS[number];
type Regulator = typeof ALLOWED_REGULATORS[number];

interface InstitutionContextInput {
  first_name?: string;
  last_name?: string;
  institution_name?: string;
  asset_band?: AssetBand;
  state?: string;
  regulator?: Regulator;
  dept_fte?: number;
}

interface RequestBody {
  sessionId?: unknown;
  profileId?: unknown;
  context?: unknown;
}

function sanitizeText(val: unknown, maxLen: number): string | undefined {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim().slice(0, maxLen);
  return trimmed || undefined;
}

function sanitizeContext(raw: unknown): InstitutionContextInput | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const src = raw as Record<string, unknown>;
  const out: InstitutionContextInput = {};

  const firstName = sanitizeText(src.first_name, 80);
  if (firstName) out.first_name = firstName;

  const lastName = sanitizeText(src.last_name, 80);
  if (lastName) out.last_name = lastName;

  const institutionName = sanitizeText(src.institution_name, 120);
  if (institutionName) out.institution_name = institutionName;

  if (typeof src.asset_band === 'string' && (ALLOWED_ASSET_BANDS as readonly string[]).includes(src.asset_band)) {
    out.asset_band = src.asset_band as AssetBand;
  }

  if (typeof src.state === 'string' && /^[A-Z]{2}$/.test(src.state)) {
    out.state = src.state;
  }

  if (typeof src.regulator === 'string' && (ALLOWED_REGULATORS as readonly string[]).includes(src.regulator)) {
    out.regulator = src.regulator as Regulator;
  }

  if (typeof src.dept_fte === 'number' && src.dept_fte >= 0 && src.dept_fte <= 100_000) {
    out.dept_fte = Math.round(src.dept_fte);
  }

  return out;
}

async function resolveProfileIdByEmail(email: string): Promise<string | null> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('user_profiles')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
  if (error || !data) return null;
  return data.id as string;
}

async function resolveProfileIdBySessionId(sessionId: string): Promise<string | null> {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  try {
    const { stripe } = await import('@/lib/stripe');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') return null;
    const email = session.customer_details?.email ?? session.customer_email;
    if (!email) return null;
    return resolveProfileIdByEmail(email);
  } catch {
    return null;
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Server not configured.' }, { status: 503 });
  }

  const limited = await rateLimitOrFail({
    key: 'institution-context',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 30,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { sessionId, profileId, context } = body;

  const sanitized = sanitizeContext(context);
  if (!sanitized) {
    return NextResponse.json({ error: 'Invalid context.' }, { status: 400 });
  }

  let resolvedProfileId: string | null = null;

  if (typeof profileId === 'string' && UUID_RE.test(profileId)) {
    resolvedProfileId = profileId;
  } else if (typeof sessionId === 'string' && STRIPE_SESSION_RE.test(sessionId)) {
    resolvedProfileId = await resolveProfileIdBySessionId(sessionId);
  } else {
    return NextResponse.json(
      { error: 'Provide a valid sessionId or profileId.' },
      { status: 400 },
    );
  }

  if (!resolvedProfileId) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  const client = createServiceRoleClient();
  const { error: writeError } = await client
    .from('user_profiles')
    .update({ institution_context: sanitized })
    .eq('id', resolvedProfileId);

  if (writeError) {
    console.error('[institution-context] write error:', writeError.message);
    return NextResponse.json({ error: 'Failed to save.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
