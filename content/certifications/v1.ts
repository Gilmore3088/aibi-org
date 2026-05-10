// Certifications — shared between /certifications and homepage.
// Source: Plans/aibi-foundation-v3.html

export interface Certification {
  readonly id: 'aibi-p' | 'aibi-s' | 'aibi-l';
  readonly name: string;
  readonly fullName: string;
  readonly credentialDisplay: string;
  readonly price: string;
  readonly audience: string;
  readonly learn: readonly string[];
  readonly format: string;
  readonly timeCommitment: string;
  readonly accent: string;
}

export const certifications: readonly Certification[] = [
  {
    id: 'aibi-p',
    name: 'AiBI Foundations',
    fullName: 'Banking AI Foundations',
    credentialDisplay: 'AiBI Foundations · The AI Banking Institute',
    price: '$99',
    audience: 'All staff',
    learn: [
      'What Gen AI is and why it fails in banking contexts',
      'Prompting for professional banking output (RTFC framework)',
      'Safe use — what never goes in a public LLM',
      'Five universal templates for banking roles',
      'Identifying the highest-value AI use cases in your role',
    ],
    format: 'Assessed by a real work output — something they would actually submit to a supervisor.',
    timeCommitment: 'Self-paced online',
    accent: 'var(--color-terra)',
  },
  {
    id: 'aibi-s',
    name: 'AiBI-S',
    fullName: 'Banking AI Specialist (Coming Soon)',
    credentialDisplay: 'AiBI-S · Specialist · Coming Soon',
    price: 'Coming Soon',
    audience: 'Department managers (5 role tracks: Operations, Lending, Compliance, Finance, Retail)',
    learn: [
      'Advanced prompt architecture for professional output',
      'Workflow mapping and automation design',
      'Power Automate and Copilot Studio for non-developers',
      'AI vendor evaluation — 5 questions, scoring framework',
      'Change management and staff adoption',
    ],
    format: 'Assessed by a submitted process improvement with measured time savings — not a test.',
    timeCommitment: 'Live cohort',
    accent: 'var(--color-cobalt)',
  },
  {
    id: 'aibi-l',
    name: 'AiBI-L',
    fullName: 'Banking AI Leader (Coming Soon)',
    credentialDisplay: 'AiBI-L · Leader · Coming Soon',
    price: 'Coming Soon',
    audience: 'C-suite and board',
    learn: [
      'AI through a leadership accountability lens',
      'Efficiency ratio strategy — live modeling with your numbers',
      '3-year AI roadmap development for board presentation',
      'AI governance and examiner readiness',
      'Vendor evaluation and concentration risk',
    ],
    format: '1-day in-person workshop.',
    timeCommitment: '1 day (in-person)',
    accent: 'var(--color-sage)',
  },
];
