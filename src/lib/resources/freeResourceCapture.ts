import { EMAIL_RE } from '@/lib/email/validate';

export const FREE_RESOURCE_UNLOCK_KEY = 'aibi.freeResource.emailCaptured';
export const FREE_RESOURCE_EMAIL_KEY = 'aibi.freeResource.email';
export const FREE_RESOURCE_CONTEXT_KEY = 'aibi.freeResource.context';
export const FREE_RESOURCE_CAPTURE_COOKIE = 'aibi_free_resource_email';

export interface FreeResourceCaptureContext {
  readonly email: string;
  readonly source: string;
  readonly role?: string;
  readonly tier?: string;
  readonly tierLabel?: string;
  readonly topGap?: string;
  readonly capturedAt: string;
}

export interface FreeResourceDownloadAttributionContext {
  readonly source?: string;
  readonly role?: string;
  readonly tier?: string;
  readonly tierLabel?: string;
  readonly topGap?: string;
}

const DOWNLOAD_ATTRIBUTION_PARAMS = {
  source: 'source_surface',
  role: 'assessment_role',
  tier: 'assessment_tier_id',
  tierLabel: 'assessment_tier_label',
  topGap: 'assessment_top_gap',
} as const;

function normalizeAttributionValue(value: unknown, maxLength = 128): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

export function normalizeCaptureEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return EMAIL_RE.test(email) ? email : null;
}

export function buildFreeResourceDownloadHref(
  href: string,
  context: FreeResourceDownloadAttributionContext,
): string {
  let url: URL;
  const isRelative = href.startsWith('/');
  try {
    url = new URL(href, 'https://www.aibankinginstitute.com');
  } catch {
    return href;
  }

  const entries: ReadonlyArray<readonly [keyof FreeResourceDownloadAttributionContext, string, number]> = [
    ['source', DOWNLOAD_ATTRIBUTION_PARAMS.source, 64],
    ['role', DOWNLOAD_ATTRIBUTION_PARAMS.role, 64],
    ['tier', DOWNLOAD_ATTRIBUTION_PARAMS.tier, 64],
    ['tierLabel', DOWNLOAD_ATTRIBUTION_PARAMS.tierLabel, 80],
    ['topGap', DOWNLOAD_ATTRIBUTION_PARAMS.topGap, 128],
  ];

  let added = false;
  for (const [key, param, maxLength] of entries) {
    const value = normalizeAttributionValue(context[key], maxLength);
    if (value) {
      url.searchParams.set(param, value);
      added = true;
    }
  }

  if (!added) return href;
  if (isRelative) return `${url.pathname}${url.search}${url.hash}`;
  return url.toString();
}

export function rememberFreeResourceCapture(
  context: Omit<FreeResourceCaptureContext, 'capturedAt'> & { readonly capturedAt?: string },
): void {
  if (typeof window === 'undefined') return;
  const email = normalizeCaptureEmail(context.email);
  if (!email) return;

  const stored: FreeResourceCaptureContext = {
    ...context,
    email,
    capturedAt: context.capturedAt ?? new Date().toISOString(),
  };

  try {
    window.sessionStorage.setItem(FREE_RESOURCE_UNLOCK_KEY, '1');
    window.sessionStorage.setItem(FREE_RESOURCE_EMAIL_KEY, email);
    window.sessionStorage.setItem(FREE_RESOURCE_CONTEXT_KEY, JSON.stringify(stored));
  } catch {
    // Private-mode/sessionStorage failures should not block the download path.
  }
}

export function readRememberedFreeResourceCapture(): FreeResourceCaptureContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const unlocked = window.sessionStorage.getItem(FREE_RESOURCE_UNLOCK_KEY) === '1';
    const email = normalizeCaptureEmail(window.sessionStorage.getItem(FREE_RESOURCE_EMAIL_KEY));
    if (!unlocked || !email) return null;

    const raw = window.sessionStorage.getItem(FREE_RESOURCE_CONTEXT_KEY);
    if (!raw) {
      return { email, source: 'unknown', capturedAt: new Date(0).toISOString() };
    }

    const parsed = JSON.parse(raw) as Partial<FreeResourceCaptureContext>;
    return {
      email,
      source: typeof parsed.source === 'string' && parsed.source ? parsed.source : 'unknown',
      ...(typeof parsed.role === 'string' ? { role: parsed.role } : {}),
      ...(typeof parsed.tier === 'string' ? { tier: parsed.tier } : {}),
      ...(typeof parsed.tierLabel === 'string' ? { tierLabel: parsed.tierLabel } : {}),
      ...(typeof parsed.topGap === 'string' ? { topGap: parsed.topGap } : {}),
      capturedAt:
        typeof parsed.capturedAt === 'string' && parsed.capturedAt
          ? parsed.capturedAt
          : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}
