/**
 * PII scanner for AiBI Lab.
 *
 * Scans free-text input for personally identifiable information (SSNs,
 * account numbers, emails, phone numbers, dates of birth, addresses,
 * contextual names, and masked/customer identifiers) before the text is
 * sent to an AI provider. Runs in both client and server
 * contexts -- no Node-only or browser-only APIs are used.
 *
 * Design goals:
 *  - Zero external dependencies (pure TypeScript regex).
 *  - Low false-positive rate on dollar amounts, percentages, years,
 *    and module/exercise references.
 *  - Returns the *first* match so the learner gets one actionable
 *    message at a time.
 */

export type PIIKind =
  | 'ssn'
  | 'account_number'
  | 'email'
  | 'phone'
  | 'date_of_birth'
  | 'address'
  | 'person_name'
  | 'masked_identifier';

export interface ScanResult {
  safe: boolean;
  kind?: PIIKind;
  reason?: string;
}

interface Detection {
  kind: PIIKind;
  reason: string;
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

function detection(kind: PIIKind, reason: string): Detection {
  return { kind, reason };
}

function detectSSN(text: string): Detection | null {
  // XXX-XX-XXXX  (dashes required for the formatted variant)
  const dashPattern = /\b(\d{3})-(\d{2})-(\d{4})\b/g;
  let m: RegExpExecArray | null;
  while ((m = dashPattern.exec(text)) !== null) {
    // Reject if the last group looks like a year and the first two
    // groups could be a date component (e.g. "123-45-2024" is unlikely
    // to be a date, but we still flag it as a potential SSN since the
    // full pattern is 3-2-4 digits).
    // Real SSNs never start with 000, 666, or 9xx per SSA rules, but
    // we flag them anyway — better a false positive on a weird number
    // than a missed real SSN.
    return detection('ssn',
      'This message appears to contain a Social Security number. ' +
      'Use the sample data provided instead.',
    );
  }

  // XXX XX XXXX / XXX.XX.XXXX — space- or dot-separated variants. The
  // separator must be consistent, and 3-2-4 grouping is distinctive enough
  // (phones group 3-3-4) that a bare match is worth flagging.
  const separated = /(?<!\d)(\d{3})([ .])(\d{2})\2(\d{4})(?!\d)/g;
  if (separated.exec(text) !== null) {
    return detection('ssn',
      'This message appears to contain a Social Security number. ' +
      'Use the sample data provided instead.',
    );
  }

  // 9 consecutive digits that are NOT part of a longer digit string.
  const nineDigits = /(?<!\d)(\d{9})(?!\d)/g;
  while ((m = nineDigits.exec(text)) !== null) {
    const _digits = m[1];
    // Exclude if embedded in a dollar amount context (preceded by $ or
    // followed by common currency/percent indicators).
    const before = text.slice(Math.max(0, m.index - 1), m.index);
    if (before === '$') continue;

    // Exclude if it looks like a phone number without separators —
    // phone detection handles those separately with area-code heuristics.
    // Here we only flag pure 9-digit sequences as potential SSNs.
    return detection('ssn',
      'This message appears to contain a Social Security number. ' +
      'Use the sample data provided instead.',
    );
  }

  return null;
}

function detectMaskedIdentifier(text: string): Detection | null {
  const masked =
    /\b(?:ssn|social\s+security|account|acct|member|customer|consumer|loan|card|debit\s+card|credit\s+card)\b[^\n]{0,32}(?:x{2,}|\*{2,}|ending\s+in|last\s+(?:four|4))[\s:#-]*\d{4}\b/i;
  if (masked.test(text)) {
    return detection(
      'masked_identifier',
      'This message appears to contain a masked customer identifier. Use the sample data provided instead.',
    );
  }
  return null;
}

function detectContextualIdentifier(text: string): Detection | null {
  const contextual =
    /\b(?:account|acct|member|customer|consumer|loan|card|debit\s+card|credit\s+card|cif|tin|tax\s+id)\s*(?:number|no\.?|#|id|identifier|ending|last\s+(?:four|4)|ref(?:erence)?)?\s*(?:[:#=]|\bis\b)?\s*(?:[A-Z]{1,5}[- ]?)?(?:\d[ -]?){4,17}\b/gi;
  if (contextual.test(text)) {
    return detection(
      'account_number',
      'This message appears to contain a customer, account, loan, card, or member identifier. Use the sample data provided instead.',
    );
  }
  return null;
}

function detectAccountNumber(text: string): Detection | null {
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

    return detection('account_number',
      'This message appears to contain an account number. ' +
      'Use the sample data provided instead.',
    );
  }

  return null;
}

function detectEmail(text: string): Detection | null {
  // Standard email pattern — intentionally broad.
  const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (pattern.test(text)) {
    return detection('email',
      'This message appears to contain an email address. ' +
      'Use the sample data provided instead.',
    );
  }
  return null;
}

function detectPhone(text: string): Detection | null {
  // (XXX) XXX-XXXX
  const paren = /\(\d{3}\)\s?\d{3}[-.]\d{4}/;
  // XXX-XXX-XXXX or XXX.XXX.XXXX
  const dashed = /(?<!\d)\d{3}[-.\s]\d{3}[-.\s]\d{4}(?!\d)/;

  if (paren.test(text) || dashed.test(text)) {
    return detection('phone',
      'This message appears to contain a phone number. ' +
      'Use the sample data provided instead.',
    );
  }
  return null;
}

function detectDOB(text: string): Detection | null {
  // Look for contextual keywords near a date-like pattern.
  const pattern =
    /\b(?:DOB|date\s+of\s+birth|born\s+on|birthdate|birth\s+date)\b[\s:]*\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/i;
  if (pattern.test(text)) {
    return detection('date_of_birth',
      'This message appears to contain a date of birth. ' +
      'Use the sample data provided instead.',
    );
  }
  return null;
}

function detectAddress(text: string): Detection | null {
  const streetAddress =
    /\b\d{1,6}\s+(?:[A-Z0-9][a-zA-Z0-9.'-]*\s+){0,5}(?:street|st\.?|avenue|ave\.?|road|rd\.?|boulevard|blvd\.?|drive|dr\.?|lane|ln\.?|court|ct\.?|way|place|pl\.?|circle|cir\.?|highway|hwy\.?)\b/i;
  const poBox = /\bP\.?\s*O\.?\s+Box\s+\d{1,8}\b/i;
  if (streetAddress.test(text) || poBox.test(text)) {
    return detection(
      'address',
      'This message appears to contain a street or mailing address. Use the sample data provided instead.',
    );
  }
  return null;
}

function detectPersonName(text: string): Detection | null {
  const fullName = String.raw`[A-Z][a-z]+(?:[-'][A-Z][a-z]+)?\s+[A-Z][a-z]+(?:[-'][A-Z][a-z]+)?`;
  const contextual = new RegExp(
    String.raw`\b(?:customer|member|borrower|client|employee|applicant|complainant|consumer)\s+(?:named\s+|name\s+is\s+)?${fullName}\b`,
    'g',
  );
  const labeled = new RegExp(
    String.raw`\b(?:from|name|customer|member|borrower|client|employee|applicant|complainant|consumer)\s*:\s*${fullName}\b`,
    'gi',
  );
  if (contextual.test(text) || labeled.test(text)) {
    return detection(
      'person_name',
      'This message appears to contain a customer or member name. Use the sample data provided instead.',
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function scanForPII(text: string): ScanResult {
  // Run detectors in priority order (most sensitive first).
  const detectors = [
    detectSSN,
    detectEmail,
    detectDOB,
    detectPhone,
    detectAddress,
    detectMaskedIdentifier,
    detectContextualIdentifier,
    detectAccountNumber,
    detectPersonName,
  ];

  for (const detect of detectors) {
    const result = detect(text);
    if (result) {
      return { safe: false, kind: result.kind, reason: result.reason };
    }
  }

  return { safe: true };
}
