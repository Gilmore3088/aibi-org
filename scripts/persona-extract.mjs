// Extracts the 100 persona StructuredOutput payloads from the workflow agent
// transcripts and writes docs/course-persona-audit-100/eval-results.json.
// Regenerates the personas deterministically (identical logic to the workflow
// script) so personaId maps back to role/department/confidence for segmenting.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const WF_DIR = process.argv[2] ||
  '/Users/jgmbp/.claude/projects/-Users-jgmbp-Projects-TheAiBankingInstitute/f42e76f9-00b2-439d-8062-5f0cbd065518/subagents/workflows/wf_73874025-c9c';
const OUT = resolve(process.cwd(), 'docs/course-persona-audit-100/eval-results.json');

// --- persona taxonomy (must match persona-eval.workflow.mjs) ---
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
const deviceFor = (i) => (i % 9 === 0 ? 'mobile (iPhone)' : i % 7 === 0 ? 'tablet' : 'desktop');

function buildPersonas() {
  const out = [];
  for (let i = 0; i < 100; i += 1) {
    const [label, dept, focus, goal, concern, wantsSurfaces] = ROLES[i % ROLES.length];
    out.push({
      id: `P${String(i + 1).padStart(3, '0')}`, role: label, department: dept,
      institution: INSTS[(i * 7) % INSTS.length], assetSize: SIZES[(i * 3) % SIZES.length],
      confidence: CONF[(i * 5) % CONF.length], disposition: DISP[(i * 11) % DISP.length],
      device: deviceFor(i), focusModules: focus, goal, concern, wantsSurfaces,
    });
  }
  return out;
}

// --- extract StructuredOutput payloads from each agent transcript ---
function extractEval(file) {
  const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
  let found = null;
  for (const ln of lines) {
    let o;
    try { o = JSON.parse(ln); } catch { continue; }
    const content = o.message?.content || o.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (c.type === 'tool_use' && c.name === 'StructuredOutput' && c.input && c.input.personaId) {
        found = c.input; // keep last (handles retries)
      }
    }
  }
  return found;
}

const personas = buildPersonas();
const files = readdirSync(WF_DIR).filter((f) => f.endsWith('.jsonl'));
const byId = new Map();
for (const f of files) {
  const ev = extractEval(resolve(WF_DIR, f));
  if (ev && ev.personaId) byId.set(ev.personaId, ev);
}
const evals = [...byId.values()];

writeFileSync(OUT, JSON.stringify({ personas, evals }, null, 2), 'utf8');
const missing = personas.filter((p) => !byId.has(p.id)).map((p) => p.id);
console.log(`Extracted ${evals.length}/100 persona evaluations -> ${OUT}`);
if (missing.length) console.log(`Missing: ${missing.join(', ')}`);
