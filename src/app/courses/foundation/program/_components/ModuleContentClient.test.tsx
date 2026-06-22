import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModuleContentClient } from './ModuleContentClient';

describe('ModuleContentClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('requires review and transfer evidence before completing an activity-less module', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, nextModule: 11 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ModuleContentClient
        activities={[]}
        enrollmentId="enrollment-1"
        moduleNumber={10}
        existingResponses={{}}
        isLastModule={false}
        isAlreadyCompleted={false}
      />,
    );

    const completeButton = screen.getByRole('button', { name: 'Add review + transfer' }) as HTMLButtonElement;
    expect(screen.getByTestId('foundation-module-handoff').textContent).toContain('Ready to advance?');
    expect(completeButton.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/My handoff note/i), {
      target: { value: 'Use this module pattern in the next approved workflow review.' },
    });
    fireEvent.change(screen.getByLabelText(/Next real use/i), {
      target: { value: 'Use this in the next approved workflow review before manager sign-off.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Complete module' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const request = fetchMock.mock.calls[0][1] as { body: string };
    const body = JSON.parse(request.body) as {
      moduleHandoffNote?: string;
      moduleTransferPlan?: string;
    };

    expect(body.moduleHandoffNote).toBe(
      'Use this module pattern in the next approved workflow review.',
    );
    expect(body.moduleTransferPlan).toBe(
      'Use this in the next approved workflow review before manager sign-off.',
    );
    expect(await screen.findByText('Save the learning before you leave.')).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Continue to Module 11 · Choose the Right AI Use Case' })
        .getAttribute('href'),
    ).toBe('/courses/foundation/program/11');
  });
});
