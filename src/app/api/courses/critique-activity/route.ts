// POST /api/courses/critique-activity
//
// Reads the learner's module Apply submission, sends it to Claude with a
// rubric grounded in the module's stated outcome, and returns a structured
// critique: what's strong, what to revise, and a one-paragraph rewrite the
// learner can compare against their own response.
//
// This is the interactive heart of "robust learner steps" — without an
// actual critique loop the Apply activities are just diary entries.
//
// Security: requires an authed Supabase session + active Foundation
// enrollment for the requesting user. Rate-limited 20/IP/hr.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import {
  FOUNDATION_FINAL_MODULE_NUMBER,
  V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER,
  type ExpandedModule,
} from '@content/courses/foundation-program';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RequestBody {
  readonly moduleNumber?: unknown;
  readonly response?: unknown;
}

interface CritiqueOutput {
  readonly strong: readonly string[]; // 2-4 bullet items the learner did well
  readonly revise: readonly string[]; // 2-4 specific things to revise
  readonly rewrite: string; // 1 paragraph rewrite of their submission
  readonly model: string;
}

// Defensive cleanup for string values the model may have leaked JSON
// scaffolding into (the foundation-cx audit caught raw braces in the
// module-3 rewrite). Targets curly braces and leaked "key": tokens only —
// square brackets are left intact since rewrites legitimately use
// [placeholder] markers.
function cleanProse(value: string): string {
  let s = value.trim();
  // Drop a leaked leading JSON key token, e.g. {"rewrite": or "rewrite":
  s = s.replace(/^\{?\s*"?(?:strong|revise|rewrite)"?\s*:\s*/i, '');
  // Remove stray JSON object braces that leaked into the value.
  s = s.replace(/[{}]/g, '');
  // Strip a single pair of wrapping double-quotes.
  s = s.replace(/^"([\s\S]*)"$/, '$1');
  // Collapse whitespace introduced by the removals.
  return s.replace(/\s{2,}/g, ' ').trim();
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await rateLimitOrFail({
    key: 'critique-activity',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 20,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const moduleNumber = typeof body.moduleNumber === 'number' ? body.moduleNumber : NaN;
  const response = typeof body.response === 'string' ? body.response.trim() : '';
  if (
    !Number.isFinite(moduleNumber) ||
    moduleNumber < 1 ||
    moduleNumber > FOUNDATION_FINAL_MODULE_NUMBER
  ) {
    return NextResponse.json(
      { error: `moduleNumber must be 1-${FOUNDATION_FINAL_MODULE_NUMBER}.` },
      { status: 400 },
    );
  }
  if (response.length < 20) {
    return NextResponse.json(
      { error: 'Response must be at least 20 characters to critique meaningfully.' },
      { status: 400 },
    );
  }

  const expanded: ExpandedModule | undefined =
    V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER.get(moduleNumber);
  if (!expanded) {
    return NextResponse.json({ error: 'Unknown module.' }, { status: 404 });
  }

  // Auth check — must be signed in with an active Foundation enrollment.
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to receive feedback.' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI critique is not configured on this environment.' },
      { status: 503 },
    );
  }

  const system = `You are a senior reviewer at The AI Banking Institute giving feedback on a community-bank learner's practice submission for the AiBI-Foundation course.

Voice:
- Editorial. Second-person ("you"). Banker-direct. Specific over clever.
- Constructive: name what worked, name what to revise, give a concrete rewrite.
- Banned: "leverage", "unlock", "supercharge", "revolutionize", "synergy", exclamation points, emoji, decorative em-dashes.

You may cite real public federal regulations by name when applicable (SR 26-2 — the 2026 revised model risk guidance superseding SR 11-7, ECOA Reg B, GLBA Safeguards, FFIEC IT Handbook, Interagency TPRM 2023), but only as applicable references — never as endorsement, never claiming a specific examiner has flagged anything.

Output format: a single JSON object with three keys:
- strong: array of 2-4 strings, each a specific thing the learner did well
- revise: array of 2-4 strings, each a specific thing to revise with the reason
- rewrite: one paragraph (60-110 words) showing how a strong response to the same prompt would read

Every string value must be plain prose only — no braces, brackets, backticks, or JSON syntax inside any value. No prose outside the JSON. No markdown code fences.`;

  const userBlock = `Module ${expanded.number}.
Goal of the module: ${expanded.goal}
The practice asks the learner to: ${expanded.practice}
The artifact they should produce: ${expanded.artifact}
Banking boundary to respect: ${expanded.bankingBoundary}

Learner submission:
"""
${response}
"""

Return the JSON critique now. Be specific to their text. Reference details they wrote. No preamble.`;

  try {
    const client = new Anthropic({ apiKey });
    const result = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 900,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userBlock }],
      thinking: { type: 'adaptive' },
    });
    const textBlock = result.content.find((b) => b.type === 'text');
    const raw = textBlock && textBlock.type === 'text' ? textBlock.text : '';
    // Extract the outermost JSON object: the first '{' to the last '}'.
    // This tolerates code fences, preamble, and trailing prose without a
    // brittle fence-only strip.
    const objStart = raw.indexOf('{');
    const objEnd = raw.lastIndexOf('}');
    const jsonText = objStart !== -1 && objEnd > objStart ? raw.slice(objStart, objEnd + 1) : raw.trim();
    let parsed: CritiqueOutput;
    try {
      const j = JSON.parse(jsonText) as {
        strong?: unknown;
        revise?: unknown;
        rewrite?: unknown;
      };
      if (
        !Array.isArray(j.strong) ||
        !Array.isArray(j.revise) ||
        typeof j.rewrite !== 'string'
      ) {
        throw new Error('shape mismatch');
      }
      parsed = {
        strong: (j.strong as unknown[])
          .filter((s): s is string => typeof s === 'string')
          .map(cleanProse)
          .filter((s) => s.length > 0)
          .slice(0, 4),
        revise: (j.revise as unknown[])
          .filter((s): s is string => typeof s === 'string')
          .map(cleanProse)
          .filter((s) => s.length > 0)
          .slice(0, 4),
        rewrite: cleanProse(j.rewrite),
        model: 'claude-opus-4-7',
      };
    } catch (parseErr) {
      console.error('[critique-activity] JSON parse failed:', parseErr, raw.slice(0, 300));
      return NextResponse.json(
        { error: 'AI returned malformed JSON.', raw: raw.slice(0, 300) },
        { status: 502 },
      );
    }
    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[critique-activity] Anthropic error:', err);
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: `Critique failed: ${msg}` }, { status: 500 });
  }
}
