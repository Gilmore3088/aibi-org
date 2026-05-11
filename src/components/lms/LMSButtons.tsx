'use client';

import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, type CSSProperties, useState } from 'react';

type ButtonOrAnchorProps =
  | ({ as?: 'button' } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ as: 'a' } & AnchorHTMLAttributes<HTMLAnchorElement>);

type ExtraProps = { children: React.ReactNode; style?: CSSProperties };

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: 'var(--ledger-mono)',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 600,
  padding: '12px 20px',
  borderRadius: 2,
  cursor: 'pointer',
  transition: 'background .18s ease, border-color .18s ease, color .18s ease',
  textDecoration: 'none',
  border: 'none',
};

export function PrimaryButton(props: ButtonOrAnchorProps & ExtraProps) {
  const [hovered, setHovered] = useState(false);
  const { as, children, style, ...rest } = props as ButtonOrAnchorProps & ExtraProps & { as?: 'button' | 'a' };
  const merged: CSSProperties = {
    ...baseStyle,
    background: hovered ? 'var(--ledger-accent)' : 'var(--ledger-ink)',
    color: 'var(--ledger-paper)',
    ...style,
  };
  if (as === 'a') {
    return (
      <a
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        style={merged}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      style={merged}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

export function GhostButton(props: ButtonOrAnchorProps & ExtraProps) {
  const [hovered, setHovered] = useState(false);
  const { as, children, style, ...rest } = props as ButtonOrAnchorProps & ExtraProps & { as?: 'button' | 'a' };
  const merged: CSSProperties = {
    ...baseStyle,
    background: 'transparent',
    color: hovered ? 'var(--ledger-accent)' : 'var(--ledger-ink)',
    border: `1px solid ${hovered ? 'var(--ledger-accent)' : 'var(--ledger-rule-strong)'}`,
    padding: '12px 18px',
    ...style,
  };
  if (as === 'a') {
    return (
      <a
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        style={merged}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      style={merged}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}
