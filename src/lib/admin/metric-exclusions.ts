import { canonicalEmail } from '@/lib/email/canonicalize';

export interface MetricExclusionConfig {
  readonly exactEmails: readonly string[];
  readonly wildcardPatterns: readonly string[];
}

const DEFAULT_WILDCARD_PATTERNS = [
  '*@aibankinginstitute.test',
  '*@example.test',
  '*@example.com',
] as const;

function parseList(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[,\n]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function wildcardToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .trim()
    .toLowerCase()
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`, 'i');
}

export function getMetricExclusionConfig(): MetricExclusionConfig {
  return {
    exactEmails: parseList(process.env.ADMIN_DASHBOARD_EXCLUDED_EMAILS).map((email) => canonicalEmail(email)),
    wildcardPatterns: [
      ...DEFAULT_WILDCARD_PATTERNS,
      ...parseList(process.env.ADMIN_DASHBOARD_EXCLUDED_EMAIL_PATTERNS),
    ],
  };
}

export function isExcludedMetricEmail(
  email: string | null | undefined,
  config: MetricExclusionConfig = getMetricExclusionConfig(),
): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  if (!lower) return false;
  if (config.exactEmails.includes(canonicalEmail(lower))) return true;
  return config.wildcardPatterns.some((pattern) => wildcardToRegExp(pattern).test(lower));
}

export function filterMetricRowsByEmail<T>(
  rows: readonly T[],
  getEmail: (row: T) => string | null | undefined,
  config: MetricExclusionConfig = getMetricExclusionConfig(),
): T[] {
  return rows.filter((row) => !isExcludedMetricEmail(getEmail(row), config));
}
