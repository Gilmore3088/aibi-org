import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const insertMock = vi.fn();
const upsertMock = vi.fn();
const librarySingleMock = vi.fn();
const fromMock = vi.fn((table: string) => {
  if (table === 'toolbox_library_skills') {
    return {
      select: () => ({
        eq: () => ({
          single: librarySingleMock,
        }),
      }),
    };
  }
  return { insert: insertMock, upsert: upsertMock };
});

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));
vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: vi.fn(async () => ({ userId: 'u1' })),
  canBuildOrRun: vi.fn((access: unknown) => access !== null),
}));
vi.mock('@content/courses/foundation-program/prompt-library', async () => ({
  getPromptById: (id: string) =>
    id === 'p-1'
      ? {
          id: 'p-1',
          title: 't',
          promptText: 'pt',
          relatedModule: 2,
          expectedOutput: 'eo',
          difficulty: 'beginner',
          timeEstimate: '5 min',
          role: 'lender',
          platform: 'claude',
        }
      : null,
}));

afterEach(() => {
  vi.clearAllMocks();
  // Default leaf: insert(...).select('id').single()
  insertMock.mockImplementation(() => ({
    select: () => ({
      single: async () => ({ data: { id: 'new-id' }, error: null }),
    }),
  }));
  upsertMock.mockImplementation(() => ({
    select: () => ({
      single: async () => ({ data: { id: 'updated-id' }, error: null }),
    }),
  }));
});

function req(body: unknown): Request {
  return new Request('http://localhost/api/toolbox/save', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/toolbox/save', () => {
  it('rejects unauthenticated', async () => {
    const access = (await import('@/lib/toolbox/access'))
      .getPaidToolboxAccess as ReturnType<typeof vi.fn>;
    access.mockResolvedValueOnce(null);
    const res = await POST(
      req({
        origin: 'course',
        payload: { promptId: 'p-1', courseSlug: 'aibi-p', moduleNumber: 2 },
      }),
    );
    expect(res.status).toBe(403);
  });

  it('saves a course prompt and returns the new id', async () => {
    insertMock.mockImplementationOnce(() => ({
      select: () => ({
        single: async () => ({ data: { id: 'new-id' }, error: null }),
      }),
    }));
    const res = await POST(
      req({
        origin: 'course',
        payload: { promptId: 'p-1', courseSlug: 'aibi-p', moduleNumber: 2 },
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { id: string };
    expect(json.id).toBe('new-id');
  });

  it('rejects an unknown origin', async () => {
    const res = await POST(req({ origin: 'cookbook', payload: {} }));
    expect(res.status).toBe(400);
  });

  it('records recipeSourceRef as source_ref on library-origin save', async () => {
    librarySingleMock.mockResolvedValueOnce({
      data: {
        id: 'lib-1',
        slug: 'denial-letter',
        kind: 'template',
        title: 'Denial Letter',
        description: 'd',
        system_prompt: 'sp',
        user_prompt_template: 'tmpl',
        variables: [],
        pillar: 'B',
        category: 'Lending',
      },
      error: null,
    });
    let captured: { source_ref?: string | null } | null = null;
    insertMock.mockImplementationOnce((payload: { source_ref?: string | null }) => {
      captured = payload;
      return {
        select: () => ({
          single: async () => ({ data: { id: 'new-id' }, error: null }),
        }),
      };
    });
    const res = await POST(
      req({
        origin: 'library',
        payload: {
          librarySkillId: 'lib-1',
          versionId: 'ver-7',
          recipeSourceRef: 'cookbook:loan-memo#step-2',
        },
      }),
    );
    expect(res.status).toBe(200);
    expect(captured).not.toBeNull();
    expect(captured!.source_ref).toBe('cookbook:loan-memo#step-2');
  });

  it('rejects a course payload pointing at a missing prompt', async () => {
    const res = await POST(
      req({
        origin: 'course',
        payload: {
          promptId: 'does-not-exist',
          courseSlug: 'aibi-p',
          moduleNumber: 2,
        },
      }),
    );
    expect(res.status).toBe(404);
  });

  it('upserts a course module artifact as a toolbox workflow', async () => {
    const res = await POST(
      req({
        origin: 'course',
        payload: {
          kind: 'module-artifact',
          courseSlug: 'aibi-p',
          moduleNumber: 15,
          activityId: '15.1',
          artifactName: 'Human Review Gate Card',
          readiness: 'reuse',
          reviewNote: 'Reviewer can stop the output before customer impact.',
          transferPlan: 'Use this on the next AI-assisted branch procedure update.',
          fields: [
            {
              id: 'paused_work',
              label: 'Paused work',
              value: 'AI drafts the first branch procedure update.',
            },
          ],
        },
      }),
    );

    expect(res.status).toBe(200);
    expect(insertMock).not.toHaveBeenCalled();
    expect(upsertMock).toHaveBeenCalledTimes(1);
    const captured = upsertMock.mock.calls[0][0] as {
      command?: string;
      kind?: string;
      source?: string;
      source_ref?: string | null;
      skill?: { name?: string; kind?: string; sourceRef?: string };
    };
    expect(captured?.command).toBe('/foundation-m15-human-review-gate-card');
    expect(captured?.kind).toBe('workflow');
    expect(captured?.source).toBe('course');
    expect(captured?.source_ref).toBe('aibi-p/module-15/15.1');
    expect(captured?.skill?.name).toBe('M15: Human Review Gate Card');
  });

  it('validates course artifacts but skips storage for local preview enrollment bypass', async () => {
    const access = (await import('@/lib/toolbox/access'))
      .getPaidToolboxAccess as ReturnType<typeof vi.fn>;
    access.mockResolvedValueOnce({ userId: 'dev-bypass' });
    const previousSkipGate = process.env.SKIP_ENROLLMENT_GATE;
    process.env.SKIP_ENROLLMENT_GATE = 'true';

    try {
      const res = await POST(
        req({
          origin: 'course',
          payload: {
            kind: 'module-artifact',
            courseSlug: 'aibi-p',
            moduleNumber: 15,
            activityId: '15.1',
            artifactName: 'Human Review Gate Card',
            readiness: 'reuse',
            reviewNote: 'Reviewer can stop the output before customer impact.',
            transferPlan: 'Use this on the next AI-assisted branch procedure update.',
            fields: [
              {
                id: 'paused_work',
                label: 'Paused work',
                value: 'AI drafts the first branch procedure update.',
              },
            ],
          },
        }),
      );

      expect(res.status).toBe(200);
      const json = (await res.json()) as { id: string; localPreview?: boolean };
      expect(json.localPreview).toBe(true);
      expect(json.id).toBe('dev-foundation-m15-human-review-gate-card');
      expect(insertMock).not.toHaveBeenCalled();
      expect(upsertMock).not.toHaveBeenCalled();
    } finally {
      if (previousSkipGate === undefined) {
        delete process.env.SKIP_ENROLLMENT_GATE;
      } else {
        process.env.SKIP_ENROLLMENT_GATE = previousSkipGate;
      }
    }
  });
});
