// POST /api/auth/signup
//
// Server-side signup using Supabase service-role admin. Bypasses
// Supabase's hosted email-confirmation step entirely (we set
// email_confirm: true), which sidesteps SMTP misconfigurations and
// rate limits — the documented escape hatch in
// .claude/projects/.../memory/feedback_resend_workspace_and_admin_escape_hatch.md.
//
// The client follows up with a normal signInWithPassword to establish
// the session cookie; this endpoint only creates the auth.users row.
//
// Request body:
//   { email: string; password: string; fullName: string;
//     institutionName?: string }
//
// Returns:
//   200 { ok: true } — account created (or already existed; idempotent)
//   400 { error }    — validation failure
//   409 { error }    — email already in use with a DIFFERENT account state
//   500 { error }    — admin API failure

import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface SignupBody {
  readonly email?: unknown;
  readonly password?: unknown;
  readonly fullName?: unknown;
  readonly institutionName?: unknown;
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return bad('Invalid JSON body.');
  }

  const email =
    typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const fullName =
    typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const institutionName =
    typeof body.institutionName === 'string'
      ? body.institutionName.trim()
      : '';

  if (!EMAIL_RE.test(email)) return bad('A valid email is required.');
  if (password.length < MIN_PASSWORD_LENGTH) {
    return bad(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (fullName.length === 0) return bad('Full name is required.');

  const supabase = createServiceRoleClient();

  try {
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        institution_name: institutionName,
      },
    });

    if (error) {
      const message = error.message ?? 'Failed to create account.';
      // Already-registered user: surface a clear conflict status so the
      // client can suggest sign-in instead of retrying.
      if (
        message.toLowerCase().includes('already') ||
        message.toLowerCase().includes('registered') ||
        message.toLowerCase().includes('exists')
      ) {
        return bad('An account with this email already exists. Try signing in instead.', 409);
      }
      console.error('[api/auth/signup] admin.createUser failed:', error);
      return bad(message, 500);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/auth/signup] unexpected error:', err);
    return bad('Internal error during signup.', 500);
  }
}
