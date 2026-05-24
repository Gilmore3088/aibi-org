// Backup recovery codes — the "lost all my devices" escape hatch for
// passkey-only auth. Generated at enrollment, shown once, stored hashed
// in webauthn_recovery_codes. Each code is single-use: consumed on
// verification, the row is marked with consumed_at and the user must
// generate a fresh batch.
//
// Crypto choices:
// - Codes are 16 chars of base32 (no I, O, 0, 1 — humanly disambiguated)
//   formatted as XXXX-XXXX-XXXX-XXXX. ~80 bits of entropy per code.
// - Hash is SHA-256 with a server-side pepper (RECOVERY_CODE_PEPPER).
//   At 80 bits the codes are already infeasible to brute-force from a
//   stolen DB; SHA-256+pepper protects against rainbow tables and the
//   case where the pepper hasn't leaked alongside the DB.
// - Each call to generateCodes makes 8 codes. Plaintext is returned
//   exactly once — never re-derivable from the DB.

import { randomBytes, createHash } from 'node:crypto';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // base32 minus IOLB01
const CODE_LENGTH = 16; // 4 groups of 4
const BATCH_SIZE = 8;

function pepper(): string {
  return process.env.RECOVERY_CODE_PEPPER ?? '';
}

function randomCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let raw = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    // Modulo bias is negligible for a 32-char alphabet over 256 byte
    // values (256 % 32 === 0). Each byte maps uniformly.
    raw += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  // Format as XXXX-XXXX-XXXX-XXXX
  return raw.match(/.{1,4}/g)!.join('-');
}

function normalize(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function hashCode(plaintext: string): string {
  const normalized = normalize(plaintext);
  return createHash('sha256')
    .update(`${pepper()}::${normalized}`)
    .digest('hex');
}

interface GenerateResult {
  readonly ok: boolean;
  readonly codes?: readonly string[];
  readonly error?: string;
}

/** Generate a fresh batch of recovery codes for a user. Wipes any
 *  prior codes for the same user — only one active batch at a time. */
export async function generateCodesForUser(
  userId: string,
): Promise<GenerateResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured.' };
  }
  const supabase = createServiceRoleClient();

  // Delete any existing codes (consumed or not) so the user can't get
  // confused about which batch is active.
  await supabase
    .from('webauthn_recovery_codes')
    .delete()
    .eq('user_id', userId);

  const codes = Array.from({ length: BATCH_SIZE }, () => randomCode());
  const rows = codes.map((code) => ({
    user_id: userId,
    code_hash: hashCode(code),
  }));

  const { error } = await supabase
    .from('webauthn_recovery_codes')
    .insert(rows);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, codes };
}

interface VerifyResult {
  readonly ok: boolean;
  readonly userId?: string;
  readonly email?: string;
  readonly error?: string;
}

/** Verify a code provided at /auth/recovery. Looks up the matching
 *  hash, marks the row consumed, returns the user's id + email so the
 *  caller can bootstrap a session. */
export async function verifyRecoveryCode(
  email: string,
  code: string,
): Promise<VerifyResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured.' };
  }
  if (!code || normalize(code).length !== CODE_LENGTH) {
    return { ok: false, error: 'Invalid code format.' };
  }

  const supabase = createServiceRoleClient();

  // Find the auth user by email so we can scope the code lookup.
  const { data: list } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const target = list?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase().trim(),
  );
  if (!target) {
    return { ok: false, error: 'No account for that email.' };
  }

  const hash = hashCode(code);
  const { data: row } = await supabase
    .from('webauthn_recovery_codes')
    .select('id, consumed_at')
    .eq('user_id', target.id)
    .eq('code_hash', hash)
    .maybeSingle();

  if (!row) {
    return { ok: false, error: 'Code not recognized.' };
  }
  if (row.consumed_at) {
    return { ok: false, error: 'Code already used.' };
  }

  await supabase
    .from('webauthn_recovery_codes')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', row.id);

  return { ok: true, userId: target.id, email: target.email ?? email };
}

/** Count remaining (unconsumed) recovery codes for a user. Surface this
 *  on the security dashboard so the user knows when to regenerate. */
export async function countActiveRecoveryCodes(
  userId: string,
): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = createServiceRoleClient();
  const { count } = await supabase
    .from('webauthn_recovery_codes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('consumed_at', null);
  return count ?? 0;
}
