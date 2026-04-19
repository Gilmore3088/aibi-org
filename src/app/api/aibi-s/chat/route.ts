import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { canContinueChat } from '../../../../../lib/aibi-s/chat-limiter';
import type { ChatTurn } from '../../../../../lib/aibi-s/types';
import { opsUnit1_1 } from '../../../../../content/courses/aibi-s/ops/unit-1-1';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface ChatRequestBody {
  readonly unitId: string;
  readonly trackCode: 'ops';
  readonly rebuttal: string;
  readonly turns: readonly ChatTurn[];
}

interface ChatResponseBody {
  readonly personaTurn: ChatTurn;
  readonly allowMoreTurns: boolean;
}

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponseBody | { error: string }>> {
  const body = (await req.json()) as ChatRequestBody;

  if (body.unitId !== '1.1' || body.trackCode !== 'ops') {
    return NextResponse.json({ error: 'Unit/track not supported in prototype' }, { status: 400 });
  }

  const defendBeat = opsUnit1_1.beats.find((b) => b.kind === 'defend');
  if (!defendBeat || defendBeat.kind !== 'defend') {
    return NextResponse.json({ error: 'Defend beat not found' }, { status: 500 });
  }
  const persona = defendBeat.persona;

  const continuation = canContinueChat(body.turns, persona.maxChatTurns);
  if (!continuation.allowed || continuation.nextRole !== 'persona') {
    return NextResponse.json({ error: 'Chat exhausted' }, { status: 409 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const messages: Anthropic.MessageParam[] = [];
  messages.push({
    role: 'user',
    content: `This is the learner's written rebuttal to your challenge memo:\n\n---\n${body.rebuttal}\n---`,
  });
  for (const turn of body.turns) {
    messages.push({
      role: turn.role === 'persona' ? 'assistant' : 'user',
      content: turn.content,
    });
  }

  const resp = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 400,
    system: persona.chatSystemPrompt,
    messages,
  });

  const textBlock = resp.content.find((b) => b.type === 'text');
  const content = textBlock && textBlock.type === 'text' ? textBlock.text : '';

  const nextIndex = body.turns.length + 1;
  const personaTurn: ChatTurn = {
    role: 'persona',
    content,
    turnIndex: nextIndex,
  };

  const hypothetical: ChatTurn[] = [
    ...body.turns,
    personaTurn,
    { role: 'learner', turnIndex: nextIndex + 1, content: '' },
  ];
  const afterLearnerContinuation = canContinueChat(hypothetical, persona.maxChatTurns);

  return NextResponse.json({
    personaTurn,
    allowMoreTurns: afterLearnerContinuation.allowed,
  });
}
