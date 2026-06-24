import { describe, expect, it } from 'vitest';
import { calculatePlaygroundUsageMetrics, parsePlaygroundUsageRange, type PlaygroundUsageRow } from './usage-metrics';

const rows: PlaygroundUsageRow[] = [
  {
    id: '1',
    provider: 'openai',
    model: 'gpt-4o-mini',
    input_tokens: 20,
    output_tokens: 10,
    cost_cents: 1,
    status: 'succeeded',
    error_kind: null,
    ip_hash: 'ip-a',
    created_at: '2026-06-23T10:00:00.000Z',
  },
  {
    id: '2',
    provider: 'openai',
    model: 'gpt-4o-mini',
    input_tokens: null,
    output_tokens: null,
    cost_cents: null,
    status: 'rate-limited',
    error_kind: null,
    ip_hash: 'ip-a',
    created_at: '2026-06-23T10:01:00.000Z',
  },
  {
    id: '3',
    provider: 'openai',
    model: 'gpt-4o-mini',
    input_tokens: null,
    output_tokens: null,
    cost_cents: null,
    status: 'errored',
    error_kind: 'server',
    ip_hash: 'ip-b',
    created_at: '2026-06-22T09:00:00.000Z',
  },
];

describe('public playground usage metrics', () => {
  it('parses ranges defensively', () => {
    expect(parsePlaygroundUsageRange('7d')).toBe('7d');
    expect(parsePlaygroundUsageRange('90d')).toBe('90d');
    expect(parsePlaygroundUsageRange('bad')).toBe('30d');
  });

  it('aggregates calls, statuses, cost, days, and top IP hashes', () => {
    const metrics = calculatePlaygroundUsageMetrics({
      range: '30d',
      startIso: '2026-05-24T00:00:00.000Z',
      rows,
    });

    expect(metrics).toMatchObject({
      calls: 3,
      succeeded: 1,
      rateLimited: 1,
      errored: 1,
      uniqueIpHashes: 2,
      inputTokens: 20,
      outputTokens: 10,
      costCents: 1,
    });
    expect(metrics.topIps[0]).toMatchObject({
      ipHash: 'ip-a',
      calls: 2,
      succeeded: 1,
      rateLimited: 1,
      lastSeenAt: '2026-06-23T10:01:00.000Z',
    });
    expect(metrics.byDay).toEqual([
      expect.objectContaining({ day: '2026-06-22', calls: 1, errored: 1 }),
      expect.objectContaining({ day: '2026-06-23', calls: 2, succeeded: 1, rateLimited: 1 }),
    ]);
  });
});
