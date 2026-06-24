import { describe, expect, it } from 'vitest';
import { TRUSTED_DEVICE_COOKIE } from '@/lib/auth/trusted-device';
import { clearAuthCookiesForSignOut } from './signOutCookies';

describe('clearAuthCookiesForSignOut', () => {
  it('clears Supabase auth cookies and the trusted-device cookie only', () => {
    const deleted: string[] = [];
    const cookieStore = {
      getAll: () => [
        { name: 'sb-project-auth-token' },
        { name: 'sb-project-auth-token.0' },
        { name: TRUSTED_DEVICE_COOKIE },
        { name: 'aibi-preferences' },
      ],
      delete: (name: string) => {
        deleted.push(name);
      },
    };

    clearAuthCookiesForSignOut(cookieStore);

    expect(deleted).toEqual([
      'sb-project-auth-token',
      'sb-project-auth-token.0',
      TRUSTED_DEVICE_COOKIE,
    ]);
  });
});
