// /foundation/gate — the three-way fork after Module 3.
// PRD §6.4 — shown when the learner finishes M3 (link from the M3 end-card)
// or follows the upgrade link from a capped Toolbox.

import type { Metadata } from 'next';
import { GateScreen } from '@/components/addie/gate/GateScreen';

export const metadata: Metadata = {
  title: 'Choose your path · Foundation Course',
  description: 'Continue to Module 4 + 5, keep what you built, or take the Readiness Assessment.',
};

export default function GatePage() {
  return <GateScreen />;
}
