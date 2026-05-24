// POST /api/addie/assessment/results
// Persists a completed In-Depth Readiness Assessment to addie.assessment_results
// and emits an assessment_completed event. Idempotent on stripe_session_id
// (or (email, date) when absent).
//
// PRD §6.6 — four deliverables (dimensional scorecard, plan, ideas+prompts, CTAs).

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';
import { resolveAddieIdentity } from '@/lib/addie/auth/resolveIdentity';
import { persistAssessment } from '@/lib/addie/assessment/persist';
import { isDimensionKey, DIMENSION_KEYS } from '@/lib/addie/assessment/dimensions';
import { emit } from '@/lib/addie/events/emit';

export const runtime = 'nodejs';

const BodySchema = z.object({
  email: z.string().email().max(254),
  raw_answers: z
    .array(
      z.object({
        question_id: z.string().min(1).max(64),
        value: z.number().int().min(1).max(4),
      }),
    )
    .min(1)
    .max(96),
  dimension_scores: z.record(z.string(), z.number()).refine(
    (rec) => {
      const keys = Object.keys(rec);
      if (keys.length !== DIMENSION_KEYS.length) return false;
      return keys.every(isDimensionKey);
    },
    { message: 'dimension_scores must contain all 8 canonical dimension keys' },
  ),
  plan_md: z.string().max(50_000).optional().nullable(),
  ideas_prompts_md: z.string().max(50_000).optional().nullable(),
  ctas_md: z.string().max(20_000).optional().nullable(),
  stripe_session_id: z.string().max(255).optional().nullable(),
  marketing_opt_in: z.boolean().optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-assessment-results',
    limit: 5,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;

  const identity = await resolveAddieIdentity(req);

  try {
    const result = await persistAssessment({
      email: body.email,
      raw_answers: body.raw_answers,
      dimension_scores: body.dimension_scores,
      plan_md: body.plan_md ?? null,
      ideas_prompts_md: body.ideas_prompts_md ?? null,
      ctas_md: body.ctas_md ?? null,
      stripe_session_id: body.stripe_session_id ?? null,
      user_id: identity.user_id,
      lead_id: identity.lead_id,
      marketing_opt_in: body.marketing_opt_in === true,
    });

    await emit({
      action: 'assessment_completed',
      user_id: identity.user_id,
      lead_id: identity.lead_id,
      anon_session_id: identity.anon_session_id,
      object_type: 'assessment_result',
      object_id: result.id,
      payload: {
        created: result.created,
        stripe_session_id: body.stripe_session_id ?? null,
      },
    });

    return NextResponse.json(
      {
        id: result.id,
        view_url: `/foundation/assessment/${result.id}`,
        created: result.created,
      },
      { status: result.created ? 201 : 200 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error('[api/addie/assessment/results POST] failed:', msg);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
