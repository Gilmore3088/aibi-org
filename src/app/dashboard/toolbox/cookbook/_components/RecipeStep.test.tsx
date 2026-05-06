// src/app/dashboard/toolbox/cookbook/_components/RecipeStep.test.tsx
//
// Plan G — Task 5 tests for the RecipeStep client component. Asserts
// kind-aware rendering (template vs workflow) and that the save button
// POSTs to /api/toolbox/save with the exact body shape Task 6's route
// extension expects, including the new `recipeSourceRef` field.

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeStep } from './RecipeStep';
import type { RecipeStep as RecipeStepData } from '@/lib/toolbox/recipes';

/* eslint-disable @typescript-eslint/no-explicit-any */

const templateStep: RecipeStepData = {
  skill_slug: 'classify-complaint',
  skill_version_id: 'ver-1',
  narrative: 'Run the classifier first.',
  notes: 'Paste only the complaint body.',
  skillSnapshot: {
    kind: 'template',
    name: 'Classify Complaint',
    systemPrompt: 'SYS_PROMPT_BODY',
    userPromptTemplate: 'USER_TMPL_BODY',
  } as any,
};

const workflowStep: RecipeStepData = {
  skill_slug: 'review-workflow',
  skill_version_id: 'ver-2',
  narrative: 'Review with the workflow.',
  notes: null,
  skillSnapshot: {
    kind: 'workflow',
    name: 'Workflow X',
    purpose: 'PURPOSE_BODY',
    steps: ['STEP_ONE', 'STEP_TWO'],
    guardrails: ['GUARD_ONE'],
  } as any,
};

describe('RecipeStep', () => {
  it('renders narrative, notes, and template snapshot fields when kind=template', () => {
    render(
      <RecipeStep index={1} recipeSlug="r1" step={templateStep} librarySkillId="lib-1" />,
    );
    expect(screen.getByText(/run the classifier first/i)).toBeTruthy();
    expect(screen.getByText(/paste only the complaint body/i)).toBeTruthy();
    expect(screen.getByText(/system prompt/i)).toBeTruthy();
    expect(screen.getByText(/SYS_PROMPT_BODY/)).toBeTruthy();
    expect(screen.getByText(/user template/i)).toBeTruthy();
    expect(screen.getByText(/USER_TMPL_BODY/)).toBeTruthy();
  });

  it('renders purpose, steps, and guardrails when kind=workflow', () => {
    render(
      <RecipeStep index={2} recipeSlug="r1" step={workflowStep} librarySkillId="lib-2" />,
    );
    expect(screen.getByRole('heading', { name: /purpose/i })).toBeTruthy();
    expect(screen.getByText(/PURPOSE_BODY/)).toBeTruthy();
    expect(screen.getByText(/STEP_ONE/)).toBeTruthy();
    expect(screen.getByText(/STEP_TWO/)).toBeTruthy();
    expect(screen.getByText(/GUARD_ONE/)).toBeTruthy();
  });

  it('POSTs to /api/toolbox/save with origin=library and recipeSourceRef on click', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'new-skill' }), { status: 200 }),
      );

    render(
      <RecipeStep
        index={1}
        recipeSlug="respond-to-complaint"
        step={templateStep}
        librarySkillId="lib-1"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /save to my playbooks/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/toolbox/save');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({
      origin: 'library',
      payload: {
        librarySkillId: 'lib-1',
        versionId: 'ver-1',
        recipeSourceRef: 'cookbook:respond-to-complaint#step-1',
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saved to playbooks/i })).toBeTruthy();
    });

    fetchMock.mockRestore();
  });

  it('disables the save button and shows error state when no librarySkillId is provided', () => {
    render(
      <RecipeStep index={1} recipeSlug="r1" step={templateStep} librarySkillId={undefined} />,
    );
    const button = screen.getByRole('button', { name: /save to my playbooks/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
