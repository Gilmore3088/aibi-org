# AI Practice Sandbox — All Modules Implementation Plan

**Date:** 2026-04-17
**Scope:** AiBI Foundations Modules 1-4, 6-9 sandbox exercises (Module 5 already shipped)
**Prerequisite:** Phase 1 sandbox infrastructure is complete (Claude adapter, PII scanner, injection filter, API route, AIPracticeSandbox component, markdown renderer)

## Execution Strategy

Each module needs 3 things:
1. **Sample data files** in `content/sandbox-data/aibi-p/module-N/`
2. **Sandbox config** (system prompt + sample data refs + suggested prompts) in `content/sandbox-data/aibi-p/module-N/config.ts`
3. **Wiring** — conditional render in `src/app/courses/aibi-p/[module]/page.tsx` (extend the existing `moduleNum === 5` check to a lookup)

The `[module]/page.tsx` wiring should be refactored once: instead of `moduleNum === 5`, use a config map that checks if the module has a sandbox config and loads it dynamically.

## Module-by-Module Plan

### Module 1: Regulation Q&A
**Exercise:** Learner pastes banking scenarios and asks Claude which regulations apply.
**System prompt theme:** Banking regulation expert. Maps workflows to SR 11-7, ECOA/Reg B, GLBA, BSA/AML, TPRM Guidance, AIEOG Lexicon. Responds with a table: Scenario | Applicable Regulations | Key Requirements | Examiner Focus Areas.
**Sample data:**
- `banking-scenarios.md` — 10 short banking scenarios (deploying a chatbot for member inquiries, using AI for loan underwriting, automating BSA transaction monitoring, etc.)
**Suggested prompts:**
- "Which regulations apply to using AI for automated lending decisions?"
- "Our branch wants to deploy a customer-facing chatbot. What regulatory frameworks should we consider?"
- "Map each scenario to its applicable regulations and summarize examiner expectations"

### Module 2: Platform Explorer
**Exercise:** Learner picks a sample banking task and sees how Claude handles it. Compares approaches across tasks.
**System prompt theme:** AI platform advisor for community banks. When given a banking task, demonstrate how to accomplish it step-by-step, show expected output format, and note which platform features are most relevant.
**Sample data:**
- `sample-board-memo.md` — a 2-page fake board memo about Q3 performance with financials
- `sample-member-complaint.md` — a fake member complaint email about fee disputes
- `sample-policy-draft.md` — a rough draft of an AI acceptable use policy with gaps
**Suggested prompts:**
- "Summarize this board memo into 5 bullet points for the CEO's morning briefing"
- "Draft a professional response to this member complaint that acknowledges their concern and explains the fee structure"
- "Review this AI acceptable use policy draft and identify missing sections"

### Module 3: Hallucination Detective
**Exercise:** Sandbox is pre-loaded with AI outputs that contain deliberate errors. Learner asks Claude to fact-check.
**System prompt theme:** AI output auditor. You are helping a banker learn to identify hallucinations. When the learner shares an AI-generated text, analyze it line by line for: fabricated statistics, wrong regulation numbers, misattributed quotes, plausible but incorrect claims, and outdated information. Present findings in a table: Claim | Verdict (Accurate/Hallucinated/Unverifiable) | Correction | How to Verify.
**Sample data:**
- `ai-output-with-errors.md` — a fake AI-generated compliance summary containing 5 deliberate errors (wrong FDIC stat, fabricated regulation section number, misattributed quote to OCC, outdated threshold amount, invented case citation)
- `ai-output-clean.md` — a fake AI-generated summary that is actually correct (control group)
**Suggested prompts:**
- "Fact-check this AI-generated compliance summary. Identify any claims that appear fabricated or incorrect."
- "Compare these two AI outputs. Which one contains hallucinations and which is reliable? How can you tell?"
- "What verification steps should a banker take before sharing AI-generated regulatory content with their board?"

### Module 4: Output Grader
**Exercise:** Two AI-generated loan review summaries — one good, one with quality issues. Learner uses AI to evaluate both.
**System prompt theme:** AI output quality evaluator for banking. Grade AI outputs on a 5-point rubric: Accuracy (factual correctness), Completeness (covers all required elements), Tone (appropriate for institutional context), Regulatory Awareness (references applicable frameworks), Actionability (provides clear next steps). Present grades in a scorecard table.
**Sample data:**
- `loan-review-good.md` — well-structured AI-generated loan review summary (clear risk assessment, appropriate caveats, regulatory references, actionable recommendations)
- `loan-review-poor.md` — AI-generated loan review with issues (vague language, missing risk factors, no regulatory context, overly confident conclusions, no action items)
**Suggested prompts:**
- "Grade both loan review summaries using the 5-point quality rubric. Which is institutional-grade and why?"
- "Rewrite the weaker summary to make it institutional-grade. Show what changes you made and why."
- "Create a quality checklist that a loan officer could use to evaluate any AI-generated review before forwarding it"

### Module 6: Prompt Autopsy
**Exercise:** Three weak prompts — learner asks Claude to diagnose what's wrong and fix them.
**System prompt theme:** Prompt engineering coach for banking. When shown a prompt, diagnose it using the RTFC Framework (Role, Task, Format, Constraint). Identify which components are missing or weak. Show the original, the diagnosis, and a rewritten version side by side. Rate improvement potential on a 1-5 scale.
**Sample data:**
- `weak-prompts.md` — 3 prompts with different issues:
  1. "Summarize this report" (missing Role, Format, Constraint — too vague)
  2. "You are an expert. Analyze the data and give me insights about everything." (missing Task specificity, no Format, no Constraint — too broad)
  3. "As a compliance officer at a community bank, review this BSA policy for gaps. List them." (decent but missing Format specification and output Constraints — almost there)
**Suggested prompts:**
- "Diagnose each prompt using the RTFC Framework. What's missing from each one?"
- "Rewrite all three prompts to be institutional-grade. Show the before/after with your reasoning."
- "Which of these three prompts is closest to being effective? What one change would make the biggest improvement?"

### Module 7: Live Skill Workshop
**Exercise:** Learner builds a prompt iteratively with AI coaching. Real-time feedback loop.
**System prompt theme:** AI skill-building coach. Help the learner construct an effective prompt for their banking use case using the RTFC Framework. After each attempt, score it (1-5 per component), identify the weakest component, and suggest a specific improvement. When the prompt scores 4+ on all components, congratulate them and show how to save it as a reusable skill. Be encouraging but specific — "good start" is not helpful; "your Task is clear but your Format needs a table specification" is.
**Sample data:**
- `skill-building-scenarios.md` — 5 banking tasks the learner can choose to build a skill for:
  1. Monthly exception report summarization (Operations)
  2. Loan application pre-screening narrative (Lending)
  3. Regulatory change impact assessment (Compliance)
  4. Board financial narrative from Excel data (Finance)
  5. Member communication template for rate changes (Retail)
**Suggested prompts:**
- "I want to build a skill for summarizing monthly exception reports. Coach me through it step by step."
- "Here's my first attempt at a prompt for loan pre-screening narratives: [learner types]. Score it and help me improve."
- "Show me what a 5/5 RTFC prompt looks like for board financial narrative generation"

### Module 8: Stress Test Lab
**Exercise:** AI throws edge cases at a sample skill to test its robustness.
**System prompt theme:** AI skill stress tester. Given a prompt/skill, systematically test it against 6 failure modes: (1) incomplete input data, (2) large volume data, (3) ambiguous instructions, (4) contradictory information, (5) edge case scenarios, (6) adversarial inputs. For each test, show the input variation, predict what will happen, and recommend a prompt modification to handle it. Present as a stress test report with Pass/Fail per test.
**Sample data:**
- `sample-skill-to-test.md` — a well-built prompt from M7 (exception report summarizer with RTFC components) that the learner stress-tests
- `edge-case-inputs.md` — 6 variations of input data that test different failure modes (empty spreadsheet, 500-row dataset, data with conflicting dates, data with unusual formatting, etc.)
**Suggested prompts:**
- "Stress test this exception report skill against all 6 failure modes. Show me where it breaks."
- "The skill failed on incomplete data. How should I modify the prompt to handle missing fields gracefully?"
- "Generate a stress test report card for this skill with Pass/Fail ratings and recommended fixes"

### Module 9: Portfolio Builder
**Exercise:** AI helps the learner draft their capstone work product narrative.
**System prompt theme:** Professional portfolio coach for banking AI practitioners. Help the learner articulate what they built, the before/after impact, and the ROI of their AI skill. Ask probing questions to strengthen weak claims: "You said it saves time — how much time per week? What was the process before?" Coach them toward a compelling, evidence-based narrative suitable for professional credentialing. Do NOT write it for them — guide them to write it themselves.
**Sample data:**
- `portfolio-template.md` — the 4-item work product template with section headers and guidance
- `strong-example.md` — an anonymized example of a strong capstone narrative (for reference, not copying)
**Suggested prompts:**
- "I automated the monthly exception report for my operations team. Help me write the narrative for my work product submission."
- "Review my draft narrative and tell me where the claims need stronger evidence or specific numbers."
- "What would make this work product stand out to a reviewer? What's missing?"

## Wiring Refactor

Currently `[module]/page.tsx` has:
```tsx
{moduleNum === 5 && (
  <AIPracticeSandbox ... sandboxConfig={module5SandboxConfig} />
)}
```

Refactor to a config map:
```tsx
// In a new file: content/sandbox-data/aibi-p/index.ts
import { module1SandboxConfig } from './module-1/config';
import { module2SandboxConfig } from './module-2/config';
// ... etc
export const SANDBOX_CONFIGS: Partial<Record<number, SandboxConfig>> = {
  1: module1SandboxConfig,
  2: module2SandboxConfig,
  3: module3SandboxConfig,
  4: module4SandboxConfig,
  5: module5SandboxConfig,
  6: module6SandboxConfig,
  7: module7SandboxConfig,
  8: module8SandboxConfig,
  9: module9SandboxConfig,
};
```

Then in the page:
```tsx
const sandboxConfig = SANDBOX_CONFIGS[moduleNum];
{sandboxConfig && (
  <AIPracticeSandbox
    moduleId={`aibi-p-module-${moduleNum}`}
    product="aibi-p"
    sandboxConfig={sandboxConfig}
  />
)}
```

## Task Breakdown (8 modules, parallelizable)

Each module is independent. Can dispatch up to 4 agents in parallel:

**Wave 1:** Modules 1, 2, 3, 4 (Awareness + Understanding pillars)
**Wave 2:** Modules 6, 7, 8, 9 (Creation + Application pillars)
**Wave 3:** Config map refactor + wiring all modules into page

Estimated: ~3 sample data files + 1 config per module = ~24 new files + 1 refactored page.

## Success Criteria

- All 9 modules have sandbox exercises with unique system prompts
- Sample data is realistic, banking-specific, and contains no real PII
- Suggested prompts guide the learner toward the module's learning outcome
- System prompts produce rich responses (tables, structured analysis)
- `npm run build` passes with zero errors
- Each sandbox exercise is completable in 5-10 messages
