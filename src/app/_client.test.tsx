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
      name: /AI is already here\. Let.s make sure your team is ready\./i,
    });
    expect(heading).toBeTruthy();
    expect(screen.getByText(/Free .* 12 questions .* 3 minutes .* first working template/i)).toBeTruthy();
    expect(screen.getByText(/frontline tellers, branch teams, lenders/i)).toBeTruthy();

    const proofObject = screen.getByLabelText(/typed into a public chatbot/i);
    expect(heading.compareDocumentPosition(proofObject) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the safe hero as a reusable template — placeholders shown, raw PII never', () => {
    render(<HomePage />);

    // Resting state (reduced-motion) is the resolved "safe" frame: the card must
    // teach templating, so the needed values become bracketed placeholders and
    // the real customer data is gone from the DOM.
    const card = screen.getByLabelText(/typed into a public chatbot/i);
    expect(card.textContent).toContain('[customer name]');
    expect(card.textContent).toContain('[account number]');
    expect(card.textContent).toContain('[amount]');

    // The real PII must not be rendered in the safe/template frame.
    expect(card.textContent).not.toContain('John Smith');
    expect(card.textContent).not.toContain('0042871');
    expect(card.textContent).not.toContain('$83.17');

    // The complaint context survives — that's what makes the template usable.
    expect(card.textContent).toContain('overdraft');
  });

  it('drops PII the task never needed (DOB, SSN, phone) from the template', () => {
    render(<HomePage />);

    // The lesson isn't just "mask everything" — a fee-reversal reply never needs
    // a DOB, SSN, or phone number, so the template omits them entirely rather
    // than leaving placeholder slots for data nobody should collect for this task.
    const card = screen.getByLabelText(/typed into a public chatbot/i);
    expect(card.textContent).not.toContain('04/12/1981');
    expect(card.textContent).not.toContain('(555) 123-4567');
    expect(card.textContent).not.toMatch(/ssn/i);
    expect(card.textContent).not.toMatch(/\bdob\b/i);
  });
});
