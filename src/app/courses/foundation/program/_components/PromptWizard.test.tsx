import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MODULE_3_PROMPTING_ACTIVITIES } from '@content/courses/foundation-program/module-3-activities';
import { PromptWizard } from './PromptWizard';

const promptWizardActivity = MODULE_3_PROMPTING_ACTIVITIES.find((activity) => activity.id === '3.2');
if (!promptWizardActivity) throw new Error('Expected Module 3 prompt wizard activity');

describe('PromptWizard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lets a learner use worked starter prompts and submit the graded prompt', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ success: true }),
    });
    const onSubmitSuccess = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <PromptWizard
        activity={promptWizardActivity}
        enrollmentId="enrollment-1"
        moduleNumber={3}
        onSubmitSuccess={onSubmitSuccess}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /use starter prompt/i }));
    expect((screen.getByLabelText(/write your prompt to the ai/i) as HTMLTextAreaElement).value).toContain(
      'branch banking assistant',
    );
    fireEvent.click(screen.getByRole('button', { name: /run the prompt/i }));
    fireEvent.click(await screen.findByRole('button', { name: /next scenario/i }));

    fireEvent.click(screen.getByRole('button', { name: /use starter prompt/i }));
    expect((screen.getByLabelText(/write your prompt to the ai/i) as HTMLTextAreaElement).value).toContain(
      'CD penalty schedule',
    );
    fireEvent.click(screen.getByRole('button', { name: /run the prompt/i }));
    fireEvent.click(await screen.findByRole('button', { name: /save my prompt/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const request = fetchMock.mock.calls[0][1] as { body: string };
    const body = JSON.parse(request.body) as {
      moduleNumber: number;
      activityId: string;
      response: { final_prompt: string };
    };

    expect(body.moduleNumber).toBe(3);
    expect(body.activityId).toBe('3.2');
    expect(body.response.final_prompt).toContain('CD penalty schedule');
    expect(body.response.final_prompt.length).toBeGreaterThanOrEqual(30);
    expect(onSubmitSuccess).toHaveBeenCalledWith('3.2');
    expect(await screen.findByText(/prompt wizard · complete/i)).toBeTruthy();
  });
});
