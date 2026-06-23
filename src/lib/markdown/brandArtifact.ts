// Wraps a generated markdown artifact with the same masthead + footer the
// static skill-template files carry (public/artifacts/skill-templates/*.md), so
// every downloadable .md is attributed to The AI Banking Institute rather than
// shipping as anonymous text. Used by the dynamic artifact routes whose
// templates don't embed attribution themselves.

const MASTHEAD =
  '> **The AI Banking Institute** · AiBI-Foundation Artifact\n' +
  '> AIBankingInstitute.com\n\n';

const FOOTER =
  '\n\n---\n\n' +
  '_© 2026 The AI Banking Institute · AIBankingInstitute.com_\n' +
  '_For internal use at your institution. Turning Bankers into Builders._\n';

/**
 * Prepend the AiBI masthead and append the attribution footer to a markdown
 * body. Idempotent-safe to call once per generated artifact; the body's own
 * leading "# Title" is preserved beneath the masthead, matching the static
 * skill-template convention.
 */
export function brandMarkdownArtifact(body: string): string {
  return `${MASTHEAD}${body.trim()}${FOOTER}`;
}
