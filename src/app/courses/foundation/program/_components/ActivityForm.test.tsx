import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getModuleByNumber } from '@content/courses/foundation-program';
import { ActivityForm } from './ActivityForm';

const module1 = getModuleByNumber(1);
if (!module1) throw new Error('Expected Foundation module 1');
const activity = module1.activities[0];
if (!activity) throw new Error('Expected Foundation module 1 activity');

function fillRequiredActivityFields() {
  fireEvent.change(screen.getByLabelText(/What did you build/i), {
    target: {
      value:
        'AI can draft internal messages and summarize approved sources, but a banker owns facts, decisions, and final use.',
    },
  });
  fireEvent.change(screen.getByLabelText(/What did you check before saving it/i), {
    target: {
      value:
        'No customer data is included, the human owner is named, and the decision boundary is visible.',
    },
  });
  fireEvent.change(screen.getByLabelText(/Where will you reuse this at work/i), {
    target: {
      value:
        'Use this card before opening an AI tool for unfamiliar internal drafting or review work.',
    },
  });
  fireEvent.change(screen.getByPlaceholderText(/I removed customer details/i), {
    target: { value: 'I verified AI is drafting support only and the banker owns the decision boundary.' },
  });
}

describe('ActivityForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('requires a transfer plan before saving a standard activity', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ActivityForm
        activity={activity}
        enrollmentId="enrollment-1"
        moduleNumber={1}
      />,
    );

    fillRequiredActivityFields();
    fireEvent.click(screen.getByRole('button', { name: 'Save artifact step' }));

    expect(await screen.findByText('Name the first realistic use before saving the artifact.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('persists the transfer plan with the activity response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ success: true }),
    });
    const onSubmitSuccess = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ActivityForm
        activity={activity}
        enrollmentId="enrollment-1"
        moduleNumber={1}
        onSubmitSuccess={onSubmitSuccess}
      />,
    );

    fillRequiredActivityFields();
    fireEvent.change(screen.getByLabelText(/First real use/i), {
      target: { value: 'Use this on the next branch rollout email before manager review.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save artifact step' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    const request = fetchMock.mock.calls[0][1] as { body: string };
    const body = JSON.parse(request.body) as {
      response: Record<string, string>;
    };

    expect(body.response.__learning_transfer_plan).toBe(
      'Use this on the next branch rollout email before manager review.',
    );
    expect(window.localStorage.getItem('foundation-module-handoff-1')).toBe(
      'I verified AI is drafting support only and the banker owns the decision boundary.',
    );
    expect(window.localStorage.getItem('foundation-transfer-plan-1')).toBe(
      'Use this on the next branch rollout email before manager review.',
    );
    expect(onSubmitSuccess).toHaveBeenCalledWith('1.1');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/toolbox/save');
    const toolboxRequest = fetchMock.mock.calls[1][1] as { body: string };
    const toolboxBody = JSON.parse(toolboxRequest.body) as {
      origin: string;
      payload: {
        kind: string;
        courseSlug: string;
        moduleNumber: number;
        activityId: string;
        artifactName: string;
        fields: Array<{ id: string; label: string; value: string }>;
        reviewNote: string;
        transferPlan: string;
      };
    };
    expect(toolboxBody.origin).toBe('course');
    expect(toolboxBody.payload.kind).toBe('module-artifact');
    expect(toolboxBody.payload.courseSlug).toBe('aibi-p');
    expect(toolboxBody.payload.moduleNumber).toBe(1);
    expect(toolboxBody.payload.activityId).toBe(activity.id);
    expect(toolboxBody.payload.artifactName).toBe('AI Limits Card');
    expect(toolboxBody.payload.fields[0]).toEqual({
      id: 'artifact_draft',
      label: 'What did you build?',
      value:
        'AI can draft internal messages and summarize approved sources, but a banker owns facts, decisions, and final use.',
    });
    expect(toolboxBody.payload.reviewNote).toBe(
      'I verified AI is drafting support only and the banker owns the decision boundary.',
    );
    expect(toolboxBody.payload.transferPlan).toBe(
      'Use this on the next branch rollout email before manager review.',
    );
    expect(await screen.findByText('Saved with artifact')).toBeTruthy();
    expect(await screen.findByText('Saved to Toolbox')).toBeTruthy();
  });
});
