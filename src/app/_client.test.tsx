import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './_client';

describe('HomePage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  it('names the ICP and three-minute assessment value in the hero', () => {
    render(<HomePage />);

    expect(screen.getByText(/For community banks and credit unions/i)).toBeTruthy();
    const heading = screen.getByRole('heading', {
      name: /AI adoption is accelerating\. Judgment isn.t\./i,
    });
    expect(heading).toBeTruthy();
    expect(screen.getByText(/Free .* 12 questions .* 3 minutes .* first artifact/i)).toBeTruthy();
    expect(screen.getByText(/frontline tellers, branch teams, lenders/i)).toBeTruthy();

    const proofObject = screen.getByLabelText(/pasted into a public chatbot/i);
    expect(heading.compareDocumentPosition(proofObject) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
