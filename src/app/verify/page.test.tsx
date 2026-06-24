import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VerifyCertificateLookupPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('VerifyCertificateLookupPage', () => {
  it('provides a public certificate lookup entry point with verification boundaries', () => {
    render(<VerifyCertificateLookupPage />);

    expect(screen.getByRole('heading', { name: /verify an aibi certificate/i })).toBeTruthy();
    expect(screen.getByText(/not regulator,\s*examiner,\s*or third-party endorsement/i)).toBeTruthy();
    expect(screen.getByText(/the certificate ID exists/i)).toBeTruthy();
    expect(screen.getByLabelText(/certificate id/i)).toBeTruthy();
  });
});
