// Shared entitlement query helper.
//
// The In-Depth Assessment take page, the In-Depth enrollment lookup
// (_lib/getInDepthEnrollment.ts), and the Foundation enrollment lookup
// (_lib/getEnrollment.ts) all hit course_enrollments with the same
// pattern: match `user_id = $authedUser.id` OR `email IN (canonical
// variants of $authedUser.email)`, scoped to one or more product values.
//
// Centralised here so a future change to the variant strategy, the
// product key mapping, or the row order propagates everywhere.

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { emailVariants } from '@/lib/email/canonicalize';

export interface FindEnrollmentOptions {
  readonly user: User;
  readonly products: readonly string[];
  readonly columns: string;
  readonly orderByEnrolledAtDesc?: boolean;
}

export async function findEnrollmentByEmailOrUserId<T = unknown>(
  supabase: SupabaseClient,
  { user, products, columns, orderByEnrolledAtDesc = false }: FindEnrollmentOptions,
): Promise<T | null> {
  const variants = user.email ? emailVariants(user.email) : [];
  const emailClause = variants.map((e) => `email.eq.${e}`).join(',');
  const orFilter = emailClause
    ? `user_id.eq.${user.id},${emailClause}`
    : `user_id.eq.${user.id}`;

  let query = supabase
    .from('course_enrollments')
    .select(columns)
    .or(orFilter)
    .in('product', products as string[]);

  if (orderByEnrolledAtDesc) {
    query = query.order('enrolled_at', { ascending: false });
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('[findEnrollmentByEmailOrUserId] supabase error:', error);
    return null;
  }

  return (data as T | null) ?? null;
}
