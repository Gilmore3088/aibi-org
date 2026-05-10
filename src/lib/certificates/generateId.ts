// Certificate ID generator for AiBI-Foundation credentials.
// Produces IDs in format: AIBIP-YYYY-XXXXXX
// where YYYY is the current year and XXXXXX is 6 random chars from an
// unambiguous 30-character alphabet (no 0/O/1/I/L to prevent confusion).
// The UNIQUE constraint on certificates.certificate_id provides the DB-level
// uniqueness guarantee; this generator just needs sufficient entropy.
// 6 chars × 30-char alphabet = ~729 million combinations.

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const RANDOM_PART_LENGTH = 6;

/**
 * Generates a unique certificate ID in the format AIBIP-YYYY-XXXXXX.
 * Uses crypto.getRandomValues() for cryptographically secure randomness.
 */
export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const randomBytes = new Uint8Array(RANDOM_PART_LENGTH);
  crypto.getRandomValues(randomBytes);

  const randomPart = Array.from(randomBytes)
    .map((byte) => ALPHABET[byte % ALPHABET.length])
    .join('');

  return `AIBIP-${year}-${randomPart}`;
}
