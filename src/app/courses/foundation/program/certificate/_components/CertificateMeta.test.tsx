import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CertificateMeta } from './CertificateMeta';

describe('CertificateMeta', () => {
  it('renders the LinkedIn Add-to-Profile deep link built from the certificate', () => {
    render(
      <CertificateMeta
        certificateId="AIBIP-2026-ABC234"
        enrollmentId="enrollment-123"
        downloadFilename="AiBI-Foundation-Certificate-AIBIP-2026-ABC234.pdf"
        issuedAt="2026-06-23T12:30:00.000Z"
        verificationUrl="https://aibankinginstitute.com/verify/AIBIP-2026-ABC234"
      />,
    );

    const link = screen.getByRole('link', { name: /add to linkedin profile/i });
    const href = link.getAttribute('href') ?? '';
    const parsed = new URL(href);
    expect(parsed.origin).toBe('https://www.linkedin.com');
    expect(parsed.pathname).toBe('/profile/add');
    expect(parsed.searchParams.get('certId')).toBe('AIBIP-2026-ABC234');
    expect(parsed.searchParams.get('certUrl')).toBe(
      'https://aibankinginstitute.com/verify/AIBIP-2026-ABC234',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
