// Server-side helper called from the auth callback after a magic-link
// signin. Links user_profiles.id (currently a generated UUID) to the
// new auth.users.id by matching on email.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { createServiceRoleClient } from '@/lib/supabase/client';
import { emailVariants } from '@/lib/email/canonicalize';

export interface BackFillResult {
  readonly linked: boolean;
  readonly newProfileId?: string;
}

export async function backFillProfile(
  authUserId: string,
  email: string,
): Promise<BackFillResult> {
  const client = createServiceRoleClient();
  const variants = emailVariants(email);

  // Opportunistically bind any course_enrollments rows that match any
  // email variant but have user_id=null. Covers the Stripe-alias case:
  // bought as user+1@gmail.com, signed in as user@gmail.com.
  await client
    .from('course_enrollments')
    .update({ user_id: authUserId })
    .is('user_id', null)
    .in('email', variants)
    .then(({ error }) => {
      if (error) {
        console.warn('[back-fill-profile] enrollment bind failed:', error.message);
      }
    });

  const { data: existing, error: fetchError } = await client
    .from('user_profiles')
    .select('id, pdf_storage_path')
    .in('email', variants)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`[back-fill-profile] fetch failed: ${fetchError.message}`);
  }
  if (!existing) {
    return { linked: false };
  }
  if (existing.id === authUserId) {
    return { linked: true, newProfileId: authUserId };
  }

  const oldId = existing.id;
  const oldPath = existing.pdf_storage_path;

  // Move the PDF object BEFORE stamping the new path. The previous order
  // stamped `${authUserId}.pdf` first and moved best-effort after — a failed
  // move left the DB pointing at an object that doesn't exist, and the
  // download endpoint then handed out signed URLs that 404 (2026-06-10 prod
  // incident). Stamp whichever path is actually true.
  let newPdfPath: string | null = null;
  if (oldPath) {
    const target = `${authUserId}.pdf`;
    const { error: moveError } = await client.storage
      .from('assessment-pdfs')
      .move(oldPath, target);
    if (!moveError) {
      newPdfPath = target;
    } else {
      console.warn('[back-fill-profile] storage move failed, keeping old path:', moveError.message);
      newPdfPath = oldPath;
    }
  }

  // Record the old id so emailed /results/{oldId} bearer links keep working
  // after the re-key (journey audit 2026-06-10, F5). Fail-open: if migration
  // 00042 hasn't been applied, retry the update without previous_id.
  let { error: updateError } = await client
    .from('user_profiles')
    .update({
      id: authUserId,
      previous_id: oldId,
      pdf_storage_path: newPdfPath,
    })
    .eq('id', oldId);

  if (updateError) {
    console.warn(
      '[back-fill-profile] update with previous_id failed, retrying without:',
      updateError.message,
    );
    ({ error: updateError } = await client
      .from('user_profiles')
      .update({
        id: authUserId,
        pdf_storage_path: newPdfPath,
      })
      .eq('id', oldId));
  }

  if (updateError) {
    throw new Error(`[back-fill-profile] update failed: ${updateError.message}`);
  }

  return { linked: true, newProfileId: authUserId };
}
