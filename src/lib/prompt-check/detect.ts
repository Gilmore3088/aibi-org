// Prompt checker — finds customer data in a prompt before it is pasted into
// an AI tool, and proposes a placeholder version.
//
// Pure, synchronous, browser-only pattern matching. Nothing is sent
// anywhere. It checks patterns, not meaning: a clean result does not make a
// prompt safe, and the UI says so. Patterns favour recall over precision for
// the identifiers that matter most (SSN, account, card) and stay
// context-bound for names so ordinary capitalised words are not flagged.

export type FindingKind =
  | 'ssn'
  | 'card'
  | 'account'
  | 'routing'
  | 'phone'
  | 'email'
  | 'dob'
  | 'amount'
  | 'address'
  | 'name';

export interface Finding {
  readonly kind: FindingKind;
  readonly start: number;
  readonly end: number;
  readonly text: string;
  /** A possessive name ("John's", "johns"): the placeholder keeps the "'s". */
  readonly possessive?: boolean;
}

export const KIND_LABEL: Record<FindingKind, string> = {
  ssn: 'Social Security number',
  card: 'Card number',
  account: 'Account number',
  routing: 'Routing number',
  phone: 'Phone number',
  email: 'Email address',
  dob: 'Date of birth',
  amount: 'Dollar amount',
  address: 'Street address',
  name: 'Customer name',
};

export const KIND_PLACEHOLDER: Record<FindingKind, string> = {
  ssn: '[remove — not needed]',
  card: '[remove — not needed]',
  account: '[account number]',
  routing: '[remove — not needed]',
  phone: '[remove — not needed]',
  email: '[customer email]',
  dob: '[remove — not needed]',
  amount: '[amount]',
  address: '[address]',
  name: '[customer name]',
};

interface Rule {
  readonly kind: FindingKind;
  readonly re: RegExp;
  /** Capture group holding the sensitive value (default: whole match). */
  readonly group?: number;
  readonly accept?: (value: string) => boolean;
  /** Custom extraction; return null to skip the match. */
  readonly extract?: (m: RegExpExecArray) => Omit<Finding, 'kind'> | null;
}

const digitsOf = (s: string) => s.replace(/\D/g, '');

function luhn(num: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

const NAME_WORD = "[A-Z][a-z]+(?:['-][A-Z]?[a-z]+)?";
// Words that look like names after a cue but are not (roles, pronouns, places in prompts).
const NOT_NAMES = new Set([
  'The', 'This', 'That', 'Our', 'Your', 'My', 'His', 'Her', 'Their', 'Them', 'Him', 'Me', 'Us',
  'Customer', 'Member', 'Client', 'Borrower', 'Applicant', 'Bank', 'Credit', 'Union', 'Monday',
  'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Operations', 'Compliance',
  'Marketing', 'Lending', 'Team', 'Staff', 'Branch', 'Board', 'Management', 'AI', 'Please',
  'Retail', 'Commercial', 'Deposit', 'Loan', 'Risk', 'Finance', 'Audit', 'Executive', 'Senior',
  'Community', 'Human', 'Resources', 'Treasury', 'Federal', 'Reserve', 'Guidance', 'Policy',
]);

// Common first names, matched in any case ("about john", "johns overdraft").
// Names that are also everyday words (Will, Mark, Bill, Grace, June...) are
// left out so ordinary prompts are not flagged.
const FIRST_NAMES = new Set(
  (
    'james john robert michael david william richard joseph thomas charles christopher daniel matthew ' +
    'anthony donald steven paul andrew joshua kenneth kevin brian george timothy ronald edward jason ' +
    'jeffrey ryan jacob gary nicholas eric jonathan stephen larry justin scott brandon benjamin samuel ' +
    'gregory alexander patrick jack dennis jerry tyler aaron jose adam nathan henry douglas zachary peter ' +
    'kyle ethan walter noah jeremy christian keith roger terry austin sean gerald carl harold dylan ' +
    'arthur lawrence jordan jesse bryan billy bruce gabriel joe logan alan juan albert willie elijah ' +
    'randy wayne vincent roy ralph bobby russell bradley philip eugene carlos luis ' +
    'mary patricia jennifer linda elizabeth barbara susan jessica sarah karen lisa nancy betty sandra ' +
    'margaret ashley kimberly emily donna michelle carol amanda melissa deborah stephanie rebecca sharon ' +
    'laura cynthia dorothy amy kathleen angela shirley brenda emma anna pamela nicole samantha katherine ' +
    'christine helen debra rachel carolyn janet maria catherine heather diane olivia julie joyce victoria ' +
    'ruth virginia lauren kelly christina joan evelyn judith andrea hannah megan cheryl jacqueline martha ' +
    'madison teresa gloria sara janice ann kathryn abigail sophia frances jean alice judy isabella julia ' +
    'denise amber doris marilyn danielle beverly theresa diana natalie brittany charlotte marie kayla ' +
    'alexis lori jane priya mohammed muhammad ahmed wei li jin raj anil sanjay omar fatima aisha'
  ).split(' '),
);

// Nouns that make "<name>s <noun>" a reference to a specific customer.
const CUSTOMER_NOUNS =
  'overdrafts?|accounts?|loans?|balances?|cards?|mortgages?|transactions?|deposits?|statements?|' +
  'payments?|fees|history|files?|applications?|credit|checking|savings|wires?|disputes?|complaints?|' +
  'address|ssn|phone|email|dob|info|information|records?|activity|chargebacks?|nsf';

const POSSESSIVE_NAME = new RegExp(
  `\\b([A-Za-z][a-z]+)(?:'s|\u2019s|s)\\s+(?=(?:${CUSTOMER_NOUNS})\\b)`,
  'gi',
);

const CUE_FIRST_NAME =
  /\b(?:about|for|to|from|customer|member|client|borrower|named|with|call|email|text|tell)\s+([A-Za-z]+)(?:\s+([A-Za-z][a-z]+))?\b/gi;

// Order matters: earlier rules win when matches overlap.
const RULES: readonly Rule[] = [
  { kind: 'email', re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  // 123-45-6789, 123 45 6789, and masked forms like •••-••-4829 / XXX-XX-1234
  { kind: 'ssn', re: /(?:\b\d{3}|[•*xX]{3})[-–\s][•*xX\d]{2}[-–\s]\d{4}\b/g },
  { kind: 'ssn', re: /\b(?:ssn|social security(?: number| no\.?)?)\s*[:#]?\s*(\d{9})\b/gi, group: 1 },
  {
    kind: 'card',
    re: /\b\d(?:[ -]?\d){12,18}\b/g,
    accept: (v) => {
      const d = digitsOf(v);
      return d.length >= 13 && d.length <= 19 && luhn(d);
    },
  },
  { kind: 'routing', re: /\b(?:routing|aba|rtn)(?:\s+(?:no\.?|number|#))?\s*[:#]?\s*(\d{9})\b/gi, group: 1 },
  {
    kind: 'account',
    re: /\b(?:acct|account|acc|loan|member|share|cif)(?:\s+(?:no\.?|number|num|#))?\s*[:#]?\s*((?:\*{2,}|x{2,})?\d[\d-]{3,16}\d)\b/gi,
    group: 1,
  },
  { kind: 'phone', re: /(?:\+?1[\s.-]?)?(?:\(\d{3}\)\s?|\b\d{3}[\s.-])\d{3}[\s.-]\d{4}\b/g },
  {
    kind: 'dob',
    re: /\b(?:dob|d\.o\.b\.?|date of birth|born(?: on)?|birthdate|birthday)\s*[:#-]?\s*((?:\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})|(?:\d{4}-\d{2}-\d{2})|(?:[A-Z][a-z]+\.? \d{1,2},? \d{4}))/gi,
    group: 1,
  },
  { kind: 'amount', re: /\$\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b|\$\s?\d+(?:\.\d{2})?\b/g },
  {
    kind: 'address',
    re: /\b\d{1,6}\s+(?:[A-Z][a-z]+\s){1,3}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive|Ct|Court|Way|Pl|Place|Hwy|Highway)\b\.?/g,
  },
  {
    kind: 'name',
    re: new RegExp(
      `\\b(?:Mr|Mrs|Ms|Mx|Dr)\\.?\\s+(${NAME_WORD}(?:\\s${NAME_WORD})?)` +
        `|\\b(?:customer|member|client|borrower|applicant|cardholder|account holder|named|reply to|respond to|email to|letter to|write to|call|from|for)\\s+(${NAME_WORD}\\s${NAME_WORD})\\b`,
      'g',
    ),
  },
  {
    kind: 'name',
    re: POSSESSIVE_NAME,
    extract: (m) => {
      const base = m[1];
      const apostrophe = /['\u2019]s\s/.test(m[0]);
      // "James account": the trailing s belongs to the name, not a possessive.
      if (!apostrophe && FIRST_NAMES.has(`${base}s`.toLowerCase())) {
        const text = `${base}s`;
        return { start: m.index, end: m.index + text.length, text };
      }
      const known = FIRST_NAMES.has(base.toLowerCase());
      const capitalised = /^[A-Z]/.test(base) && !NOT_NAMES.has(base);
      if (!known && !(apostrophe && capitalised)) return null;
      const text = m[0].trimEnd();
      return { start: m.index, end: m.index + text.length, text, possessive: true };
    },
  },
  {
    kind: 'name',
    re: CUE_FIRST_NAME,
    extract: (m) => {
      const first = m[1];
      if (!FIRST_NAMES.has(first.toLowerCase())) return null;
      const surname = m[2] && /^[A-Z]/.test(m[2]) && !NOT_NAMES.has(m[2]) ? m[2] : '';
      const text = surname ? `${first} ${surname}` : first;
      const start = m.index + m[0].indexOf(first, m[0].search(/\s/));
      return { start, end: start + text.length, text };
    },
  },
];

function overlaps(a: Finding, b: { start: number; end: number }) {
  return a.start < b.end && b.start < a.end;
}

/** Every sensitive span in `text`, ordered by position, non-overlapping. */
export function detect(text: string): Finding[] {
  const found: Finding[] = [];
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.re.exec(text))) {
      if (rule.extract) {
        const hit = rule.extract(m);
        if (hit) {
          const finding: Finding = { kind: rule.kind, ...hit };
          if (!found.some((f) => overlaps(f, finding))) found.push(finding);
        }
        continue;
      }
      let value = m[0];
      let start = m.index;
      if (rule.kind === 'name') {
        value = m[1] ?? m[2] ?? '';
        if (!value) continue;
        if (value.split(/\s/).some((w) => NOT_NAMES.has(w))) continue;
        start = m.index + m[0].lastIndexOf(value);
      } else if (rule.group && m[rule.group]) {
        value = m[rule.group];
        start = m.index + m[0].lastIndexOf(value);
      }
      if (rule.accept && !rule.accept(value)) continue;
      const finding: Finding = { kind: rule.kind, start, end: start + value.length, text: value };
      if (!found.some((f) => overlaps(f, finding))) found.push(finding);
      if (m[0].length === 0) rule.re.lastIndex++;
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

/**
 * The prompt with each finding replaced by its placeholder. Identifiers the
 * task never needs (SSN, DOB, phone, card, routing) become an explicit
 * "[remove — not needed]" marker so the person deletes them rather than
 * templating them.
 */
export function sanitize(text: string, findings: readonly Finding[] = detect(text)): string {
  let out = '';
  let cursor = 0;
  for (const f of findings) {
    out += text.slice(cursor, f.start) + KIND_PLACEHOLDER[f.kind] + (f.possessive ? '\u2019s' : '');
    cursor = f.end;
  }
  return out + text.slice(cursor);
}
