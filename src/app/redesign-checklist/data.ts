// Inventory of every route to walk for visual review of the Ledger
// redesign. Edit here; the page renders from this list.

export interface ChecklistItem {
  readonly path: string;
  readonly label?: string; // optional — defaults to the path
  readonly note?: string;  // hint / context shown under the path
}

export interface ChecklistCategory {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly items: readonly ChecklistItem[];
}

export const CHECKLIST: readonly ChecklistCategory[] = [
  {
    id: 'bundles',
    title: 'Bundle-translated reference routes',
    description: 'Pixel-faithful Ledger from claude.ai/design exports.',
    items: [
      { path: '/design-system', note: '21 sections — typography, buttons, pills, cards, sidebar, tables, model picker, etc.' },
      { path: '/preview-home', note: 'Marketing landing mockup' },
      { path: '/user-home', note: 'Dashboard mockup ("Hello, James")' },
      { path: '/my-toolbox', note: 'Interactive — filter chips, modal, drawer, search' },
      { path: '/playground', note: 'Multi-model prompt playground (interactive)' },
      { path: '/faq', note: 'FAQ accordion' },
      { path: '/briefing-preview', note: 'Assessment results briefing' },
      { path: '/lms-preview', note: 'LMS prototype (iframed React app)' },
      { path: '/courses/foundation-preview', note: 'Pre-purchase course landing' },
    ],
  },
  {
    id: 'direct',
    title: 'Direct Ledger primitive conversions',
    description: 'Hand-written using LedgerSurface / LedgerCard / LedgerField etc.',
    items: [
      { path: '/', label: 'Homepage', note: 'HomeContextStrip + MarketingPage hero + ROIDossier' },
      { path: '/auth/login', note: 'Sign-in (Password / Magic Link toggle)' },
      { path: '/auth/signup', note: 'Create account' },
      { path: '/auth/forgot-password', note: 'Request reset link' },
      { path: '/auth/reset-password', note: 'Set new password' },
      { path: '/privacy' },
      { path: '/terms' },
      { path: '/ai-use-disclaimer', note: 'Legal w/ SAFE rule callout' },
      { path: '/verify/test-id', note: 'Credential not-found state — replace test-id with real cert ID for verified state' },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing inner pages',
    description: 'Auto-remap only — needs your eyes for layout / typography fit.',
    items: [
      { path: '/about' },
      { path: '/education' },
      { path: '/for-institutions' },
      { path: '/for-institutions/advisory' },
      { path: '/for-institutions/samples/efficiency-ratio-workbook', label: '/for-institutions/samples/efficiency-ratio-workbook' },
      { path: '/research' },
      { path: '/research/the-skill-not-the-prompt', note: 'Sample essay slug' },
      { path: '/security', note: 'Pillar B was cobalt — now Ledger navy' },
      { path: '/resources', note: 'Redirects' },
      { path: '/resources/ai-governance-without-the-jargon' },
      { path: '/resources/members-will-switch' },
      { path: '/resources/six-ways-ai-fails-in-banking' },
      { path: '/resources/the-skill-not-the-prompt' },
      { path: '/resources/the-widening-ai-gap' },
      { path: '/resources/what-your-efficiency-ratio-is-hiding' },
    ],
  },
  {
    id: 'assessment',
    title: 'Assessment flow',
    description: 'Interactive subcomponents (QuestionCard, ScoreRing, EmailGate, ResultsViewV2).',
    items: [
      { path: '/assessment', note: '12-question diagnostic, score ring, email gate, results' },
      { path: '/assessment/in-depth', note: '48-question paid intake' },
      { path: '/assessment/in-depth/take', note: 'Paid take screen' },
      { path: '/assessment/in-depth/purchased', note: 'Post-purchase landing' },
      { path: '/results/test-id', label: '/results/{id}', note: 'Public results page — needs real ID' },
    ],
  },
  {
    id: 'courses',
    title: 'Course flows',
    description: 'Auto-remap. Foundations + AiBI-S + AiBI-L.',
    items: [
      { path: '/courses/foundations', note: 'Overview (~177KB page)' },
      { path: '/courses/foundations/onboarding' },
      { path: '/courses/foundations/gallery' },
      { path: '/courses/foundations/prompt-library' },
      { path: '/courses/foundations/tool-guides' },
      { path: '/courses/foundations/toolkit' },
      { path: '/courses/foundations/quick-wins' },
      { path: '/courses/foundations/post-assessment' },
      { path: '/courses/foundations/submit' },
      { path: '/courses/foundations/settings' },
      { path: '/courses/foundations/certificate' },
      { path: '/courses/foundations/purchase' },
      { path: '/courses/foundations/purchased' },
      { path: '/courses/foundations/01', label: '/courses/foundations/[module]', note: 'Use 01–12 for modules' },
      { path: '/courses/aibi-s', note: 'Overview' },
      { path: '/courses/aibi-s/ops', note: 'Ops track' },
      { path: '/courses/aibi-s/purchase' },
      { path: '/courses/aibi-l', note: 'Overview' },
      { path: '/courses/aibi-l/request' },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Existing dashboard. Will be replaced by /user-home + /my-toolbox.',
    items: [
      { path: '/dashboard' },
      { path: '/dashboard/progression' },
      { path: '/dashboard/toolbox' },
      { path: '/dashboard/toolbox/library' },
      { path: '/dashboard/toolbox/cookbook' },
    ],
  },
  {
    id: 'apps',
    title: 'Apps & utilities',
    description: 'Internal / specific surfaces.',
    items: [
      { path: '/practice/test-rep', label: '/practice/[repId]', note: 'Use a real rep ID' },
      { path: '/prompt-cards' },
      { path: '/certifications/exam/foundations' },
    ],
  },
];

export const TOTAL_ITEMS = CHECKLIST.reduce(
  (sum, cat) => sum + cat.items.length,
  0,
);

export const VISUAL_CHECKLIST = [
  'Lockup — top-left two-line "The AI Banking" / "Institute" Geist 700 uppercase (no seal SVG)',
  'Headlines — Newsreader serif, italic em in terra gold',
  'Body — Geist sans',
  'Buttons — terra gold for primary, ink cool-navy for high-contrast',
  'Background — parchment cream, not warm linen',
  'Errors — oxblood (not bright red)',
  'No rust-colored elements, no Cormorant serif anywhere',
];
