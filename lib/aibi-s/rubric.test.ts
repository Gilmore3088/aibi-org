import { describe, it, expect } from 'vitest';
import { parseRubricResponse, buildJudgePrompt } from './rubric';
import type { Rubric } from './types';

const testRubric: Rubric = {
  id: 'dept-head-p1',
  dimensions: [
    { id: 'scope', label: 'Scope clarity', description: '...', maxScore: 4 },
    { id: 'roi', label: 'ROI argument', description: '...', maxScore: 4 },
    { id: 'risk', label: 'Risk acknowledgment', description: '...', maxScore: 4 },
  ],
  passingTotal: 15,
  passingMinPerDimension: 3,
};

describe('rubric', () => {
  it('buildJudgePrompt includes dimension ids and labels', () => {
    const prompt = buildJudgePrompt(testRubric, 'my rebuttal', ['persona: why', 'learner: because']);
    expect(prompt).toContain('scope');
    expect(prompt).toContain('Scope clarity');
    expect(prompt).toContain('roi');
    expect(prompt).toContain('my rebuttal');
    expect(prompt).toContain('persona: why');
  });

  it('parses valid AI-judge JSON response', () => {
    const raw = `Some preamble. \`\`\`json
{
  "dimensionScores": { "scope": 3, "roi": 4, "risk": 2 },
  "feedback": "Solid on ROI, weak on risk."
}
\`\`\` trailing text`;
    const score = parseRubricResponse(raw, testRubric);
    expect(score.dimensionScores).toEqual({ scope: 3, roi: 4, risk: 2 });
    expect(score.total).toBe(9);
    expect(score.passed).toBe(false);
    expect(score.feedback).toBe('Solid on ROI, weak on risk.');
  });

  it('passes when total >= passingTotal and no dim below minPerDimension', () => {
    const highRubric: Rubric = { ...testRubric, passingTotal: 8, passingMinPerDimension: 2 };
    const raw = `\`\`\`json
{ "dimensionScores": { "scope": 3, "roi": 3, "risk": 2 }, "feedback": "ok" }
\`\`\``;
    const score = parseRubricResponse(raw, highRubric);
    expect(score.total).toBe(8);
    expect(score.passed).toBe(true);
  });

  it('rejects scores outside 0..maxScore', () => {
    const raw = `\`\`\`json
{ "dimensionScores": { "scope": 5, "roi": 3, "risk": 3 }, "feedback": "x" }
\`\`\``;
    expect(() => parseRubricResponse(raw, testRubric)).toThrow(/out of range/i);
  });

  it('rejects response missing a dimension', () => {
    const raw = `\`\`\`json
{ "dimensionScores": { "scope": 3, "roi": 3 }, "feedback": "x" }
\`\`\``;
    expect(() => parseRubricResponse(raw, testRubric)).toThrow(/missing dimension/i);
  });

  it('rejects non-JSON garbage', () => {
    expect(() => parseRubricResponse('no json here', testRubric)).toThrow();
  });
});
