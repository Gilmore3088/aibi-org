// WORKFLOW SCRIPT (run via the Workflow tool, not `node`).
// Fans out 100 deterministically-generated banker learner personas, each of
// which READS the real captured course content and evaluates the AiBI-Foundation
// course through its own lens. Returns { personas, evals } for synthesis.
//
// Grounding contract: every agent must base scores/findings ONLY on the
// captured Markdown it reads — no invented problems.

export const meta = {
  name: 'course-persona-eval-100',
  description: '100 banker personas evaluate the AiBI-Foundation course from real captured content',
  phases: [{ title: 'Evaluate', detail: '100 persona judges over captured module content' }],
};

const CAP = args?.captureDir ?? '/Users/jgmbp/Projects/TheAiBankingInstitute/docs/course-persona-audit-100/capture';

// ---- Persona taxonomy -------------------------------------------------------
// role: [label, department, focusModules(incl. 1), goal, concern, wantsSurfaces]
const ROLES = [
  ['New teller', 'Retail', [1, 2, 4, 7], 'Get one safe everyday win at the window without breaking a rule', 'Worried about doing something non-compliant with a customer', false],
  ['Branch manager', 'Retail', [1, 2, 4, 10], 'Find a staff-facing win I can roll out to my branch', 'Needs concrete examples and a fast next step', false],
  ['Retail operations manager', 'Retail ops', [1, 9, 10, 14], 'Templatize repetitive branch communications', 'Will this actually save my team time', false],
  ['Personal banker', 'Retail', [1, 2, 4, 7], 'Draft better customer messages faster', 'Keeping it accurate and on-brand', false],
  ['Member service rep', 'Member service', [1, 2, 7, 9], 'Answer member questions faster and clearer', 'Not giving members wrong information', false],
  ['Call center supervisor', 'Member service', [1, 7, 10, 9], 'Give my reps reusable response prompts', 'Consistency and quality control across reps', false],
  ['Consumer lender', 'Lending', [1, 4, 7, 8], 'Speed up routine loan correspondence', 'Never letting AI touch the credit decision', false],
  ['Commercial lender', 'Lending', [1, 7, 8, 13], 'Organize deal notes and summaries', 'Confidential borrower data and source handling', true],
  ['Mortgage loan officer', 'Lending', [1, 2, 8, 7], 'Explain mortgage steps to borrowers clearly', 'Fair-lending and accuracy of explanations', false],
  ['Credit analyst', 'Lending', [1, 3, 5, 8], 'Draft and structure credit write-ups', 'Catching weak or wrong AI output', false],
  ['Commercial underwriter', 'Lending', [1, 3, 8, 16], 'Summarize financials without affecting decisions', 'Boundary between drafting and decisioning, plus evidence', true],
  ['Loan operations specialist', 'Lending ops', [1, 6, 13, 14], 'Structure repetitive loan-ops tasks', 'Will the structured output be reliable', false],
  ['Compliance officer', 'Compliance', [1, 3, 15, 16], 'See exactly where human review and evidence live', 'Will reject vague safety language or unsupported regulatory claims', true],
  ['Fair lending analyst', 'Compliance', [1, 3, 8, 15], 'Confirm AI use cannot introduce bias', 'Documented human review at consequential checkpoints', true],
  ['BSA/AML analyst', 'BSA', [1, 6, 12, 16], 'Use AI to organize case notes safely', 'No customer data leaking; audit trail intact', true],
  ['Risk officer', 'Risk', [1, 5, 12, 15], 'Understand the control surface for AI use', 'Data boundaries and the human review gate', true],
  ['Internal auditor', 'Audit', [1, 3, 16, 18], 'Verify the proof and review trail hold up', 'Is there real evidence to audit', true],
  ['Fraud analyst', 'Fraud', [1, 3, 6, 12], 'Spot patterns and draft case summaries', 'Data safety and spotting weak AI output', false],
  ['IT administrator', 'Technology', [1, 5, 12, 15], 'Understand safe configuration and limits', 'Data handling and tool boundaries', true],
  ['Information security officer', 'Security', [1, 12, 15, 16], 'Validate data-safety boundaries are enforced', 'Is NPI handling a real control or a slogan', true],
  ['Data / BI analyst', 'Data', [1, 5, 6, 13], 'Get structured, reusable outputs', 'Output reliability and reusability', false],
  ['Core operations analyst', 'Operations', [1, 6, 13, 17], 'Build a small reusable workflow kit', 'Will this survive past the course', false],
  ['Deposit operations specialist', 'Operations', [1, 6, 9, 14], 'Templatize deposit-ops communications', 'Time saved vs effort to learn', false],
  ['Treasury management officer', 'Commercial', [1, 5, 8, 11], 'Pick the right AI use cases for treasury', 'Confidential client data', true],
  ['Marketing manager', 'Marketing', [1, 2, 9, 10], 'Produce on-brand content templates', 'Brand voice and unsupported claims', false],
  ['Marketing coordinator', 'Marketing', [1, 2, 4, 9], 'Draft campaign copy faster', 'Getting started without overwhelm', false],
  ['HR / L&D lead', 'People', [1, 4, 9, 18], 'Decide if this scales to all staff', 'Completion, certificate, and rollout fit', true],
  ['Finance / accounting analyst', 'Finance', [1, 5, 6, 16], 'Structure recurring finance summaries', 'Accuracy and a defensible record', false],
  ['Third-party risk manager', 'Vendor mgmt', [1, 8, 12, 16], 'Assess AI/vendor data handling', 'Source material safety and evidence', true],
  ['Transformation lead', 'Strategy', [1, 11, 14, 17], 'Map workflows worth automating', 'Choosing the right use cases first', true],
  ['Digital product manager', 'Product', [1, 11, 13, 14], 'Find buildable, valuable use cases', 'Practicality and reusability', false],
  ['CEO', 'Executive', [1, 11, 14, 18], 'Decide whether to invest the bank in this', 'Strategic value and risk posture', true],
  ['CFO', 'Executive', [1, 11, 16, 18], 'Judge ROI and the evidence trail', 'Measurable payoff and defensibility', true],
  ['COO', 'Executive', [1, 11, 14, 17], 'See operational workflow impact', 'Will teams actually adopt it', true],
  ['CIO / CTO', 'Executive', [1, 12, 14, 15], 'Validate the safety and control model', 'Data boundaries and governance', true],
  ['Chief Risk Officer', 'Executive', [1, 12, 15, 16], 'Confirm the risk controls are real', 'Human review gate and proof', true],
  ['Chief Lending Officer', 'Executive', [1, 8, 11, 15], 'See lending-relevant, safe use cases', 'Decisioning boundary stays intact', true],
  ['Board member', 'Board', [1, 11, 15, 18], 'Understand the bank-wide AI posture', 'Governance and accountability', true],
  ['Executive assistant', 'Admin', [1, 2, 4, 9], 'Save time on scheduling and drafts', 'Simple enough to use today', false],
  ['Teller supervisor', 'Retail', [1, 2, 7, 10], 'Coach tellers with reusable prompts', 'Quality and consistency', false],
];

const INSTS = ['community bank', 'credit union', 'minority-owned community bank', 'CDFI credit union', 'mutual savings bank', 'de novo community bank'];
const SIZES = ['$180M', '$420M', '$850M', '$1.4B', '$3.2B', '$6.5B', '$9B'];
const CONF = ['brand-new to AI and skeptical', 'a cautious beginner', 'an occasional AI user', 'a comfortable AI user', 'a power user and early adopter'];
const DISP = ['a self-funded individual buyer', 'a team champion evaluating a rollout', 'an executive evaluating an org-wide purchase', 'a compliance gatekeeper vetting safety', 'a reluctant, mandated learner', 'an ambitious self-improver'];

function deviceFor(i) {
  if (i % 9 === 0) return 'mobile (iPhone)';
  if (i % 7 === 0) return 'tablet';
  return 'desktop';
}

function buildPersonas() {
  const out = [];
  for (let i = 0; i < 100; i += 1) {
    const r = ROLES[i % ROLES.length];
    const [label, dept, focus, goal, concern, wantsSurfaces] = r;
    out.push({
      id: `P${String(i + 1).padStart(3, '0')}`,
      role: label,
      department: dept,
      institution: INSTS[(i * 7) % INSTS.length],
      assetSize: SIZES[(i * 3) % SIZES.length],
      confidence: CONF[(i * 5) % CONF.length],
      disposition: DISP[(i * 11) % DISP.length],
      device: deviceFor(i),
      focusModules: focus,
      goal,
      concern,
      wantsSurfaces,
    });
  }
  return out;
}

const PERSONAS = buildPersonas();

// ---- Evaluation schema ------------------------------------------------------
const EVAL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['personaId', 'moduleScores', 'continuityScore', 'continuityNote', 'overall', 'criticalProblems', 'opportunities'],
  properties: {
    personaId: { type: 'string' },
    moduleScores: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['module', 'easeOfUse', 'clarity', 'realWorldImpact', 'flags', 'mondayVerdict'],
        properties: {
          module: { type: 'integer' },
          easeOfUse: { type: 'integer', minimum: 1, maximum: 5 },
          clarity: { type: 'integer', minimum: 1, maximum: 5 },
          realWorldImpact: { type: 'integer', minimum: 1, maximum: 5 },
          flags: { type: 'array', items: { type: 'string' }, description: 'Accuracy/functionality/clarity concerns visible in the captured text. Empty if none.' },
          mondayVerdict: { type: 'string', description: 'One line: could this persona use this at work Monday, and why/why not.' },
        },
      },
    },
    continuityScore: { type: 'integer', minimum: 1, maximum: 5 },
    continuityNote: { type: 'string', description: 'Does each module build on the last; where does the arc break for this persona.' },
    overall: {
      type: 'object',
      additionalProperties: false,
      required: ['wouldComplete', 'wouldRecommend', 'mondayUseConfidence', 'oneLineSummary'],
      properties: {
        wouldComplete: { type: 'string', enum: ['yes', 'likely', 'unsure', 'no'] },
        wouldRecommend: { type: 'integer', minimum: 1, maximum: 5 },
        mondayUseConfidence: { type: 'integer', minimum: 1, maximum: 5 },
        oneLineSummary: { type: 'string' },
      },
    },
    criticalProblems: {
      type: 'array',
      description: '0-2 real problems grounded in captured content.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['module', 'issue', 'severity', 'evidence'],
        properties: {
          module: { type: 'integer', description: 'Module number, or 0 for course-wide/surface.' },
          issue: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium'] },
          evidence: { type: 'string', description: 'Quote or close paraphrase of the captured text supporting this.' },
        },
      },
    },
    opportunities: {
      type: 'array',
      description: '0-2 concrete improve/simplify opportunities.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['scope', 'type', 'suggestion'],
        properties: {
          scope: { type: 'string', description: 'Module number or area.' },
          type: { type: 'string', enum: ['simplify', 'improve'] },
          suggestion: { type: 'string' },
        },
      },
    },
  },
};

function promptFor(p) {
  const modFiles = p.focusModules.map((m) => `${CAP}/module-${String(m).padStart(2, '0')}.md`);
  const surfaceLine = p.wantsSurfaces
    ? `\n4. Because your role cares about governance/proof, also Read ${CAP}/surfaces.md (certificate, submit, settings, gallery, etc.).`
    : '';
  return `You are role-playing a real learner taking the AiBI-Foundation online course — a practical AI-proficiency course built specifically for community banks and credit unions. Evaluate the course strictly THROUGH THIS PERSONA'S EYES.

PERSONA ${p.id}
- Role: ${p.role} (${p.department}) at a ${p.institution} with ${p.assetSize} in assets
- AI confidence: You are ${p.confidence}
- Buyer disposition: ${p.disposition}
- Device: You are taking the course on ${p.device}
- Your goal: ${p.goal}
- Your main concern: ${p.concern}
- Your assigned focus modules: ${p.focusModules.join(', ')}

DO THIS:
1. Read ${CAP}/course-map.md (the full 18-module arc) for continuity context.
2. Read each of your focus module captures:
${modFiles.map((f) => `   - ${f}`).join('\n')}
3. These files contain the REAL captured on-screen content for each module's four phases (Understand / Try / Build / Save), including word counts, interactive-field counts, and the actual instructional text.${surfaceLine}

THEN evaluate, in character as this busy banker (not as a UX expert):
- For EACH focus module: easeOfUse, clarity, realWorldImpact (1-5, where 5 is excellent). List any concrete flags you can SEE in the captured text — confusing instructions, undefined jargon, missing worked example, a phase that looks thin or empty, an instruction that doesn't match the fields present, an unsupported regulatory/efficiency claim, or anything that would block YOU specifically. Give a one-line "Monday" verdict (could you use this at work Monday?).
- continuityScore (1-5): does each module build on the previous one, and does the Understand/Try/Build/Save rhythm hold? Note where the arc breaks for you.
- overall: wouldComplete, wouldRecommend (1-5), mondayUseConfidence (1-5), one-line summary.
- criticalProblems: 0-2 REAL problems, each tied to a module and supported by evidence you actually read.
- opportunities: 0-2 concrete ways to improve or simplify for someone like you.

GROUNDING RULES (critical):
- Base every score and finding ONLY on the captured content you read. Quote or closely paraphrase the real captured text as your evidence.
- If you cannot find evidence for a problem, DO NOT invent one — return fewer items. A short, honest evaluation beats a padded one.
- Differentiate: a power user and a skeptical beginner should not score the same module identically.

Return your evaluation via the StructuredOutput tool.`;
}

// ---- Fan out ----------------------------------------------------------------
phase('Evaluate');
log(`Evaluating ${PERSONAS.length} personas against captured course content…`);

const evals = await parallel(
  PERSONAS.map((p) => () =>
    agent(promptFor(p), {
      label: `${p.id} ${p.role}`,
      phase: 'Evaluate',
      schema: EVAL_SCHEMA,
      agentType: 'general-purpose',
    }).then((res) => (res ? { ...res, personaId: p.id } : null)),
  ),
);

const ok = evals.filter(Boolean);
log(`Collected ${ok.length}/${PERSONAS.length} persona evaluations.`);

return { personas: PERSONAS, evals: ok };
