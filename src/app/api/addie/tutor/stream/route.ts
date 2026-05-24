// POST /api/addie/tutor/stream
//
// In-lesson AI tutor (foundation-course-content-audit-2026-05-24 §3.1).
//
// Bounded conversational helper scoped to the current lesson. Reuses the
// project's ai-harness Claude client and follows the same guardrails the
// sandbox uses:
//   - rate-limited per IP (20/hr) — chattier than checkout, tighter than the
//     toolbox playground; tutor questions are short and stream fast
//   - PII pre-flight on the question — refuses outright if the learner
//     pasted an SSN / card / routing / account number shape
//   - system prompt locked to the lesson body, learner track, and the
//     standing data-discipline rule
//   - response streamed as NDJSON ({ type: 'text' | 'done' | 'error' | 'blocked' })
//   - emits `tutor_query` event on completion for analytics
//
// Authoritative content (lesson body, track) is loaded server-side so the
// client can't spoof the lesson context to roam past the guardrails.

import { NextResponse, type NextRequest } from 'next/server';
import { createLLMClient } from '@/lib/ai-harness/client';
import { LLMError } from '@/lib/ai-harness/types';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { readAnonSession } from '@/lib/addie/auth/anonSession';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';
import { piiCheck, piiHumanReason } from '@/lib/addie/tutor/piiCheck';
import {
  buildTutorSystemPrompt,
  type LearnerTrack,
} from '@/lib/addie/tutor/systemPrompt';
import { emit } from '@/lib/addie/events/emit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_QUESTION_CHARS = 1200;
const MAX_HISTORY_MESSAGES = 8;
const MAX_OUTPUT_TOKENS = 600;
const MODEL = 'claude-haiku-4-5-20251001';
const VALID_TRACKS: ReadonlySet<string> = new Set([
  'risk_compliance',
  'customer_facing',
  'back_office',
  'technical',
  'leadership',
]);

interface Body {
  lessonId?: unknown;
  question?: unknown;
  history?: unknown;
}

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

function isHistory(v: unknown): v is HistoryMessage[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    (m) =>
      m &&
      typeof m === 'object' &&
      (m as { role?: unknown }).role !== undefined &&
      ((m as { role: unknown }).role === 'user' || (m as { role: unknown }).role === 'assistant') &&
      typeof (m as { content?: unknown }).content === 'string',
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-tutor',
    limit: 20,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : '';
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!lessonId || !question) {
    return NextResponse.json({ error: 'lessonId and question required' }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_CHARS) {
    return NextResponse.json(
      { error: `question must be ${MAX_QUESTION_CHARS} characters or fewer` },
      { status: 400 },
    );
  }

  const history = isHistory(body.history)
    ? body.history.slice(-MAX_HISTORY_MESSAGES).map((m) => ({
        role: m.role,
        content: m.content.slice(0, 4000),
      }))
    : [];

  // PII pre-flight. Banks don't get to paste customer data even into the
  // tutor box. Return a friendly explanation, not a generic 422.
  const pii = piiCheck(question);
  if (pii.hits.length > 0) {
    const anon = readAnonSession(req).id;
    await emit({
      action: 'tutor_blocked_pii',
      anon_session_id: anon,
      object_type: 'lesson',
      object_id: lessonId,
      payload: { hits: pii.hits },
    });
    return new Response(
      JSON.stringify({
        kind: 'blocked',
        reason: piiHumanReason(pii.hits),
        guidance:
          'Describe the situation, not the person. Strip the number, anonymize the name, and ask again — the help is almost always available without the sensitive details.',
      }),
      { status: 422, headers: { 'content-type': 'application/json' } },
    );
  }

  // Authoritative lesson + module load + track lookup.
  let lessonTitle = '';
  let lessonBody = '';
  let moduleId = '';
  let moduleTitle = '';
  let track: LearnerTrack = null;
  try {
    const svc = getAddieServiceClient();
    const { data: lesson, error: lessonErr } = await svc
      .from('lessons')
      .select('id, module_id, title, body_md')
      .eq('id', lessonId)
      .maybeSingle();
    if (lessonErr) throw lessonErr;
    if (!lesson) {
      return NextResponse.json({ error: 'lesson_not_found' }, { status: 404 });
    }
    const l = lesson as { id: string; module_id: string; title: string; body_md: string | null };
    lessonTitle = l.title;
    lessonBody = l.body_md ?? '';
    moduleId = l.module_id;

    const { data: mod } = await svc
      .from('modules')
      .select('id, title')
      .eq('id', moduleId)
      .maybeSingle();
    if (mod) moduleTitle = (mod as { title: string }).title;

    const anonId = readAnonSession(req).id;
    if (anonId) {
      const { data: prof } = await svc
        .from('learner_profiles')
        .select('track')
        .eq('anon_session_id', anonId)
        .maybeSingle();
      const t = (prof as { track?: string } | null)?.track;
      if (t && VALID_TRACKS.has(t)) track = t as LearnerTrack;
    }
  } catch (err) {
    console.error('[addie/tutor] context load failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'context_load_failed' }, { status: 500 });
  }

  const system = buildTutorSystemPrompt({
    moduleId,
    moduleTitle: moduleTitle || moduleId.toUpperCase(),
    lessonId,
    lessonTitle,
    lessonBody,
    track,
  });

  const messages = [
    ...history,
    { role: 'user' as const, content: question },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      let outputTokens = 0;
      let inputTokens = 0;
      let errored = false;
      let textLen = 0;

      try {
        const client = createLLMClient('anthropic');
        for await (const chunk of client.stream({
          model: MODEL,
          maxTokens: MAX_OUTPUT_TOKENS,
          temperature: 0.3,
          system,
          messages,
        })) {
          if (chunk.type === 'text') {
            const t = chunk.text ?? '';
            textLen += t.length;
            write({ type: 'text', text: t });
          } else if (chunk.type === 'stop') {
            inputTokens = chunk.usage?.inputTokens ?? 0;
            outputTokens = chunk.usage?.outputTokens ?? 0;
            write({
              type: 'done',
              usage: { inputTokens, outputTokens },
            });
          } else if (chunk.type === 'error') {
            errored = true;
            write({
              type: 'error',
              message: chunk.error instanceof LLMError ? chunk.error.kind : 'unknown',
            });
          }
        }
      } catch (err) {
        errored = true;
        const message = err instanceof LLMError ? err.kind : 'unknown';
        write({ type: 'error', message });
        console.error('[addie/tutor] stream error:', err);
      } finally {
        try {
          const anon = readAnonSession(req).id;
          await emit({
            action: 'tutor_query',
            anon_session_id: anon,
            object_type: 'lesson',
            object_id: lessonId,
            payload: {
              question_chars: question.length,
              answer_chars: textLen,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
              track,
              errored,
            },
          });
        } catch {
          // telemetry failure must not break the stream
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
