'use client';

import { useEffect, useState } from 'react';

interface TierPreviewProps {
  readonly tierLabel: string;
  readonly tierColorVar: string;
}

// Pre-email reveal: shows tier label only, not the score number.
// Creates a small dopamine hit ("Building Momentum!") while the number
// and dimension breakdown stay gated behind email capture.
export function TierPreview({ tierLabel, tierColorVar }: TierPreviewProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex flex-col items-center text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/60">
        Your tier
      </p>
      <p
        className="font-serif text-5xl md:text-7xl mt-4 leading-none transition-all duration-700 ease-out"
        style={{
          color: tierColorVar,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        {tierLabel}
      </p>
      <p className="font-sans text-base md:text-lg text-[color:var(--color-ink)]/70 mt-6 max-w-md">
        Your exact score, an 8-dimension breakdown, and what this means for the
        next 90 days are below &mdash; just enter your email.
      </p>
    </div>
  );
}
