// Clean layout for the AiBI-S prototype — no cohort sidebar, includes a cross-course nav strip.
// Mirrors the AiBI brand but is intentionally minimal; only used for the self-paced prototype.

import type { ReactNode } from 'react';
import Link from 'next/link';

interface PreviewLayoutProps {
  readonly children: ReactNode;
}

export default function AiBISPreviewLayout({ children }: PreviewLayoutProps) {
  return (
    <div className="min-h-screen bg-[color:var(--color-linen)]">
      <nav className="border-b border-[color:var(--color-ink)]/10 bg-white">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/aibi-s-preview" className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-cobalt)]">
            AiBI-S · Prototype
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/courses/aibi-p" className="text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-ink)]">
              → AiBI-P
            </Link>
            <Link href="/courses/aibi-s" className="text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-ink)]">
              → AiBI-S cohort landing
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
