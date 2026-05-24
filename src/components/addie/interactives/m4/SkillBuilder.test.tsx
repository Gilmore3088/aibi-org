// SkillBuilder widget tests — Module 4.2/4.3 smoke coverage.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SkillBuilder, type SkillBuilderDescriptor } from './SkillBuilder';

function buildDescriptor(includeTrackDefaults = false): SkillBuilderDescriptor {
  const blocks: Array<{ id: string; label: string; body?: string }> = [
    {
      id: 'builder_sources',
      label: 'Available source exercises',
      body: JSON.stringify([
        {
          exercise_id: 'm3-5-real-use-cases',
          label: 'Real use cases',
          leversAvailable: [
            {
              key: 'role',
              label: 'Role',
              options: [
                { id: 'risk_compliance', label: 'Risk & Compliance' },
                { id: 'customer_facing', label: 'Customer-Facing' },
              ],
            },
          ],
          suggestedSlots: [
            { key: 'use_case_brief', label: 'Use-case brief', help: 'No PII.' },
          ],
        },
      ]),
    },
  ];
  if (includeTrackDefaults) {
    blocks.push({
      id: 'track_defaults',
      label: 'Per-track defaults',
      body: JSON.stringify({
        risk_compliance: {
          sourceExerciseId: 'm3-5-real-use-cases',
          lockedLevers: { role: 'risk_compliance' },
          slots: [
            { key: 'rule_excerpt', label: 'Rule excerpt', help: 'Public regulator text.' },
          ],
          suggestedTitle: 'Reg summary for tellers',
        },
      }),
    });
  }
  return { preset_context_blocks: blocks } as SkillBuilderDescriptor;
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 'new-skill-id' }),
      } as unknown as Response)
    )
  );
});

describe('SkillBuilder', () => {
  it('renders empty-state when no source exercises are seeded', () => {
    render(
      <SkillBuilder exerciseDescriptor={{ preset_context_blocks: [] }} />
    );
    expect(screen.getByText(/No source exercises have been seeded/i)).toBeTruthy();
  });

  it('walks the four-step flow and saves a skill template with valid JSON body', async () => {
    const onSaved = vi.fn();
    render(
      <SkillBuilder exerciseDescriptor={buildDescriptor()} onSaved={onSaved} />
    );

    // Step 1: source pre-selected (only one); advance.
    expect(screen.getByText(/Step 1 of 4/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));

    // Step 2: lock the role lever.
    expect(screen.getByText(/Step 2 of 4/i)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/^Role$/i), {
      target: { value: 'risk_compliance' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));

    // Step 3: slot pre-populated from suggestedSlots.
    expect(screen.getByText(/Step 3 of 4/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));

    // Step 4: name + save.
    expect(screen.getByText(/Step 4 of 4/i)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/^Skill name$/i), {
      target: { value: 'Reg summary for tellers' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Save skill$/i }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith('new-skill-id'));

    // Verify the fetch payload shape.
    const fetchMock = (globalThis.fetch as unknown) as ReturnType<typeof vi.fn>;
    const lastCall = fetchMock.mock.calls[0];
    expect(lastCall?.[0]).toBe('/api/addie/toolbox/items');
    const init = lastCall?.[1] as RequestInit;
    const body = JSON.parse(init.body as string) as {
      type: string;
      title: string;
      body_md: string;
    };
    expect(body.type).toBe('skill_template');
    expect(body.title).toBe('Reg summary for tellers');
    const parsedSkill = JSON.parse(body.body_md) as {
      exerciseId: string;
      fixedLeverSelections: Record<string, string>;
      slotSchema: Array<{ key: string; label: string }>;
    };
    expect(parsedSkill.exerciseId).toBe('m3-5-real-use-cases');
    expect(parsedSkill.fixedLeverSelections.role).toBe('risk_compliance');
    expect(parsedSkill.slotSchema[0]?.key).toBe('use_case_brief');
  });

  it('role-skill mode pre-selects locked levers and suggested title from track defaults', () => {
    render(
      <SkillBuilder
        exerciseDescriptor={buildDescriptor(true)}
        mode="role-skill"
        track="risk_compliance"
      />
    );
    // Advance to step 4 to inspect title default.
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    const titleInput = screen.getByLabelText(/^Skill name$/i) as HTMLInputElement;
    expect(titleInput.value).toBe('Reg summary for tellers');
  });

  it('saves as type "skill" in role-skill mode', async () => {
    const onSaved = vi.fn();
    render(
      <SkillBuilder
        exerciseDescriptor={buildDescriptor(true)}
        mode="role-skill"
        track="risk_compliance"
        onSaved={onSaved}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Save skill$/i }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    const fetchMock = (globalThis.fetch as unknown) as ReturnType<typeof vi.fn>;
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(init.body as string) as { type: string };
    expect(body.type).toBe('skill');
  });
});
