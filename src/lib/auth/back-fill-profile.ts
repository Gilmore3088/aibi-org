// Server-side helper called from the auth callback after a magic-link
// signin. Links user_profiles.id (currently a generated UUID) to the
// new auth.users.id by matching on email.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { createServiceRoleClient } from '@/lib/supabase/client';

export interface BackFillResult {
  readonly linked: boolean;
  readonly newProfileId?: string;
}

export async function backFillProfile(
  authUserId: string,
  email: string,
): Promise<BackFillResult> {
  const client = createServiceRoleClient();

  const { data: existing, error: fetchError } = await client
    .from('user_profiles')
    .select('id, pdf_storage_path')
    .eq('email', email)
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

  const { error: updateError } = await client
    .from('user_profiles')
    .update({
      id: authUserId,
      pdf_storage_path: oldPath ? `${authUserId}.pdf` : null,
    })
    .eq('id', oldId);

  if (updateError) {
    throw new Error(`[back-fill-profile] update failed: ${updateError.message}`);
  }

  if (oldPath) {
    const { error: moveError } = await client.storage
      .from('assessment-pdfs')
      .move(oldPath, `${authUserId}.pdf`);
    if (moveError) {
      console.warn('[back-fill-profile] storage move failed:', moveError.message);
    }
  }

  return { linked: true, newProfileId: authUserId };
}
