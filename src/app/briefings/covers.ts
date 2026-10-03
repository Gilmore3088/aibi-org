// Card covers for the briefings index. Each figure and caption is lifted
// verbatim from the piece's own dek (covers.test.ts enforces it), so a cover
// never introduces a number the article does not already carry. Pieces
// without an entry get a source-stamp cover instead.

export interface CoverFigure {
  /** The large figure, verbatim from the dek. */
  readonly figure: string;
  /** A short phrase, verbatim from the dek. */
  readonly caption: string;
}

export const COVER_FIGURES: Readonly<Record<string, CoverFigure>> = {
  'ai-governance-without-the-jargon': { figure: 'Five', caption: 'regulatory frameworks' },
  'six-ways-ai-fails-in-banking': { figure: 'Six', caption: 'patterns surface specifically in banking' },
  'the-skill-not-the-prompt': { figure: 'Skill', caption: 'a persistent, repeatable, institution-grade instruction' },
  'what-your-efficiency-ratio-is-hiding': { figure: '~65%', caption: 'efficiency' },
  'members-will-switch': { figure: '84%', caption: 'would switch FIs for AI-driven financial insights' },
  'the-widening-ai-gap': { figure: 'Top-25', caption: 'banks moved from "AI exploration" to "AI deployment"' },
};

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
