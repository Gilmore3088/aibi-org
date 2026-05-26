import type { ReactNode } from 'react';

export interface EyebrowChipProps {
  /** Optional leading icon (typically a 16×16 stroke SVG). */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Gold-tinted pill chip used as an eyebrow on dark hero sections. Same
 * pattern across mockup.html, assessment.html, results.html.
 */
export function EyebrowChip({ icon, children, className }: EyebrowChipProps) {
  return (
    <div className={`mk-eyebrow${className ? ` ${className}` : ''}`}>
      {icon}
      {children}
    </div>
  );
}
