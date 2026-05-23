/**
 * POST /api/sandbox/ab — thin Next.js shim for sandbox A/B mode.
 * Mirrors /api/sandbox/run/route.ts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  abInputSchema,
  runSandboxAb,
} from '../../../../../sandbox-service/src/handlers/ab';
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

  const parsed = abInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const identity = await resolveSandboxIdentity(req);
  if (!identity.learnerId && !identity.anonSessionId) {
    return NextResponse.json({ error: 'no_session' }, { status: 401 });
  }

  try {
    const result = await runSandboxAb({
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
    console.error('sandbox-service: unhandled error (ab)', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
