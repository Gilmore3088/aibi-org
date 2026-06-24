import { TRUSTED_DEVICE_COOKIE } from '@/lib/auth/trusted-device';

interface SignOutCookieStore {
  getAll(): Array<{ name: string }>;
  delete(name: string): void;
}

export function clearAuthCookiesForSignOut(cookieStore: SignOutCookieStore): void {
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name);
    }
  }
  cookieStore.delete(TRUSTED_DEVICE_COOKIE);
}
