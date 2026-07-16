import { NextResponse } from 'next/server';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { emailVariants } from '@/lib/email/canonicalize';
import { sendAuthSignInLink } from '@/lib/resend';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { ensureAuthUser, generateMagicLink } from '@/lib/supabase/auth-admin';
import { normalizeProduct } from '@/lib/products/normalize';
import { EMAIL_RE } from '@/lib/email/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


interface Payload {
  readonly email?: unknown;
}

interface EnrollmentRow {
  readonly id: string;
  readonly email: string;
  readonly product: string;
  readonly user_id: string | null;
  readonly enrolled_at: string | null;
  readonly created_at: string;
}

function genericResponse(): NextResponse {
  return NextResponse.json({
    ok: true,
    message: 'If that email has a purchase, a fresh access link is on its way.',
  });
}

function nextPathForProduct(product: string): string | null {
  if (product === 'in-depth-assessment') return '/assessment/in-depth/take';
  if (normalizeProduct(product) === 'foundation') return '/courses/foundation/program';
  return null;
}

function newestFirst(a: EnrollmentRow, b: EnrollmentRow): number {
  const at = Date.parse(a.enrolled_at ?? a.created_at);
  const bt = Date.parse(b.enrolled_at ?? b.created_at);
  return bt - at;
}

function uniqueEnrollments(rows: readonly EnrollmentRow[]): EnrollmentRow[] {
  const seen = new Set<string>();
  const out: EnrollmentRow[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

async function findLatestRecoverableEnrollment(email: string): Promise<EnrollmentRow | null> {
  if (!isSupabaseConfigured()) return null;

  const service = createServiceRoleClient();
  const { userId } = await ensureAuthUser(email);
  const variants = emailVariants(email);
  const reads: PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>[] = [
    service
      .from('course_enrollments')
      .select('id, email, product, user_id, enrolled_at, created_at')
      .in('email', variants),
  ];

  if (userId) {
    reads.push(
      service
        .from('course_enrollments')
        .select('id, email, product, user_id, enrolled_at, created_at')
        .eq('user_id', userId),
    );
  }

  const results = await Promise.all(reads);
  const rows: EnrollmentRow[] = [];
  for (const result of results) {
    if (result.error) {
      console.warn('[auth/resend-purchase-link] enrollment lookup skipped:', result.error.message);
      continue;
    }
    rows.push(...((result.data ?? []) as EnrollmentRow[]));
  }

  return (
    uniqueEnrollments(rows)
      .filter((row) => nextPathForProduct(row.product))
      .sort(newestFirst)[0] ?? null
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const limitedIp = await rateLimitOrFail({
    key: 'resend-purchase-link',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 6,
    windowSeconds: 3600,
  });
  if (limitedIp) return limitedIp;

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 });
  }

  const limitedEmail = await rateLimitOrFail({
    key: 'resend-purchase-link',
    scope: 'email',
    identifier: email,
    max: 3,
    windowSeconds: 3600,
  });
  if (limitedEmail) return limitedEmail;

  try {
    const enrollment = await findLatestRecoverableEnrollment(email);
    const nextPath = enrollment ? nextPathForProduct(enrollment.product) : null;
    if (nextPath) {
      const accessUrl = await generateMagicLink(email, nextPath);
      if (accessUrl) {
        await sendAuthSignInLink({ email, accessUrl });
      }
    }
  } catch (err) {
    console.warn('[auth/resend-purchase-link] skipped:', err);
  }

  return genericResponse();
}
