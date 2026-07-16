import { INK, GOLD } from '@/lib/brand/colors';

export const PAPER = '#FFFCF6';
export const GOLD_SOFT = '#E6D39B';
export const SLATE = '#637083';
export const SLATE_500 = '#64748B';
export const LINE = 'rgba(7,26,47,.12)';

export const pageStyle: React.CSSProperties = {
  background: PAPER,
  border: `1px solid ${LINE}`,
  borderRadius: 30,
  boxShadow: '0 12px 36px rgba(7,26,47,.10)',
  overflow: 'hidden',
  marginBottom: 22,
};
export const sectionPad: React.CSSProperties = { padding: 30 };

export const btnBase: React.CSSProperties = {
  borderRadius: 14,
  padding: '13px 16px',
  fontWeight: 900,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
  fontSize: '0.875rem',
};
export const btnPrimary: React.CSSProperties = { ...btnBase, background: GOLD, color: INK };
export const btnDark: React.CSSProperties = { ...btnBase, background: INK, color: 'white' };
export const btnOutline: React.CSSProperties = {
  ...btnBase,
  background: 'white',
  border: `1px solid ${LINE}`,
  color: INK,
};
