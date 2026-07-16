import type { DimensionAggregate } from '@/lib/team-assessment/aggregate';

export interface DimensionAction {
  readonly outcome: string;
  readonly owner: string;
  readonly firstMove: string;
  readonly shortMove: string;
  readonly artifact: string;
  readonly evidence: string;
}

export const DIMENSION_ACTIONS: Record<DimensionAggregate['id'], DimensionAction> = {
  'ai-access-architecture': {
    outcome: 'Staff know which AI tools are approved, which uses are blocked, and where exceptions go.',
    owner: 'IT / InfoSec with Compliance',
    firstMove: 'Publish a one-page approved-tool register with data-use boundaries and exception routing.',
    shortMove: 'Publish approved-tool register',
    artifact: 'Approved AI access register',
    evidence: 'Tool list, access groups, exception log, and data class rules',
  },
  'model-risk-validation': {
    outcome: 'High-impact AI use cases have repeatable testing before they reach customers or regulated decisions.',
    owner: 'Risk with line-of-business owners',
    firstMove: 'Define the validation checklist for one model-assisted workflow and assign a review cadence.',
    shortMove: 'Define validation checklist',
    artifact: 'Model and output validation checklist',
    evidence: 'Test cases, reviewer notes, defect thresholds, and sign-off history',
  },
  'compliance-explainability': {
    outcome: 'Teams can explain where AI is used, what it influenced, and what policy standard applies.',
    owner: 'Compliance with business process owners',
    firstMove: 'Map the top five AI use cases to policies, disclosures, retention rules, and reviewer roles.',
    shortMove: 'Map top five AI uses',
    artifact: 'AI compliance traceability map',
    evidence: 'Policy citations, approval notes, and customer-impact classification',
  },
  'data-security-guardrails': {
    outcome: 'Employees have clear red, yellow, and green data rules before they paste or upload anything.',
    owner: 'InfoSec with Data Governance',
    firstMove: 'Convert data classes into allowed, restricted, and blocked AI handling rules.',
    shortMove: 'Set red/yellow/green data rules',
    artifact: 'AI data handling matrix',
    evidence: 'Data classification, DLP rules, approved prompts, and exception records',
  },
  'workflow-orchestration': {
    outcome: 'AI use moves from one-off prompting to reusable, reviewed workflows.',
    owner: 'Operations with department managers',
    firstMove: 'Select one high-frequency workflow and document inputs, review points, outputs, and re-use rules.',
    shortMove: 'Document one reusable workflow',
    artifact: 'AI workflow SOP',
    evidence: 'Workflow map, saved prompt, reviewer checkpoint, and time-saved baseline',
  },
  'bounded-autonomy-human-review': {
    outcome: 'People know when AI can draft, when it can recommend, and when a human must decide.',
    owner: 'Risk with department leaders',
    firstMove: 'Create a checkpoint matrix for low, moderate, and high-impact use cases.',
    shortMove: 'Set human-review checkpoints',
    artifact: 'Human review checkpoint matrix',
    evidence: 'Approval thresholds, reviewer roles, escalations, and exception examples',
  },
  'vendor-risk-interoperability': {
    outcome: 'Vendor AI capabilities are inventoried before teams rely on embedded automation.',
    owner: 'Vendor Management with IT',
    firstMove: 'Inventory AI features inside core, CRM, lending, fraud, marketing, and productivity platforms.',
    shortMove: 'Inventory vendor AI features',
    artifact: 'AI vendor inventory',
    evidence: 'Vendor attestations, data flow notes, contract terms, and interoperability constraints',
  },
  'governance-roles-human-capital': {
    outcome: 'AI ownership is visible by role, not trapped in a single champion or informal committee.',
    owner: 'Executive sponsor with Training / HR',
    firstMove: 'Name accountable owners for policy, tool approval, training, monitoring, and workflow review.',
    shortMove: 'Name owners and training path',
    artifact: 'AI roles and training map',
    evidence: 'Owner roster, training completion, meeting cadence, and adoption metrics',
  },
};
