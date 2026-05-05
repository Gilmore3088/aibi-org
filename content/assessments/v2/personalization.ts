// Dynamic Assessment Results — Phase 1 personalization data.
// Spec: docs/superpowers/specs/2026-05-04-dynamic-assessment-results.md
//
// Three lookups:
//   1. tier → persona label (the User Profile Object's `persona`)
//   2. dimension → recommendation (one fastest-ROI move per gap)
//   3. tier → gap-aware insight bullet templates
//
// All copy is template-based (Option A from the spec). Phase 3 swaps
// these for LLM-generated content per assessment.

import type { Tier } from './scoring';
import type { Dimension } from './types';

export interface Persona {
  readonly id: Tier['id'];
  readonly label: string;
  readonly oneLine: string;
}

export const PERSONAS: Record<Tier['id'], Persona> = {
  'starting-point': {
    id: 'starting-point',
    label: 'Unstructured Explorer',
    oneLine:
      'Staff are curious but unguarded. There is no playbook, no policy, and no shared workflow yet.',
  },
  'early-stage': {
    id: 'early-stage',
    label: 'Coordinated Experimenter',
    oneLine:
      'Pockets of activity exist but they are not coordinated. Wins stay trapped inside individual teams.',
  },
  'building-momentum': {
    id: 'building-momentum',
    label: 'Program Builder',
    oneLine:
      'AI is in production across multiple teams. The next move is documented outcomes that compound.',
  },
  'ready-to-scale': {
    id: 'ready-to-scale',
    label: 'Capability Leader',
    oneLine:
      'AI is operating as a strategic capability. The opportunity now is institution-wide replication.',
  },
};

// One fastest-ROI recommendation per dimension. The bottom-ranked dimension
// drives which recommendation surfaces. Copy is intentionally specific to
// community-bank workflows.
export interface Recommendation {
  readonly title: string;
  readonly riskLevel: 'Low' | 'Moderate' | 'Higher';
  readonly timeSaved: string;
  readonly owner: string;
  readonly explanation: string;
}

export const RECOMMENDATIONS: Record<Dimension, Recommendation> = {
  'current-ai-usage': {
    title: 'Standardize meeting summaries',
    riskLevel: 'Low',
    timeSaved: '~60 min per meeting',
    owner: 'Ops / Admin',
    explanation:
      'Pick one recurring meeting. Use a shared prompt to turn the recording or transcript into action items, owners, and dates. Same prompt every week, same review step every week.',
  },
  'experimentation-culture': {
    title: 'Run a 30-minute "show your prompt" lunch',
    riskLevel: 'Low',
    timeSaved: '~3 hours/week recovered across the team',
    owner: 'Department lead',
    explanation:
      'Three staff members each share one prompt that saved them time this month, plus the review step they use. Document what worked. Repeat monthly. This is how isolated experiments become institutional knowledge.',
  },
  'ai-literacy-level': {
    title: 'Run AiBI-P Module 01 with one team',
    riskLevel: 'Low',
    timeSaved: 'Compounding — pays back across every later workflow',
    owner: 'Department lead + L&D',
    explanation:
      'Five-to-seven minute reps on safe prompting basics. The team that goes through it together stops asking the AI policy team theoretical questions and starts asking workflow questions instead.',
  },
  'quick-win-potential': {
    title: 'Rewrite a messy internal email',
    riskLevel: 'Low',
    timeSaved: '~15 min per email · pays back the same morning',
    owner: 'Front-line manager',
    explanation:
      'Pick the kind of email your team rewrites three times a week — a policy reminder, a status update, a meeting recap. Use a single prompt with a documented review step. The first rep takes ten minutes; the tenth takes one.',
  },
  'leadership-buy-in': {
    title: 'Present one ROI estimate to leadership',
    riskLevel: 'Low',
    timeSaved: 'Unlocks budget for the next move',
    owner: 'AI lead + finance',
    explanation:
      'Use the conservative ROI model from this assessment with your real staff numbers. Present one slide: hours recovered, dollars equivalent, where the time went. Leadership commits to programs that have a number attached.',
  },
  'security-posture': {
    title: 'Document one approved AI workflow end-to-end',
    riskLevel: 'Low',
    timeSaved: 'Removes the SR 11-7 question your examiner is going to ask',
    owner: 'Compliance + Ops',
    explanation:
      'One workflow, written down: which tool, what data goes in, what review happens, who signs off. This is the artifact your examiner wants to see, and the artifact your team needs to scale safely. Start with the workflow you already trust.',
  },
  'training-infrastructure': {
    title: 'Pilot a 12-week practice cadence with one cohort',
    riskLevel: 'Low',
    timeSaved: 'Persistent — outlasts the staff turnover that kills one-off training',
    owner: 'L&D + Department lead',
    explanation:
      'Five-to-seven minute reps, weekly, in a shared space. The training infrastructure problem is not "who teaches" — it is "where does practice live after the kickoff session?" Make the cadence the answer.',
  },
  'builder-potential': {
    title: 'Identify your first internal builder',
    riskLevel: 'Low',
    timeSaved: 'Capability multiplier — one builder unlocks ten workflows',
    owner: 'AI lead',
    explanation:
      'Look for the analyst or operations person who already automates spreadsheets without being asked. Give them one workflow and one prompt system. Builders convert tools into capability faster than committees do.',
  },
};

// Tier-specific insight bullets that surface what the score "means" in
// concrete terms. Three bullets per tier — keep terse, scannable.
export const TIER_INSIGHTS: Record<Tier['id'], readonly string[]> = {
  'starting-point': [
    'Staff are likely experimenting through public AI tools without guardrails',
    'No formal training, governance, or shared prompt patterns yet',
    'AI usage is producing inconsistent or invisible time savings',
  ],
  'early-stage': [
    'Early adopters exist on individual teams but their wins are not shared',
    'A written use policy exists in some form, but it has not become workflow',
    'Leadership is aware AI matters; nobody owns the program yet',
  ],
  'building-momentum': [
    'Multiple teams use AI tools with documented (if uneven) review processes',
    'Governance exists; the audit-readiness question is mostly answered',
    'The next bottleneck is measuring outcomes rigorously enough to defend the program',
  ],
  'ready-to-scale': [
    'AI is integrated into daily workflows across departments',
    'Governance, training, and review are operating as a coordinated program',
    'The advantage now compounds — codifying what works pays back across every new hire',
  ],
};

// Decide which post-results CTA to surface based on the takedown state.
// During COMING_SOON we route everyone into the waitlist with the right
// interest pre-selected. Once the takedown is lifted, we route to the
// real product surface.
export function getRecommendedAction(
  tierId: Tier['id'],
  comingSoonMode: boolean,
): {
  readonly title: string;
  readonly description: string;
  readonly cta: string;
  readonly href: string;
} {
  const isFoundational = tierId === 'starting-point' || tierId === 'early-stage';

  if (isFoundational) {
    return {
      title: 'Start with AiBI-P Practitioner training.',
      description:
        'Twelve self-paced modules. Five-to-seven minute reps. Real workflows your team can apply Monday morning, with the review processes your compliance team can sign off on.',
      cta: comingSoonMode ? 'Reserve your seat in the first cohort' : 'Start practitioner training',
      href: comingSoonMode ? '/coming-soon?interest=course' : '/courses/aibi-p',
    };
  }

  return {
    title: 'Talk to us about scaling this institution-wide.',
    description:
      'Your tier is unusual. Most institutions at this stage benefit from a tailored conversation about codifying what is already working — cohort cadence, leadership advisory, and measurable replication across teams.',
    cta: comingSoonMode ? 'Get on the advisory list' : 'Book an Executive Briefing',
    href: comingSoonMode ? '/coming-soon?interest=consulting' : '/for-institutions/advisory',
  };
}
