// AiBI In-Depth AI Readiness Diagnostic — v4 Question Pool
//
// 48 questions across 8 dimensions, 6 questions per dimension. 1-4
// points each. Raw range 48-192; normalized to 0-100 on display.
//
// Source: docs/Plans/_assets/aibi-assessment-architecture-2026-05-28.md
// Section 4 — each dimension's "Example diagnostic questions" used as
// the question stem, expanded into a 4-option scale (weak → strong)
// using the "Common weak state" and "Strong state" lines from the
// same section.
//
// Voice: second-person, individual ("you / your work"). The diagnostic
// asks about the respondent's own AI practice, not their institution's
// posture. Question IDs follow `<dim-slug-prefix>-NN` so they sort
// deterministically inside the runner.

import type { AssessmentQuestion } from './types';

export const questions: readonly AssessmentQuestion[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. AI Access Architecture — Approved AI Access
  // ─────────────────────────────────────────────────────────────
  {
    id: 'aaa-01',
    dimension: 'ai-access-architecture',
    prompt: 'Do you know which AI tools are approved for the work you do?',
    options: [
      { label: 'No — I use whatever I find online.', points: 1 },
      { label: 'I have a rough sense, but no formal list to point to.', points: 2 },
      { label: 'I know the approved list and stick to it most of the time.', points: 3 },
      { label: 'I work entirely inside approved tools and know who to ask before trying anything new.', points: 4 },
    ],
  },
  {
    id: 'aaa-02',
    dimension: 'ai-access-architecture',
    prompt: 'Can you describe where AI is being used in your department, or just where you personally use it?',
    options: [
      { label: 'Only my own use — I have no idea what others are doing.', points: 1 },
      { label: 'A vague sense of who else is using it, no shared visibility.', points: 2 },
      { label: 'I know what tools my team uses and roughly which workflows they cover.', points: 3 },
      { label: 'I can name the AI use across my department and what data each use touches.', points: 4 },
    ],
  },
  {
    id: 'aaa-03',
    dimension: 'ai-access-architecture',
    prompt: 'When the work involves sensitive data, do you route your AI requests through a controlled environment?',
    options: [
      { label: 'No — if I need an answer I paste what I have.', points: 1 },
      { label: 'Sometimes, when I remember to.', points: 2 },
      { label: 'Yes — sensitive work goes to an approved internal tool by habit.', points: 3 },
      { label: 'Yes — I follow a clear rule, and I can explain to a colleague why and when.', points: 4 },
    ],
  },
  {
    id: 'aaa-04',
    dimension: 'ai-access-architecture',
    prompt: 'Are the prompts, outputs, or tool activity from your AI work logged anywhere a reviewer could see?',
    options: [
      { label: 'No — once the chat closes, it is gone.', points: 1 },
      { label: 'A few items get saved when I think to do it.', points: 2 },
      { label: 'I save prompt + output for anything that affects real work.', points: 3 },
      { label: 'Yes — a consistent log lives in a place I can hand to a reviewer or examiner.', points: 4 },
    ],
  },
  {
    id: 'aaa-05',
    dimension: 'ai-access-architecture',
    prompt: 'Do you have different access (or different rules) for AI tools depending on your role or task?',
    options: [
      { label: 'No — same access, same rules, no distinctions.', points: 1 },
      { label: "I have a rough idea but it has not been formalized.", points: 2 },
      { label: 'Yes — some tools and data classes are off-limits for some of my work.', points: 3 },
      { label: 'Yes — and the rules are clear enough that I can explain them to a new colleague.', points: 4 },
    ],
  },
  {
    id: 'aaa-06',
    dimension: 'ai-access-architecture',
    prompt: 'Before you adopt a new AI tool, is there a review you go through?',
    options: [
      { label: 'No — I just try things.', points: 1 },
      { label: 'I think about it briefly but no formal step.', points: 2 },
      { label: 'I check with IT or compliance before using anything new with real data.', points: 3 },
      { label: 'I follow a documented review path for any new AI tool before live use.', points: 4 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. Model Risk & Validation — Model Oversight
  // ─────────────────────────────────────────────────────────────
  {
    id: 'mrv-01',
    dimension: 'model-risk-validation',
    prompt: 'Do you know which of your AI-supported workflows actually influence a decision (vs. just drafting)?',
    options: [
      { label: 'No — I have not separated them in my mind.', points: 1 },
      { label: 'I have a rough sense for the high-stakes ones.', points: 2 },
      { label: 'Yes — I can list which AI uses produce drafts vs. which feed real decisions.', points: 3 },
      { label: 'Yes — and I treat the decision-influencing ones with explicit additional review.', points: 4 },
    ],
  },
  {
    id: 'mrv-02',
    dimension: 'model-risk-validation',
    prompt: 'For high-impact AI uses, do you review the AI output before it gets used in production?',
    options: [
      { label: 'No — I use it as-is most of the time.', points: 1 },
      { label: 'I reread it quickly but no formal check.', points: 2 },
      { label: 'Yes — high-impact items get a real review against the source material.', points: 3 },
      { label: 'Yes — and I can describe what specifically I check (figures, sources, customer-facing language).', points: 4 },
    ],
  },
  {
    id: 'mrv-03',
    dimension: 'model-risk-validation',
    prompt: 'Do you watch for changes over time in the quality or behavior of the AI tools you use?',
    options: [
      { label: 'No — quality is whatever I get on the day.', points: 1 },
      { label: 'I notice when something feels off but do not track it.', points: 2 },
      { label: 'I keep informal notes when behavior changes between vendor updates.', points: 3 },
      { label: 'Yes — I track a few quality signals on the AI work that matters most.', points: 4 },
    ],
  },
  {
    id: 'mrv-04',
    dimension: 'model-risk-validation',
    prompt: 'When you override AI output (rewrite, reject, escalate), do you keep a record of why?',
    options: [
      { label: 'No — I just rewrite and move on.', points: 1 },
      { label: 'Sometimes, mentally, for the unusual cases.', points: 2 },
      { label: 'I capture the override for anything that affects a customer or a decision.', points: 3 },
      { label: 'Yes — overrides are part of my saved record alongside the prompt and output.', points: 4 },
    ],
  },
  {
    id: 'mrv-05',
    dimension: 'model-risk-validation',
    prompt: 'When a vendor updates an AI tool you use, do you review what changed?',
    options: [
      { label: 'No — I have never thought about it.', points: 1 },
      { label: 'I notice the release banner but do not read it.', points: 2 },
      { label: 'I skim release notes for tools I depend on.', points: 3 },
      { label: 'Yes — I read changes that could affect behavior, and I re-test prompts that matter.', points: 4 },
    ],
  },
  {
    id: 'mrv-06',
    dimension: 'model-risk-validation',
    prompt: 'Can you describe the limitations of the AI tools you use — what they are bad at, where they break?',
    options: [
      { label: 'No — I have not really thought about limits.', points: 1 },
      { label: 'I have a vague sense of which tasks fail.', points: 2 },
      { label: 'Yes — I can name three to five places AI consistently struggles in my work.', points: 3 },
      { label: 'Yes — and I have a personal rule for what NOT to use AI on.', points: 4 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. Compliance & Explainability — Compliance Clarity
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ce-01',
    dimension: 'compliance-explainability',
    prompt: 'When AI helps you draft customer-facing work, do you review it before it goes out?',
    options: [
      { label: 'No — if it reads well, it goes out.', points: 1 },
      { label: 'I reread it but with no formal check.', points: 2 },
      { label: 'Yes — I review customer-facing AI work against source material before it leaves.', points: 3 },
      { label: 'Yes — and I can describe the specific things I check (accuracy, tone, regulatory fit).', points: 4 },
    ],
  },
  {
    id: 'ce-02',
    dimension: 'compliance-explainability',
    prompt: 'If AI helped support a claim in your work, can you trace that claim back to source material?',
    options: [
      { label: 'No — once AI says it, I usually trust it.', points: 1 },
      { label: 'Sometimes, if I remember to check.', points: 2 },
      { label: 'Yes — for high-stakes work I always verify against source.', points: 3 },
      { label: 'Yes — and I attach the source link or excerpt to my saved record.', points: 4 },
    ],
  },
  {
    id: 'ce-03',
    dimension: 'compliance-explainability',
    prompt: 'For any AI-supported credit-related work, are outputs reviewed for adverse-action and fair-lending risk?',
    options: [
      { label: 'I have not thought about it in those terms.', points: 1 },
      { label: 'I know it applies but no specific review happens.', points: 2 },
      { label: 'Yes — credit-related AI work gets a deliberate fair-lending review.', points: 3 },
      { label: 'Yes — and I can explain how principal reasons are produced and reviewed.', points: 4 },
    ],
  },
  {
    id: 'ce-04',
    dimension: 'compliance-explainability',
    prompt: 'For marketing or communications AI drafts, do compliance claims get checked before publication?',
    options: [
      { label: 'No — drafts go out without a compliance check.', points: 1 },
      { label: 'Maybe, depending on who handles it that day.', points: 2 },
      { label: 'Yes — anything with a claim gets a deliberate review.', points: 3 },
      { label: 'Yes — and the review is documented before publication.', points: 4 },
    ],
  },
  {
    id: 'ce-05',
    dimension: 'compliance-explainability',
    prompt: 'When you decide to accept, edit, or reject AI output, do you record the decision?',
    options: [
      { label: 'No — the decision lives only in my head.', points: 1 },
      { label: 'For unusual cases I might leave a note.', points: 2 },
      { label: 'Yes — I capture the decision for any AI work that affects a customer or a record.', points: 3 },
      { label: 'Yes — reviewer decisions are part of the standard saved record.', points: 4 },
    ],
  },
  {
    id: 'ce-06',
    dimension: 'compliance-explainability',
    prompt: 'Are your AI-supported workflows ready for an audit or examiner review today?',
    options: [
      { label: 'No — I would scramble to reconstruct what happened.', points: 1 },
      { label: 'Some workflows yes, others no.', points: 2 },
      { label: 'Yes — the work I do most often is reconstructable.', points: 3 },
      { label: 'Yes — any reviewer or examiner could see prompt, source, output, edits, and decision.', points: 4 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. Data Security & Guardrails — Data Safety
  // ─────────────────────────────────────────────────────────────
  {
    id: 'dsg-01',
    dimension: 'data-security-guardrails',
    prompt: 'Do you know what categories of data are prohibited from public AI tools at your institution?',
    options: [
      { label: 'No — I have not been told.', points: 1 },
      { label: 'I have a rough sense for the obvious things.', points: 2 },
      { label: 'Yes — I can list the prohibited categories.', points: 3 },
      { label: 'Yes — and I know the underlying reasons (NPI, PII, exam confidentiality, vendor terms).', points: 4 },
    ],
  },
  {
    id: 'dsg-02',
    dimension: 'data-security-guardrails',
    prompt: 'Are customer identifiers, balances, or transaction details ever pasted into unapproved AI tools in your work?',
    options: [
      { label: 'Honestly yes — I sometimes paste real customer detail to get a faster answer.', points: 1 },
      { label: 'Rarely, and only when I forget to strip first.', points: 2 },
      { label: 'No — I strip customer-specific detail before pasting.', points: 3 },
      { label: 'No — and I have a fallback approved tool for when the work actually needs real data.', points: 4 },
    ],
  },
  {
    id: 'dsg-03',
    dimension: 'data-security-guardrails',
    prompt: 'Are the AI tools you use reviewed (by you, IT, or vendor risk) before live use?',
    options: [
      { label: 'No — I just sign up.', points: 1 },
      { label: 'Maybe, for some tools, by someone else.', points: 2 },
      { label: 'Yes — IT or vendor risk has reviewed the tools I rely on.', points: 3 },
      { label: 'Yes — and I check before adopting anything new.', points: 4 },
    ],
  },
  {
    id: 'dsg-04',
    dimension: 'data-security-guardrails',
    prompt: 'Do you check your AI outputs for sensitive data leakage before using them?',
    options: [
      { label: 'No — I trust the output.', points: 1 },
      { label: 'Quick scan for the obvious.', points: 2 },
      { label: 'Yes — I check that nothing sensitive surfaced in the output.', points: 3 },
      { label: 'Yes — and I know the specific patterns to look for in this kind of work.', points: 4 },
    ],
  },
  {
    id: 'dsg-05',
    dimension: 'data-security-guardrails',
    prompt: 'For your most sensitive work, do you limit yourself to controlled internal environments?',
    options: [
      { label: 'No — same tools for everything.', points: 1 },
      { label: 'Sometimes, when I remember.', points: 2 },
      { label: 'Yes — sensitive work stays in approved internal tools.', points: 3 },
      { label: 'Yes — and I can articulate the line where work crosses into "sensitive" territory.', points: 4 },
    ],
  },
  {
    id: 'dsg-06',
    dimension: 'data-security-guardrails',
    prompt: 'Have you been trained on how to strip specifics from your prompts while keeping the structure of the question?',
    options: [
      { label: 'No — I have never seen that taught.', points: 1 },
      { label: 'I have heard the idea but not practiced it.', points: 2 },
      { label: 'Yes — I have learned the technique and use it most of the time.', points: 3 },
      { label: 'Yes — and stripping is automatic; I do not think about it.', points: 4 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. Workflow Orchestration — Workflow Fit
  // ─────────────────────────────────────────────────────────────
  {
    id: 'wo-01',
    dimension: 'workflow-orchestration',
    prompt: 'Can you identify repeated tasks in your week that are well-suited to AI assistance?',
    options: [
      { label: 'No — I have not mapped my work that way.', points: 1 },
      { label: 'A vague list, mostly in my head.', points: 2 },
      { label: 'Yes — I can name three to five recurring tasks that benefit from AI.', points: 3 },
      { label: 'Yes — and I know which ones are highest-value to formalize first.', points: 4 },
    ],
  },
  {
    id: 'wo-02',
    dimension: 'workflow-orchestration',
    prompt: 'For your AI-assisted work, can you describe the steps from input to AI draft to review to final output?',
    options: [
      { label: 'No — every time is ad hoc.', points: 1 },
      { label: 'A rough mental model, nothing written.', points: 2 },
      { label: 'Yes — for the top recurring tasks I have a clear sequence.', points: 3 },
      { label: 'Yes — and the steps are written down clearly enough for a colleague to follow.', points: 4 },
    ],
  },
  {
    id: 'wo-03',
    dimension: 'workflow-orchestration',
    prompt: 'When a prompt works well, do you save and reuse it?',
    options: [
      { label: 'No — I rewrite from scratch each time.', points: 1 },
      { label: 'Occasionally, in a doc somewhere.', points: 2 },
      { label: 'Yes — I keep a personal library of prompts that work.', points: 3 },
      { label: 'Yes — and my prompts have a consistent structure and are organized by task.', points: 4 },
    ],
  },
  {
    id: 'wo-04',
    dimension: 'workflow-orchestration',
    prompt: 'For document workflows, do you design checkpoints where a human reviews before the next step?',
    options: [
      { label: 'No — work flows through without explicit checkpoints.', points: 1 },
      { label: 'Sometimes, for the obvious cases.', points: 2 },
      { label: 'Yes — my recurring workflows have review steps built in.', points: 3 },
      { label: 'Yes — and the checkpoints are written into the workflow doc, not just in my head.', points: 4 },
    ],
  },
  {
    id: 'wo-05',
    dimension: 'workflow-orchestration',
    prompt: 'When AI assists with a multi-step task, are the boundaries (what AI does vs. what you do) clear?',
    options: [
      { label: 'No — boundaries blur.', points: 1 },
      { label: 'Roughly clear, situation by situation.', points: 2 },
      { label: 'Yes — for recurring work the boundary is consistent and intentional.', points: 3 },
      { label: 'Yes — and I can describe the boundary in writing for a colleague.', points: 4 },
    ],
  },
  {
    id: 'wo-06',
    dimension: 'workflow-orchestration',
    prompt: 'Are your most successful AI workflows documented as procedures someone else could follow?',
    options: [
      { label: 'No — everything lives only in my head.', points: 1 },
      { label: 'A few notes exist but not full procedures.', points: 2 },
      { label: 'Yes — one or two workflows are documented step-by-step.', points: 3 },
      { label: 'Yes — and a colleague has actually used my docs to reproduce the work.', points: 4 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. Bounded Autonomy & Human Review — Human Control
  // ─────────────────────────────────────────────────────────────
  {
    id: 'bahr-01',
    dimension: 'bounded-autonomy-human-review',
    prompt: 'For high-risk AI outputs (customer-facing, regulated decisions), is there a defined human reviewer?',
    options: [
      { label: 'No — I review my own work and that is it.', points: 1 },
      { label: 'Sometimes, depending on the item.', points: 2 },
      { label: 'Yes — high-risk AI work routes to a named reviewer.', points: 3 },
      { label: 'Yes — and the reviewer pathway is documented for each kind of high-risk work.', points: 4 },
    ],
  },
  {
    id: 'bahr-02',
    dimension: 'bounded-autonomy-human-review',
    prompt: 'Are the reviewers for your AI-assisted work named by role, not just "whoever is around"?',
    options: [
      { label: 'No — review is informal.', points: 1 },
      { label: 'Sometimes, by role.', points: 2 },
      { label: 'Yes — high-stakes work goes to specific roles.', points: 3 },
      { label: 'Yes — and the role assignments are written down and known by everyone.', points: 4 },
    ],
  },
  {
    id: 'bahr-03',
    dimension: 'bounded-autonomy-human-review',
    prompt: 'Do you have clear rules for when AI output must be escalated rather than acted on?',
    options: [
      { label: 'No — escalation is judgment-by-judgment.', points: 1 },
      { label: 'Rough triggers exist but are not written down.', points: 2 },
      { label: 'Yes — clear escalation triggers exist for the work I do.', points: 3 },
      { label: 'Yes — and I can articulate the triggers to a colleague without thinking.', points: 4 },
    ],
  },
  {
    id: 'bahr-04',
    dimension: 'bounded-autonomy-human-review',
    prompt: 'Are final decisions separated from the AI draft (i.e., the AI does not "decide")?',
    options: [
      { label: 'Sometimes the AI output IS the decision.', points: 1 },
      { label: 'Mostly separated, but blurry on small calls.', points: 2 },
      { label: 'Yes — AI drafts, a human decides, every time.', points: 3 },
      { label: 'Yes — and the human decision is explicitly captured separately from the AI output.', points: 4 },
    ],
  },
  {
    id: 'bahr-05',
    dimension: 'bounded-autonomy-human-review',
    prompt: 'When a reviewer reviews AI-assisted work, is that review captured?',
    options: [
      { label: 'No — review is verbal or implicit.', points: 1 },
      { label: 'A note in some cases.', points: 2 },
      { label: 'Yes — reviewer signoff is recorded for high-stakes items.', points: 3 },
      { label: 'Yes — reviewer signoff is a standard field on the saved record.', points: 4 },
    ],
  },
  {
    id: 'bahr-06',
    dimension: 'bounded-autonomy-human-review',
    prompt: 'Do you know specifically which decisions AI may NOT make in your work?',
    options: [
      { label: 'No — I have not drawn that line.', points: 1 },
      { label: 'I have a rough sense, situation-by-situation.', points: 2 },
      { label: 'Yes — I have a personal "AI does not decide this" list.', points: 3 },
      { label: 'Yes — and it aligns with the institutional rule, not just my judgment.', points: 4 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. Vendor Risk & Interoperability — Vendor Control
  // ─────────────────────────────────────────────────────────────
  {
    id: 'vri-01',
    dimension: 'vendor-risk-interoperability',
    prompt: 'Do you know which of your vendor tools have AI features inside them?',
    options: [
      { label: 'No — I had not really thought about it.', points: 1 },
      { label: 'A couple of them — the obvious ones.', points: 2 },
      { label: 'Yes — I can name AI features in most of my tools.', points: 3 },
      { label: 'Yes — and I track which features turn on by default and which I have to enable.', points: 4 },
    ],
  },
  {
    id: 'vri-02',
    dimension: 'vendor-risk-interoperability',
    prompt: 'Do you know whether your vendor AI uses your data (or customer data) for model training?',
    options: [
      { label: 'No — I have never checked.', points: 1 },
      { label: 'For one or two big vendors, yes.', points: 2 },
      { label: 'Yes — for the AI vendors I rely on, I know the training-data policy.', points: 3 },
      { label: 'Yes — and I know which vendors offer opt-out and which do not.', points: 4 },
    ],
  },
  {
    id: 'vri-03',
    dimension: 'vendor-risk-interoperability',
    prompt: 'Are AI-enabled vendors reviewed by your institution before use?',
    options: [
      { label: 'No — I just sign up for what I need.', points: 1 },
      { label: 'Some yes, some no.', points: 2 },
      { label: 'Yes — anything new with AI goes through review before live use.', points: 3 },
      { label: 'Yes — and there is a standard review the institution applies to AI vendors.', points: 4 },
    ],
  },
  {
    id: 'vri-04',
    dimension: 'vendor-risk-interoperability',
    prompt: 'When you use a vendor AI tool, do you understand the output well enough to use it confidently?',
    options: [
      { label: 'No — sometimes I cannot tell why it said what it said.', points: 1 },
      { label: 'Mostly, but I struggle with edge cases.', points: 2 },
      { label: 'Yes — I can explain the output enough to defend my use of it.', points: 3 },
      { label: 'Yes — and I know the limits of what the vendor will explain.', points: 4 },
    ],
  },
  {
    id: 'vri-05',
    dimension: 'vendor-risk-interoperability',
    prompt: 'Are vendor model or feature changes communicated to you (or someone you trust)?',
    options: [
      { label: 'No — I only notice when something breaks.', points: 1 },
      { label: 'Occasionally, through release notes I read.', points: 2 },
      { label: 'Yes — material changes are flagged through a process I can rely on.', points: 3 },
      { label: 'Yes — and I or my institution review changes before they affect live work.', points: 4 },
    ],
  },
  {
    id: 'vri-06',
    dimension: 'vendor-risk-interoperability',
    prompt: 'Do you avoid relying on AI vendor outputs you cannot explain or verify?',
    options: [
      { label: 'No — I use whatever the tool gives me.', points: 1 },
      { label: 'I have informal limits but no clear rule.', points: 2 },
      { label: 'Yes — for high-stakes work I require explainable outputs.', points: 3 },
      { label: 'Yes — and I can articulate why some vendor outputs are safe to use and others are not.', points: 4 },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 8. Governance Roles & Human Capital — People & Governance
  // ─────────────────────────────────────────────────────────────
  {
    id: 'grhc-01',
    dimension: 'governance-roles-human-capital',
    prompt: 'Is there a named executive at your institution who owns AI readiness?',
    options: [
      { label: 'No — AI ownership is unclear.', points: 1 },
      { label: 'There is an informal champion.', points: 2 },
      { label: 'Yes — a specific executive is accountable.', points: 3 },
      { label: 'Yes — and I know what that executive measures and reports on.', points: 4 },
    ],
  },
  {
    id: 'grhc-02',
    dimension: 'governance-roles-human-capital',
    prompt: 'Is there a group at your institution (formal or informal) reviewing AI use?',
    options: [
      { label: 'No.', points: 1 },
      { label: 'A loose group meets occasionally.', points: 2 },
      { label: 'Yes — a cross-functional group meets on a regular cadence.', points: 3 },
      { label: 'Yes — and its decisions actually shape what I can and cannot do with AI.', points: 4 },
    ],
  },
  {
    id: 'grhc-03',
    dimension: 'governance-roles-human-capital',
    prompt: 'Is your role-specific AI training (vs. general "what is AI") part of how you work?',
    options: [
      { label: 'No — training has been generic.', points: 1 },
      { label: 'A bit of role-specific examples, not much depth.', points: 2 },
      { label: 'Yes — I get role-specific examples I can apply directly.', points: 3 },
      { label: 'Yes — and the training keeps pace with what I actually do at work.', points: 4 },
    ],
  },
  {
    id: 'grhc-04',
    dimension: 'governance-roles-human-capital',
    prompt: 'Are the acceptable-use rules for AI at your institution clear to you?',
    options: [
      { label: 'No — I make my own judgment calls.', points: 1 },
      { label: "I have read something but cannot find it now.", points: 2 },
      { label: 'Yes — I know the rules and where to find them.', points: 3 },
      { label: 'Yes — and I can apply them to edge cases without asking.', points: 4 },
    ],
  },
  {
    id: 'grhc-05',
    dimension: 'governance-roles-human-capital',
    prompt: 'Is your manager equipped to coach safe, useful AI work?',
    options: [
      { label: 'No — they know less about AI than I do.', points: 1 },
      { label: 'Sometimes — for general things.', points: 2 },
      { label: 'Yes — I can ask them practical AI questions and get real answers.', points: 3 },
      { label: 'Yes — and they actively coach AI use as part of how the team works.', points: 4 },
    ],
  },
  {
    id: 'grhc-06',
    dimension: 'governance-roles-human-capital',
    prompt: 'Is AI framed at your institution as an amplifier of your judgment, not a replacement for it?',
    options: [
      { label: 'No — leadership talks about AI replacing tasks.', points: 1 },
      { label: 'It is unclear.', points: 2 },
      { label: 'Yes — leadership frames AI as helping you work better.', points: 3 },
      { label: 'Yes — and that framing shows up in policy, training, and day-to-day expectations.', points: 4 },
    ],
  },
];
