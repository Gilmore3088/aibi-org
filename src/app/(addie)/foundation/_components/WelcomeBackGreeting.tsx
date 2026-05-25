'use client';

// WelcomeBackGreeting — Vera G2 (2026-05-25). If the visitor captured an
// email at the assessment gate (within the assessment-storage 24h TTL),
// greet them by first name on /foundation. Five lines of code; large
// emotional payoff per the 2026-05-24 e2e flow audit ("system captures
// name at email gate, immediately forgets it on /foundation").
//
// Hydrates client-side from localStorage. Renders nothing if no name is
// stored or if the TTL has expired — server-rendered fallback handles
// that path.

import { useEffect, useState } from 'react';
import { loadAssessment } from '@/app/assessment/_lib/assessment-storage';

export function WelcomeBackGreeting() {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const name = loadAssessment<string>('aibi-learner-first-name');
    if (name && typeof name === 'string' && name.trim().length > 0) {
      setFirstName(name.trim());
    }
  }, []);

  if (!firstName) return null;

  return (
    <p
      className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] mb-4"
      role="status"
      aria-live="polite"
    >
      Welcome back, {firstName}.
    </p>
  );
}
