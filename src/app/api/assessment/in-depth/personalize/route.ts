// POST /api/assessment/in-depth/personalize
//
// Generates the three live, institution-specific blocks that make the
// In-Depth report feel hand-written: executive summary, 30-day plan tuned
// to FTE + asset band, and an review-ready narrative tuned to the
// user's primary regulator.
//
// Called by the Action Packet client component on mount (with skeletons
// in the meantime). Results are returned as JSON; the client caches them
// in localStorage keyed by profileId so reloads don't re-spend tokens.
//
// Cost guard: rate-limited 12 calls / IP / hour. Per-call output is
// capped via max_tokens to keep typical spend under $0.02.

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { loadAssessmentResponse } from '@/lib/assessment/load-response';
import { ROLE_V4_META } from '@content/assessments/v4/roles';
import { DIMENSION_LABELS } from '@content/assessments/v4/types';
import { getActionPacket } from '@content/assessments/v4/action-packet';
// NOTE: peer benchmarking, business-case math, vendor intelligence, and
// MRA-theme overlays were removed from the prompt context on 2026-06-01
// because the source data was unverified. The personalization is now
// grounded only in the taker's own answers and the role's templated
// guidance — no unsourced third-party claims may appear in output.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RequestBody {
  readonly profileId?: unknown;
}

interface PersonalizationResult {
  readonly execSummary: string;
  readonly thirtyDayPlan: readonly string[];
  readonly model: string;
  readonly generatedAt: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await rateLimitOrFail({
    key: 'in-depth-personalize',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 12,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const profileId = typeof body.profileId === 'string' ? body.profileId : null;
  if (!profileId) {
    return NextResponse.json({ error: 'profileId required.' }, { status: 400 });
  }

  const response = await loadAssessmentResponse(profileId);
  if (!response || response.version !== 'v4') {
    return NextResponse.json({ error: 'In-Depth (v4) profile not found.' }, { status: 404 });
  }

  const ctx = response.institutionContext ?? {};
  const roleMeta = response.role ? ROLE_V4_META[response.role] : null;
  const packet = getActionPacket(response.role);

  const dimensionLines = (
    Object.entries(response.dimensionBreakdown) as Array<
      [keyof typeof DIMENSION_LABELS, { score: number; label: string }]
    >
  )
    .map(([k, d]) => `${DIMENSION_LABELS[k]}: ${d.score}/100`)
    .join('; ');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI personalization is not configured on this environment.' },
      { status: 503 },
    );
  }

  const client = new Anthropic({ apiKey });

  // System prompt — frozen-ish (high cache-hit rate across reports).
  const system = `You are writing a brief 2-section personalization for a paid In-Depth AI Readiness Diagnostic published by The AI Banking Institute.

Voice:
- Editorial. Second-person ("you", "your"). Banker-direct.
- Specific over clever. Use the reader's exact role and institution name when given.
- Banned: "leverage", "unlock", "supercharge", "revolutionize", "synergy", exclamation points, decorative em-dashes, emoji.

Honesty constraints — HARD RULES:
- Do not claim peer benchmarking, percentile, or "X% of community banks" unless an explicit Peer benchmark is given below. None is given here.
- Do not claim dollar amounts, time savings, or ROI estimates unless an explicit Business case is given below. None is given here.
- Do not claim what any specific regulator has flagged, examined, or accepted. Do not attribute the work to any reviewer, examiner, or institute reviewer.
- Do not name any vendor product feature with a verdict (allow/gate/decline). You may reference the user's own named vendors only as factual stack context.
- You may cite real public federal regulations (SR 11-7, ECOA Reg B, GLBA Safeguards, FFIEC IT Handbook, Interagency TPRM 2023) by name — but only as applicable regulations, never as endorsements.

Output format: a single JSON object with exactly two keys — execSummary (string, 90-130 words, 3 short paragraphs joined with two newlines), thirtyDayPlan (array of exactly 5 strings, each a concrete first-30-day action). No prose outside the JSON. No markdown code fences.`;

  const userBlock = `Personalize for this paid In-Depth taker.

Reader:
- Name: ${ctx.first_name ?? 'the reader'}${ctx.last_name ? ' ' + ctx.last_name : ''}
- Institution: ${ctx.institution_name ?? 'their institution'}
- Role: ${roleMeta?.label ?? 'unspecified role'}
- State: ${ctx.state ?? 'unspecified'}
- Department FTE: ${ctx.dept_fte ?? 'unspecified'}

Diagnostic (the only sourced data — ground everything in this):
- Overall: ${response.score}/100 (${response.band.label})
- Dimensions: ${dimensionLines}
- Primary artifact for this role: ${packet.primaryArtifact.name}
- Thesis (the report's own framing): "${packet.thesisHeadline}"

Return the JSON object now. Reference the institution by name. No preamble.`;

  try {
    const result = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1200,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userBlock }],
      thinking: { type: 'adaptive' },
    });

    const textBlock = result.content.find((b) => b.type === 'text');
    const raw = textBlock && textBlock.type === 'text' ? textBlock.text : '';
    // Strip any accidental code fences just in case.
    const jsonText = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    let parsed: PersonalizationResult;
    try {
      const j = JSON.parse(jsonText) as {
        execSummary?: string;
        thirtyDayPlan?: string[];
      };
      if (typeof j.execSummary !== 'string' || !Array.isArray(j.thirtyDayPlan)) {
        throw new Error('shape mismatch');
      }
      parsed = {
        execSummary: j.execSummary,
        thirtyDayPlan: j.thirtyDayPlan.slice(0, 5),
        model: 'claude-opus-4-7',
        generatedAt: new Date().toISOString(),
      };
    } catch (parseErr) {
      console.error('[in-depth/personalize] JSON parse failed:', parseErr, raw.slice(0, 400));
      return NextResponse.json(
        { error: 'AI returned malformed JSON.', raw: raw.slice(0, 400) },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[in-depth/personalize] Anthropic error:', err);
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: `Personalization failed: ${msg}` }, { status: 500 });
  }
}
