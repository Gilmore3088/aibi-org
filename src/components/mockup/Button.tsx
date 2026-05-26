import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import Link from 'next/link';

type Variant = 'gold' | 'ink' | 'ghost-dark' | 'ghost-light';
type Size = 'md' | 'lg';

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type AsLink = Common & {
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>;

type AsButton = Common & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export type ButtonProps = AsLink | AsButton;

const variantClass: Record<Variant, string> = {
  gold: 'mk-btn-gold',
  ink: 'mk-btn-ink',
  'ghost-dark': 'mk-btn-ghost-dark',
  'ghost-light': 'mk-btn-ghost-light',
};

function buildClass({
  variant = 'ink',
  size = 'md',
  className,
}: Pick<Common, 'variant' | 'size' | 'className'>) {
  return [
    'mk-btn',
    variantClass[variant],
    size === 'lg' && 'mk-btn-lg',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Button(props: ButtonProps) {
  const { variant, size, className, children } = props;
  const cls = buildClass({ variant, size, className });

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    const external =
      /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
    if (external) {
      return (
        <a className={cls} href={href} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link
        className={cls}
        href={href}
        {...(rest as Omit<React.ComponentProps<typeof Link>, 'href' | 'className'>)}
      >
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* Right-arrow glyph used inside CTAs throughout the mockup. */
export function ArrowGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="mk-ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
