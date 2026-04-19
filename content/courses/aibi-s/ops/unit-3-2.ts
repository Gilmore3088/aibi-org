import type { Unit } from '../../../../lib/aibi-s/types';
import { opsDepartmentHeadPhase1 } from './persona-dept-head-phase-1';

export const opsUnit3_2: Unit = {
  id: '3.2',
  trackCode: 'ops',
  phase: 3,
  title: 'Capstone and Certification',
  summary: 'The AiBI-S/Ops capstone submission: deployed automation, operating model, skill library, and defended artifact bundle. This unit defines what a submission looks like, where candidates typically fall short, and how to assemble the package.',
  beats: [
    {
      kind: 'learn',
      title: 'The capstone submission package',
      body: `The AiBI-S Specialist certification in Operations is not a final exam. It's a submission of evidence — evidence that you have moved from understanding AI automation to operating it institutionally.

**The four components of a complete submission:**

**1. Deployed Automation** — One or more skills that have been in production, with measurement data.
- Required: RTFC+D+G documentation for each skill
- Required: Baseline metrics captured before deployment
- Required: 90-day measurement data (or pro-rated if deployment is more recent)
- Required: Compliance inventory reference number or pending-approval documentation
- Common gap: Measurement data shows the skill ran, but no baseline was captured before deployment. Without a before state, the ROI claim is unverifiable.

**2. Operating Model** — A written document (1-3 pages) describing how your department governs AI automation on an ongoing basis.
- Sections required: Workflow selection criteria, skill authoring standard, data-tier classification process, HITL checkpoint model, failure-mode escalation process, quarterly review cadence
- Common gap: The operating model describes what should happen but omits who owns each process. An operating model with no named owners is a policy document, not an operating model.

**3. Skill Library** — A minimum of three library entries meeting the Unit 3.1 specification.
- Each entry must have: Skill ID, owner pair, data tier, regulatory framework(s), failure modes, retire trigger, compliance inventory status
- Common gap: Library entries that haven't cleared the use-case inventory process and have no documentation of why they're deployed without it.

**4. Defended Artifact Bundle** — The artifacts from your Defend beats across Phases 1-3.
- Required: All three defended artifacts from Units 1.1/1.2, 2.1, and 2.2/3.1 (refined versions, not first drafts)
- Required: A one-paragraph reflection on the strongest challenge you received in any Defend beat and what you changed as a result
- Common gap: Submitting first-draft rebuttal text rather than refined versions. The defended artifact is the post-refinement document — not the raw conversation.

**What evaluators look at first:**
The operating model and the failure-mode register. These two artifacts tell the evaluator more about institutional readiness than any individual skill. An institution where the operating model is three bullet points has not built capability — it has built a skill with no governance infrastructure around it.

**Pillar A + B + C convergence:** The capstone is the one place where all three pillars are assessed together. Accessible (library, operating model — others can use what you built). Boundary-Safe (data tier, HITL, failure modes, compliance documentation). Capable (deployed automation with measurable outcomes). All three must be present. A submission that scores 4/4 on Capable and 1/4 on Boundary-Safe does not pass.`,
      hooks: {
        pillar: 'A',
        frameworks: ['AIEOG', 'SR 11-7', 'Interagency TPRM'],
        dataTiers: [1, 2, 3],
      },
    },

    {
      kind: 'practice',
      simKind: 'decision',
      scenario: `Your capstone submission is due in 48 hours. You've been building toward this for 8 weeks. You do a final review and find the following:

- **Deployed Automation:** Skill in production for 6 weeks. Measurement data collected. Compliance inventory entry: pending — submitted 4 weeks ago, not yet approved.
- **Operating Model:** Drafted, 2 pages. Sections complete except: the quarterly review cadence section says "TBD — will establish after certification."
- **Skill Library:** Three entries. Entry 3 was added last week and has no backup owner listed — "recruiting for that role."
- **Defended Artifact Bundle:** Units 1.1 and 2.1 refined artifacts present. Unit 2.2 artifact: you submitted the first-draft rebuttal by mistake. The refined version is in your notes but hasn't been formatted.`,
      question: 'Which gap puts the submission at GREATEST risk of rejection?',
      options: [
        {
          id: 'opt-compliance-pending',
          label: 'The pending Compliance inventory entry. A skill in production without Compliance approval is a compliance incident in the submission itself.',
          isCorrect: false,
          feedback: 'The pending Compliance entry is a real risk, but the evaluator is looking for evidence that you have a functioning governance process — not that every process has concluded. A 4-week pending inventory entry with documentation of the submission date shows you followed the process. The evaluator will note it, but it\'s not the highest rejection risk if your operating model explains the pending-approval workflow.',
        },
        {
          id: 'opt-operating-model',
          label: 'The "TBD" quarterly review cadence in the operating model. An operating model with deferred sections signals that the governance infrastructure hasn\'t been built — only described.',
          isCorrect: true,
          feedback: 'Correct. "TBD — will establish after certification" in the operating model is the most damaging gap. The evaluator\'s primary test is: does this department have a governance infrastructure that will sustain AI automation without this person\'s continued personal involvement? A deferred section in the operating model answers that question with "no." It signals that the operating model was written for the submission, not for the department. Fix this before submitting — even a draft quarterly review cadence is better than a TBD.',
        },
        {
          id: 'opt-library-backup',
          label: 'The missing backup owner in library Entry 3. An unowned skill in the library is a shadow-AI risk inside the submission itself.',
          isCorrect: false,
          feedback: 'Missing backup owner is a real gap and the evaluator will flag it. But a library entry with a documented "recruiting for that role" gap is different from a library entry with no governance structure at all. You can mitigate this by naming a temporary backup owner (even a manager) until the role is filled and documenting that clearly. It\'s fixable in 10 minutes.',
        },
        {
          id: 'opt-artifact-bundle',
          label: 'The unformatted Unit 2.2 refined artifact. Submitting a first draft in the artifact bundle undermines the entire defended-artifact narrative.',
          isCorrect: false,
          feedback: 'This is fixable in 2 hours and you should fix it — format the refined version tonight. But it\'s the lowest-stakes gap in this list. The defended artifact bundle quality affects your dimension score; it\'s unlikely to cause outright rejection if the rest of the submission is strong. Address the operating model gap first.',
        },
      ],
      hooks: {
        pillar: 'A',
        frameworks: ['AIEOG', 'Interagency TPRM'],
        dataTiers: [2],
      },
    },

    {
      kind: 'apply',
      prompt: `Assemble the outline of your capstone submission package.

For each of the four components, write:
- **What you have ready** — specific artifacts, files, or documents that are complete
- **What is still TBD** — gaps, pending items, or sections not yet written
- **What you will do in the next 7 days** — one or two specific actions per gap

Then write a one-paragraph reflection: What was the strongest challenge you received in any Defend beat across this course, and what did you change as a direct result of it?

This is not a polished document — it's an honest inventory. The goal is to surface your actual gaps now, while there is still time to close them.`,
      guidance: `The reflection paragraph is not a formality. Evaluators use it to assess whether the defended artifact process changed your thinking or was just a compliance checkbox. The strongest reflections name a specific claim they made in a Defend beat that didn't hold up under challenge — and describe the concrete change they made to their artifact as a result.`,
      minWords: 100,
    },

    {
      kind: 'defend',
      persona: opsDepartmentHeadPhase1,
      hooks: {
        pillar: 'A',
        frameworks: ['AIEOG', 'SR 11-7', 'Interagency TPRM'],
        dataTiers: [1, 2, 3],
      },
    },

    {
      kind: 'refine',
      guidance: `Dana's final challenge cut across all three pillars — not just operations scope, but accessibility (can others use what you built?), boundary safety (does the governance hold?), and capability (does the measurement show real impact?). Revise your capstone outline to address the specific gap she identified. Then write a final 2-sentence certification readiness statement: what you have built, and what it would take to sustain it after you're no longer the only person who understands it.`,
    },

    {
      kind: 'capture',
      artifactLabel: 'Unit 3.2 — /Ops — Capstone submission outline + certification readiness statement',
    },
  ],
};
