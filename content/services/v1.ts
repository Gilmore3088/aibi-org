// Services — engagement tiers, shared between /services and homepage.
// Source: Plans/aibi-foundation-v3.html + feedback-v1-aibi-landing-page-prd.docx

export interface ServiceTier {
  readonly id: 'quick-win' | 'audit' | 'transformation';
  readonly name: string;
  readonly phaseLabel: string;
  readonly tagline: string;
  readonly priceRange: string;
  readonly duration: string;
  readonly summary: string;
  readonly included: readonly string[];
  readonly accent: string;
}

export const serviceTiers: readonly ServiceTier[] = [
  {
    id: 'quick-win',
    name: 'Operational Quick Win Sprint',
    phaseLabel: 'Phase I · Prove It',
    tagline: 'The fastest path to proof.',
    priceRange: '$5,000 – $15,000',
    duration: '4–6 weeks',
    summary:
      'We identify your three highest-value automation opportunities, implement them, and deliver a documented before/after impact report — hours recaptured, NIE reduced, efficiency ratio impact quantified.',
    included: [
      '3 implemented automations',
      'Documented ROI report plus a "What We Didn\'t Do" page',
      '90-day ROI guarantee',
    ],
    accent: 'var(--color-terra)',
  },
  {
    id: 'audit',
    name: 'Efficiency & Process Audit',
    phaseLabel: 'Phase II · Map It',
    tagline: 'The full picture. Board-ready.',
    priceRange: '$25,000 – $60,000',
    duration: '6–10 weeks',
    summary:
      'Full cross-departmental assessment. Every manual workflow quantified by dollar value. Prioritized automation roadmap with NIE reduction attached to each line item.',
    included: [
      'All departments assessed',
      'Efficiency ratio model built for your institution',
      'Board presentation included',
    ],
    accent: 'var(--color-cobalt)',
  },
  {
    id: 'transformation',
    name: 'AI Transformation + AiBI fCAIO',
    phaseLabel: 'Phase III · Install It',
    tagline: 'A monthly operating system for AI.',
    priceRange: '$75,000 – $150,000+',
    duration: 'Monthly engagements, typically 6–12 months',
    summary:
      'A structured monthly operating system installed inside your institution. Dedicated team. 90-day rolling roadmap. Capability transfer built in — your team drives AI transformation independently when the engagement ends.',
    included: [
      'Week 1: Executive Alignment',
      'Week 2: Department Activation',
      'Week 3: Implementation Sprint',
      'Week 4: Training and Impact Report',
    ],
    accent: 'var(--color-sage)',
  },
];
