import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { buildJudgePrompt, parseRubricResponse } from '../../../../../lib/aibi-s/rubric';
import type { ChatTurn, RubricScore } from '../../../../../lib/aibi-s/types';
import { opsUnit1_1 } from '../../../../../content/courses/aibi-s/ops/unit-1-1';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface GradeRequestBody {
  readonly unitId: string;
  readonly trackCode: 'ops';
  readonly rebuttal: string;
  readonly turns: readonly ChatTurn[];
}

export async function POST(req: NextRequest): Promise<NextResponse<RubricScore | { error: string }>> {
  const body = (await req.json()) as GradeRequestBody;

  if (body.unitId !== '1.1' || body.trackCode !== 'ops') {
    return NextResponse.json({ error: 'Unit/track not supported in prototype' }, { status: 400 });
  }

  const defendBeat = opsUnit1_1.beats.find((b) => b.kind === 'defend');
  if (!defendBeat || defendBeat.kind !== 'defend') {
    return NextResponse.json({ error: 'Defend beat not found' }, { status: 500 });
  }

  const transcript = body.turns.map((t) => `${t.role}: ${t.content}`);
  const prompt = buildJudgePrompt(defendBeat.persona.rubric, body.rebuttal, transcript);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const resp = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1000,
    system: 'You are a strict but fair grader. Respond ONLY with the requested JSON.',
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = resp.content.find((b) => b.type === 'text');
  const raw = textBlock && textBlock.type === 'text' ? textBlock.text : '';

  let score: RubricScore;
  try {
    score = parseRubricResponse(raw, defendBeat.persona.rubric);
  } catch (err) {
    return NextResponse.json({ error: `Grading parse failed: ${(err as Error).message}` }, { status: 502 });
  }

  return NextResponse.json(score);
}
