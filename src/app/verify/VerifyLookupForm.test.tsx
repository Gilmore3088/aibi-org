import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VerifyLookupForm } from './VerifyLookupForm';

const pushMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('VerifyLookupForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('normalizes a printed certificate ID and routes to the public verification page', () => {
    render(<VerifyLookupForm />);

    fireEvent.change(screen.getByLabelText(/certificate id/i), {
      target: { value: ' aibip-2026-abc234 ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /verify certificate/i }));

    expect(pushMock).toHaveBeenCalledWith('/verify/AIBIP-2026-ABC234');
  });

  it('prompts for the printed credential ID before routing', () => {
    render(<VerifyLookupForm />);

    fireEvent.change(screen.getByLabelText(/certificate id/i), {
      target: { value: 'AIBI' },
    });
    fireEvent.click(screen.getByRole('button', { name: /verify certificate/i }));

    expect(screen.getByRole('alert').textContent).toBe(
      'Enter the certificate ID printed on the credential.',
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
