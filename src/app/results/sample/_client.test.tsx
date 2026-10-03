import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SampleResultsPage, { SAMPLE_ANSWERS, SAMPLE_SCORE } from './_client';

describe('/results/sample', () => {
  it('renders the real results view with the sample PDF numbers, labelled as sample data', () => {
    render(<SampleResultsPage />);
    expect(SAMPLE_SCORE).toBe(36);
    expect(Math.min(...Object.values(SAMPLE_ANSWERS))).toBe(1);
    expect(Object.values(SAMPLE_ANSWERS).filter((v) => v === 1)).toHaveLength(1);
    expect(screen.getByText(/illustrative data only/i)).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Building Momentum/);
    expect(document.querySelector('.rv-readout')!.textContent).toContain('Documentation');
  });
});
