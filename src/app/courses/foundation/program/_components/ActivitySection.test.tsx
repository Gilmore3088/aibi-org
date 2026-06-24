import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Activity } from '@content/courses/foundation-program';
import { ActivitySection } from './ActivitySection';

const activity: Activity = {
  id: '1.1',
  title: 'Save the rewritten email',
  description: 'Capture the useful output and the human review decision.',
  type: 'free-text',
  fields: [
    {
      id: 'practice-response',
      label: 'Practice response',
      type: 'textarea',
      minLength: 20,
      required: true,
    },
  ],
  completionTrigger: 'save-response',
};

describe('ActivitySection', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('requires module review and transfer evidence before saving progress', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, nextModule: 2 }),
    });
    const onAllActivitiesComplete = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ActivitySection
        activities={[activity]}
        enrollmentId="enrollment-1"
        moduleNumber={1}
        existingResponses={{
          '1.1': {
          'practice-response': 'A saved artifact response that already meets the requirement.',
          __learning_judgment_note: 'I removed identifiers and verified the human review boundary.',
        },
      }}
        isLastModule={false}
        isAlreadyCompleted={false}
        onAllActivitiesComplete={onAllActivitiesComplete}
      />,
    );

    const lockedButton = screen.getByRole('button', { name: 'Add review + transfer' }) as HTMLButtonElement;
    expect(lockedButton.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/My handoff note/i), {
      target: { value: 'Reuse this on the next branch update and keep proof in the packet.' },
    });
    fireEvent.change(screen.getByLabelText(/Next real use/i), {
      target: { value: 'Use this on the next branch rollout email before manager review.' },
    });
    const completeButton = screen.getByRole('button', { name: 'Complete module' });
    fireEvent.click(completeButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const request = fetchMock.mock.calls[0][1] as { body: string };
    const body = JSON.parse(request.body) as {
      moduleHandoffNote?: string;
      moduleTransferPlan?: string;
    };

    expect(body.moduleHandoffNote).toBe(
      'Reuse this on the next branch update and keep proof in the packet.',
    );
    expect(body.moduleTransferPlan).toBe(
      'Use this on the next branch rollout email before manager review.',
    );
    expect(onAllActivitiesComplete).toHaveBeenCalledTimes(1);
  });

  it('shows a visible error when module progress cannot be saved', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'Module out of sequence. Refresh the page and try again.',
      }),
    });
    const onAllActivitiesComplete = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ActivitySection
        activities={[activity]}
        enrollmentId="enrollment-1"
        moduleNumber={1}
        existingResponses={{
          '1.1': {
            'practice-response': 'A saved artifact response that already meets the requirement.',
            __learning_judgment_note: 'I removed identifiers and verified the human review boundary.',
          },
        }}
        isLastModule={false}
        isAlreadyCompleted={false}
        onAllActivitiesComplete={onAllActivitiesComplete}
      />,
    );

    fireEvent.change(screen.getByLabelText(/My handoff note/i), {
      target: { value: 'Reuse this on the next branch update and keep proof in the packet.' },
    });
    fireEvent.change(screen.getByLabelText(/Next real use/i), {
      target: { value: 'Use this on the next branch rollout email before manager review.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Complete module' }));

    expect(
      await screen.findByText('Module out of sequence. Refresh the page and try again.'),
    ).toBeTruthy();
    expect(onAllActivitiesComplete).not.toHaveBeenCalled();
  });
});
