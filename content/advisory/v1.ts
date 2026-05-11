// Advisory — optional coaching engagements that pair with certification.
// Education is the product. Advisory is a complement for institutions that
// want a coach embedded alongside the cohort. No prices until we have
// case studies to anchor them.

export interface AdvisoryTier {
  readonly id: 'pilot' | 'program' | 'leadership';
  readonly name: string;
  readonly scaleLabel: string;
  readonly tagline: string;
  readonly summary: string;
  readonly bestFor: string;
  readonly format: string;
  readonly duration: string;
  readonly accent: string;
}

export const advisoryTiers: readonly AdvisoryTier[] = [
  {
    id: 'pilot',
    name: 'Pilot Advisory',
    scaleLabel: 'Alongside a Foundations cohort',
    tagline: 'Coach one use case, end to end.',
    summary:
      'A short engagement paired with a Foundations cohort. We coach your bankers through picking one real use case inside the institution and applying what they learned — from scoping through the documented before/after. Your team does the work. We keep them unstuck.',
    bestFor:
      'Institutions running their first Foundations cohort that want structured application support.',
    format: 'Weekly coaching, async review, one documented use case at the end.',
    duration: '4 – 6 weeks',
    accent: 'var(--color-terra)',
  },
  {
    id: 'program',
    name: 'Program Advisory',
    scaleLabel: 'Alongside a Specialist cohort',
    tagline: 'Coach a department through a roadmap.',
    summary:
      'Coaching paired with a department-wide Specialist cohort. We coach managers through translating the cohort work into a prioritized departmental automation roadmap — workflow by workflow, with governance baked in. The deliverable belongs to your team.',
    bestFor:
      'Institutions that have certified a department and want to turn learning into a live roadmap.',
    format: 'Bi-weekly coaching, roadmap review, documented handoff to the department owner.',
    duration: '6 – 10 weeks',
    accent: 'var(--color-cobalt)',
  },
  {
    id: 'leadership',
    name: 'Leadership Advisory',
    scaleLabel: 'Alongside your AI leader',
    tagline: 'A thought partner for the person accountable.',
    summary:
      'Ongoing executive coaching for the institution’s AI leader — CIO, COO, or a designated executive. A senior advisor meets regularly to help install governance, prioritize use cases, and lead capability-building internally. Fractional Chief AI Officer if that’s what you need; a trusted second opinion if that’s all you need.',
    bestFor:
      'Institutions with a Leader-credentialed executive who wants a thought partner, not a replacement.',
    format: 'Monthly executive coaching, async strategic review, quarterly alignment with the board.',
    duration: 'Monthly, ongoing',
    accent: 'var(--color-sage)',
  },
];
