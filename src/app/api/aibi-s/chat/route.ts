import type { NextRequest } from 'next/server';
import { createFeatureHandler } from '@/lib/ai-harness/feature-handler';
import type { ChatRequest, Message } from '@/lib/ai-harness/types';
import type { ChatTurn } from '@/../lib/aibi-s/types';
import { aibiSConfig } from '@/../content/courses/aibi-s/course.config';
import { canContinueChat } from '@/../lib/aibi-s/chat-limiter';
import { opsUnit1_1 } from '@/../content/courses/aibi-s/ops/unit-1-1';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface ChatRequestBody {
  readonly unitId: string;
  readonly trackCode: 'ops';
  readonly rebuttal: string;
  readonly turns: readonly ChatTurn[];
}

interface ChatResponseShape {
  readonly personaTurn: ChatTurn;
  readonly allowMoreTurns: boolean;
}

// Stash per-request context between buildRequest and shapeResponse via a
// symbol-keyed property on the NextRequest object (avoids module-level state).
const CTX = Symbol('chat-ctx');

interface ChatCtx {
  turns: readonly ChatTurn[];
  maxTurns: number;
  nextIndex: number;
}

export const { POST } = createFeatureHandler<ChatResponseShape>({
  config: aibiSConfig,
  featureId: 'personaDefense',
  buildRequest: async (req: NextRequest, featureDef): Promise<ChatRequest> => {
    const body = (await req.json()) as ChatRequestBody;
    if (body.unitId !== '1.1' || body.trackCode !== 'ops') {
      throw new Error('Unit/track not supported in prototype');
    }
    const defendBeat = opsUnit1_1.beats.find((b) => b.kind === 'defend');
    if (!defendBeat || defendBeat.kind !== 'defend') {
      throw new Error('Defend beat not found');
    }
    const persona = defendBeat.persona;
    const continuation = canContinueChat(body.turns, persona.maxChatTurns);
    if (!continuation.allowed || continuation.nextRole !== 'persona') {
      throw new Error('Chat exhausted');
    }

    (req as unknown as Record<symbol, ChatCtx>)[CTX] = {
      turns: body.turns,
      maxTurns: persona.maxChatTurns,
      nextIndex: body.turns.length + 1,
    };

    const messages: Message[] = [];
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

    return {
      model: featureDef.model,
      maxTokens: featureDef.maxTokens,
      system: persona.chatSystemPrompt,
      messages,
    };
  },
  shapeResponse: (resp, req): ChatResponseShape => {
    const ctx = (req as unknown as Record<symbol, ChatCtx>)[CTX];
    const personaTurn: ChatTurn = {
      role: 'persona',
      content: resp.text,
      turnIndex: ctx.nextIndex,
    };
    const hypothetical: ChatTurn[] = [
      ...ctx.turns,
      personaTurn,
      { role: 'learner', turnIndex: ctx.nextIndex + 1, content: '' },
    ];
    const after = canContinueChat(hypothetical, ctx.maxTurns);
    return { personaTurn, allowMoreTurns: after.allowed };
  },
});
