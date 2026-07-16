// Canonical HTML-escaping for user-controlled values interpolated into
// server-built HTML (transactional emails, PDF/Word HTML). Consolidates the
// copies previously defined in resend templates, PDF builders, and Word
// routes. Escapes the five HTML-significant characters, including the
// apostrophe (safe in both element and attribute contexts).

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
