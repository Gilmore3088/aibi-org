// /my-toolbox — signed-in learner's saved-prompt / skill / playbook surface.
//
// Per CLAUDE.md §16 this is the paid-customer Toolbox. The previous render
// shipped to anonymous visitors as a "preview" — but a preview built from
// the production Toolbox component leaks the feature surface and exposed
// links to /my-toolbox/skills/[slug] that 500'd for anonymous users
// (resolved separately in #312).
//
// Auth-gating the route now; if a public preview surface is wanted later,
// it should live at /toolbox or /courses/foundation/program/toolbox-preview
// rather than at the signed-in learner's URL. Issue #318.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isPreviewAuthBypassEnabled } from '@/lib/auth/previewBypass';
import ToolboxPage from './_client';

export const metadata: Metadata = {
  alternates: { canonical: '/my-toolbox' },
  title: 'My Toolbox',
  description:
    'Your saved prompts, skills, and reusable workflows from the AiBI-Foundation course.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Preview/local bypass — parity with /courses/foundation/program/layout.
  if (isPreviewAuthBypassEnabled()) {
    return <ToolboxPage />;
  }

  const loginHref = '/auth/login?next=%2Fmy-toolbox';

  if (!isSupabaseConfigured()) {
    redirect(loginHref);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();
  const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginHref);

  return <ToolboxPage />;
}
