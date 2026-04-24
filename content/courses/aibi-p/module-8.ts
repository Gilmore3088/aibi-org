// AiBI-P Module 8: Summarization and Communication
// Pillar: Application | Estimated: 35 minutes
// Key Output: Iterated skill version with improvement notes

import type { Module } from './types';

export const module8: Module = {
  number: 8,
  id: 'm8-test-iterate-share',
  title: 'Summarization and Communication',
  pillar: 'application',
  estimatedMinutes: 35,
  keyOutput: 'Iterated skill with version notes',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m8_test_iterate_share',
  sections: [
    {
      id: 'm8-opening',
      title: 'Reliability is the Residue of Design',
      content: `A skill written once and never revisited is a starting point, not a finished tool. The practitioners who build lasting value with AI are the ones who treat their skills as living documents — testing them against edge cases, documenting what works and what fails, and iterating toward consistent performance.

The Module 8 objective is to take the skill you built in Module 7 and put it through a structured iteration cycle. By the end, you will have a versioned skill file with documented improvements and a clear record of what changed and why.

**Why iteration matters:**

> The first version of any skill is built from intuition. The second version is built from evidence.

The gap between version 1.0 and version 1.2 is almost always the difference between an AI tool that occasionally disappoints and one that reliably performs.`,
    },
    {
      id: 'm8-litmus-test',
      title: 'The Litmus Test',
      content: `> **If you find yourself editing the output after the skill runs — correcting, restructuring, or rewriting — stop. The skill needs improvement, not the output.**

This is the single most important principle in skill iteration. It reframes the question.

When a skill produces output that requires manual correction, the instinct is to fix the output and move on. The correct response is to treat the need for correction as a diagnostic signal: something in the skill is underspecified, missing, or wrong. Fix the skill so the next run produces output you can use directly.

**Why this matters in banking operations:**

A BSA analyst who runs a SAR Narrative Skill and then spends 20 minutes editing the output has not saved 30 minutes — they have saved 10. And they are encoding a false impression of the skill's performance: it appears to be working because the final output is good, but the good output required significant human labor that the skill was supposed to eliminate.

More importantly: the editing is invisible. The next analyst who uses the same skill will face the same 20 minutes of correction work without knowing it is coming.

The Litmus Test makes skill quality visible. If you are editing outputs, the skill has a defect. Find which component is producing the defective output — Role, Context, Task, Output Format, or Constraints — and fix that component specifically. Then test again.

**Applying the Litmus Test in practice:**

After every skill run, ask one question: "Did I use this output directly, or did I modify it?"

- Used directly: the skill is performing well for this input type.
- Modified formatting: likely an Output Format failure. Show a more precise template.
- Modified content: likely a Task failure (underspecified deliverable) or Gotcha Section gap (failure pattern not yet documented).
- Added caveats or removed inappropriate content: likely a Constraints failure. Make the guardrail explicit.
- Rewrote from scratch: the Role or Context is too generic. The skill is not grounded in the right expertise or institutional setting.

> Document every correction in the Gotcha Section as a binding instruction. This is how a skill learns.`,
    },
    {
      id: 'm8-iteration-protocol',
      title: 'The Iteration Protocol',
      content: `The Iteration Protocol is a structured process for improving AI skills based on observed outputs. It has three steps.

**Step 1: Stress Test**

Run your skill against at least three real inputs from your actual workflow. Do not use ideal, clean examples — use messy, incomplete, or edge-case inputs that represent what you actually encounter. Observe the outputs carefully.

Questions to ask of each output:

1. Did the AI follow the Role specification? Did it produce expert-level outputs or generic ones?
2. Did the Task get executed precisely? Were the specific deliverables produced?
3. Was the Format correct? Did the output match the specified structure?
4. Were the Constraints respected? Did anything appear that the constraints should have prevented?
5. What did the output contain that surprised you — positively or negatively?

**Step 2: Diagnose**

Categorize each failure or unexpected output by component. "The AI produced bullets when I asked for a table" is a Format failure. "The AI made a compliance determination instead of flagging for review" is a Constraint failure. "The output didn't account for the specific risk framework I work with" is a Context failure.

> Categorize by component to fix root causes, not symptoms. Adding another sentence to a bloated system prompt is often less effective than rewriting the specific component that failed.

**Step 3: Revise and Version**

Make targeted revisions based on your diagnosis. Document what changed and why in a comment at the top of the Markdown file. Increment the version number.

Version numbering convention: major.minor (e.g., 1.0 → 1.1 for small improvements, 1.0 → 2.0 for significant restructuring).

Re-test after each revision to verify the fix worked and did not introduce new failures.`,
    },
    {
      id: 'm8-degrees-of-freedom',
      title: 'Degrees of Freedom: Calibrating Constraint Tightness',
      content: `One of the most consequential design decisions in any skill is how tightly to constrain the AI's behavior.

> The answer is not "as tight as possible" — it is "tight where variance is a liability, loose where judgment adds value."

**Tight constraints — compliance and operational tasks**

When a skill handles tasks where deviation from a defined output has regulatory, credit, or operational consequences, constraints should be tight. The AI should have minimal latitude to vary its approach, format, or language.

Indicators that tight constraints are warranted:
- The output will be used in a regulatory filing, exam response, or compliance determination
- The output format is specified by an external standard (FinCEN, FDIC, FFIEC) or internal policy
- Multiple staff members will use this skill and consistency across users is required
- The output will be reviewed by an examiner, auditor, or board member

Examples: SAR narrative drafting (tight — FinCEN elements, legal tone, specific language requirements); loan committee memo formatting (tight — institutional template, defined approval language); exception report triage (tight — categories and escalation thresholds are defined by policy).

**Loose constraints — research and advisory tasks**

When a skill handles tasks where the AI's analytical judgment improves the output, over-constraining reduces quality. Tight process constraints on a research task tell the AI exactly how to think — which eliminates the adaptive reasoning that makes research valuable.

Indicators that loose constraints are appropriate:
- The output is a first draft or input to a human decision, not a final determination
- The value of the output comes from surfacing unexpected connections or perspectives
- The task type is creative, analytical, or exploratory rather than procedural
- You want the AI to challenge assumptions, not confirm them

Examples: Competitive landscape research (loose — you want unexpected observations, not just confirmation of known facts); strategic scenario analysis (loose — the value is in surfacing risks you had not considered); Devil's Advocate skill (loose by design — constraining the challenge response defeats the purpose).

**The calibration question:**

> For every constraint you write, ask: "Am I preventing a genuine failure mode, or am I constraining out of anxiety about what the AI might do?"

Constraints written from anxiety produce brittle skills that break on legitimate inputs. Constraints written from observed failure patterns produce skills that get consistently better.`,
    },
    {
      id: 'm8-ab-testing',
      title: 'A/B Testing Your Skill: Is Version 2 Actually Better?',
      content: `When you revise a skill based on observed failure, it is tempting to assume the revision fixed the problem. This assumption is often wrong. The revision may have fixed one failure while introducing a subtler one — or it may have produced outputs that feel better on casual inspection without actually performing better on the inputs that matter.

**The A/B test for skill iteration:**

Before retiring version 1 of a skill, run both versions against the same set of inputs — ideally the ones that prompted the revision in the first place, plus at least two inputs that were working well before.

Questions to evaluate:

1. Does version 2 fix the specific failure that prompted the revision?
2. Does version 2 maintain the performance that version 1 had on inputs that were working?
3. Is version 2 producing genuinely better outputs, or merely different outputs?

The last question is the hardest to answer objectively. "Different" is not the same as "better." A version 2 output that reads more formally is not necessarily more useful than a version 1 output that was clearer and more actionable. Evaluate against the actual use case: will this output require less manual correction? Does it match the required format more precisely? Does it flag the right items for human review?

**The difference between better and different:**

A BSA analyst revises their SAR Narrative Skill to produce longer, more detailed outputs. The version 2 outputs are more thorough — but they also require more editing before submission because they exceed the recommended narrative length guidelines. Version 2 is longer and different. It is not better.

A lending analyst revises their Loan QC Skill to flag missing items with [PRIORITY: HIGH] / [PRIORITY: STANDARD] labels instead of a flat list. The version 2 outputs require less interpretation from the reviewer and surface the two or three critical gaps immediately. Version 2 is different and demonstrably better for the workflow it serves.

**Practical A/B testing in community banking:**

Run both versions on the same three to five real work inputs from the past week. Do not use invented or idealized examples — use the actual messy, variable inputs your workflow produces.

> Score each output on one criterion only: how much manual correction did it require? The version requiring less correction is better.`,
    },
    {
      id: 'm8-skill-portability',
      title: 'Skill Portability Across Platforms',
      content: `One of the most important properties of a well-written Markdown skill is portability. A skill written for ChatGPT Custom Instructions should work in Claude's Project system prompt with minimal modification. This is not accidental — it is a property of plain-language instruction that does not depend on platform-specific syntax.

**Cross-platform compatibility rules:**

1. **Write in plain language, not prompt syntax.** Avoid platform-specific constructs like ChatGPT's special tags or Claude's XML-style formatting. Plain, instructional prose works across all major platforms.
2. **Test on your primary platform first.** Optimize for the platform you use daily. Cross-platform compatibility is a bonus, not a first-order requirement.
3. **Store skills as .md files.** Markdown is the universal format. A skill stored as a .md file can be pasted into any platform's configuration interface without conversion.
4. **Version-track your skills.** As platforms update, skill behavior can shift. Keeping version notes and re-testing periodically catches platform-driven regressions.

**Skills as institutional assets:**

A well-built skill has value beyond the individual who created it. A Loan QC Skill built by your most experienced credit analyst represents institutional knowledge that can be shared with every lending staff member. A Compliance Narrative Skill built by your BSA Officer captures regulatory interpretation expertise that would otherwise exist only in that officer's head.

> Skills are institutional knowledge made portable and repeatable.

The Sharing Ladder in the activity below formalizes this progression from personal tool to institutional asset.`,
    },
    {
      id: 'm8-when-to-reevaluate',
      title: 'When to Re-evaluate Your Skills',
      content: `Skills are not fire-and-forget. Certain events — both internal and external — are reliable signals that a skill needs review, even if it appears to be working. The table below defines the five triggers and the appropriate response to each.

A skill that passes all five review triggers without changes is a healthy skill. A skill that has not been reviewed in over a year has almost certainly drifted — either because the institution's context has changed, the platform has changed, or the underlying model's capabilities have evolved past what the skill was designed to compensate for.`,
    },
    {
      id: 'm8-margin-of-error-progression',
      title: 'The Margin of Error Progression Framework',
      content: `> Not all AI use cases carry the same consequence if the AI makes an error.

The Margin of Error Progression Framework categorizes banking AI use cases by their consequence of failure — and recommends different verification protocols accordingly.

**Category A — Low Consequence (First Draft)**

Examples: Drafting internal communications, creating meeting agendas, formatting reports, brainstorming ideas, creating training materials.

Error consequence: Easily corrected by a human reviewer. An error in a draft internal memo is caught before it goes anywhere.

Verification protocol: Single review by the author. Check for factual accuracy and tone. No secondary review required.

**Category B — Moderate Consequence (Verify Before Use)**

Examples: Customer-facing communications drafts, policy summaries, research synthesis, competitive analysis.

Error consequence: Reaches a customer or external audience if uncaught. A hallucinated fact in a member newsletter creates trust risk.

Verification protocol: Author review plus one additional check against primary sources for any specific claims. Primary source verification for any cited statistics or regulatory references.

**Category C — High Consequence (Requires Validation)**

Examples: Compliance findings, risk assessments, credit analysis inputs, SAR narrative elements.

Error consequence: May influence a regulatory filing, credit decision, or risk management action.

Verification protocol: Full independent verification against primary sources. Human expert review before use. AI output treated as a first-draft research input, not a final determination.

**Category D — Critical (AI Assistance Only)**

Examples: BSA/AML determinations, credit decisions, final compliance assessments, exam responses.

Error consequence: Regulatory, legal, or credit risk impact if wrong.

Verification protocol: AI provides supporting analysis only. The determination is made entirely by a qualified human. The AI output is cited as a research input in the work file, not as the basis for the decision.`,
    },
  ],
  tables: [
    {
      id: 'm8-when-to-reevaluate',
      caption: 'When to Re-evaluate Your Skills — Five Triggers and Appropriate Responses',
      columns: [
        { header: 'Trigger', key: 'trigger' },
        { header: 'What to Do', key: 'action' },
      ],
      rows: [
        {
          trigger: 'Model change — the AI platform you rely on releases a significant model update',
          action: 'Re-run your three most-used skills against the same test inputs used in the previous version check. Your Gotcha Section may contain instructions that solved problems the new model no longer has — these can often be removed, simplifying the skill. Conversely, the new model may behave differently on edge cases — test those specifically.',
        },
        {
          trigger: 'Tool change — you or your institution moves from one AI platform to another',
          action: 'Skills are portable but platform behaviors differ. Validate every skill on the new platform before distributing it to colleagues. Pay particular attention to format fidelity — tables, numbered lists, and structured headers render differently across platforms.',
        },
        {
          trigger: 'Results degrade — outputs that were consistent begin requiring more manual correction',
          action: 'Before assuming the model changed, ask: did your institutional context change? Did your templates, regulatory focus, or workflow change since the skill was built? Degrading results are often caused by stale context, not model regression. Audit the Context section first.',
        },
        {
          trigger: 'Before scaling — you are about to share a skill with more than 10 colleagues or make it an institution-wide standard',
          action: 'Run structured evaluation across a representative set of real inputs — at minimum 10 examples covering normal cases, edge cases, and the failure patterns documented in the Gotcha Section. A skill that performs well for its original builder may behave differently when used by colleagues with different input patterns and workflow contexts.',
        },
        {
          trigger: 'Quarterly review — no specific event, but the skill has not been reviewed in 90 days',
          action: 'Even if nothing appears broken, run a brief review. Capability uplift skills in particular may have been surpassed by the base model — if the model now handles the task well without the skill\'s scaffolding, the skill may be obsolete or reducible. Encoded preference skills rarely become obsolete but may need context updates as your institution\'s workflows evolve.',
        },
      ],
    },
    {
      id: 'm8-degrees-of-freedom',
      caption: 'Degrees of Freedom — Calibrating Constraint Tightness by Task Type',
      columns: [
        { header: 'Task Type', key: 'taskType' },
        { header: 'Appropriate Constraint Level', key: 'level' },
        { header: 'Banking Examples', key: 'examples' },
        { header: 'Risk of Getting It Wrong', key: 'risk' },
      ],
      rows: [
        {
          taskType: 'Compliance and regulatory tasks — outputs used in filings, exam responses, or determinations',
          level: 'Tight — minimal AI latitude. Specify format, language, required elements, and explicit prohibitions.',
          examples: 'SAR narrative drafting, ECOA adverse action notice drafting, BSA alert dispositions, exam response summaries',
          risk: 'Under-constrained: AI produces outputs that look professional but contain determinations, unsupported conclusions, or incorrect legal tone — requiring significant rework and creating compliance risk if used without careful review.',
        },
        {
          taskType: 'Operational tasks — outputs used in defined workflows with specified formats',
          level: 'Tight on format and output structure. Moderate latitude on analytical sequencing.',
          examples: 'Loan file documentation checklist, exception report triage, daily branch operations summary, variance commentary generation',
          risk: 'Under-constrained on format: inconsistent outputs across staff make the skill unusable as an institutional standard. Over-constrained on process: rigid sequencing produces brittle outputs on inputs that deviate from the expected pattern.',
        },
        {
          taskType: 'Research and analysis tasks — outputs that inform human decisions',
          level: 'Loose — give the AI latitude to surface unexpected observations and challenge assumptions.',
          examples: 'Regulatory change monitoring, competitive landscape research, ALCO rate scenario analysis, strategic initiative research',
          risk: 'Over-constrained: the AI confirms what you already know rather than surfacing what you do not. Tight process constraints on research tasks eliminate the adaptive reasoning that makes AI research valuable.',
        },
        {
          taskType: 'Creative and drafting tasks — first-draft outputs reviewed and refined by humans',
          level: 'Loose on content and structure. Tight on brand voice, compliance flags, and channel-specific requirements.',
          examples: 'Member communication drafting, campaign copy development, board presentation narratives, training material development',
          risk: 'Over-constrained: outputs are technically correct but generic and require as much rewriting as writing from scratch. Under-constrained on compliance: AI produces outputs without appropriate regulatory disclosure flags, creating risk when distributed without review.',
        },
      ],
    },
  ],
  activities: [
    {
      id: '8.1',
      title: 'Iterate and Save',
      description: 'Take your skill from Module 7 and run it through the three-step Iteration Protocol. Test it against two real work inputs, diagnose any failures by component, and document your improvements. Save a new version with iteration notes.',
      type: 'iteration',
      fields: [
        {
          id: 'test-input-1',
          label: 'Describe the first real input you tested your skill against (do not include Tier 3 data — describe the type and general content)',
          type: 'textarea',
          minLength: 20,
          required: true,
          placeholder: 'e.g., A loan document package with incomplete collateral documentation and an unusual property type. Three items were missing from the standard checklist.',
        },
        {
          id: 'output-assessment-1',
          label: 'How did the skill perform on input 1? What worked well? What failed?',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'Describe what the AI produced. Did it follow the Role, Task, Format, and Constraints? Were there unexpected outputs? Which component failed if something went wrong?',
        },
        {
          id: 'test-input-2',
          label: 'Describe the second real input you tested (edge case or challenging scenario)',
          type: 'textarea',
          minLength: 20,
          required: true,
          placeholder: 'e.g., A more complex or unusual version of the same task type. The edge case is where skills most often break.',
        },
        {
          id: 'output-assessment-2',
          label: 'How did the skill perform on input 2? Did the edge case reveal any failures?',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'Describe the output and any failures. Edge cases often reveal constraint gaps — what should have been prevented but was not?',
        },
        {
          id: 'revision-notes',
          label: 'What changes did you make to improve the skill? Describe the revision and the component it addressed.',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'e.g., "Added a Constraint: Never produce output in paragraph form — always use the specified table format." or "Strengthened the Role: Added specific expertise in [topic] to improve the quality of [specific output type]."',
        },
        {
          id: 'sharing-ladder-level',
          label: 'Where does this skill sit on the Sharing Ladder? Is it ready to share with your team, or still in personal sandbox testing?',
          type: 'radio',
          required: true,
          options: [
            { value: 'personal', label: 'Personal — still in testing, not ready to share' },
            { value: 'team', label: 'Team — ready to share with my immediate team for peer review' },
            { value: 'institution', label: 'Institution — polished enough for institution-wide distribution' },
            { value: 'not-sure', label: 'Not sure — needs one more iteration' },
          ],
        },
      ],
      completionTrigger: 'save-response',
    },
  ],
} as const;
