// src/lib/toolbox/library.test.ts
//
// Plan C — tests for library.ts data access. Uses a mocked Supabase service-role
// client to avoid needing a live database in the unit suite.

import { describe, it, expect, vi, beforeEach } from 'vitest';

interface QueryResult {
  data: unknown;
  error: { message: string } | null;
}

// Build a thenable mock chain. All chain methods return the chain itself so
// real chains like .from().select().eq().eq().order().order() work. The chain
// is also a thenable, so awaiting it resolves to the configured queue value.
// .single() and .maybeSingle() also resolve to the queue value (they are
// terminals in real PostgREST but we simulate them by replacing the next-await
// behavior).
const buildQueryMock = () => {
  const queue: QueryResult[] = [];
  const chain: Record<string, unknown> = {};
  for (const m of ['from', 'select', 'eq', 'order', 'insert']) {
    chain[m] = vi.fn(() => chain);
  }
  // single() and maybeSingle() return a thenable that resolves to the next queue entry
  const terminal = (): Promise<QueryResult> => {
    const next = queue.shift() ?? { data: null, error: { message: 'no mock result queued' } };
    return Promise.resolve(next);
  };
  chain.single = vi.fn(terminal);
  chain.maybeSingle = vi.fn(terminal);
  // The chain itself is awaitable for non-single() queries (list, etc.)
  (chain as { then: (resolve: (v: QueryResult) => unknown) => unknown }).then = (resolve) => {
    const next = queue.shift() ?? { data: null, error: { message: 'no mock result queued' } };
    return resolve(next);
  };
  return Object.assign(chain, {
    __push: (r: QueryResult) => {
      queue.push(r);
    },
  });
};

let mockClient: ReturnType<typeof buildQueryMock>;

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => mockClient,
}));

import {
  listLibrarySkills,
  getLibrarySkill,
  forkLibrarySkill,
} from './library';

describe('listLibrarySkills', () => {
  beforeEach(() => {
    mockClient = buildQueryMock();
  });

  it('returns published skills sorted by category then title', async () => {
    const rows = [
      { id: '1', slug: 'a', kind: 'workflow', title: 'A', description: '', pillar: 'A', category: 'Compliance', complexity: 'intermediate', current_version: 1 },
      { id: '2', slug: 'b', kind: 'workflow', title: 'B', description: '', pillar: 'A', category: 'Lending', complexity: 'beginner', current_version: 1 },
    ];
    mockClient.__push({ data: rows, error: null });

    const result = await listLibrarySkills();
    expect(result).toEqual(rows);
    expect(mockClient.from).toHaveBeenCalledWith('toolbox_library_skills');
    expect(mockClient.eq).toHaveBeenCalledWith('published', true);
  });

  it('applies pillar filter when provided', async () => {
    mockClient.__push({ data: [], error: null });
    await listLibrarySkills({ pillar: 'B' });
    expect(mockClient.eq).toHaveBeenCalledWith('pillar', 'B');
  });

  it('applies category filter when provided', async () => {
    mockClient.__push({ data: [], error: null });
    await listLibrarySkills({ category: 'Lending' });
    expect(mockClient.eq).toHaveBeenCalledWith('category', 'Lending');
  });

  it('applies kind filter when provided', async () => {
    mockClient.__push({ data: [], error: null });
    await listLibrarySkills({ kind: 'template' });
    expect(mockClient.eq).toHaveBeenCalledWith('kind', 'template');
  });

  it('throws when supabase reports an error', async () => {
    mockClient.__push({ data: null, error: { message: 'boom' } });
    await expect(listLibrarySkills()).rejects.toThrow(/listLibrarySkills failed: boom/);
  });
});

describe('getLibrarySkill', () => {
  beforeEach(() => {
    mockClient = buildQueryMock();
  });

  it('returns null when no skill matches the slug', async () => {
    mockClient.__push({ data: null, error: null });
    const result = await getLibrarySkill('nope');
    expect(result).toBeNull();
  });

  it('returns the skill plus its current version content', async () => {
    const skill = { id: 's1', slug: 'exam-prep', kind: 'workflow', title: 'Exam Prep', description: '', pillar: 'A', category: 'Compliance', complexity: 'intermediate', current_version: 1, course_source_ref: null, published: true };
    const version = { id: 'v1', library_skill_id: 's1', version: 1, content: { foo: 'bar' }, published_at: '2026-05-04T00:00:00Z' };
    mockClient.__push({ data: skill, error: null });
    mockClient.__push({ data: version, error: null });

    const result = await getLibrarySkill('exam-prep');
    expect(result).toEqual({ skill, currentVersion: version });
  });
});

describe('forkLibrarySkill', () => {
  beforeEach(() => {
    mockClient = buildQueryMock();
  });

  it('creates a personal toolbox_skills row with library provenance', async () => {
    const versionContent = {
      cmd: '/exam-prep',
      purpose: 'Read policy library and prior exam findings',
      success: 'A 1-page summary',
      questions: 'Exam date?',
      steps: ['step 1', 'step 2'],
      guardrails: ['No final decisions'],
      customGuard: 'Never assert "compliant"',
      samples: [{ title: 't', prompt: 'p' }],
    };
    mockClient.__push({ data: { id: 'v1', library_skill_id: 's1', content: versionContent }, error: null });
    mockClient.__push({ data: { kind: 'workflow', title: 'Exam Prep', description: 'd', pillar: 'A', category: 'Compliance' }, error: null });
    mockClient.__push({ data: { id: 'new-skill-id' }, error: null });

    const result = await forkLibrarySkill({
      ownerId: 'user-1',
      librarySkillId: 's1',
      versionId: 'v1',
    });

    expect(result).toEqual({ id: 'new-skill-id' });
    expect(mockClient.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        owner_id: 'user-1',
        source: 'library',
        source_ref: 'v1',
        kind: 'workflow',
        title: 'Exam Prep',
        pillar: 'A',
        purpose: versionContent.purpose,
        steps: versionContent.steps,
        guardrails: versionContent.guardrails,
      })
    );
  });

  it('throws when the version is not found', async () => {
    mockClient.__push({ data: null, error: { message: 'not found' } });
    await expect(
      forkLibrarySkill({ ownerId: 'u', librarySkillId: 's', versionId: 'v' })
    ).rejects.toThrow(/version not found/);
  });
});
