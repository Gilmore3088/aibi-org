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
  // Plain text link to avoid competing with the primary "Take Assessment"
  // CTA button in the same right rail. Matches the eyebrow style of the
  // other nav items.
  return (
    <Link
      href="/auth/login"
      className="font-serif-sc text-xs uppercase text-[color:var(--color-ink)]/75 hover:text-[color:var(--color-terra)] transition-colors hidden md:inline"
    >
      Sign In
    </Link>
  );
}
