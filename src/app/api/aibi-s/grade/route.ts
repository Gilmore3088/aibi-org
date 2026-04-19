import type { NextRequest } from 'next/server';
import { createFeatureHandler } from '@/lib/ai-harness/feature-handler';
import type { ChatRequest } from '@/lib/ai-harness/types';
import { buildJudgePrompt, parseRubricResponse } from '@/../lib/aibi-s/rubric';
import type { ChatTurn, RubricScore, Rubric } from '@/../lib/aibi-s/types';
import { aibiSConfig } from '@/../content/courses/aibi-s/course.config';
import { opsUnit1_1 } from '@/../content/courses/aibi-s/ops/unit-1-1';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface GradeRequestBody {
  readonly unitId: string;
  readonly trackCode: 'ops';
  readonly rebuttal: string;
  readonly turns: readonly ChatTurn[];
}

const RUBRIC = Symbol('grade-rubric');

export const { POST } = createFeatureHandler<RubricScore>({
  config: aibiSConfig,
  featureId: 'defenseGrader',
  buildRequest: async (req: NextRequest, featureDef): Promise<ChatRequest> => {
    const body = (await req.json()) as GradeRequestBody;
    if (body.unitId !== '1.1' || body.trackCode !== 'ops') {
      throw new Error('Unit/track not supported in prototype');
    }
    const defendBeat = opsUnit1_1.beats.find((b) => b.kind === 'defend');
    if (!defendBeat || defendBeat.kind !== 'defend') {
      throw new Error('Defend beat not found');
    }

    (req as unknown as Record<symbol, Rubric>)[RUBRIC] = defendBeat.persona.rubric;

    const transcript = body.turns.map((t) => `${t.role}: ${t.content}`);
    const prompt = buildJudgePrompt(defendBeat.persona.rubric, body.rebuttal, transcript);

    return {
      model: featureDef.model,
      maxTokens: featureDef.maxTokens,
      system: 'You are a strict but fair grader. Respond ONLY with the requested JSON.',
      messages: [{ role: 'user', content: prompt }],
    };
  },
  shapeResponse: (resp, req): RubricScore => {
    const rubric = (req as unknown as Record<symbol, Rubric>)[RUBRIC];
    return parseRubricResponse(resp.text, rubric);
  },
});
