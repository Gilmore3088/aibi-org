import { describe, it, expect } from 'vitest';
import {
  computeAggregate,
  MIN_RESPONSES,
  CHAMPION_THRESHOLD,
  type AggregateTakerInput,
} from './aggregate';

const fullDim = (base = 12): Record<string, number> => ({
  'current-ai-usage': base,
  'experimentation-culture': base,
  'ai-literacy-level': base,
  'quick-win-potential': base,
  'leadership-buy-in': base,
  'security-posture': base,
  'training-infrastructure': base,
  'builder-potential': base,
});

const taker = (
  overrides: Partial<AggregateTakerInput> = {}
): AggregateTakerInput => ({
  invite_email: 'x@b.test',
  invite_consumed_at: '2026-05-05T00:00:00Z',
  completed_at: '2026-05-05T00:00:00Z',
  score_total: 120,
  score_per_dimension: fullDim(),
  ...overrides,
});

describe('computeAggregate', () => {
  it('returns locked state with fewer than MIN_RESPONSES completed', () => {
    const result = computeAggregate({
      institutionName: 'Test',
      seatsPurchased: 10,
      takers: [
        taker({ invite_email: 'a@b.test' }),
        taker({ invite_email: 'b@b.test' }),
      ],
    });
    expect(result.unlocked).toBe(false);
    expect(result.responsesReceived).toBe(2);
    expect(result.overall).toBeUndefined();
    expect(result.dimensions).toBeUndefined();
    expect(result.champions).toEqual([]);
    expect(MIN_RESPONSES).toBe(3);
  });

  it('counts responses in three buckets correctly', () => {
    const completed = taker({ invite_email: '1@b.test' });
    const inProgress = taker({
      invite_email: '2@b.test',
      completed_at: null,
      score_total: null,
      score_per_dimension: null,
    });
    const result = computeAggregate({
      institutionName: 'X',
      seatsPurchased: 10,
      takers: [completed, inProgress],
    });
    expect(result.responsesReceived).toBe(1);
    expect(result.responsesInProgress).toBe(1);
    expect(result.responsesPending).toBe(8);
  });

  it('unlocks at MIN_RESPONSES (3) with overall + dimension data populated', () => {
    const t1 = taker({
      invite_email: 'a@b.test',
      score_total: 96,
      score_per_dimension: fullDim(8),
    });
    const t2 = taker({
      invite_email: 'b@b.test',
      score_total: 120,
      score_per_dimension: fullDim(12),
    });
    const t3 = taker({
      invite_email: 'c@b.test',
      score_total: 144,
      score_per_dimension: fullDim(16),
    });
    const result = computeAggregate({
      institutionName: 'Test',
      seatsPurchased: 10,
      takers: [t1, t2, t3],
    });
    expect(result.unlocked).toBe(true);
    expect(result.overall?.average_score).toBe(120);
    expect(result.overall?.tier_label).toBe('Building Momentum');
    expect(result.dimensions).toHaveLength(8);
    expect(result.responsesReceived).toBe(3);
    expect(result.responsesPending).toBe(7);
  });

  it('returns 0 champions when no taker scores >= CHAMPION_THRESHOLD', () => {
    const t = (n: number, email: string) =>
      taker({ invite_email: email, score_total: n });
    const result = computeAggregate({
      institutionName: 'X',
      seatsPurchased: 10,
      takers: [t(120, 'a@b.test'), t(128, 'b@b.test'), t(140, 'c@b.test')],
    });
    expect(result.champions).toHaveLength(0);
    expect(CHAMPION_THRESHOLD).toBe(156);
  });

  it('returns top-2 champions only when score >= CHAMPION_THRESHOLD (156)', () => {
    const result = computeAggregate({
      institutionName: 'X',
      seatsPurchased: 10,
      takers: [
        taker({ invite_email: 'a@b.test', score_total: 168 }),
        taker({ invite_email: 'b@b.test', score_total: 160 }),
        taker({ invite_email: 'c@b.test', score_total: 152 }), // below
        taker({ invite_email: 'd@b.test', score_total: 120 }),
      ],
    });
    expect(result.champions.map((c) => c.email)).toEqual([
      'a@b.test',
      'b@b.test',
    ]);
  });

  it('caps champions at CHAMPION_LIMIT even when more qualify', () => {
    const result = computeAggregate({
      institutionName: 'X',
      seatsPurchased: 10,
      takers: [
        taker({ invite_email: 'a@b.test', score_total: 180 }),
        taker({ invite_email: 'b@b.test', score_total: 172 }),
        taker({ invite_email: 'c@b.test', score_total: 164 }),
        taker({ invite_email: 'd@b.test', score_total: 158 }),
      ],
    });
    expect(result.champions).toHaveLength(2);
    expect(result.champions[0].email).toBe('a@b.test');
    expect(result.champions[1].email).toBe('b@b.test');
  });

  it('never exposes raw individual scores or answers in the response', () => {
    const result = computeAggregate({
      institutionName: 'X',
      seatsPurchased: 10,
      takers: [
        taker({ invite_email: 'a@b.test', score_total: 96 }),
        taker({ invite_email: 'b@b.test', score_total: 120 }),
        taker({ invite_email: 'c@b.test', score_total: 144 }),
      ],
    });
    const json = JSON.stringify(result);
    expect(json).not.toContain('"score_total"');
    expect(json).not.toContain('"answers"');
    expect(json).not.toContain('"score_per_dimension"');
  });

  it('marks weakest_areas / strongest_areas correctly', () => {
    const skewed: Record<string, number> = {
      'current-ai-usage': 4, // weakest
      'experimentation-culture': 5, // weakest
      'ai-literacy-level': 12,
      'quick-win-potential': 13,
      'leadership-buy-in': 14,
      'security-posture': 15,
      'training-infrastructure': 22, // strongest
      'builder-potential': 23, // strongest
    };
    const t1 = taker({
      invite_email: 'a@b.test',
      score_total: 108,
      score_per_dimension: skewed,
    });
    const t2 = taker({
      invite_email: 'b@b.test',
      score_total: 108,
      score_per_dimension: skewed,
    });
    const t3 = taker({
      invite_email: 'c@b.test',
      score_total: 108,
      score_per_dimension: skewed,
    });
    const result = computeAggregate({
      institutionName: 'X',
      seatsPurchased: 10,
      takers: [t1, t2, t3],
    });
    const weakest = result.dimensions!.filter((d) => d.weakest_areas);
    const strongest = result.dimensions!.filter((d) => d.strongest_areas);
    expect(weakest).toHaveLength(2);
    expect(strongest).toHaveLength(2);
    expect(weakest.map((d) => d.dimension_id).sort()).toEqual(
      ['current-ai-usage', 'experimentation-culture'].sort()
    );
    expect(strongest.map((d) => d.dimension_id).sort()).toEqual(
      ['builder-potential', 'training-infrastructure'].sort()
    );
  });

  it('buckets per-dimension distributions into low/mid/high thirds of 24', () => {
    // low: <8, mid: <16, high: >=16
    const lowT = taker({
      invite_email: 'l@b.test',
      score_total: 96,
      score_per_dimension: fullDim(4),
    });
    const midT = taker({
      invite_email: 'm@b.test',
      score_total: 120,
      score_per_dimension: fullDim(12),
    });
    const highT = taker({
      invite_email: 'h@b.test',
      score_total: 144,
      score_per_dimension: fullDim(20),
    });
    const result = computeAggregate({
      institutionName: 'X',
      seatsPurchased: 10,
      takers: [lowT, midT, highT],
    });
    for (const dim of result.dimensions!) {
      expect(dim.distribution.low).toBe(1);
      expect(dim.distribution.mid).toBe(1);
      expect(dim.distribution.high).toBe(1);
    }
  });

  it("champion's strongest_dimension reflects their highest dim score", () => {
    const dim = fullDim(12);
    dim['leadership-buy-in'] = 24;
    const result = computeAggregate({
      institutionName: 'X',
      seatsPurchased: 10,
      takers: [
        taker({
          invite_email: 'a@b.test',
          score_total: 168,
          score_per_dimension: dim,
        }),
        taker({ invite_email: 'b@b.test', score_total: 120 }),
        taker({ invite_email: 'c@b.test', score_total: 120 }),
      ],
    });
    expect(result.champions[0].strongest_dimension).toBe('Leadership Buy-In');
  });
});
