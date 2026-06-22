import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LabArtifactDraft } from './LabArtifactDraft';

const moduleId = 'aibi-p-module-3';

function seedDraft() {
  window.localStorage.setItem(
    `foundation-lab-draft-${moduleId}`,
    JSON.stringify({
      moduleId,
      moduleNumber: 3,
      model: 'Claude 3.5 Sonnet',
      dataset: 'Prompt card scenarios',
      savedAt: '2026-06-19T18:30:00.000Z',
      reviewChecklist: ['Task is specific', 'Sensitive data is represented by placeholders'],
      content: 'Draft prompt output from the lab.',
    }),
  );
}

describe('LabArtifactDraft', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('requires a visible human edit decision before transfer', async () => {
    seedDraft();

    render(
      <LabArtifactDraft
        moduleId={moduleId}
        artifactLabel="Prompt Strategy Cheat Sheet"
        feedbackCue="Ready when someone else can run it."
      />,
    );

    expect(await screen.findByText('Human edit lens')).toBeTruthy();
    expect(screen.getByText('Decide what the AI output needs from you.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Change' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Edit decision first')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Keep source visible/i }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));
    expect(screen.getByRole('button', { name: 'Verify' }).getAttribute('aria-pressed')).toBe('true');
    expect(window.localStorage.getItem(`foundation-lab-edit-lens-${moduleId}`)).toBe('verify');

    fireEvent.change(screen.getByLabelText(/Edit decision/i), {
      target: {
        value: 'Verify the dates, then rewrite the table labels in bank language.',
      },
    });

    await waitFor(() =>
      expect(window.localStorage.getItem(`foundation-lab-edit-note-${moduleId}`)).toBe(
        'Verify the dates, then rewrite the table labels in bank language.',
      ),
    );
    expect(screen.getByText('0/3 ready')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Keep source visible/i }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('stays hidden when no lab draft has been saved', () => {
    render(
      <LabArtifactDraft
        moduleId={moduleId}
        artifactLabel="Prompt Strategy Cheat Sheet"
      />,
    );

    expect(screen.queryByLabelText('Saved lab draft')).toBeNull();
  });
});
