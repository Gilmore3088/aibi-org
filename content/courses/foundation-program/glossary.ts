// Glossary — plain-English asides for jargon that appears in lesson
// body_md. Surfaced inline via the [[Gloss:term]] marker in markdown
// + the <Gloss> component rendered by LessonBody/renderInline.
//
// Branch Mgr Devon (2026-05-24) flagged that SR 11-7, MNPI, OCC, Reg E,
// ECOA/Reg B all appear in lesson bodies without definition. A six-week
// MSR glazes over jargon they have never heard. The aside renders the
// term inline with a subtle underline and a <details> popover containing
// the plain-English gloss. The technical term stays in the text so a
// learner can search for the formal name later.
//
// Missing entries render the term plain — no crash. Add new entries
// alphabetically.

export const glossary: Readonly<Record<string, string>> = {
  'ECOA / Reg B':
    "the Equal Credit Opportunity Act and its implementing rule — the federal fair-lending requirements that apply to every credit decision a bank makes.",
  'MNPI':
    "material non-public information — facts whose disclosure could move markets, harm members, or pre-empt a regulator. M&A talks, pending product launches, an exam matter under negotiation all qualify.",
  'OCC':
    "the Office of the Comptroller of the Currency — the federal regulator for national banks and federal savings associations.",
  'Reg E':
    "the Federal Reserve's electronic-funds-transfer rule — covers debit cards, ACH, ATM, mobile payments, error-resolution timing.",
  'SR 11-7':
    "the Federal Reserve's model risk management guidance — the rulebook for how banks identify, validate, monitor, and govern any model (including AI/LLM outputs) used in business decisions.",
};

/**
 * Returns the plain-English gloss for a term, or null if not in the
 * glossary. Term lookup is case-insensitive and whitespace-trimmed.
 */
export function lookupGloss(term: string): string | null {
  const normalized = term.trim();
  if (glossary[normalized]) return glossary[normalized];
  // Fallback: case-insensitive match.
  const lower = normalized.toLowerCase();
  for (const [k, v] of Object.entries(glossary)) {
    if (k.toLowerCase() === lower) return v;
  }
  return null;
}
