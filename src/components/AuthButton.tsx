// AuthButton — shows Sign In when logged out, user menu when logged in.
// This is a Server Component. The dropdown is a Client Component island.

import { cookies } from 'next/headers';
import Link from 'next/link';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { AuthDropdown } from './AuthDropdown';

export async function AuthButton() {
  if (!isSupabaseConfigured()) {
    return <SignInLink />;
  }

  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <SignInLink />;
  }

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split('@')[0] ??
    'Account';

  return <AuthDropdown email={user.email ?? ''} displayName={displayName} />;
}

function SignInLink() {
  return (
    <Link
      href="/auth/login"
      className="font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] border border-[color:var(--color-ink)]/25 text-[color:var(--color-ink)]/75 px-4 py-2 hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
    >
      Sign In
    </Link>
  );
}
