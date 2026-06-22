export const DEFAULT_SUPPORT_INBOX_EMAIL = 'hello@aibankinginstitute.com';

export function parseAdminSupportEmails(value: string | undefined | null): string[] {
  return Array.from(
    new Set(
      (value ?? '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export function getConfiguredSupportAdminEmails(): string[] {
  return parseAdminSupportEmails(process.env.ADMIN_SUPPORT_EMAILS);
}

export function isSupportAdminEmail(
  email: string | null | undefined,
  allowlist = getConfiguredSupportAdminEmails(),
): boolean {
  if (!email) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

export function getSupportInboxEmail(): string {
  return (process.env.SUPPORT_INBOX_EMAIL ?? DEFAULT_SUPPORT_INBOX_EMAIL).trim();
}
