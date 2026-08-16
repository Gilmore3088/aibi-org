export function redactEmail(email: string): string {
  const separator = email.lastIndexOf('@');
  if (separator <= 0 || separator === email.length - 1) {
    return '[redacted-email]';
  }

  const local = email.slice(0, separator);
  const domain = email.slice(separator + 1);
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}
