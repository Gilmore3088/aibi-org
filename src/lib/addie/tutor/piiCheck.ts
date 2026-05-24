/**
 * Pre-send PII check for the in-lesson AI tutor question input.
 *
 * Mirrors sandbox-service/src/exercises/piiCheck.ts intentionally — when
 * we later promote one or the other to a shared package, the contract
 * should already agree. Catches the four highest-risk shapes a banker
 * might reflexively type into a tutor box:
 *
 *   - SSN              ddd-dd-dddd or 9 contiguous digits with weak separators
 *   - card             13–19 contiguous digits passing a Luhn check
 *   - routing          9 contiguous digits passing the ABA checksum
 *   - account          10–17 contiguous digits, no boundary chars
 *
 * Not a comprehensive PII scanner. The standing data-discipline rule
 * (CLAUDE.md) is the contract; this guard is the belt + suspenders.
 */

export type PiiCategory = 'SSN' | 'card' | 'routing' | 'account';

export interface PiiCheckResult {
  readonly hits: readonly PiiCategory[];
}

const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g;
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

  for (const run of value.match(DIGIT_RUN_RE) ?? []) {
    const d = digitsOnly(run);
    if (luhnValid(d)) hits.add('card');
    if (abaValid(d)) hits.add('routing');
    if (d.length >= 10 && d.length <= 17 && !luhnValid(d) && !abaValid(d)) {
      hits.add('account');
    }
  }

  for (const m of value.match(SSN_RE) ?? []) {
    const d = digitsOnly(m);
    if (d.length !== 9) continue;
    if (d === '000000000' || d === '999999999') continue;
    if (m.includes('-')) {
      hits.add('SSN');
      break;
    }
    if (!abaValid(d)) {
      hits.add('SSN');
      break;
    }
  }

  return { hits: Array.from(hits) };
}

export function piiHumanReason(hits: readonly PiiCategory[]): string {
  if (hits.length === 0) return '';
  const map: Record<PiiCategory, string> = {
    SSN: 'a Social Security number',
    card: 'what looks like a card number',
    routing: 'a routing number',
    account: 'what looks like an account number',
  };
  const phrases = hits.map((h) => map[h]);
  if (phrases.length === 1) return `Your question contains ${phrases[0]}.`;
  const last = phrases[phrases.length - 1];
  return `Your question contains ${phrases.slice(0, -1).join(', ')} and ${last}.`;
}
