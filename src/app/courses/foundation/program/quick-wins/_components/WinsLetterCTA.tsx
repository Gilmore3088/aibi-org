'use client';

import { LetterTemplatePreview } from '../_local/LetterTemplatePreview';
import { toolLabel, quarterlyHours, type QuickWin } from '../../_lib/quickWinsData';

interface WinsLetterCTAProps {
  readonly wins: QuickWin[];
  readonly winsForLetter: number;
  readonly totalQuarterlyHours: number;
}

export function WinsLetterCTA({ wins, winsForLetter, totalQuarterlyHours }: WinsLetterCTAProps) {
  return (
    <LetterTemplatePreview
      wins={wins.map((w) => ({
        description: w.description,
        toolLabel: toolLabel(w.tool),
        department: w.department,
        quarterlyHours: quarterlyHours(w),
      }))}
      winsForLetter={winsForLetter}
      totalQuarterlyHours={totalQuarterlyHours}
    />
  );
}
