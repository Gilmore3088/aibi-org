// POST /api/assessment/in-depth/personalize
//
// Generates the three live, institution-specific blocks that make the
// In-Depth report feel hand-written: executive summary, 30-day plan tuned
// to FTE + asset band, and an examiner-readable narrative tuned to the
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
import {
  getPeerBenchmark,
  getBusinessCase,
  getVendorIntel,
  getMraThemes,
} from '@content/assessments/v4/enhancement-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RequestBody {
  readonly profileId?: unknown;
}

interface PersonalizationResult {
  readonly execSummary: string;
  readonly thirtyDayPlan: readonly string[];
  readonly examinerNarrative: string;
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
  const peer = getPeerBenchmark(response.score, ctx.asset_band);
  const business = getBusinessCase(ctx.asset_band, ctx.dept_fte);
  const vendorIntel = [ctx.primary_core, ctx.primary_los, ctx.primary_marketing, ctx.primary_fraud]
    .map(getVendorIntel)
    .filter((v): v is NonNullable<ReturnType<typeof getVendorIntel>> => v !== null);
  const mraThemes = getMraThemes(ctx.regulator);

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
  const system = `You are a senior reviewer at The AI Banking Institute writing a brief, brutal, useful 3-section personalization for a paid In-Depth AI Readiness Diagnostic.

Voice:
- Editorial. Second-person ("you", "your"). Banker-direct.
- Specific over clever. Use the reader's exact role, institution name, asset band, and regulator when given.
- Banned: "leverage", "unlock", "supercharge", "revolutionize", "synergy", exclamation points, em-dashes used decoratively, emoji.
- Cite real regulatory references when they apply (SR 11-7, ECOA Reg B, GLBA Safeguards, FFIEC IT Handbook, TPRM 2023).

Output format: a single JSON object with exactly three keys — execSummary (string, 90-130 words, 3 short paragraphs joined with two newlines), thirtyDayPlan (array of exactly 5 strings, each one a concrete first-30-day action calibrated to the team's FTE and asset band), examinerNarrative (string, 70-100 words, one paragraph that explains how this packet's artifacts pre-empt the most-flagged examiner themes for this regulator). No prose outside the JSON. No markdown code fences.`;

  const userBlock = `Personalize for this paid In-Depth taker.

Reader:
- Name: ${ctx.first_name ?? 'the reader'}${ctx.last_name ? ' ' + ctx.last_name : ''}
- Institution: ${ctx.institution_name ?? 'their institution'}
- Role: ${roleMeta?.label ?? 'unspecified role'}
- State: ${ctx.state ?? 'unspecified'}
- Primary regulator: ${ctx.regulator ?? 'unspecified'}
- Asset band: ${ctx.asset_band ?? 'unspecified'}${ctx.asset_size_usd_millions ? ` (~$${ctx.asset_size_usd_millions}M assets)` : ''}
- Department FTE: ${ctx.dept_fte ?? 'unspecified'}
- Primary vendor stack: core=${ctx.primary_core ?? '?'}, LOS=${ctx.primary_los ?? '?'}, marketing=${ctx.primary_marketing ?? '?'}, fraud=${ctx.primary_fraud ?? '?'}

Diagnostic:
- Overall: ${response.score}/100 (${response.band.label})
- Dimensions: ${dimensionLines}
- Top gap: ${packet.primaryArtifact.name === 'Principal Reason Traceability Table' ? 'Approved AI Access' : 'see lowest dimension above'}
- Primary artifact for this role: ${packet.primaryArtifact.name}
- Thesis (the report's own framing): "${packet.thesisHeadline}"

Peer benchmark:
${peer ? `- Score ${response.score} → ${peer.percentile}th percentile of ${peer.band.label.toLowerCase()} (n=${peer.band.institutionCount}). Framing: ${peer.framing}` : '- Asset band unspecified — skip peer benchmarking line in execSummary.'}

Quantified business case:
${business ? `- Pilot recovers ~${business.display}/year. ${business.assumptionLine}` : '- FTE or asset band unspecified — skip business case line in execSummary.'}

Vendor intelligence for this stack:
${vendorIntel.length > 0 ? vendorIntel.map((v) => `- ${v.name} (${v.category}): verdict=${v.verdict}. ${v.action}`).join('\n') : '- No vendor intelligence in scope. Skip vendor mention.'}

Examiner themes for ${ctx.regulator ?? 'unspecified'}:
${mraThemes.length > 0 ? mraThemes.map((t, i) => `${i + 1}. ${t.theme}`).join('\n') : 'No themes available — speak generally about exam-readability in the examinerNarrative.'}

Return the JSON object now. Be specific. Reference the institution by name. No preamble.`;

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
        examinerNarrative?: string;
      };
      if (
        typeof j.execSummary !== 'string' ||
        !Array.isArray(j.thirtyDayPlan) ||
        typeof j.examinerNarrative !== 'string'
      ) {
        throw new Error('shape mismatch');
      }
      parsed = {
        execSummary: j.execSummary,
        thirtyDayPlan: j.thirtyDayPlan.slice(0, 5),
        examinerNarrative: j.examinerNarrative,
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
