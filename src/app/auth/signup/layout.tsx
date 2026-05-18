import type { ReactNode } from 'react';
import { requireGuestOrRedirect } from '@/lib/auth/requireGuestOrRedirect';

export default async function SignupLayout({ children }: { children: ReactNode }) {
  await requireGuestOrRedirect();
  return <>{children}</>;
}
