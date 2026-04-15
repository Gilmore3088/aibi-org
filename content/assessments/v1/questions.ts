// AiBI Readiness Assessment — v1
// Each question has 4 options. Points 1 (lowest maturity) to 4 (highest).
// Edit freely — this file is the source of truth for assessment content.
// Score range: 8 (all 1s) to 32 (all 4s).

export interface AssessmentOption {
  readonly label: string;
  readonly points: 1 | 2 | 3 | 4;
}

export interface AssessmentQuestion {
  readonly id: string;
  readonly dimension: string;
  readonly prompt: string;
  readonly options: readonly [AssessmentOption, AssessmentOption, AssessmentOption, AssessmentOption];
}

export const questions: readonly AssessmentQuestion[] = [
  {
    id: 'current-ai-usage',
    dimension: 'Current AI Usage',
    prompt: 'How are your staff currently using AI tools in their daily work?',
    options: [
      { label: 'We have not introduced AI tools and staff are not using them in any official capacity.', points: 1 },
      { label: 'A few individuals experiment on their own, but there is no coordinated use across departments.', points: 2 },
      { label: 'Several teams use AI tools regularly for specific tasks, though adoption varies by department.', points: 3 },
      { label: 'AI tools are integrated into daily workflows across most functions with clear use cases.', points: 4 },
    ],
  },
  {
    id: 'experimentation-culture',
    dimension: 'Experimentation Culture',
    prompt: 'How does your institution approach trying new technology tools?',
    options: [
      { label: 'We wait until tools are proven across the industry before evaluating them.', points: 1 },
      { label: 'We evaluate new tools through a formal committee process that typically takes months.', points: 2 },
      { label: 'We encourage pilots in specific departments when the business case is clear.', points: 3 },
      { label: 'We have a standing practice of structured experimentation with rapid feedback loops.', points: 4 },
    ],
  },
  {
    id: 'ai-literacy',
    dimension: 'AI Literacy Level',
    prompt: "How would you describe your staff's current understanding of AI tools?",
    options: [
      { label: 'Most staff have little exposure to AI beyond what they hear in the news.', points: 1 },
      { label: 'Staff are curious but unsure what AI can actually do for their specific roles.', points: 2 },
      { label: 'A meaningful portion of staff understand core AI concepts and common use cases.', points: 3 },
      { label: 'Staff across functions can identify opportunities, evaluate tools, and articulate limits.', points: 4 },
    ],
  },
  {
    id: 'quick-win-potential',
    dimension: 'Quick Win Potential',
    prompt: 'How much manual, repetitive work exists in your current workflows?',
    options: [
      { label: 'We have not mapped where repetitive work lives, so we cannot say.', points: 1 },
      { label: 'We know it exists but have not prioritized identifying specific processes.', points: 2 },
      { label: 'We have identified several repetitive processes that are candidates for automation.', points: 3 },
      { label: 'We have a documented inventory of high-volume manual work with measured time costs.', points: 4 },
    ],
  },
  {
    id: 'leadership-buy-in',
    dimension: 'Leadership Buy-In',
    prompt: 'How does your leadership team currently view AI adoption?',
    options: [
      { label: 'Leadership is skeptical or concerned about risks and has not prioritized AI.', points: 1 },
      { label: 'Leadership is interested but has not committed budget or staff time.', points: 2 },
      { label: 'Leadership has approved initial exploration and is tracking early results.', points: 3 },
      { label: 'Leadership treats AI capability as a strategic priority with budget and accountability.', points: 4 },
    ],
  },
  {
    id: 'security-posture',
    dimension: 'Security Posture',
    prompt: 'Does your institution currently have an AI governance framework or staff AI use guidelines?',
    options: [
      { label: 'We have no formal guidelines; staff use of AI tools is unrestricted and untracked.', points: 1 },
      { label: 'We have informal guidance but no written policy or oversight process.', points: 2 },
      { label: 'We have a written AI use policy that references existing risk and vendor frameworks.', points: 3 },
      { label: 'We have a governance framework aligned with SR 11-7 and TPRM guidance, reviewed regularly.', points: 4 },
    ],
  },
  {
    id: 'training-infrastructure',
    dimension: 'Training Infrastructure',
    prompt: "What is your institution's capacity for delivering staff training programs?",
    options: [
      { label: 'We rely on vendor-provided training as needed; we have no internal capacity.', points: 1 },
      { label: 'We deliver compliance training but lack capacity for new skill programs.', points: 2 },
      { label: 'We have a training function that can roll out new programs with advance planning.', points: 3 },
      { label: 'We have an active learning function that regularly launches new skill programs.', points: 4 },
    ],
  },
  {
    id: 'builder-potential',
    dimension: 'Builder Potential',
    prompt: 'How much appetite do your staff have for building their own workflow solutions?',
    options: [
      { label: 'Staff expect IT or vendors to solve workflow problems for them.', points: 1 },
      { label: 'A few individuals tinker with spreadsheets or simple tools but nothing is shared.', points: 2 },
      { label: 'Several staff build and share workflow improvements using low-code tools.', points: 3 },
      { label: 'We have an active community of staff builders with a process for scaling what works.', points: 4 },
    ],
  },
] as const;
