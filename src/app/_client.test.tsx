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

  it('renders the safe hero as a reusable template — placeholders shown, raw PII never', () => {
    render(<HomePage />);

    // Resting state (reduced-motion) is the resolved "safe" frame: the card must
    // teach templating, so sensitive values are replaced with bracketed
    // placeholder tokens, and the real customer data is gone from the DOM.
    const card = screen.getByLabelText(/pasted into a public chatbot/i);
    expect(card.textContent).toContain('[customer name]');
    expect(card.textContent).toContain('[account number]');
    expect(card.textContent).toContain('[amount]');

    // The real PII must not be rendered in the safe/template frame.
    expect(card.textContent).not.toContain('John Smith');
    expect(card.textContent).not.toContain('0042871');
    expect(card.textContent).not.toContain('$83.17');

    // The non-sensitive context (the actual complaint) survives — that's what
    // makes the template usable, not just empty.
    expect(card.textContent).toContain('overdraft');
  });
});
