import type { ReactNode } from 'react';

// ax- primitives: the shared AI-native building blocks for rebuilt pages.
// Styles live in src/styles/system.css. Every page built from these reads
// as one system — dark dot-grid surface, a command-line hero, hairline
// windows — instead of a run of colour-filled cards.

export { CopyPrompt } from './CopyPrompt';

export interface AxHeroProps {
  /** The command line above the headline, without the leading "> ". */
  readonly cmd: string;
  readonly title: ReactNode;
  readonly lede?: ReactNode;
  readonly actions?: ReactNode;
  /** Optional right-hand column (a window, a session, a document). */
  readonly aside?: ReactNode;
}

export function AxHero({ cmd, title, lede, actions, aside }: AxHeroProps) {
  return (
    <section className="ax-hero">
      <div className={`mk-container${aside ? ' ax-hero-split' : ''}`}>
        <div>
          <p className="ax-cmd">{cmd}</p>
          <h1 className="ax-display">{title}</h1>
          {lede && <p className="ax-lede">{lede}</p>}
          {actions && <div className="ax-actions">{actions}</div>}
        </div>
        {aside}
      </div>
    </section>
  );
}

export interface AxSectionProps {
  readonly id?: string;
  readonly kicker?: string;
  readonly title?: ReactNode;
  readonly lede?: ReactNode;
  readonly children: ReactNode;
  /** A warm cream band instead of navy — alternate so cards never sit navy on navy. */
  readonly light?: boolean;
}

export function AxSection({ id, kicker, title, lede, children, light }: AxSectionProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      className={`ax-section${light ? ' ax-light' : ''}`}
      aria-labelledby={title ? headingId : undefined}
    >
      <div className="mk-container">
        {(kicker || title || lede) && (
          <div className="ax-section-head">
            {kicker && <p className="ax-k">{kicker}</p>}
            {title && (
              <h2 id={headingId} className="ax-display">
                {title}
              </h2>
            )}
            {lede && <p>{lede}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export interface AxWindowProps {
  /** Left side of the title bar — usually a filename or tool name. */
  readonly title: ReactNode;
  /** Right side of the title bar — metadata. */
  readonly meta?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
  /** Render children without the default body padding. */
  readonly flush?: boolean;
}

export function AxWindow({ title, meta, children, className, flush }: AxWindowProps) {
  return (
    <div className={`ax-window${className ? ` ${className}` : ''}`}>
      <div className="ax-window-bar">
        <span>{title}</span>
        {meta && <span>{meta}</span>}
      </div>
      {flush ? children : <div className="ax-window-body">{children}</div>}
    </div>
  );
}
