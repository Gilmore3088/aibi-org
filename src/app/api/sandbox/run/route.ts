/**
 * POST /api/sandbox/run — thin Next.js shim over sandbox-service.
 *
 * Responsibilities:
 *   - Parse + validate the request body.
 *   - Resolve learner identity (Supabase session OR anon_session cookie).
 *   - Delegate to sandbox-service/src/handlers/run.ts.
 *   - Serialize the result / error.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { z } from 'zod';
import {
  runSandbox,
  runInputSchema,
  SandboxError,
} from '../../../../../sandbox-service/src/handlers/run';
import type { LearnerIdentity } from '../../../../../sandbox-service/src/types';
import { readAnonSession } from '@/lib/addie/auth/anonSession';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function resolveIdentity(req: NextRequest): Promise<LearnerIdentity> {
  // 1. Try Supabase session.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: () => {
          /* no-op: this route does not mutate auth cookies */
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return { learnerId: user.id, anonSessionId: null };
    }
  }

  // 2. Fall back to HMAC-signed anon_session cookie (Auth Spec §1).
  const { id } = readAnonSession(req);
  if (id) {
    return { learnerId: null, anonSessionId: id };
  }

  return { learnerId: null, anonSessionId: null };
}

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = runInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const identity = await resolveIdentity(req);
  if (!identity.learnerId && !identity.anonSessionId) {
    return NextResponse.json({ error: 'no_session' }, { status: 401 });
  }

  try {
    const result = await runSandbox({
      ...parsed.data,
      identity,
      ipAddress: clientIp(req),
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SandboxError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'invalid_body', issues: err.issues },
        { status: 400 },
      );
    }
    console.error('sandbox-service: unhandled error', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
