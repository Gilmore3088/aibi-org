/* Inline stroke icons for /resources. Matches the project's no-dependency
 * SVG convention (see src/app/playbooks/page.tsx). */

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (p: IconProps) => ({
  className: p.className,
  width: p.size ?? 24,
  height: p.size ?? 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export const ArrowRight = (p: IconProps) => (
  <svg {...base(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);
export const ShieldCheck = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
);
export const Users = (p: IconProps) => (
  <svg {...base(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const Megaphone = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 11v3a3 3 0 0 0 3 3h2l5 4V4L8 8H6a3 3 0 0 0-3 3z" /></svg>
);
export const FileText = (p: IconProps) => (
  <svg {...base(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></svg>
);
export const Target = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);
export const LockKeyhole = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><circle cx="12" cy="16" r="1" /></svg>
);
export const ClipboardCheck = (p: IconProps) => (
  <svg {...base(p)}><rect x="8" y="3" width="8" height="4" rx="1" /><path d="M9 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3" /><polyline points="9 14 11 16 15 12" /></svg>
);
export const BookOpen = (p: IconProps) => (
  <svg {...base(p)}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
);
export const Workflow = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /><path d="M7 11v2a2 2 0 0 0 2 2h4" /></svg>
);
export const BarChart3 = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 3v18h18" /><path d="M7 16V9" /><path d="M12 16V5" /><path d="M17 16v-4" /></svg>
);
export const Eye = (p: IconProps) => (
  <svg {...base(p)}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const BadgeCheck = (p: IconProps) => (
  <svg {...base(p)}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z" /><polyline points="9 12 11 14 15 10" /></svg>
);
export const Sparkles = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M19 16l.75 2.25L22 19l-2.25.75L19 22l-.75-2.25L16 19l2.25-.75z" /></svg>
);
export const CheckCircle = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>
);
export const Download = (p: IconProps) => (
  <svg {...base(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
export const Layers = (p: IconProps) => (
  <svg {...base(p)}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
);
export const Library = (p: IconProps) => (
  <svg {...base(p)}><path d="M16 6H4v15" /><path d="M20 21V3h-4v18" /><path d="M8 6v15" /><path d="M12 6v15" /></svg>
);
