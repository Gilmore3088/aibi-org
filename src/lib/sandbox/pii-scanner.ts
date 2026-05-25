/**
 * PII Scanner for the AI Practice Sandbox.
 *
 * Scans free-text input for personally identifiable information (SSNs,
 * account numbers, emails, phone numbers, dates of birth) before the
 * text is sent to an AI provider. Runs in both client and server
 * contexts -- no Node-only or browser-only APIs are used.
 *
 * Design goals:
 *  - Zero external dependencies (pure TypeScript regex).
 *  - Low false-positive rate on dollar amounts, percentages, years,
 *    and module/exercise references.
 *  - Returns the *first* match so the learner gets one actionable
 *    message at a time.
 */

interface ScanResult {
  safe: boolean;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Year-range constant used to suppress false positives on 4-digit years.
// ---------------------------------------------------------------------------
const YEAR_MIN = 1900;
const YEAR_MAX = 2099;

function isPlausibleYear(digits: string): boolean {
  const n = parseInt(digits, 10);
  return n >= YEAR_MIN && n <= YEAR_MAX;
}

// ---------------------------------------------------------------------------
// Individual detectors — each returns a reason string or null.
// ---------------------------------------------------------------------------

function detectSSN(text: string): string | null {
  const ssnReason =
    'This message appears to contain a Social Security number. ' +
    'Use the sample data provided instead.';

  // XXX-XX-XXXX  (dashed variant)
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) {
    return ssnReason;
  }

  // XXX XX XXXX  (space-separated variant — F18 hardening 2026-05-24)
  if (/(?<!\d)\d{3}\s\d{2}\s\d{4}(?!\d)/.test(text)) {
    return ssnReason;
  }

  // XXX.XX.XXXX  (dot-separated variant)
  if (/(?<!\d)\d{3}\.\d{2}\.\d{4}(?!\d)/.test(text)) {
    return ssnReason;
  }

  // 9 consecutive digits that are NOT part of a longer digit string,
  // and NOT immediately preceded by '$' (dollar amount).
  const nineDigits = /(?<!\d)(\d{9})(?!\d)/g;
  let m: RegExpExecArray | null;
  while ((m = nineDigits.exec(text)) !== null) {
    const before = text.slice(Math.max(0, m.index - 1), m.index);
    if (before === '$') continue;
    return ssnReason;
  }

  return null;
}

// Luhn checksum for credit-card PAN validation. Returns true when the
// digit sequence passes the standard mod-10 check. Used by detectPAN —
// added 2026-05-24 (F18) to close the "no PAN/Luhn check on the chat
// path" gap surfaced by the IT/InfoSec critique.
function passesLuhn(digits: string): boolean {
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (Number.isNaN(n)) return false;
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function detectPAN(text: string): string | null {
  // 13–19 digit sequences with optional - or space separators between
  // 4-digit groups (catches the most common print formats: 4242 4242
  // 4242 4242, 4242-4242-4242-4242, 4242424242424242).
  const groupedPan = /(?<!\d)((?:\d[\s-]?){12,18}\d)(?!\d)/g;
  let m: RegExpExecArray | null;
  while ((m = groupedPan.exec(text)) !== null) {
    const digits = m[1].replace(/[\s-]/g, '');
    if (digits.length < 13 || digits.length > 19) continue;
    if (!passesLuhn(digits)) continue;
    return (
      'This message appears to contain a credit card or payment card number. ' +
      'Use the sample data provided instead.'
    );
  }
  return null;
}

function detectAccountNumber(text: string): string | null {
  // 8-12 consecutive digits not part of a longer digit run.
  const pattern = /(?<!\d)(\d{8,12})(?!\d)/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const digits = m[1];

    // Skip if preceded by a dollar sign (monetary amount).
    const before = text.slice(Math.max(0, m.index - 1), m.index);
    if (before === '$') continue;

    // Skip 4-digit years that happen to abut other digits to form 8+
    // chars — but only when the string IS exactly 4 digits (handled by
    // the year check below for the full match).
    if (digits.length === 4 && isPlausibleYear(digits)) continue;

    // Skip if the number is exactly 9 digits — SSN detector handles it.
    if (digits.length === 9) continue;

    // Skip plausible years embedded alone (already handled by length
    // check above, but guard against 8-digit date strings like
    // 20240115 which are ISO-ish dates).
    if (digits.length === 8) {
      const yearPart = digits.slice(0, 4);
      if (isPlausibleYear(yearPart)) continue;
    }

    return (
      'This message appears to contain an account number. ' +
      'Use the sample data provided instead.'
    );
  }

  return null;
}

function detectEmail(text: string): string | null {
  // Standard email pattern — intentionally broad.
  const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (pattern.test(text)) {
    return (
      'This message appears to contain an email address. ' +
      'Use the sample data provided instead.'
    );
  }
  return null;
}

function detectPhone(text: string): string | null {
  // (XXX) XXX-XXXX
  const paren = /\(\d{3}\)\s?\d{3}[-.]\d{4}/;
  // XXX-XXX-XXXX or XXX.XXX.XXXX
  const dashed = /(?<!\d)\d{3}[-.\s]\d{3}[-.\s]\d{4}(?!\d)/;

  if (paren.test(text) || dashed.test(text)) {
    return (
      'This message appears to contain a phone number. ' +
      'Use the sample data provided instead.'
    );
  }
  return null;
}

function detectDOB(text: string): string | null {
  // Look for contextual keywords near a date-like pattern.
  const pattern =
    /\b(?:DOB|date\s+of\s+birth|born\s+on|birthdate|birth\s+date)\b[\s:]*\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/i;
  if (pattern.test(text)) {
    return (
      'This message appears to contain a date of birth. ' +
      'Use the sample data provided instead.'
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function scanForPII(text: string): ScanResult {
  // Run detectors in priority order (most sensitive first). PAN before
  // account-number because the Luhn check is more specific and we want
  // the more accurate error message when the input matches.
  const detectors = [detectSSN, detectPAN, detectEmail, detectDOB, detectPhone, detectAccountNumber];

  for (const detect of detectors) {
    const reason = detect(text);
    if (reason) {
      return { safe: false, reason };
    }
  }

  return { safe: true };
}
