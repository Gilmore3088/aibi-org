import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AIPracticeSandbox } from './AIPracticeSandbox';
import type { SandboxConfig } from '@/lib/sandbox/types';

const sandboxConfig: SandboxConfig = {
  systemPrompt: 'Use the sample data safely.',
  sampleData: [
    {
      id: 'email-rewrite-scenarios',
      label: 'Email rewrite scenarios',
      type: 'document',
      description: 'Synthetic branch communication examples.',
    },
  ],
  suggestedPrompts: [
    'Rewrite the loaded staff note with clear owner and deadline.',
    'Review the output for added facts.',
    'Create a reusable rewrite prompt.',
  ],
};

describe('AIPracticeSandbox', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '## Scenario 1\nA synthetic branch note with no customer data.',
      } as Response),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('renders a pre-run calibration checkpoint', async () => {
    render(
      <AIPracticeSandbox
        moduleId="aibi-p-module-1"
        product="foundation"
        sandboxConfig={sandboxConfig}
      />,
    );

    const calibration = screen.getByTestId('aibi-lab-calibration');
    expect(calibration).toHaveTextContent('Predict the first check.');
    expect(calibration).toHaveTextContent('Before running AI, name the risk or quality check');
    expect(screen.getByRole('button', { name: 'No customer data' })).toBeInTheDocument();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('persists a suggested prediction for the module and emits a learning event', async () => {
    const listener = vi.fn();
    window.addEventListener('foundation-lab-prediction-updated', listener);

    render(
      <AIPracticeSandbox
        moduleId="aibi-p-module-1"
        product="foundation"
        sandboxConfig={sandboxConfig}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'No customer data' }));

    await waitFor(() => {
      expect(screen.getByText('Prediction saved')).toBeInTheDocument();
    });

    const saved = JSON.parse(
      window.localStorage.getItem('foundation-lab-prediction-aibi-p-module-1') ?? '{}',
    ) as { value?: string; moduleNumber?: number };

    expect(saved.value).toBe('No customer data');
    expect(saved.moduleNumber).toBe(1);
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener('foundation-lab-prediction-updated', listener);
  });

  it('saves a custom prediction from the text field', async () => {
    render(
      <AIPracticeSandbox
        moduleId="aibi-p-module-3"
        product="foundation"
        sandboxConfig={sandboxConfig}
      />,
    );

    fireEvent.change(screen.getByLabelText('My prediction'), {
      target: { value: 'The prompt may omit the reviewer boundary.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save prediction' }));

    await waitFor(() => {
      expect(screen.getByText('Prediction saved')).toBeInTheDocument();
    });

    const saved = JSON.parse(
      window.localStorage.getItem('foundation-lab-prediction-aibi-p-module-3') ?? '{}',
    ) as { value?: string; moduleNumber?: number };

    expect(saved.value).toBe('The prompt may omit the reviewer boundary.');
    expect(saved.moduleNumber).toBe(3);
  });

  it('keeps guided lab starts locked until a prediction is saved', async () => {
    render(
      <AIPracticeSandbox
        moduleId="aibi-p-module-1"
        product="foundation"
        sandboxConfig={sandboxConfig}
      />,
    );

    expect(screen.getByText('1. Predict')).toBeInTheDocument();
    expect(screen.getByText('Name the first check')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Predict first' })[0]).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save a prediction before sending' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'No customer data' }));

    await waitFor(() => {
      expect(screen.getByText('Prediction saved')).toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: 'Use this start' })[0]).toBeEnabled();
  });

  it('adds role-specific lab starts that write banker-context prompts after prediction', async () => {
    render(
      <AIPracticeSandbox
        moduleId="aibi-p-module-1"
        product="foundation"
        sandboxConfig={sandboxConfig}
      />,
    );

    const roleStarts = screen.getByRole('group', { name: 'Role-specific lab starts' });
    const lendingStart = within(roleStarts).getByRole('button', { name: 'Lending' });
    expect(lendingStart).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'No customer data' }));

    await waitFor(() => {
      expect(screen.getByText('Prediction saved')).toBeInTheDocument();
    });

    expect(lendingStart).toBeEnabled();
    fireEvent.click(lendingStart);

    const input = screen.getByLabelText('Message input') as HTMLTextAreaElement;
    expect(input.value).toContain('loan file support');
    expect(input.value).toContain('one sentence I could save into my Foundation Packet');
  });

  it('maps a 401 run failure to actionable sign-in copy and keeps Run un-done', async () => {
    // Sample-data fetch succeeds; the chat POST fails with 401.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          return {
            ok: false,
            status: 401,
            json: async () => ({ error: 'Authentication required.' }),
          } as Response;
        }
        return {
          ok: true,
          text: async () => '## Scenario 1\nA synthetic branch note with no customer data.',
        } as Response;
      }),
    );

    render(
      <AIPracticeSandbox
        moduleId="aibi-p-module-1"
        product="foundation"
        sandboxConfig={sandboxConfig}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'No customer data' }));
    await waitFor(() => {
      expect(screen.getByText('Prediction saved')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'Use this start' })[0]);
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/sign in to run the lab/i);
    expect(alert.textContent).not.toMatch(/^Authentication required\.$/);
    expect(within(alert).getByRole('link', { name: /go to sign-in/i }).getAttribute('href')).toBe(
      '/auth/login',
    );

    // The step tracker must NOT mark Run as done after a failed request.
    const runStep = screen.getByText('3. Run').closest('li') ?? screen.getByText('3. Run').parentElement;
    expect(runStep?.textContent ?? '').not.toMatch(/done/i);
  });
});
