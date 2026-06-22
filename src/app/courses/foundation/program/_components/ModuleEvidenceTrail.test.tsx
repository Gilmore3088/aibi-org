import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ModuleEvidenceTrail } from './ModuleEvidenceTrail';

const baseProps = {
  moduleNumber: 3,
  moduleId: 'aibi-p-module-3',
  artifactLabel: 'Prompt Strategy Cheat Sheet',
  hasLab: true,
  isAlreadyCompleted: false,
  recallCue: 'Build one reusable prompt with CORE structure.',
  reviewCue: 'Check the prompt for data boundaries.',
  transferCue: 'Use the prompt on one recurring weekly task.',
} as const;

describe('ModuleEvidenceTrail', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('shows a compact evidence path before the learner has collected proof', () => {
    render(<ModuleEvidenceTrail {...baseProps} />);

    const trail = screen.getByTestId('foundation-module-evidence-trail');

    expect(trail.textContent).toContain('Evidence trail');
    expect(trail.textContent).toContain('0/7 proof points');
    expect(trail.textContent).toContain('Next · Target');
    expect(trail.textContent).toContain('Choose the job this module should help.');
    expect(trail.textContent).toContain('Next · Remember');
    expect(trail.textContent).toContain('Build one reusable prompt with CORE structure.');
    expect(trail.textContent).toContain('Next · Predict');
    expect(trail.textContent).toContain('Name the first risk before running AI.');
    expect(trail.textContent).toContain('Next · Lab');
    expect(trail.textContent).toContain('Next · Review');
    expect(trail.textContent).toContain('Next · Next use');
    expect(trail.textContent).toContain('Use the prompt on one recurring weekly task.');
    expect(trail.textContent).toContain('Next · Packet');
  });

  it('summarizes saved target, recall, prediction, lab draft, handoff, and transfer evidence', () => {
    window.localStorage.setItem('foundation-module-start-target-3', 'Rewrite the next lending update.');
    window.localStorage.setItem('foundation-memory-card-3', 'remembered');
    window.localStorage.setItem(
      'foundation-lab-prediction-aibi-p-module-3',
      JSON.stringify({
        moduleNumber: 3,
        value: 'The output may miss the reviewer boundary.',
        savedAt: '2026-06-20T00:00:00.000Z',
      }),
    );
    window.localStorage.setItem('foundation-lab-draft-aibi-p-module-3', '{"content":"draft"}');
    window.localStorage.setItem(
      'foundation-module-handoff-3',
      'Use this prompt pattern for the next weekly branch recap.',
    );
    window.localStorage.setItem(
      'foundation-transfer-plan-3',
      'Use this on the next recurring branch recap before sending it to the manager.',
    );

    render(<ModuleEvidenceTrail {...baseProps} />);

    const trail = screen.getByTestId('foundation-module-evidence-trail');

    expect(trail.textContent).toContain('6/7 proof points');
    expect(trail.textContent).toContain('Done · Target');
    expect(trail.textContent).toContain('Rewrite the next lending update.');
    expect(trail.textContent).toContain('Done · Remember');
    expect(trail.textContent).toContain('Rule remembered.');
    expect(trail.textContent).toContain('Done · Predict');
    expect(trail.textContent).toContain('The output may miss the reviewer boundary.');
    expect(trail.textContent).toContain('Done · Lab');
    expect(trail.textContent).toContain('Lab output saved.');
    expect(trail.textContent).toContain('Done · Review');
    expect(trail.textContent).toContain('Use this prompt pattern for the next weekly branch recap.');
    expect(trail.textContent).toContain('Done · Next use');
    expect(trail.textContent).toContain(
      'Use this on the next recurring branch recap before sending it to the manager.',
    );
    expect(trail.textContent).toContain('Next · Packet');
  });

  it('updates when module learning signals change on the page', async () => {
    render(<ModuleEvidenceTrail {...baseProps} />);

    expect(screen.getByTestId('foundation-module-evidence-trail').textContent).toContain(
      '0/7 proof points',
    );

    act(() => {
      window.localStorage.setItem('foundation-module-start-target-3', 'Use this on a safe policy note.');
      window.dispatchEvent(
        new CustomEvent('foundation-module-start-target-updated', {
          detail: { moduleNumber: 3 },
        }),
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('foundation-module-evidence-trail').textContent).toContain(
        '1/7 proof points',
      ),
    );
    expect(screen.getByTestId('foundation-module-evidence-trail').textContent).toContain(
      'Use this on a safe policy note.',
    );

    act(() => {
      window.localStorage.setItem(
        'foundation-lab-prediction-aibi-p-module-3',
        JSON.stringify({ moduleNumber: 3, value: 'The answer may overstate the policy source.' }),
      );
      window.dispatchEvent(
        new CustomEvent('foundation-lab-prediction-updated', {
          detail: { moduleId: 'aibi-p-module-3' },
        }),
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('foundation-module-evidence-trail').textContent).toContain(
        '2/7 proof points',
      ),
    );
    expect(screen.getByTestId('foundation-module-evidence-trail').textContent).toContain(
      'The answer may overstate the policy source.',
    );

    act(() => {
      window.localStorage.setItem('foundation-lab-draft-aibi-p-module-3', '{"content":"draft"}');
      window.dispatchEvent(
        new CustomEvent('foundation-lab-draft-updated', {
          detail: { moduleId: 'aibi-p-module-3' },
        }),
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('foundation-module-evidence-trail').textContent).toContain(
        '3/7 proof points',
      ),
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent('foundation-learning-signal-updated', {
          detail: {
            moduleNumber: 3,
            signal: 'transfer-plan',
            active: true,
            value: 'Use this prompt on the next weekly branch recap.',
          },
        }),
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('foundation-module-evidence-trail').textContent).toContain(
        '4/7 proof points',
      ),
    );
    expect(screen.getByTestId('foundation-module-evidence-trail').textContent).toContain(
      'Use this prompt on the next weekly branch recap.',
    );
  });

  it('omits the lab step when a module has no sandbox', () => {
    render(<ModuleEvidenceTrail {...baseProps} hasLab={false} />);

    const trail = screen.getByTestId('foundation-module-evidence-trail');

    expect(trail.textContent).toContain('0/5 proof points');
    expect(trail.textContent).not.toContain('Lab output saved.');
    expect(trail.textContent).not.toContain('Next · Predict');
    expect(trail.textContent).not.toContain('Next · Lab');
    expect(trail.textContent).toContain('Next · Next use');
  });
});
