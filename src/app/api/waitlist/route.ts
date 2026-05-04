import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_INTERESTS = new Set(['practitioner', 'specialist', 'leader']);

interface WaitlistBody {
  readonly email?: unknown;
  readonly interest?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: WaitlistBody;

  try {
    body = (await request.json()) as WaitlistBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  }

  if (typeof body.interest !== 'string' || !VALID_INTERESTS.has(body.interest)) {
    return NextResponse.json({ error: 'interest must be practitioner, specialist, or leader.' }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('future_course_waitlist')
    .upsert(
      {
        email: body.email.toLowerCase(),
        interest: body.interest,
        source: 'coming-soon',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email,interest' },
    );

  if (error) {
    console.error('[waitlist] insert failed:', error);
    return NextResponse.json({ error: 'Could not save waitlist entry.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
