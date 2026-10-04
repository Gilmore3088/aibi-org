-- 00063: refresh three Toolbox library templates (version 2).
--
-- These prompts were copied into the library by 00022 and have since been
-- corrected in content/courses/foundation-program/prompt-library.ts:
--   - the vendor scorecard and board deck cited SR 11-7 as live guidance;
--     SR 26-2 superseded it in April 2026.
--   - the board deck and efficiency-ratio model carried an old FDIC
--     efficiency ratio and productivity figures attributed to a vendor
--     report. They now use placeholders filled from the primary source.
-- Versions are append-only, so v1 stays for any recipe pinned to it;
-- current_version moves to 2.

insert into public.toolbox_library_skill_versions (library_skill_id, version, content)
select s.id, 2, v.content || jsonb_build_object(
  'description', $p$A structured 5-question scoring framework that produces a 0–100 vendor score across data security, regulatory alignment, explainability, vendor stability, and total cost — with a recommendation threshold and a hard stop on fair lending failures.$p$::text,
  'user_prompt_template', $p$You are a Senior IT Risk Officer at a community bank ($600M in assets) evaluating an AI vendor for a specific use case: [DESCRIBE USE CASE — e.g., AI-assisted underwriting support, AI document extraction, AI customer service routing].

Your institution follows SR 26-2 model risk management guidance, interagency TPRM principles (OCC Bulletin 2023-17), and the AIEOG AI Lexicon definitions for explainability and human-in-the-loop controls.

Objective: Produce a 5-question scoring framework — one master question per domain — that yields a 100-point vendor evaluation score. Each question must:

1. State the evaluation criterion in plain language
2. Define a 4-tier response scale with specific point values (0 / partial / full / exceeds)
3. Specify what documentary evidence the vendor must provide to support each score
4. Identify the regulatory citation that makes this criterion non-negotiable

The five domains are:
1. Customer data handling and PII controls (25 points)
2. Regulatory alignment — SR 26-2, ECOA/Reg B, UDAP (20 points)
3. Explainability and human-in-the-loop controls per AIEOG Lexicon (20 points)
4. Vendor financial stability and community banking references (15 points)
5. All-in pricing and exit provisions (20 points)

After the scorecard, produce:
- A scoring matrix (table: domain, max points, actual points, evidence collected)
- Recommendation thresholds: 75+ = Proceed, 60-74 = Conditional, below 60 = Do not proceed
- One hard-stop criterion: if the ECOA/Reg B explainability score is zero, the vendor is disqualified from any credit-decision use case regardless of total score
- A one-paragraph recommendation narrative template for the board risk committee

Expectations — limits:
- All regulatory citations must be specific and correct. Use "SR 26-2" not "Fed guidance." Use "AIEOG AI Lexicon" not "industry definitions."
- The HITL definition must match the AIEOG Lexicon: a human with appropriate authority, information, and time to intervene before the AI decision takes effect
- Do not create criteria that a vendor can satisfy with marketing materials alone. Evidence must be documentary (SOC 2, validation reports, contract language)$p$::text,
  'example', jsonb_build_object('input', '{}'::jsonb, 'output', $p$A structured 5-question scoring framework that produces a 0–100 vendor score across data security, regulatory alignment, explainability, vendor stability, and total cost — with a recommendation threshold and a hard stop on fair lending failures.$p$::text)
)
from public.toolbox_library_skills s
join public.toolbox_library_skill_versions v on v.library_skill_id = s.id and v.version = 1
where s.slug = 's-vendor-ai-evaluation-scorecard'
on conflict (library_skill_id, version) do nothing;

update public.toolbox_library_skills s
set current_version = 2,
    description = $p$A structured 5-question scoring framework that produces a 0–100 vendor score across data security, regulatory alignment, explainability, vendor stability, and total cost — with a recommendation threshold and a hard stop on fair lending failures.$p$,
    updated_at = now()
where s.slug = 's-vendor-ai-evaluation-scorecard'
  and s.current_version < 2
  and exists (
    select 1 from public.toolbox_library_skill_versions v
    where v.library_skill_id = s.id and v.version = 2
  );

insert into public.toolbox_library_skill_versions (library_skill_id, version, content)
select s.id, 2, v.content || jsonb_build_object(
  'description', $p$A complete 10-slide board presentation outline with speaker notes, data placeholders keyed to FDIC BankFind Suite and the dated sources you supply, risk disclosures, and a board resolution template for AI governance policy adoption.$p$::text,
  'user_prompt_template', $p$You are an AI Strategy Advisor preparing a board-level presentation for a community bank CEO. The audience is a 7-person board of directors with mixed technical backgrounds: 2 former bankers, 2 business owners, 1 attorney, 1 CPA, and 1 technology executive.

The bank's profile: $[ASSET SIZE]M in assets, $[FTE COUNT] FTE, efficiency ratio of [EFFICIENCY RATIO]% (source: FDIC BankFind Suite). The board has not received a formal AI strategy presentation before.

Objective: Produce a complete 10-slide board presentation outline. For each slide, provide:
- Slide title
- Three to five bullet points (the actual content, not placeholders)
- Speaker notes (2-3 sentences the CEO can use verbatim)
- Any data that should appear on the slide, with source citations

Slide structure:
1. Why AI, Why Now — market context using sourced statistics
2. What Our Peers Are Doing — community bank AI adoption data (cite the named, dated survey in [PEER SURVEY])
3. What We Are Already Doing — current AI tool inventory (use [TOOL LIST] placeholder)
4. The Efficiency Opportunity — ROI model using institution's own FTE count and efficiency ratio
5. Regulatory Landscape — what examiners are looking for (SR 26-2, TPRM, AIEOG Lexicon)
6. Our Governance Framework — three-layer model: policy, oversight, training
7. Risk Assessment — what we are managing, what we are watching, what we are avoiding
8. The 12-Month Roadmap — three phases with named owners and success metrics
9. Resource Requirements — budget, staffing, and training investment
10. Board Resolution — formal adoption of AI governance policy

After the outline, produce a draft board resolution (two paragraphs) authorizing the bank's AI governance framework and designating an AI oversight committee.

Expectations — limits:
- All statistics must cite named, dated sources. Use only the sources I list here: [SOURCES — e.g., the latest FDIC Quarterly Banking Profile, a named industry survey with its year]. Mark any slide that needs a figure I have not given you as [NEED SOURCE]. Do not fabricate benchmarks.
- The efficiency ratio slide must use the institution's actual FDIC-reported figure, not an industry average. Insert [FDIC EFFICIENCY RATIO] as a placeholder if not provided.
- Do not use "AI-powered," "cutting-edge," or "revolutionary." Directors have seen too many technology presentations that overpromised.
- The risk slide must include regulatory risk of inaction (operating without a governance framework while staff use consumer AI) — not just risk of action
- Speaker notes must be in plain language. Assume the CEO is not a technologist.$p$::text,
  'example', jsonb_build_object('input', '{}'::jsonb, 'output', $p$A complete 10-slide board presentation outline with speaker notes, data placeholders keyed to FDIC BankFind Suite and the dated sources you supply, risk disclosures, and a board resolution template for AI governance policy adoption.$p$::text)
)
from public.toolbox_library_skills s
join public.toolbox_library_skill_versions v on v.library_skill_id = s.id and v.version = 1
where s.slug = 'l-board-ai-strategy-deck-generator'
on conflict (library_skill_id, version) do nothing;

update public.toolbox_library_skills s
set current_version = 2,
    description = $p$A complete 10-slide board presentation outline with speaker notes, data placeholders keyed to FDIC BankFind Suite and the dated sources you supply, risk disclosures, and a board resolution template for AI governance policy adoption.$p$,
    updated_at = now()
where s.slug = 'l-board-ai-strategy-deck-generator'
  and s.current_version < 2
  and exists (
    select 1 from public.toolbox_library_skill_versions v
    where v.library_skill_id = s.id and v.version = 2
  );

insert into public.toolbox_library_skill_versions (library_skill_id, version, content)
select s.id, 2, v.content || jsonb_build_object(
  'description', $p$A three-scenario efficiency ratio model (conservative / base / optimistic) showing projected impact of AI-driven productivity gains on the institution's efficiency ratio over 24 months, using FDIC BankFind Suite baseline data and sourced productivity assumptions.$p$::text,
  'user_prompt_template', $p$You are a Financial Strategy Analyst at a community bank building a 24-month AI productivity model for the CFO and board.

Institution data (pull from FDIC BankFind Suite at banks.data.fdic.gov):
- Current efficiency ratio: [FDIC EFFICIENCY RATIO]%
- Total non-interest expense: $[NIE]M
- Total revenue (NII + non-interest income): $[REVENUE]M
- Total FTE: [FTE COUNT]
- Average cost per FTE (burdened): $[COST PER FTE]

Peer median efficiency ratio: [PEER MEDIAN]% (your asset-size peer group from FDIC BankFind Suite or your UBPR peer report; note the quarter)
Industry-wide efficiency ratio: [INDUSTRY RATIO]% (latest FDIC Quarterly Banking Profile at fdic.gov; note the quarter)

Objective: Produce a three-scenario efficiency ratio model showing projected impact of AI adoption on the institution's efficiency ratio over 24 months.

For each scenario (Conservative / Base / Optimistic), model:
1. Productivity assumption: hours saved per FTE per week (Conservative: 1.5 hrs, Base: 3 hrs, Optimistic: 5 hrs) — illustrative starting assumptions; replace them with hours measured in your own pilot
2. Dollar value of productivity gain: FTE count × hours/week × burdened hourly rate × 50 working weeks
3. Projected non-interest expense reduction (assume 60% of productivity gain flows to NIE reduction in Year 1, 80% in Year 2 as processes are restructured)
4. Projected efficiency ratio at 12 months and 24 months
5. Basis points of improvement vs. current ratio
6. Gap to the peer median and the industry-wide ratio given above

Format output as:
- A summary table (scenario × metric × Year 1 × Year 2)
- Narrative paragraph for CFO (3 sentences, suitable for board report)
- Key assumption list with citations
- Sensitivity note: what has to be true for the Optimistic scenario to materialize

Expectations — limits:
- Label every productivity assumption as either measured (with where it was measured) or illustrative. Do not attribute an assumption to a survey I have not given you.
- The model must show the gap to peer benchmarks — the goal is not just improvement but convergence toward the industry median
- Do not present cost reduction as guaranteed. Frame as "projected under stated assumptions" throughout.
- Include a VERIFY placeholder wherever institution-specific data is required: [VERIFY: pull from FDIC BankFind Suite]
- Do not model revenue growth — this model is limited to expense-side productivity only. Revenue impact of AI is a separate analysis.$p$::text,
  'example', jsonb_build_object('input', '{}'::jsonb, 'output', $p$A three-scenario efficiency ratio model (conservative / base / optimistic) showing projected impact of AI-driven productivity gains on the institution's efficiency ratio over 24 months, using FDIC BankFind Suite baseline data and sourced productivity assumptions.$p$::text)
)
from public.toolbox_library_skills s
join public.toolbox_library_skill_versions v on v.library_skill_id = s.id and v.version = 1
where s.slug = 'l-efficiency-ratio-scenario-modeling'
on conflict (library_skill_id, version) do nothing;

update public.toolbox_library_skills s
set current_version = 2,
    description = $p$A three-scenario efficiency ratio model (conservative / base / optimistic) showing projected impact of AI-driven productivity gains on the institution's efficiency ratio over 24 months, using FDIC BankFind Suite baseline data and sourced productivity assumptions.$p$,
    updated_at = now()
where s.slug = 'l-efficiency-ratio-scenario-modeling'
  and s.current_version < 2
  and exists (
    select 1 from public.toolbox_library_skill_versions v
    where v.library_skill_id = s.id and v.version = 2
  );
