// credentials.ts — Server-only helper for resolving a user's highest certification level.
// Used by server components to determine content gate access.
// Never import from Client Components.

import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import type { ContentLevel } from '@content/courses/aibi-p/prompt-library';

// Products in ascending level order — determines which ContentLevel a product maps to.
const PRODUCT_TO_LEVEL: Record<string, ContentLevel> = {
  'aibi-p': 'p',
  'aibi-s': 's',
  'aibi-l': 'l',
} as const;

const LEVEL_ORDER: Record<ContentLevel, number> = { p: 1, s: 2, l: 3 };

/**
 * Resolve the highest certification level the current user holds.
 *
 * Returns:
 *   'l' — user has AiBI-L enrollment
 *   's' — user has AiBI-S enrollment (but not L)
 *   'p' — user has AiBI-P enrollment only
 *   null — unauthenticated, unconfigured, or no enrollment found
 *
 * Dev bypass: in development (without SKIP_DEV_BYPASS=true), returns 'p'
 * so the course is browsable and gates are visible without Supabase auth.
 */
export async function resolveUserLevel(): Promise<ContentLevel | null> {
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_DEV_BYPASS !== 'true') {
    return 'p';
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

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

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('product')
    .eq('user_id', user.id)
    .in('product', ['aibi-p', 'aibi-s', 'aibi-l']);

  if (error || !data || data.length === 0) {
    return null;
  }

  // Find the highest level among all enrollments
  let highest: ContentLevel | null = null;
  for (const row of data) {
    const level = PRODUCT_TO_LEVEL[row.product as string];
    if (!level) continue;
    if (!highest || LEVEL_ORDER[level] > LEVEL_ORDER[highest]) {
      highest = level;
    }
  }

  return highest;
}
