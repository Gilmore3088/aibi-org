/**
 * POST /api/skill/run — thin Next.js shim for sandbox skill mode (M4).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  runSkill,
  skillInputSchema,
} from '../../../../../sandbox-service/src/handlers/skill';
import { SandboxError } from '../../../../../sandbox-service/src/handlers/shared';
import { getClientIp, resolveSandboxIdentity } from '@/lib/addie/sandbox/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = skillInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const identity = await resolveSandboxIdentity(req);
  if (!identity.learnerId) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  }

  try {
    const result = await runSkill({
      ...parsed.data,
      identity,
      ipAddress: getClientIp(req),
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SandboxError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_body', issues: err.issues }, { status: 400 });
    }
    console.error('sandbox-service: unhandled error (skill)', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
