// Role-aware framing for the In-Depth Briefing (#97).
//
// Same readiness score, same weakest dimension — but a compliance leader
// reads it differently from an operator. This module maps (role × dimension)
// to a single sentence of role-aware framing that the renderer drops into
// the diagnosis narrative.
//
// The framings deliberately don't repeat the gap content from
// GAP_CONTENT (in personalization.ts). They translate the same gap into
// the language of the role's seat: a compliance leader sees risk; an
// operator sees process; an executive sees consequence; etc.
//
// Returns null for (role, dimension) pairs where the default narrative
// already works. Not every cell has to differ — the renderer falls back
// gracefully.

import type { Role } from './role';
import type { Dimension } from './types';

export type RoleFraming = Partial<Record<Dimension, string>>;

export const ROLE_FRAMING: Record<Role, RoleFraming> = {
  operator: {
    'current-ai-usage':
      "From your seat, the gap shows up as the same five-step process repeating ten times a week. AI's job here is to collapse the routine to one step.",
    'quick-win-potential':
      "You already know which workflow is the heaviest. The In-Depth result confirms it. Start there.",
    'training-infrastructure':
      "Operations is where training has to live to stick — at the desk, in the workflow, not in a calendar invite.",
    'experimentation-culture':
      "Operations sees the wins first; the gap is that no one carries them out of your team.",
  },
  'compliance-risk': {
    'security-posture':
      "An examiner won't ask whether your staff are smart about AI. They'll ask whether you can show them the policy. That document is what this gap costs you.",
    'leadership-buy-in':
      "Compliance moves at the speed of executive air cover. Without it, the safe answer keeps being 'no.'",
    'ai-literacy-level':
      "Two failure modes you can already see in your queue: staff afraid to use AI at all, and staff pasting PII into ChatGPT. The training infrastructure is what separates them.",
    'current-ai-usage':
      "Workflows you don't know about are workflows you can't supervise. That visibility gap is the audit finding waiting to happen.",
  },
  'training-hr': {
    'training-infrastructure':
      'This is your home turf. The In-Depth confirms what you already suspect: kickoffs do not compound; cadence does.',
    'ai-literacy-level':
      "You're being asked to train a workforce on a tool that didn't exist five years ago. The Foundation curriculum gives you a defensible starting point.",
    'builder-potential':
      "L&D's leverage is finding the staff who can teach what they learn. The Foundation path graduates one of those per cohort.",
    'experimentation-culture':
      'Cadence + a shared library is what turns one-off learning events into a curriculum.',
  },
  executive: {
    'leadership-buy-in':
      "You are the air cover. The gap your team is registering is the absence of a clear signal from you that AI is on the bank's strategic map.",
    'quick-win-potential':
      "The board asks 'what did AI do for us this quarter?' That question has a one-paragraph answer or it does not. The first workflow is what makes the answer possible.",
    'security-posture':
      "Two artifacts matter to the next examiner conversation: the AI use policy and the AI workflow inventory. Both are achievable in 30 days.",
    'current-ai-usage':
      'The institutions pulling ahead aren\'t the ones with more tools. They\'re the ones with named workflows. That is the lever from your seat.',
  },
  lending: {
    'quick-win-potential':
      "Lending workflows — credit memo drafts, condition checklists, denial letter language — are among the highest-leverage AI use cases in community banking. The In-Depth result names which one is closest at hand.",
    'security-posture':
      'NPI is the constraint that shapes every lending AI decision. The policy gap is how staff know what they can and cannot paste.',
    'current-ai-usage':
      'Loan staff already adopt productivity tools the fastest — they just need someone to bless the workflow.',
  },
  marketing: {
    'experimentation-culture':
      'Marketing teams already experiment freely. The gap is converting that velocity into a library every member-service team can pull from.',
    'current-ai-usage':
      'Member-service teams will adopt AI fastest in the script-and-template workflows. That is where to start.',
    'leadership-buy-in':
      'Marketing wins are the easiest to show in a board deck. The buy-in gap closes faster from your seat than from anywhere else in the institution.',
  },
  it: {
    'security-posture':
      'You vet the tools. The posture gap is the policy doc that lets the rest of the institution use what you have approved.',
    'builder-potential':
      "IT is often the only function with the building muscle today. The Foundation curriculum graduates non-IT staff into the same muscle so it isn't all on you.",
    'training-infrastructure':
      "Sustainable AI capability isn't an IT project. The training infrastructure gap is the difference between a pilot and a program.",
  },
  other: {
    // No specialized framings — falls through to the default narrative.
    // Intentional: 'other' covers board members, vendors, consultants, etc.;
    // they should see the general institutional framing, not a role-specific
    // angle that may not match their seat.
  },
};

export function getRoleFraming(role: Role, dimension: Dimension): string | null {
  return ROLE_FRAMING[role][dimension] ?? null;
}
