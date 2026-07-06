import { describe, expect, it } from 'vitest';
import { buildLinkedInAddToProfileUrl } from './linkedin';

describe('buildLinkedInAddToProfileUrl', () => {
  it('builds the profile/add deep link with certification fields', () => {
    const url = buildLinkedInAddToProfileUrl({
      name: 'AiBI-Foundation',
      organizationName: 'The AI Banking Institute',
      issuedAt: '2026-06-23T12:30:00.000Z',
      certUrl: 'https://aibankinginstitute.com/verify/AIBIP-2026-ABC234',
      certId: 'AIBIP-2026-ABC234',
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://www.linkedin.com');
    expect(parsed.pathname).toBe('/profile/add');
    expect(parsed.searchParams.get('startTask')).toBe('CERTIFICATION_NAME');
    expect(parsed.searchParams.get('name')).toBe('AiBI-Foundation');
    expect(parsed.searchParams.get('organizationName')).toBe('The AI Banking Institute');
    expect(parsed.searchParams.get('issueYear')).toBe('2026');
    expect(parsed.searchParams.get('issueMonth')).toBe('6');
    expect(parsed.searchParams.get('certUrl')).toBe(
      'https://aibankinginstitute.com/verify/AIBIP-2026-ABC234',
    );
    expect(parsed.searchParams.get('certId')).toBe('AIBIP-2026-ABC234');
  });

  it('uses the UTC issue month (1-based), including year boundaries', () => {
    const url = buildLinkedInAddToProfileUrl({
      name: 'AiBI-Foundation',
      organizationName: 'The AI Banking Institute',
      issuedAt: '2026-01-01T00:15:00.000Z',
      certUrl: 'https://aibankinginstitute.com/verify/AIBIP-2026-XYZ789',
      certId: 'AIBIP-2026-XYZ789',
    });

    const parsed = new URL(url);
    expect(parsed.searchParams.get('issueYear')).toBe('2026');
    expect(parsed.searchParams.get('issueMonth')).toBe('1');
  });
});
