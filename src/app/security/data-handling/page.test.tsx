import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DataHandlingPage from './page';

describe('DataHandlingPage', () => {
  it('shows AiBI retention, subprocessor, residency, DPA, and PII override posture', () => {
    render(<DataHandlingPage />);

    expect(screen.getByRole('heading', { name: /what happens when a learner uses ai/i })).toBeTruthy();
    expect(screen.getByText(/AiBI operating posture/i)).toBeTruthy();
    // Retention leads with concrete figures in a table, not a prose block.
    expect(screen.getByTestId('retention-table')).toBeTruthy();
    expect(screen.getByText(/Retention at a glance/i)).toBeTruthy();
    expect(screen.getByText(/Assessment resume drafts/i)).toBeTruthy();
    expect(screen.getByText(/Deleted after 30 days/i)).toBeTruthy();
    expect(screen.getByText(/Never stored — metadata only/i)).toBeTruthy();
    expect(screen.getByText(/Retained by OpenAI up to 30 days/i)).toBeTruthy();
    expect(screen.getByText(/Subprocessors and residency/i)).toBeTruthy();
    expect(screen.getByText(/does not currently offer a self-serve single-region residency guarantee/i)).toBeTruthy();
    expect(screen.getByText(/DPA and SOC 2 posture/i)).toBeTruthy();
    expect(screen.getByText(/does not currently claim SOC 2/i)).toBeTruthy();
    expect(screen.getByText(/PII warning overrides/i)).toBeTruthy();
    expect(screen.getByText(/Prompt-injection blocks cannot be overridden/i)).toBeTruthy();
  });
});
