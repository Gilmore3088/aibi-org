import type { ReactNode, HTMLAttributes } from 'react';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Override the `.mk-std` default vertical padding. */
  variant?: 'std' | 'tight' | 'none';
  /** Render the inner `.mk-container`. Defaults to true. */
  contained?: boolean;
  /** Optional surface variant — dark navy or white. */
  surface?: 'cream' | 'white' | 'ink';
  children: ReactNode;
}

const surfaceStyle: Record<NonNullable<SectionProps['surface']>, React.CSSProperties> = {
  cream: {},
  white: { background: '#fff' },
  ink: { background: 'var(--ink)', color: '#fff' },
};

export function Section({
  variant = 'std',
  contained = true,
  surface = 'cream',
  className,
  style,
  children,
  ...rest
}: SectionProps) {
  const cls = [
    variant === 'std' && 'mk-std',
    variant === 'tight' && 'mk-std mk-std-tight',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const sectionStyle = { ...surfaceStyle[surface], ...style };

  return (
    <section className={cls} style={sectionStyle} {...rest}>
      {contained ? <div className="mk-container">{children}</div> : children}
    </section>
  );
}

export interface SectionHeadProps {
  /** Kicker — small caps label above the heading. */
  kicker?: string;
  /** The main heading (h2). */
  heading: ReactNode;
  /** Optional lede paragraph below the heading. */
  lede?: ReactNode;
  className?: string;
}

export function SectionHead({ kicker, heading, lede, className }: SectionHeadProps) {
  return (
    <div className={`mk-section-head${className ? ` ${className}` : ''}`}>
      {kicker && <div className="k">{kicker}</div>}
      <h2>{heading}</h2>
      {lede && <p>{lede}</p>}
    </div>
  );
}
