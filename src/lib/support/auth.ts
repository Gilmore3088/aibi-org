import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { isDeviceTrusted, TRUSTED_DEVICE_COOKIE } from '@/lib/auth/trusted-device';
import { isSupportAdminEmail } from './admin';

export type SupportAdminSessionResult =
  | {
      ok: true;
      user: {
        id: string;
        email: string;
      };
    }
  | {
      ok: false;
      status: 401 | 403 | 503;
      reason: 'supabase_not_configured' | 'unauthenticated' | 'untrusted_device' | 'forbidden';
      email?: string | null;
    };

export async function getSupportAdminSession(): Promise<SupportAdminSessionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, status: 503, reason: 'supabase_not_configured' };
  }

  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false, status: 401, reason: 'unauthenticated' };
  }

  const trustedCookie = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;
  let trusted = false;
  try {
    trusted = await isDeviceTrusted({ userId: user.id, cookieToken: trustedCookie });
  } catch {
    return { ok: false, status: 503, reason: 'supabase_not_configured' };
  }
  if (!trusted) {
    return {
      ok: false,
      status: 401,
      reason: 'untrusted_device',
      email: user.email ?? null,
    };
  }

  if (!isSupportAdminEmail(user.email)) {
    return {
      ok: false,
      status: 403,
      reason: 'forbidden',
      email: user.email ?? null,
    };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email ?? '',
    },
  };
}
