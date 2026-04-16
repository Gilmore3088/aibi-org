// AiBI Readiness Assessment — v2 Question Pool
// 48 questions across 8 dimensions (6 per dimension).
// Score range per question: 1 (lowest maturity) to 4 (highest).
// Total score range: 12-48 (12 questions per session).

import type { AssessmentQuestion } from './types';

export const questions: readonly AssessmentQuestion[] = [
  // ─── Current AI Usage (6 questions) ─────────────────────────────────────
  {
    id: 'cau-01',
    dimension: 'current-ai-usage',
    prompt: 'How are your staff currently using AI tools in their daily work?',
    options: [
      { label: 'We have not introduced AI tools and staff are not using them in any official capacity.', points: 1 },
      { label: 'A few individuals experiment on their own, but there is no coordinated use across departments.', points: 2 },
      { label: 'Several teams use AI tools regularly for specific tasks, though adoption varies by department.', points: 3 },
      { label: 'AI tools are integrated into daily workflows across most functions with clear use cases.', points: 4 },
    ],
  },
  {
    id: 'cau-02',
    dimension: 'current-ai-usage',
    prompt: 'Which departments have adopted AI tools for routine tasks at your institution?',
    options: [
      { label: 'No departments have formally adopted AI tools for routine work.', points: 1 },
      { label: 'One department has experimented informally, but adoption is not official or tracked.', points: 2 },
      { label: 'Two or three departments use AI tools for specific, defined tasks.', points: 3 },
      { label: 'Four or more departments have integrated AI tools into their standard workflows.', points: 4 },
    ],
  },
  {
    id: 'cau-03',
    dimension: 'current-ai-usage',
    prompt: 'How often do staff use AI-generated outputs in customer-facing communications?',
    options: [
      { label: 'Never — we have a blanket prohibition or no awareness that this is occurring.', points: 1 },
      { label: 'Occasionally, but without a review or approval process.', points: 2 },
      { label: 'Regularly, with informal review before anything goes to a customer.', points: 3 },
      { label: 'Routinely, with a documented review workflow and clear approval criteria.', points: 4 },
    ],
  },
  {
    id: 'cau-04',
    dimension: 'current-ai-usage',
    prompt: 'Does your institution track which AI tools are being used and by whom?',
    options: [
      { label: 'No — staff use whatever tools they find and we have no visibility into it.', points: 1 },
      { label: 'We have partial awareness of some tools but no formal inventory.', points: 2 },
      { label: 'We maintain a list of approved tools, though off-list use still occurs.', points: 3 },
      { label: 'We have a current, audited AI tool inventory with user-level tracking and access controls.', points: 4 },
    ],
  },
  {
    id: 'cau-05',
    dimension: 'current-ai-usage',
    prompt: 'How are AI-generated outputs currently documented or reviewed before operational use?',
    options: [
      { label: 'They are not — staff use AI outputs without any review or documentation.', points: 1 },
      { label: 'Individual staff review their own outputs, but there is no standard or record.', points: 2 },
      { label: 'A supervisor or peer reviews AI-assisted work in defined high-risk contexts.', points: 3 },
      { label: 'We have a formal human-in-the-loop review process with logs for all significant AI use.', points: 4 },
    ],
  },
  {
    id: 'cau-06',
    dimension: 'current-ai-usage',
    prompt: 'Roughly what percentage of staff have used an AI tool (any tool, any purpose) in the past 30 days?',
    options: [
      { label: 'Fewer than 5% — AI tool use is extremely rare.', points: 1 },
      { label: 'Roughly 5–20% — limited to a handful of early adopters.', points: 2 },
      { label: 'Roughly 20–50% — a meaningful minority use AI tools regularly.', points: 3 },
      { label: 'More than 50% — the majority of staff use AI tools as part of their work.', points: 4 },
    ],
  },

  // ─── Experimentation Culture (6 questions) ───────────────────────────────
  {
    id: 'ec-01',
    dimension: 'experimentation-culture',
    prompt: 'How does your institution approach trying new technology tools?',
    options: [
      { label: 'We wait until tools are proven across the industry before evaluating them.', points: 1 },
      { label: 'We evaluate new tools through a formal committee process that typically takes months.', points: 2 },
      { label: 'We encourage pilots in specific departments when the business case is clear.', points: 3 },
      { label: 'We have a standing practice of structured experimentation with rapid feedback loops.', points: 4 },
    ],
  },
  {
    id: 'ec-02',
    dimension: 'experimentation-culture',
    prompt: 'When a staff member proposes testing a new AI tool, what typically happens?',
    options: [
      { label: 'The idea stalls — there is no clear path to evaluate it, so it gets dropped.', points: 1 },
      { label: 'It gets escalated but the review process is slow and unclear.', points: 2 },
      { label: 'There is a defined process to assess and pilot new tools within a few weeks.', points: 3 },
      { label: 'Staff have autonomy to run low-risk pilots with lightweight documentation, then share results.', points: 4 },
    ],
  },
  {
    id: 'ec-03',
    dimension: 'experimentation-culture',
    prompt: 'How does your institution handle an AI experiment that does not produce the expected result?',
    options: [
      { label: 'Failed experiments are discouraged — failure is seen as a poor use of resources.', points: 1 },
      { label: 'Failures are quietly dropped without a post-mortem or shared learning.', points: 2 },
      { label: 'We debrief after failures and capture what we learned, though sharing is informal.', points: 3 },
      { label: 'Failures are formally documented, shared broadly, and treated as valuable institutional knowledge.', points: 4 },
    ],
  },
  {
    id: 'ec-04',
    dimension: 'experimentation-culture',
    prompt: 'How does your institution allocate staff time for learning and experimenting with new tools?',
    options: [
      { label: 'We do not — learning happens only when required by compliance or a project need.', points: 1 },
      { label: 'We allow it informally, but it competes with normal workload and rarely wins.', points: 2 },
      { label: 'We have protected time for select staff (e.g., a tech team or innovation lead).', points: 3 },
      { label: 'Structured learning and experimentation time is built into workload planning for all staff.', points: 4 },
    ],
  },
  {
    id: 'ec-05',
    dimension: 'experimentation-culture',
    prompt: 'How frequently does your institution share the results of internal technology experiments across teams?',
    options: [
      { label: 'Rarely or never — results stay with the team that ran the experiment.', points: 1 },
      { label: 'Occasionally, if a leader notices a relevant result and passes it along.', points: 2 },
      { label: 'We have an informal channel (email, Slack) where learnings are sometimes shared.', points: 3 },
      { label: 'We have regular cross-team knowledge-sharing sessions specifically for AI and tech learnings.', points: 4 },
    ],
  },
  {
    id: 'ec-06',
    dimension: 'experimentation-culture',
    prompt: 'Has your institution piloted an AI tool in the past 12 months, even informally?',
    options: [
      { label: 'No — we have not piloted any AI tool in the past 12 months.', points: 1 },
      { label: 'One team tried something briefly, but it did not move forward.', points: 2 },
      { label: 'Two or three teams ran pilots; at least one produced useful information.', points: 3 },
      { label: 'Multiple pilots ran, with documented results and at least one moving to ongoing use.', points: 4 },
    ],
  },

  // ─── AI Literacy Level (6 questions) ─────────────────────────────────────
  {
    id: 'all-01',
    dimension: 'ai-literacy-level',
    prompt: "How would you describe your staff's current understanding of AI tools?",
    options: [
      { label: 'Most staff have little exposure to AI beyond what they hear in the news.', points: 1 },
      { label: 'Staff are curious but unsure what AI can actually do for their specific roles.', points: 2 },
      { label: 'A meaningful portion of staff understand core AI concepts and common use cases.', points: 3 },
      { label: 'Staff across functions can identify opportunities, evaluate tools, and articulate limits.', points: 4 },
    ],
  },
  {
    id: 'all-02',
    dimension: 'ai-literacy-level',
    prompt: 'Can your staff explain what an AI model hallucination is and why it matters for banking?',
    options: [
      { label: 'No — this concept is unfamiliar to most staff, including leadership.', points: 1 },
      { label: 'A few people (typically IT or compliance) understand it, but frontline staff do not.', points: 2 },
      { label: 'Most staff who use AI tools understand hallucination risk and how to verify outputs.', points: 3 },
      { label: 'All staff using AI can explain hallucination, cite banking-specific risks, and apply verification habits.', points: 4 },
    ],
  },
  {
    id: 'all-03',
    dimension: 'ai-literacy-level',
    prompt: 'How well do your staff understand what data should never be entered into a public AI tool?',
    options: [
      { label: 'Staff are generally unaware of the data handling risks with public AI tools.', points: 1 },
      { label: 'Staff have heard warnings but cannot articulate specific data categories to avoid.', points: 2 },
      { label: 'Staff understand the categories (PII, NPI, loan data) but apply the guidance inconsistently.', points: 3 },
      { label: 'Staff can reliably identify restricted data categories and apply consistent judgment before using any AI tool.', points: 4 },
    ],
  },
  {
    id: 'all-04',
    dimension: 'ai-literacy-level',
    prompt: 'Can your operations staff identify at least one specific AI use case relevant to their own role?',
    options: [
      { label: 'Most cannot — AI feels abstract and distant from their daily tasks.', points: 1 },
      { label: 'Some can name a general use case (like writing assistance) but not something specific to their role.', points: 2 },
      { label: 'Most staff can name a relevant use case, though they may not know how to act on it.', points: 3 },
      { label: 'Most staff can name two or more role-specific use cases and have experimented with at least one.', points: 4 },
    ],
  },
  {
    id: 'all-05',
    dimension: 'ai-literacy-level',
    prompt: "Has your institution conducted formal AI literacy training for staff in the past 18 months?",
    options: [
      { label: 'No formal AI literacy training has been delivered.', points: 1 },
      { label: 'A one-time presentation or webinar was offered, with no follow-through.', points: 2 },
      { label: 'A structured training program was delivered to at least one team or department.', points: 3 },
      { label: 'AI literacy training has been delivered institution-wide with role-specific tracks and assessments.', points: 4 },
    ],
  },
  {
    id: 'all-06',
    dimension: 'ai-literacy-level',
    prompt: 'How comfortable is your leadership team discussing AI capabilities and limitations with staff?',
    options: [
      { label: 'Leadership avoids the topic or defers all AI questions to IT.', points: 1 },
      { label: 'Leadership can speak to AI at a surface level but lacks confidence in specifics.', points: 2 },
      { label: 'Leadership is reasonably informed and can engage meaningfully on AI strategy and risk.', points: 3 },
      { label: 'Leadership actively champions AI literacy and can discuss specific use cases, risks, and governance with credibility.', points: 4 },
    ],
  },

  // ─── Quick Win Potential (6 questions) ───────────────────────────────────
  {
    id: 'qwp-01',
    dimension: 'quick-win-potential',
    prompt: 'How much manual, repetitive work exists in your current workflows?',
    options: [
      { label: 'We have not mapped where repetitive work lives, so we cannot say.', points: 1 },
      { label: 'We know it exists but have not prioritized identifying specific processes.', points: 2 },
      { label: 'We have identified several repetitive processes that are candidates for automation.', points: 3 },
      { label: 'We have a documented inventory of high-volume manual work with measured time costs.', points: 4 },
    ],
  },
  {
    id: 'qwp-02',
    dimension: 'quick-win-potential',
    prompt: 'What percentage of staff time in your institution is spent on tasks that involve copying, reformatting, or summarizing information?',
    options: [
      { label: 'We have not measured this and have no estimate.', points: 1 },
      { label: 'Anecdotally significant, but we have not quantified it.', points: 2 },
      { label: 'We estimate 10–25% of total staff hours involve this type of work.', points: 3 },
      { label: 'We have measured this and know specific workflows with the highest volume.', points: 4 },
    ],
  },
  {
    id: 'qwp-03',
    dimension: 'quick-win-potential',
    prompt: 'How would you describe the state of internal documentation and process guides at your institution?',
    options: [
      { label: 'Most processes live in staff memory or email threads — documentation is sparse.', points: 1 },
      { label: 'Some departments document processes, but coverage is inconsistent.', points: 2 },
      { label: 'Core processes are documented, though some are outdated or stored inconsistently.', points: 3 },
      { label: 'Processes are documented, maintained, and accessible — a strong base for AI-assisted enhancement.', points: 4 },
    ],
  },
  {
    id: 'qwp-04',
    dimension: 'quick-win-potential',
    prompt: 'Are there loan processing, compliance, or onboarding steps at your institution that involve significant manual document review?',
    options: [
      { label: 'We have not assessed this from an automation standpoint.', points: 1 },
      { label: 'Yes, we know manual review is heavy but have not prioritized changing it.', points: 2 },
      { label: 'We have identified at least one high-volume manual review process as an automation candidate.', points: 3 },
      { label: 'We have measured the time cost and have a scoped plan to streamline at least one review workflow with AI assistance.', points: 4 },
    ],
  },
  {
    id: 'qwp-05',
    dimension: 'quick-win-potential',
    prompt: 'How quickly can your institution implement a small process change (e.g., a new template, a revised workflow step)?',
    options: [
      { label: 'Months — changes require extensive committee review and sign-off chains.', points: 1 },
      { label: 'Several weeks — there is a process, but it moves slowly.', points: 2 },
      { label: 'One to two weeks for small operational changes with department-level approval.', points: 3 },
      { label: 'Days to a week for low-risk changes — we have a clear path for quick operational improvements.', points: 4 },
    ],
  },
  {
    id: 'qwp-06',
    dimension: 'quick-win-potential',
    prompt: 'Does your institution use standard templates for common communications (member letters, loan notices, onboarding packets)?',
    options: [
      { label: 'No consistent templates — staff write from scratch or use ad hoc formats.', points: 1 },
      { label: 'Some templates exist but they are inconsistently used across departments.', points: 2 },
      { label: 'We have a working template library for most common communications.', points: 3 },
      { label: 'Comprehensive template library with version control — a strong base for AI-assisted drafting.', points: 4 },
    ],
  },

  // ─── Leadership Buy-In (6 questions) ─────────────────────────────────────
  {
    id: 'lbi-01',
    dimension: 'leadership-buy-in',
    prompt: 'How does your leadership team currently view AI adoption?',
    options: [
      { label: 'Leadership is skeptical or concerned about risks and has not prioritized AI.', points: 1 },
      { label: 'Leadership is interested but has not committed budget or staff time.', points: 2 },
      { label: 'Leadership has approved initial exploration and is tracking early results.', points: 3 },
      { label: 'Leadership treats AI capability as a strategic priority with budget and accountability.', points: 4 },
    ],
  },
  {
    id: 'lbi-02',
    dimension: 'leadership-buy-in',
    prompt: 'Has your CEO or executive team publicly communicated a position on AI to staff?',
    options: [
      { label: 'No — AI has not been addressed in any formal communication to staff.', points: 1 },
      { label: 'Leadership has acknowledged AI exists but has not articulated a clear position.', points: 2 },
      { label: 'Leadership has communicated a general direction, though specific priorities are still unclear.', points: 3 },
      { label: 'Leadership has shared a clear, written AI strategy or use policy with all staff.', points: 4 },
    ],
  },
  {
    id: 'lbi-03',
    dimension: 'leadership-buy-in',
    prompt: 'Is there a named individual or team responsible for AI strategy at your institution?',
    options: [
      { label: 'No — AI falls under no one\'s explicit responsibility.', points: 1 },
      { label: 'It is informally owned by IT, but AI strategy is not a distinct function.', points: 2 },
      { label: 'A specific leader or department has been assigned AI oversight as part of their role.', points: 3 },
      { label: 'We have a dedicated AI lead or committee with defined authority, budget, and reporting accountability.', points: 4 },
    ],
  },
  {
    id: 'lbi-04',
    dimension: 'leadership-buy-in',
    prompt: 'Has your board of directors discussed AI strategy or risk in the past 12 months?',
    options: [
      { label: 'No — AI has not appeared on any board agenda.', points: 1 },
      { label: 'It came up briefly in a technology update, but without substantive discussion.', points: 2 },
      { label: 'The board has had a dedicated AI discussion at least once in the past year.', points: 3 },
      { label: 'The board receives regular AI risk and strategy updates and has approved a formal AI governance policy.', points: 4 },
    ],
  },
  {
    id: 'lbi-05',
    dimension: 'leadership-buy-in',
    prompt: 'Has your institution allocated a specific budget line for AI tools, training, or consulting in the past 12 months?',
    options: [
      { label: 'No dedicated budget — AI spending comes from general IT or incidental expenses.', points: 1 },
      { label: 'Informal spending has occurred but was not formally budgeted.', points: 2 },
      { label: 'A modest budget was approved for AI exploration or a specific tool.', points: 3 },
      { label: 'A formal AI budget line exists with defined allocations for tools, training, and advisory support.', points: 4 },
    ],
  },
  {
    id: 'lbi-06',
    dimension: 'leadership-buy-in',
    prompt: 'How does your leadership respond when an AI experiment produces an ambiguous or underwhelming result?',
    options: [
      { label: 'It reinforces skepticism and reduces appetite for future experiments.', points: 1 },
      { label: 'The topic gets tabled and the resources redirected to other priorities.', points: 2 },
      { label: 'Leadership asks questions and uses the result to refine the next experiment.', points: 3 },
      { label: 'Leadership treats it as a learning moment and actively incorporates the insight into strategy.', points: 4 },
    ],
  },

  // ─── Security Posture (6 questions) ──────────────────────────────────────
  {
    id: 'sp-01',
    dimension: 'security-posture',
    prompt: 'Does your institution currently have an AI governance framework or staff AI use guidelines?',
    options: [
      { label: 'We have no formal guidelines; staff use of AI tools is unrestricted and untracked.', points: 1 },
      { label: 'We have informal guidance but no written policy or oversight process.', points: 2 },
      { label: 'We have a written AI use policy that references existing risk and vendor frameworks.', points: 3 },
      { label: 'We have a governance framework aligned with SR 11-7 and TPRM guidance, reviewed regularly.', points: 4 },
    ],
  },
  {
    id: 'sp-02',
    dimension: 'security-posture',
    prompt: 'Does your AI use policy explicitly address which categories of data may not be entered into public AI tools?',
    options: [
      { label: 'We have no AI use policy.', points: 1 },
      { label: 'Our policy mentions data handling generally but does not specify restricted categories.', points: 2 },
      { label: 'Our policy lists specific restricted data categories (PII, NPI, account data, loan files).', points: 3 },
      { label: 'Our policy lists restricted categories with examples, is reinforced in training, and is periodically tested.', points: 4 },
    ],
  },
  {
    id: 'sp-03',
    dimension: 'security-posture',
    prompt: 'How does your institution manage third-party AI vendors from a risk perspective?',
    options: [
      { label: 'We do not apply a structured TPRM process to AI tools — they are treated like any other SaaS subscription.', points: 1 },
      { label: 'We conduct informal risk reviews but lack a documented process specific to AI tools.', points: 2 },
      { label: 'AI vendors go through our standard TPRM process, including data handling and security reviews.', points: 3 },
      { label: 'We apply an AI-specific TPRM overlay (model risk, explainability, drift monitoring) beyond the standard vendor review.', points: 4 },
    ],
  },
  {
    id: 'sp-04',
    dimension: 'security-posture',
    prompt: 'Has your institution assessed whether any AI tools it uses trigger model risk management obligations under SR 11-7 or equivalent guidance?',
    options: [
      { label: 'We have not reviewed our AI tool use against model risk guidance.', points: 1 },
      { label: 'We are aware of SR 11-7 but have not mapped our current AI tool use to its requirements.', points: 2 },
      { label: 'We have conducted a gap assessment and are addressing identified exposures.', points: 3 },
      { label: 'We have a current MRM inventory for all AI tools with documented validation, monitoring, and approval records.', points: 4 },
    ],
  },
  {
    id: 'sp-05',
    dimension: 'security-posture',
    prompt: 'Does your institution have a process for staff to report a suspected AI error or misuse?',
    options: [
      { label: 'No — there is no defined path for staff to report AI concerns.', points: 1 },
      { label: 'Staff are expected to raise concerns with their manager, but there is no formal channel.', points: 2 },
      { label: 'AI concerns can be reported through our existing IT or compliance incident process.', points: 3 },
      { label: 'We have a dedicated AI incident reporting path with defined escalation, response, and documentation standards.', points: 4 },
    ],
  },
  {
    id: 'sp-06',
    dimension: 'security-posture',
    prompt: 'How does your institution address fair lending risk in AI-assisted processes (e.g., loan summaries, member communications)?',
    options: [
      { label: 'We have not considered fair lending risk in the context of AI tool use.', points: 1 },
      { label: 'We are aware of the risk but have not yet integrated it into our AI oversight process.', points: 2 },
      { label: 'Our compliance team reviews AI-assisted processes for ECOA/Reg B alignment as part of our standard fair lending program.', points: 3 },
      { label: 'We have a documented fair lending review protocol for AI-assisted processes with testing, monitoring, and board reporting.', points: 4 },
    ],
  },

  // ─── Training Infrastructure (6 questions) ───────────────────────────────
  {
    id: 'ti-01',
    dimension: 'training-infrastructure',
    prompt: "What is your institution's capacity for delivering staff training programs?",
    options: [
      { label: 'We rely on vendor-provided training as needed; we have no internal capacity.', points: 1 },
      { label: 'We deliver compliance training but lack capacity for new skill programs.', points: 2 },
      { label: 'We have a training function that can roll out new programs with advance planning.', points: 3 },
      { label: 'We have an active learning function that regularly launches new skill programs.', points: 4 },
    ],
  },
  {
    id: 'ti-02',
    dimension: 'training-infrastructure',
    prompt: 'How does your institution currently measure whether training has changed staff behavior on the job?',
    options: [
      { label: 'We track completion rates but do not assess whether behavior changed.', points: 1 },
      { label: 'We conduct post-training quizzes for knowledge checks, but no on-the-job measurement.', points: 2 },
      { label: 'We do follow-up surveys and some manager observation to assess application.', points: 3 },
      { label: 'We measure behavior change through defined performance indicators and manager reviews tied to training goals.', points: 4 },
    ],
  },
  {
    id: 'ti-03',
    dimension: 'training-infrastructure',
    prompt: 'Does your institution have a learning management system (LMS) or a structured way to deliver and track staff training?',
    options: [
      { label: 'No — training is delivered via email attachments, PDFs, or verbal briefings.', points: 1 },
      { label: 'We use a basic compliance training platform, but it is not used for skill development programs.', points: 2 },
      { label: 'We have an LMS that is actively used for compliance and can support new program delivery.', points: 3 },
      { label: 'We have a mature LMS with defined learning paths, manager dashboards, and completion tracking across all staff.', points: 4 },
    ],
  },
  {
    id: 'ti-04',
    dimension: 'training-infrastructure',
    prompt: 'How quickly can your institution roll out a new training program to all eligible staff?',
    options: [
      { label: 'Months — training deployment involves significant IT, compliance, and scheduling overhead.', points: 1 },
      { label: 'Four to eight weeks for a new program across all departments.', points: 2 },
      { label: 'Two to four weeks — we have a clear rollout process once content is ready.', points: 3 },
      { label: 'Under two weeks — our training infrastructure supports rapid program deployment at scale.', points: 4 },
    ],
  },
  {
    id: 'ti-05',
    dimension: 'training-infrastructure',
    prompt: 'How are training materials kept current as tools and regulations evolve?',
    options: [
      { label: 'They are not updated regularly — materials reflect the state of the world when they were created.', points: 1 },
      { label: 'Updates happen reactively when a regulatory change or major tool change forces a revision.', points: 2 },
      { label: 'We have an annual or semi-annual review cycle for training content.', points: 3 },
      { label: 'Training content is reviewed quarterly and updated as needed with a version-controlled change log.', points: 4 },
    ],
  },
  {
    id: 'ti-06',
    dimension: 'training-infrastructure',
    prompt: 'Do staff at your institution have access to role-specific (not just generic) training resources for their job functions?',
    options: [
      { label: 'No — all training is one-size-fits-all regardless of role.', points: 1 },
      { label: 'Compliance training is role-specific, but skill development programs are generic.', points: 2 },
      { label: 'Some departments have role-specific resources, but coverage is uneven.', points: 3 },
      { label: 'Role-specific learning paths exist for all major functions, covering both compliance and skill development.', points: 4 },
    ],
  },

  // ─── Builder Potential (6 questions) ─────────────────────────────────────
  {
    id: 'bp-01',
    dimension: 'builder-potential',
    prompt: 'How much appetite do your staff have for building their own workflow solutions?',
    options: [
      { label: 'Staff expect IT or vendors to solve workflow problems for them.', points: 1 },
      { label: 'A few individuals tinker with spreadsheets or simple tools but nothing is shared.', points: 2 },
      { label: 'Several staff build and share workflow improvements using low-code tools.', points: 3 },
      { label: 'We have an active community of staff builders with a process for scaling what works.', points: 4 },
    ],
  },
  {
    id: 'bp-02',
    dimension: 'builder-potential',
    prompt: 'Have any staff at your institution built a custom prompt, template, or micro-automation that others now use?',
    options: [
      { label: 'No — individuals keep any tools they build to themselves or no one has built anything.', points: 1 },
      { label: 'A few individuals have built things but they are not widely shared.', points: 2 },
      { label: 'At least one staff-built tool or prompt is used by a broader team.', points: 3 },
      { label: 'Multiple staff-built solutions are in active use across the institution with a sharing mechanism.', points: 4 },
    ],
  },
  {
    id: 'bp-03',
    dimension: 'builder-potential',
    prompt: 'How does your institution recognize or reward staff who improve workflows using technology?',
    options: [
      { label: 'There is no formal recognition for workflow improvements.', points: 1 },
      { label: 'Managers notice and appreciate it informally, but it is not officially recognized.', points: 2 },
      { label: 'Workflow innovations are acknowledged in team meetings or performance reviews.', points: 3 },
      { label: 'We have formal recognition mechanisms and career advancement pathways tied to operational innovation.', points: 4 },
    ],
  },
  {
    id: 'bp-04',
    dimension: 'builder-potential',
    prompt: 'What tools (e.g., Microsoft Power Automate, Excel macros, Zapier, Google Sheets formulas) are staff currently using to automate tasks?',
    options: [
      { label: 'Staff rely entirely on off-the-shelf software with no self-built automation.', points: 1 },
      { label: 'Basic tools like Excel formulas or mail merge are used, but nothing more sophisticated.', points: 2 },
      { label: 'Several staff use low-code tools or scripting to automate specific tasks.', points: 3 },
      { label: 'Staff across departments regularly use automation tools and share what they build.', points: 4 },
    ],
  },
  {
    id: 'bp-05',
    dimension: 'builder-potential',
    prompt: 'How does your institution handle a situation where a staff member builds a useful automation that requires broader deployment?',
    options: [
      { label: 'There is no path — staff-built tools stay with that individual and disappear when they leave.', points: 1 },
      { label: 'IT might get involved eventually, but the process is ad hoc and slow.', points: 2 },
      { label: 'There is a defined process for IT to review and support the deployment of staff-built solutions.', points: 3 },
      { label: 'We have a structured citizen developer program with governance, security review, and a deployment pipeline.', points: 4 },
    ],
  },
  {
    id: 'bp-06',
    dimension: 'builder-potential',
    prompt: 'Would staff at your institution be willing to spend 30–60 minutes per week learning to build AI-assisted workflow tools?',
    options: [
      { label: 'Unlikely — staff feel they do not have the time or aptitude for building tools.', points: 1 },
      { label: 'A small number might, but it would not be broadly adopted without structured support.', points: 2 },
      { label: 'A meaningful minority would participate if given clear guidance and institutional support.', points: 3 },
      { label: 'A majority would participate — we already have a culture of staff-driven improvement.', points: 4 },
    ],
  },
] as const;
