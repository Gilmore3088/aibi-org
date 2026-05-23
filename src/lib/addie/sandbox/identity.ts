/**
 * Shared identity + IP resolution for the sandbox-service shim routes.
 * Mirrors the original inlined helpers in /api/sandbox/run/route.ts so the
 * /sandbox/ab and /skill/run shims don't drift.
 */

import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { readAnonSession } from '@/lib/addie/auth/anonSession';
import type { LearnerIdentity } from '../../../../sandbox-service/src/types';

export async function resolveSandboxIdentity(
  req: NextRequest,
): Promise<LearnerIdentity> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: () => {
          /* no-op */
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return { learnerId: user.id, anonSessionId: null };
  }

  const { id } = readAnonSession(req);
  if (id) return { learnerId: null, anonSessionId: id };

  return { learnerId: null, anonSessionId: null };
}

export function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? null;
}
