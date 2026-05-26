import type { ReactNode, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  surface?: 'white' | 'cream';
  /** Adds the feature-level drop shadow used on interactive/hero cards. */
  elevated?: boolean;
  children: ReactNode;
}

export function Card({
  surface = 'white',
  elevated = false,
  className,
  children,
  ...rest
}: CardProps) {
  const cls = [
    surface === 'white' ? 'mk-card-white' : 'mk-card-cream',
    elevated && 'mk-card-shadow',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

export interface InfoBoxProps {
  /** Top label (small slate text). */
  label: ReactNode;
  /** Bold value below the label. */
  value: ReactNode;
  /** Outlined variant (transparent + hairline border) instead of cream fill. */
  variant?: 'solid' | 'line';
  className?: string;
}

export function InfoBox({ label, value, variant = 'solid', className }: InfoBoxProps) {
  const cls = [
    'mk-infobox',
    variant === 'line' && 'mk-line',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls}>
      <div className="mk-k">{label}</div>
      <div className="mk-v">{value}</div>
    </div>
  );
}

export interface IconBadgeProps {
  /** Visual variant — ink background with gold icon, or gold background with ink icon. */
  variant?: 'ink' | 'gold';
  children: ReactNode;
  className?: string;
}

export function IconBadge({ variant = 'ink', children, className }: IconBadgeProps) {
  const cls = [
    variant === 'ink' ? 'mk-icon-ink' : 'mk-icon-gold',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <span className={cls}>{children}</span>;
}
