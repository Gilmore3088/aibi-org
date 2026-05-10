// For Institutions — enrollment tiers. Shared between /for-institutions and
// the homepage teaser. Education-first positioning: the product is
// certification at scale, not implementation services.

export interface EnrollmentTier {
  readonly id: 'individual' | 'team' | 'institution-wide';
  readonly name: string;
  readonly scaleLabel: string;
  readonly tagline: string;
  readonly summary: string;
  readonly included: readonly string[];
  readonly cta: { readonly label: string; readonly href: string };
  readonly accent: string;
}

export const enrollmentTiers: readonly EnrollmentTier[] = [
  {
    id: 'individual',
    name: 'Individual enrollment',
    scaleLabel: 'One banker',
    tagline: 'A credential that travels with the person.',
    summary:
      'A banker enrolls on their own path. Badge and credential travel with them. The simplest way to test whether the curriculum fits before committing a team.',
    included: [
      'Per-seat pricing on every track',
      'Personal dashboard and progress tracking',
      'Verifiable credential on completion',
    ],
    cta: { label: 'See certification tracks', href: '/education' },
    accent: 'var(--color-terra)',
  },
  {
    id: 'team',
    name: 'Team cohort',
    scaleLabel: '10+ bankers',
    tagline: 'One department, one kickoff, one shared outcome.',
    summary:
      'A group from one institution moves through a track together. Shared kickoff, an internal champion, group reporting for the executive sponsor, and team pricing that scales with headcount.',
    included: [
      'Team pricing on Foundations or Specialist tracks',
      'Shared kickoff and internal champion support',
      'Group reporting for the executive sponsor',
    ],
    cta: { label: 'Request team pricing', href: '/for-institutions#inquiry' },
    accent: 'var(--color-cobalt)',
  },
  {
    id: 'institution-wide',
    name: 'Institution-wide capability program',
    scaleLabel: 'Everyone, over time',
    tagline: 'A cohort cadence, built to endure.',
    summary:
      'Multi-year. Mixed cohorts of Foundations, Specialist, and Leader credentials, scheduled on a recurring cadence so every banker — new hire or tenured — has a path to proficiency. The most durable way to build internal AI capability.',
    included: [
      'Quarterly Foundations cohorts for ongoing onboarding',
      'Specialist cohorts by department as readiness grows',
      'Leader certification for executives and the board',
      'Named program lead and annual capability review',
    ],
    cta: { label: 'Book an Executive Briefing', href: 'calendly' },
    accent: 'var(--color-sage)',
  },
];
