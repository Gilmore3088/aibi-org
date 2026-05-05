// Magic-link invite tokens for the In-Depth Assessment.
// Tokens are random 32-byte values, base64url-encoded.
// Stored in indepth_assessment_takers.invite_token (UNIQUE).
// Token validity is enforced by lookup in the DB, not by signing —
// a stolen token is a stolen seat. Tokens are one-shot:
// invite_consumed_at marks first redemption.

import { randomBytes } from 'crypto';

const TOKEN_BYTES = 32;
const TOKEN_REGEX = /^[A-Za-z0-9_-]{32,}$/;

export function generateInviteToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function isValidInviteToken(token: string): boolean {
  return typeof token === 'string' && TOKEN_REGEX.test(token);
}
