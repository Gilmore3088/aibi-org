import { describe, it, expect } from 'vitest';
import { initialState, canAdvance, advance } from './beat-state';
import type { Unit } from './types';

const fixtureUnit: Unit = {
  id: '1.1',
  trackCode: 'ops',
  phase: 1,
  title: 'Test Unit',
  summary: 'fixture',
  beats: [
    { kind: 'learn', title: 'L', body: 'b', hooks: { pillar: 'A', frameworks: [], dataTiers: [] } },
    { kind: 'practice', simKind: 'decision', scenario: 's', question: 'q', options: [
      { id: 'a', label: 'A', isCorrect: true, feedback: 'good' },
    ], hooks: { pillar: 'A', frameworks: [], dataTiers: [] } },
    { kind: 'apply', prompt: 'p', guidance: 'g', minWords: 10 },
    { kind: 'defend', persona: {
      id: 'x', displayName: 'X', trackCode: 'ops', phase: 1,
      memoMarkdown: 'm', chatSystemPrompt: 'sp', maxChatTurns: 3,
      rubric: { id: 'r', dimensions: [], passingTotal: 15, passingMinPerDimension: 3 },
    }, hooks: { pillar: 'B', frameworks: ['SR 11-7'], dataTiers: [2] } },
    { kind: 'refine', guidance: 'refine' },
    { kind: 'capture', artifactLabel: 'bundle' },
  ],
};

describe('beat-state', () => {
  it('initialState starts at beat 0 with clean fields', () => {
    const s = initialState(fixtureUnit);
    expect(s.currentBeatIndex).toBe(0);
    expect(s.practiceChoice).toBeNull();
    expect(s.applyResponse).toBe('');
    expect(s.rebuttal).toBe('');
    expect(s.chatTurns).toEqual([]);
    expect(s.rubricScore).toBeNull();
    expect(s.refinedRebuttal).toBe('');
    expect(s.capturedAt).toBeNull();
  });

  it('Learn beat allows advance immediately (no required inputs)', () => {
    const s = initialState(fixtureUnit);
    expect(canAdvance(fixtureUnit, s)).toBe(true);
  });

  it('Practice beat blocks advance until a choice is recorded', () => {
    let s = advance(fixtureUnit, initialState(fixtureUnit), { type: 'advance' });
    expect(s.currentBeatIndex).toBe(1);
    expect(canAdvance(fixtureUnit, s)).toBe(false);
    s = advance(fixtureUnit, s, { type: 'practiceChoose', optionId: 'a' });
    expect(canAdvance(fixtureUnit, s)).toBe(true);
  });

  it('Apply beat blocks advance until response meets minWords', () => {
    let s = initialState(fixtureUnit);
    s = advance(fixtureUnit, s, { type: 'advance' });
    s = advance(fixtureUnit, s, { type: 'practiceChoose', optionId: 'a' });
    s = advance(fixtureUnit, s, { type: 'advance' });
    expect(s.currentBeatIndex).toBe(2);
    expect(canAdvance(fixtureUnit, s)).toBe(false);

    s = advance(fixtureUnit, s, { type: 'applyWrite', text: 'one two three' });
    expect(canAdvance(fixtureUnit, s)).toBe(false); // only 3 words, minWords is 10

    s = advance(fixtureUnit, s, { type: 'applyWrite', text: 'one two three four five six seven eight nine ten eleven' });
    expect(canAdvance(fixtureUnit, s)).toBe(true);
  });

  it('Defend beat blocks advance until a rubric score exists', () => {
    let s = initialState(fixtureUnit);
    s = advance(fixtureUnit, s, { type: 'advance' });
    s = advance(fixtureUnit, s, { type: 'practiceChoose', optionId: 'a' });
    s = advance(fixtureUnit, s, { type: 'advance' });
    s = advance(fixtureUnit, s, { type: 'applyWrite', text: 'one two three four five six seven eight nine ten eleven' });
    s = advance(fixtureUnit, s, { type: 'advance' });
    expect(s.currentBeatIndex).toBe(3);
    expect(canAdvance(fixtureUnit, s)).toBe(false);

    s = advance(fixtureUnit, s, { type: 'rebuttalWrite', text: 'my rebuttal' });
    expect(canAdvance(fixtureUnit, s)).toBe(false);

    s = advance(fixtureUnit, s, { type: 'rubricScore', score: {
      rubricId: 'r', dimensionScores: {}, total: 18, passed: true, feedback: 'ok',
    }});
    expect(canAdvance(fixtureUnit, s)).toBe(true);
  });

  it('advances through all beats and Capture records a timestamp', () => {
    let s = initialState(fixtureUnit);
    s = advance(fixtureUnit, s, { type: 'advance' });
    s = advance(fixtureUnit, s, { type: 'practiceChoose', optionId: 'a' });
    s = advance(fixtureUnit, s, { type: 'advance' });
    s = advance(fixtureUnit, s, { type: 'applyWrite', text: 'word '.repeat(12).trim() });
    s = advance(fixtureUnit, s, { type: 'advance' });
    s = advance(fixtureUnit, s, { type: 'rebuttalWrite', text: 'r' });
    s = advance(fixtureUnit, s, { type: 'rubricScore', score: {
      rubricId: 'r', dimensionScores: {}, total: 18, passed: true, feedback: 'ok',
    }});
    s = advance(fixtureUnit, s, { type: 'advance' });
    s = advance(fixtureUnit, s, { type: 'refineWrite', text: 'refined' });
    s = advance(fixtureUnit, s, { type: 'advance' });
    expect(s.currentBeatIndex).toBe(5);
    s = advance(fixtureUnit, s, { type: 'capture' });
    expect(s.capturedAt).not.toBeNull();
  });

  it('advance is a no-op when canAdvance is false', () => {
    const s0 = initialState(fixtureUnit);
    const s = advance(fixtureUnit, s0, { type: 'advance' });
    const s2 = advance(fixtureUnit, s, { type: 'advance' });
    expect(s2.currentBeatIndex).toBe(1);
  });
});
