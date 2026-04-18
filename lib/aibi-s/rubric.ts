import type { Rubric, RubricScore } from './types';

export function buildJudgePrompt(
  rubric: Rubric,
  rebuttal: string,
  chatTranscript: readonly string[],
): string {
  const dimList = rubric.dimensions
    .map((d) => `- "${d.id}" (${d.label}) 0-${d.maxScore}: ${d.description}`)
    .join('\n');

  const transcript = chatTranscript.length
    ? `\n\nFollow-up chat transcript:\n${chatTranscript.join('\n')}`
    : '';

  return `You are grading a banker's written rebuttal (and any follow-up chat) against a rubric. Score each dimension 0-4 based on the rubric definition. Return strict JSON wrapped in a \`\`\`json code block.

Rubric dimensions (id, label, range, description):
${dimList}

Passing rule: total >= ${rubric.passingTotal} AND no single dimension below ${rubric.passingMinPerDimension}.

Written rebuttal to grade:
---
${rebuttal}
---${transcript}

Respond ONLY with JSON in this shape, wrapped in a \`\`\`json code block:
{
  "dimensionScores": { ${rubric.dimensions.map((d) => `"${d.id}": <0-${d.maxScore}>`).join(', ')} },
  "feedback": "<2-4 sentences of substantive feedback>"
}`;
}

interface RawJudgeResponse {
  readonly dimensionScores: Record<string, number>;
  readonly feedback: string;
}

function extractJsonBlock(raw: string): string {
  const match = raw.match(/```json\s*([\s\S]*?)```/);
  if (match) return match[1];
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first >= 0 && last > first) return raw.slice(first, last + 1);
  throw new Error('No JSON block found in judge response');
}

export function parseRubricResponse(raw: string, rubric: Rubric): RubricScore {
  const json = extractJsonBlock(raw);
  let parsed: RawJudgeResponse;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    throw new Error(`Judge response is not valid JSON: ${(err as Error).message}`);
  }

  if (!parsed || typeof parsed !== 'object' || !parsed.dimensionScores) {
    throw new Error('Judge response missing dimensionScores');
  }

  const dimensionScores: Record<string, number> = {};
  let total = 0;
  let minDim = Infinity;

  for (const dim of rubric.dimensions) {
    const score = parsed.dimensionScores[dim.id];
    if (typeof score !== 'number') {
      throw new Error(`Judge response missing dimension: ${dim.id}`);
    }
    if (score < 0 || score > dim.maxScore) {
      throw new Error(`Score for ${dim.id} out of range: ${score}`);
    }
    dimensionScores[dim.id] = score;
    total += score;
    if (score < minDim) minDim = score;
  }

  const passed = total >= rubric.passingTotal && minDim >= rubric.passingMinPerDimension;

  return {
    rubricId: rubric.id,
    dimensionScores,
    total,
    passed,
    feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '',
  };
}
