/**
 * Pre-send PII check for learner data slots (Sandbox Spec §14 item 4).
 *
 * Pattern-based — covers the four highest-risk classes a banker might
 * reflexively paste into a training sandbox. Not a comprehensive PII
 * scanner; we err toward catching the obvious shapes, not toward
 * exhaustive PII detection (that's a separate concern, and the data slot
 * caps + delimited framing already constrain blast radius).
 *
 *   - SSN              ddd-dd-dddd or 9 contiguous digits with weak separators
 *   - card             13–19 contiguous digits passing a Luhn check
 *   - routing          9 contiguous digits passing the ABA checksum
 *   - account          10–17 contiguous digits, no boundary chars
 */

export interface PiiCheckResult {
  hits: PiiCategory[];
}
export type PiiCategory = 'SSN' | 'card' | 'routing' | 'account';

const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g;
// Matches 9–19 char digit runs (inclusive of spaces/dashes). 9-digit runs
// cover ABA routing; 13–19 digit runs cover card PANs; 10–17 covers
// general bank account numbers.
const DIGIT_RUN_RE = /\d[\d\s-]{7,21}\d/g;

function digitsOnly(s: string): string {
  return s.replace(/\D+/g, '');
}

function luhnValid(digits: string): boolean {
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (d < 0 || d > 9) return false;
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function abaValid(digits: string): boolean {
  if (digits.length !== 9) return false;
  const d = digits.split('').map((c) => Number(c));
  if (d.some((n) => Number.isNaN(n))) return false;
  const checksum =
    3 * (d[0] + d[3] + d[6]) +
    7 * (d[1] + d[4] + d[7]) +
    1 * (d[2] + d[5] + d[8]);
  return checksum > 0 && checksum % 10 === 0;
}

export function piiCheck(value: string): PiiCheckResult {
  const hits = new Set<PiiCategory>();
  if (!value || typeof value !== 'string') return { hits: [] };

  // Card + routing + account — walk every digit run first so we can tell
  // a 9-digit ABA-valid routing apart from an SSN-shaped run.
  for (const run of value.match(DIGIT_RUN_RE) ?? []) {
    const d = digitsOnly(run);
    if (luhnValid(d)) hits.add('card');
    if (abaValid(d)) hits.add('routing');
    if (d.length >= 10 && d.length <= 17 && !luhnValid(d) && !abaValid(d)) {
      hits.add('account');
    }
  }

  // SSN — only count bare 9-digit runs that aren't already accounted for
  // as ABA-valid routing numbers, plus the explicit dashed form.
  for (const m of value.match(SSN_RE) ?? []) {
    const d = digitsOnly(m);
    if (d.length !== 9) continue;
    if (d === '000000000' || d === '999999999') continue;
    if (m.includes('-')) {
      // dashed SSN form is unambiguous
      hits.add('SSN');
      break;
    }
    // bare 9 digits — only SSN if it's NOT an ABA-valid routing
    if (!abaValid(d)) {
      hits.add('SSN');
      break;
    }
  }

  return { hits: Array.from(hits) };
}
