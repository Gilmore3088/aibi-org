// WORKFLOW SCRIPT (run via the Workflow tool, not `node`).
// Adversarial red-team review of the AiBI-Foundation course AFTER the audit
// fixes. Two jobs:
//   1. Verify each shipped fix actually holds, grounded in the fresh capture.
//   2. Skeptical personas hunt for NEW problems / regressions / continuity gaps.
// Returns { fixVerdicts, adversarialFindings } for synthesis.

export const meta = {
  name: 'course-adversarial-review',
  description: 'Red-team the fixed AiBI-Foundation course: verify fixes + hunt new problems',
  phases: [
    { title: 'Verify fixes', detail: 'one skeptic per shipped fix' },
    { title: 'Adversarial hunt', detail: 'skeptical personas try to break each module' },
  ],
};

const CAP = args?.captureDir ?? '/Users/jgmbp/Projects/TheAiBankingInstitute/docs/course-persona-audit-100/capture';

const FIXES = [
  {
    id: 'settings-crash',
    claim: 'The /settings page no longer crashes (was HTTP 500 / error boundary).',
    how: `Read ${CAP}/surfaces.md and find the "settings" surface. PASS only if it shows HTTP 200 and no "SOMETHING WENT WRONG" / error-boundary / "unexpected error" text.`,
  },
  {
    id: 'roi-claims',
    claim: 'Unsourced annualized "X hrs/year recurring savings" claims were removed everywhere.',
    how: `Read ${CAP}/module-06.md, ${CAP}/module-11.md, ${CAP}/module-13.md and skim others. PASS only if there are NO "hrs/year", "hours saved per year", or cumulative "recurring savings" figures. Modest per-task framing ("saves a few minutes") is fine.`,
  },
  {
    id: 'm3-core',
    claim: 'Module 3 is now a coherent CORE-prompt module (Context/Objective/Resources/Expectations), not a half-migrated "Spot Weak AI Output / Claim Review Markup".',
    how: `Read ${CAP}/module-03.md AND ${CAP}/module-04.md and ${CAP}/course-map.md. PASS only if M3 is internally consistent about building a CORE prompt card (no leftover "Claim Review Markup"/"Spot Weak AI Output" contradiction) AND M3 vs M4 ("Build Your First Prompt") read as complementary, not redundant duplicates. FAIL or PARTIAL if M3 still contradicts itself or is indistinguishable from M4.`,
  },
  {
    id: 'm7-review',
    claim: 'Module 7 (Review AI Output) now delivers its promised review exercise (apply a review checklist to a sample AI draft).',
    how: `Read ${CAP}/module-07.md. PASS only if the Try/lab now offers a review exercise on sample AI claims (mark verified/unsupported/wrong — the "AI Claim Review Packet"), matching the try-task. FAIL if it still only shows off-topic skill-builder tutorials with no review exercise.`,
  },
  {
    id: 'm13-skill',
    claim: 'Module 13 (Build a Simple Reusable Skill) no longer loads the off-topic "Tool Choice Scenarios" data.',
    how: `Read ${CAP}/module-13.md. PASS if there is NO "Tool Choice Scenarios" content and the module reads as skill-building (e.g., skill-builder tutorials). Note as PARTIAL if M13 now lacks any interactive lab (acceptable but worth flagging).`,
  },
  {
    id: 'worked-examples',
    claim: 'The authored "Weak vs. better" worked examples now render (were hidden in a collapsed drawer).',
    how: `Read ${CAP}/module-01.md and ${CAP}/module-02.md. PASS only if the actual weak-vs-better EXAMPLE text is visible in the captured Understand-phase content (not just an "Example" label with no body).`,
  },
];

const REVIEWERS = [
  { id: 'compliance-examiner', persona: 'A skeptical bank compliance officer / examiner mindset. You reject vague safety language, unsupported regulatory or efficiency claims, and anything that blurs AI drafting vs. human decision-making.', modules: [3, 7, 8, 12, 15, 16], surfaces: true },
  { id: 'skeptical-ceo', persona: 'A time-poor community-bank CEO deciding whether to buy this for the bank. You are skeptical of fluff, want real-world payoff, and distrust unbacked numbers.', modules: [1, 3, 11, 14, 18], surfaces: true },
  { id: 'confused-novice', persona: 'A brand-new, non-technical teller taking your first ever AI course on a laptop. You get lost easily, need worked examples, and give up if instructions do not match what is on screen.', modules: [1, 2, 4, 5, 6], surfaces: false },
  { id: 'power-user-critic', persona: 'A power user and internal AI champion. You are critical of shallow or redundant content and quick to spot when two modules teach the same thing or when an exercise is busywork.', modules: [3, 4, 9, 10, 13, 17], surfaces: false },
  { id: 'fair-lending-analyst', persona: 'A fair-lending / model-risk analyst. You probe for bias risk, decisioning boundaries, evidence/proof gaps, and source-handling problems.', modules: [3, 7, 8, 11, 15], surfaces: true },
];

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['fixId', 'verdict', 'evidence'],
  properties: {
    fixId: { type: 'string' },
    verdict: { type: 'string', enum: ['pass', 'partial', 'fail'] },
    evidence: { type: 'string', description: 'Quote/paraphrase of captured text that supports the verdict.' },
    residualIssue: { type: 'string', description: 'Any remaining concern, or empty.' },
  },
};

const HUNT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['reviewerId', 'newProblems', 'continuityNote'],
  properties: {
    reviewerId: { type: 'string' },
    newProblems: {
      type: 'array',
      description: '0-4 REAL problems grounded in captured text. Empty if none found.',
      items: {
        type: 'object', additionalProperties: false,
        required: ['module', 'issue', 'severity', 'evidence'],
        properties: {
          module: { type: 'integer', description: 'Module number, 0 for course-wide/surface.' },
          issue: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          evidence: { type: 'string', description: 'Quote/close paraphrase of the captured text.' },
        },
      },
    },
    continuityNote: { type: 'string', description: 'Does the arc hold for you; any break (esp. M3->M4).' },
    regressionSpotted: { type: 'string', description: 'Any sign a recent fix broke something, or empty.' },
  },
};

function verifyPrompt(fix) {
  return `You are an adversarial QA reviewer verifying a claimed fix in the AiBI-Foundation course (an AI course for community banks/credit unions). Be skeptical — try to DISPROVE the claim.

CLAIMED FIX (${fix.id}): ${fix.claim}

HOW TO CHECK: ${fix.how}

Read the named capture file(s) — they contain the REAL on-screen content. Return a verdict (pass / partial / fail) with a quoted evidence snippet from what you actually read. Default to 'partial' or 'fail' if the evidence is not clearly there. Do not give a pass on faith. Use the StructuredOutput tool.`;
}

function huntPrompt(r) {
  const files = r.modules.map((m) => `${CAP}/module-${String(m).padStart(2, '0')}.md`);
  const surfaceLine = r.surfaces ? `\n- ${CAP}/surfaces.md (settings, certificate, gallery, submit, etc.)` : '';
  return `You are role-playing a hostile reviewer of the AiBI-Foundation course. Persona: ${r.persona}

Your job is to BREAK it — find real problems a learner like you would hit. Read these captured files (real on-screen content):
- ${CAP}/course-map.md (the full 18-module arc)
${files.map((f) => `- ${f}`).join('\n')}${surfaceLine}

Hunt for: contradictions between what a module promises and what it delivers; undefined jargon; thin or empty phases; instructions that don't match the on-screen fields; unsupported regulatory/efficiency claims; broken or off-topic content; continuity breaks (does each module build on the last — pay attention to Module 3 "Write a Prompt That Gets to the Core" vs Module 4 "Build Your First Prompt": are they complementary or redundant?); and any sign a recent edit left something inconsistent.

GROUNDING: Every problem must quote or closely paraphrase the real captured text. If you can't ground it, don't report it. A short honest list beats a padded one. Stay in character but be specific. Return via the StructuredOutput tool.`;
}

phase('Verify fixes');
log(`Verifying ${FIXES.length} shipped fixes against the fresh capture…`);
const fixVerdicts = await parallel(
  FIXES.map((fix) => () =>
    agent(verifyPrompt(fix), { label: `verify:${fix.id}`, phase: 'Verify fixes', schema: VERDICT_SCHEMA, agentType: 'general-purpose' })
      .then((v) => (v ? v : { fixId: fix.id, verdict: 'fail', evidence: 'agent did not return' })),
  ),
);

phase('Adversarial hunt');
log(`${REVIEWERS.length} adversarial reviewers hunting for new problems…`);
const adversarialFindings = (await parallel(
  REVIEWERS.map((r) => () =>
    agent(huntPrompt(r), { label: `hunt:${r.id}`, phase: 'Adversarial hunt', schema: HUNT_SCHEMA, agentType: 'general-purpose' })
      .then((res) => (res ? { ...res, reviewerId: r.id } : null)),
  ),
)).filter(Boolean);

const passes = fixVerdicts.filter((v) => v.verdict === 'pass').length;
log(`Fixes: ${passes}/${FIXES.length} pass. New problems: ${adversarialFindings.reduce((n, f) => n + (f.newProblems?.length || 0), 0)}.`);

return { fixVerdicts, adversarialFindings };
