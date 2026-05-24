// SkillTester widget tests — Module 4.4 smoke coverage.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SkillTester, type SkillTesterDescriptor } from './SkillTester';

function buildDescriptor(): SkillTesterDescriptor {
  return {
    preset_context_blocks: [
      {
        id: 'guardrails',
        label: 'Guardrail prompts',
        body: JSON.stringify([
          { id: 'g1', prompt: 'Does it cite invented sources?', why: 'Watch for hallucinated cites.' },
          { id: 'g2', prompt: 'Would you send this as-is?', why: 'If no, note the fix.' },
        ]),
      },
    ],
  };
}

function buildSkillBody() {
  return JSON.stringify({
    exerciseId: 'm3-5-real-use-cases',
    fixedLeverSelections: { role: 'risk_compliance' },
    slotSchema: [{ key: 'rule_excerpt', label: 'Rule excerpt' }],
  });
}

function makeFetchMock(
  responses: Record<string, () => { ok: boolean; status: number; body: unknown }>
) {
  return vi.fn((input: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    const url = typeof input === 'string' ? input : '';
    const key = `${method} ${url}`;
    const matched = Object.entries(responses).find(([pattern]) => key.startsWith(pattern));
    if (!matched) {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'unmocked' }),
      } as unknown as Response);
    }
    const r = matched[1]();
    return Promise.resolve({
      ok: r.ok,
      status: r.status,
      json: () => Promise.resolve(r.body),
    } as unknown as Response);
  });
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('SkillTester', () => {
  it('renders empty-state when learner has no saved skills', async () => {
    vi.stubGlobal(
      'fetch',
      makeFetchMock({
        'GET /api/addie/toolbox/items': () => ({
          ok: true,
          status: 200,
          body: { items: [] },
        }),
      })
    );
    render(<SkillTester exerciseDescriptor={buildDescriptor()} />);
    await waitFor(() => {
      expect(screen.getByText(/No skills saved yet/i)).toBeTruthy();
    });
  });

  it('lists saved skills, loads one, runs it, and PATCHes guardrail notes', async () => {
    let patchedBody: string | null = null;
    vi.stubGlobal(
      'fetch',
      vi.fn((input: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET';
        const url = typeof input === 'string' ? input : '';
        if (method === 'GET' && url === '/api/addie/toolbox/items') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                items: [
                  { id: 'skill-1', type: 'skill', title: 'Reg summary' },
                  { id: 'note-1', type: 'note', title: 'Should be filtered out' },
                ],
              }),
          } as unknown as Response);
        }
        if (method === 'GET' && url === '/api/addie/toolbox/items/skill-1') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                id: 'skill-1',
                type: 'skill',
                title: 'Reg summary',
                latest: { body_md: buildSkillBody(), version: 1 },
              }),
          } as unknown as Response);
        }
        if (method === 'POST' && url === '/api/skill/run') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () =>
              Promise.resolve({
                sessionId: 'sess-1',
                outputText: 'Five bullets for tellers.',
              }),
          } as unknown as Response);
        }
        if (method === 'PATCH' && url === '/api/addie/toolbox/items/skill-1') {
          const body = JSON.parse(init?.body as string) as { body_md: string };
          patchedBody = body.body_md;
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ id: 'skill-1', version: 2 }),
          } as unknown as Response);
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({}),
        } as unknown as Response);
      })
    );

    render(<SkillTester exerciseDescriptor={buildDescriptor()} />);

    // Wait for list.
    await waitFor(() => {
      expect(screen.getByText(/Reg summary/i)).toBeTruthy();
    });
    // Filtered to skills only.
    expect(screen.queryByText(/Should be filtered out/i)).toBeNull();

    // Select skill.
    fireEvent.click(screen.getByRole('radio', { name: /Reg summary/i }));

    // Slot input appears.
    await waitFor(() => {
      expect(screen.getByLabelText(/^Rule excerpt$/i)).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText(/^Rule excerpt$/i), {
      target: { value: 'A public regulator update.' },
    });

    // Run.
    fireEvent.click(screen.getByRole('button', { name: /^Run skill$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Five bullets for tellers/i)).toBeTruthy();
    });

    // Guardrail prompts render after output.
    expect(screen.getByText(/Does it cite invented sources/i)).toBeTruthy();

    // Fill a guardrail note and save.
    const noteInputs = screen.getAllByLabelText(/^Your note$/i);
    fireEvent.change(noteInputs[0]!, {
      target: { value: 'No invented cites this run.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Save guardrail notes$/i }));
    await waitFor(() => {
      expect(patchedBody).not.toBeNull();
    });
    const parsed = JSON.parse(patchedBody!) as {
      exerciseId: string;
      guardrails: Array<{ id: string; prompt: string; note: string }>;
    };
    expect(parsed.exerciseId).toBe('m3-5-real-use-cases');
    expect(parsed.guardrails).toHaveLength(1);
    expect(parsed.guardrails[0]?.note).toBe('No invented cites this run.');
  });
});
