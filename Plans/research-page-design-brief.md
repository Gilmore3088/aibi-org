# Research Page Design Brief

## Rebuild `/research` as The AI Banking Brief credibility and lead engine

## 1. Executive Summary

The `/research` page should become the credibility engine for The AI Banking Institute.

It should not feel like a generic blog, resource dump, or SEO content archive. It should feel like a serious, bank-specific research desk that helps community banks and credit unions understand AI adoption, risk, regulation, operational use cases, training gaps, and practical next steps.

The page already exists as `/research` and is currently framed as **The AI Banking Brief**. The current hero says the page is “a working record of how community banks and credit unions are actually adopting AI — with sourced numbers, named regulators, and the artifacts you can lift from. Published fortnightly.” That direction is strong and should be preserved.

The opportunity is to turn the page into a structured content hub with clear sections, role-based entry points, practical tools, newsletter capture, and contextual CTAs into the product ladder:

1. Free Assessment
2. In-Depth Assessment
3. AiBI-Foundation Course

## 2. Strategic Role

The research page should answer one question:

> Why should a banker trust The AI Banking Institute?

The assessments show users where they stand.

The Foundation Course teaches them how to build capability.

The research page proves that the Institute understands the market, the regulatory environment, and the operational reality of community financial institutions.

This page should support three business outcomes:

- Build trust before purchase.
- Capture newsletter and assessment leads.
- Create reusable content for LinkedIn, email, outreach, and sales conversations.

## 3. Current Repo Reality

The current `/research` page:

- Uses `MarketingPage`.
- Hero title: `The AI Banking Brief.`
- Hero CTA: `CTAS.beginAssessment`.
- Includes a `NewsletterCard`.
- Shows a featured essay if one exists.
- Shows recent issues through `EssayArchive`.
- Pulls content through `listAllEssays()`.

Current essay registry:

- `ESSAYS` is empty.
- `LEGACY_ESSAYS` contains six metadata-only entries still living under `/resources/...`.
- Registry comments say the MDX demo essay is intentionally not registered because it contains fabricated specifics.

This means the page architecture exists, but the research system is not yet fully migrated or strategically organized.

## 4. Product Positioning

### Recommended page positioning

> The AI Banking Brief is the Institute’s research desk: sourced analysis, field notes, and practical artifacts for community banks and credit unions adopting AI safely.

### Short positioning

> Research you can use inside a financial institution.

### Page promise

> Practical AI research for community banks and credit unions — sourced, regulator-aware, and built to turn insight into action.

### What this page is

- A credibility layer.
- A research archive.
- A newsletter landing page.
- A source of lead magnets.
- A proof point that the Institute knows banking.
- A bridge into the assessments and Foundation Course.

### What this page is not

- A generic blog.
- A news recap feed.
- An OpenAI/product update page.
- A random thought leadership archive.
- A dumping ground for every idea.
- A replacement for the course or assessments.

## 5. Target Audiences

### Primary audience

Community bank and credit union professionals who are curious about AI but need proof that The AI Banking Institute is credible.

### Key reader roles

- CEO / President
- COO / Operations leader
- CRO / Compliance / Risk leader
- IT / Security leader
- Training / HR leader
- Lending / Retail / Marketing leader
- AI-curious individual contributor

### What each audience wants

#### Executives

- Market signals.
- Peer adoption evidence.
- Board-level implications.
- Strategic risk and opportunity.
- Training and governance path.

#### Risk / Compliance

- Regulatory framing.
- Guardrails.
- AI failure modes.
- Acceptable use practices.
- Vendor/model-risk implications.

#### Operations

- Workflow examples.
- Efficiency gains.
- Repeatable use cases.
- Practical artifacts.

#### Training / HR

- Skill-building frameworks.
- Staff confidence.
- Role-based enablement.
- Curriculum rationale.

#### IT / Security

- Tool control.
- Data boundaries.
- Shadow AI usage.
- Secure deployment patterns.

## 6. Content Architecture

The research page should have four content lanes.

### Lane 1 — The AI Banking Brief

This is the flagship recurring essay series.

Purpose:

- Establish perspective.
- Build authority.
- Drive newsletter subscriptions.
- Feed LinkedIn/email content.

Examples:

- AI governance without the jargon.
- Six ways AI fails in banking.
- The skill, not the prompt.
- What your efficiency ratio is hiding.
- Members will switch. The question is to whom.
- The widening AI gap.

These already exist as legacy essay metadata and should be migrated or preserved thoughtfully.

### Lane 2 — Field Notes

Shorter, practical observations from the market.

Purpose:

- Make the Institute feel current.
- Give the founder a place to publish useful short-form thinking.
- Create low-friction content between major essays.

Examples:

- What bankers are actually asking about ChatGPT.
- The most common AI policy mistake we see.
- Why meeting summaries are the safest first AI workflow.
- What a good AI acceptable use card should include.
- Where frontline staff get nervous about AI.

Recommended length:

- 500–900 words.

### Lane 3 — Research Dossiers

More premium, report-style pieces.

Purpose:

- Create authority.
- Support lead generation.
- Give banks something worth downloading or forwarding internally.

Examples:

- 2026 Community Bank AI Readiness Report.
- AI Governance Gap Report.
- Community Bank AI Training Benchmark.
- Credit Union AI Adoption Snapshot.
- AI Risk and Controls Briefing.

These can eventually become gated downloads.

### Lane 4 — Tools & Artifacts

Practical resources people can lift and use.

Purpose:

- Make research actionable.
- Bridge into the Foundation Course and toolbox.
- Show that the Institute is practical, not just theoretical.

Examples:

- AI use-case inventory template.
- Acceptable use card.
- Department AI readiness checklist.
- Vendor AI review checklist.
- Board briefing outline.
- Prompt risk review checklist.

## 7. Recommended Page Structure

### Section 1 — Hero

Purpose:

Introduce The AI Banking Brief and clarify that this is research for bankers, not generic AI commentary.

Recommended hero copy:

**Eyebrow:** Research from the Institute

**Title:** The AI Banking Brief.

**Lede:**

> Sourced analysis, field notes, and practical artifacts for community banks and credit unions adopting AI safely.

Primary CTA:

> Take the Free Assessment

Secondary CTA:

> Subscribe to the Brief

Newsletter card:

- Keep newsletter signup prominent.
- Emphasize practical, no-fluff research.
- Current “No tracking pixels · one-click unsubscribe” proof point is good.

### Section 2 — Featured Brief

Purpose:

Show the latest or most important flagship essay.

Content:

- Essay category.
- Title.
- Dek.
- Date.
- Read time.
- CTA: `Read the full brief →`

Recommended behavior:

- If no featured essay exists, show an editorial placeholder or “Start here” feature instead of leaving the page feeling empty.

### Section 3 — Start Here by Role

Purpose:

Help different banking personas find the right entry point.

Cards:

1. For Executives
   - Suggested content: widening AI gap, efficiency ratio, member-switching.
   - CTA: `Read executive briefs →`

2. For Risk & Compliance
   - Suggested content: governance without jargon, six ways AI fails, vendor review.
   - CTA: `Read risk briefs →`

3. For Operators & Trainers
   - Suggested content: skill not prompt, use-case inventory, meeting summaries.
   - CTA: `Read operational briefs →`

4. For IT & Security
   - Suggested content: data boundaries, tool control, shadow AI, acceptable use.
   - CTA: `Read security briefs →`

### Section 4 — Latest Research

Purpose:

Archive the newest essays and field notes.

Content:

- List or grid of recent content.
- Filters by category.
- Search if content volume warrants it later.

Recommended categories:

- Governance
- Risk & Controls
- Training & Skills
- Operations
- Member Impact
- Examiner Trends
- Tools & Artifacts
- Field Notes

### Section 5 — Practical Artifacts

Purpose:

Make the research page useful and lead-generating.

Cards:

- AI Use-Case Inventory
- Acceptable Use Card
- Vendor AI Review Checklist
- Board Briefing Outline
- Prompt Risk Review Checklist

CTA options:

- `Download the artifact`
- `Get the template`
- `Unlock with email`

Recommendation:

Keep one or two artifacts ungated to build trust. Gate stronger bundles later.

### Section 6 — Regulatory Watch

Purpose:

Show the Institute is tracking relevant banking AI governance developments.

Content format:

- Short summaries.
- Plain-English interpretation.
- “What this means for your institution.”
- Links/citations to official sources where applicable.

Potential sources/topics:

- SR 11-7
- Interagency TPRM guidance
- FFIEC materials
- NCUA expectations
- CFPB AI/model-related enforcement themes
- FinCEN/BSA operational risk implications
- State privacy/AI rules where relevant

Important:

This should not become legal advice. Use careful language:

> This is educational analysis, not legal or regulatory advice.

### Section 7 — Research-to-Action CTA

Purpose:

Push readers into the product ladder.

Recommended CTA block:

**Title:** Turn research into readiness.

**Copy:**

> Start with the free AI readiness assessment. If your results show momentum or risk, use the In-Depth Assessment to diagnose the gaps, then build the skills through AiBI-Foundation.

Buttons:

- `Take the Free Assessment`
- `Get the In-Depth Assessment`
- `View AiBI-Foundation`

## 8. Content Model

Recommended content types:

### Brief

Long-form essay or analysis.

Fields:

- slug
- title
- dek
- date
- category
- readMinutes
- author
- tags
- roleAudience
- primaryCta
- featured
- draft

### Field Note

Short-form commentary.

Fields:

- slug
- title
- dek
- date
- category
- readMinutes
- author
- tags
- roleAudience
- relatedProduct
- draft

### Dossier

Premium downloadable/report-style content.

Fields:

- slug
- title
- dek
- date
- category
- gated
- downloadHref
- relatedAssessment
- leadCaptureFormId
- draft

### Artifact

Practical tool/template.

Fields:

- slug
- title
- description
- format
- category
- gated
- downloadHref
- relatedFoundationModule
- leadCaptureFormId
- draft

## 9. CTA System

Each content piece should have one primary CTA based on topic.

### CTA mapping

Broad AI readiness / adoption topic:

- `Take the Free Assessment`

Deep readiness / governance / diagnostic topic:

- `Get the In-Depth Assessment`

Skill-building / workflow / prompt topic:

- `Enroll in AiBI-Foundation`

Executive / institution-level topic:

- `Talk to us about team readiness`

Artifact/template topic:

- `Download the artifact`

### Required behavior

- No essay should end without a next step.
- The next step should match the reader’s intent.
- Avoid generic “learn more” CTAs.

## 10. Migration Plan

Current `ESSAYS` is empty and `LEGACY_ESSAYS` holds six content entries.

Recommended migration sequence:

### Phase 1 — Keep current archive working

- Preserve current `/research` page.
- Ensure legacy links to `/resources/...` still work.
- Do not break existing content.

### Phase 2 — Migrate legacy essays to MDX

For each legacy essay:

1. Create `content/essays/<slug>.mdx`.
2. Export `meta`.
3. Move entry from `LEGACY_ESSAYS` to `ESSAYS`.
4. Confirm `/research/<slug>` renders.
5. Redirect or preserve `/resources/<slug>` as needed.

### Phase 3 — Add content type distinctions

- Add type/category support for Briefs, Field Notes, Dossiers, and Artifacts.
- Update `EssayArchive` or create a more general `ResearchArchive`.

### Phase 4 — Add role-based start section

- Add “Start Here by Role” cards.
- Map content to reader roles.

### Phase 5 — Add artifact/download section

- Start with 2–3 artifacts.
- Decide which are ungated vs email-gated.

## 11. Visual Design Direction

The research page should use the Ledger design language.

Tone:

- Editorial.
- Serious.
- Useful.
- Bank-native.
- Not SaaS gimmicky.

Visual references:

- Policy research institute.
- Asset manager commentary page.
- Banking intelligence memo.
- Think-tank archive.

Use:

- Strong typography.
- Clear categories.
- Editorial spacing.
- Subtle dividers.
- Featured content hierarchy.
- Practical artifact cards.

Avoid:

- Blog-card clutter.
- Cartoon AI graphics.
- Generic tech gradients.
- Endless grids of same-looking cards.

## 12. Recommended Copy Blocks

### Hero option

**The AI Banking Brief.**

Sourced analysis, field notes, and practical artifacts for community banks and credit unions adopting AI safely.

Start with the latest brief, download a practical artifact, or take the free readiness assessment to see where your institution stands.

### Newsletter card

**Get the Brief.**

Fortnightly research on AI adoption, risk, and practical workflows for community financial institutions.

No hype. No generic AI news. Just banker-useful analysis.

### Artifact section

**Tools you can lift.**

Practical templates and checklists built for regulated financial institutions, not generic office work.

### Regulatory Watch

**Regulatory watch, translated.**

We track the guidance and enforcement themes that shape AI use in banking — then translate them into practical operating implications.

### Bottom CTA

**Turn research into readiness.**

Take the free assessment, pressure-test your results with the In-Depth Assessment, then build the skills and artifacts through AiBI-Foundation.

## 13. SEO and Metadata

Recommended title:

`Research — The AI Banking Brief | The AI Banking Institute`

Recommended description:

`Sourced AI research, field notes, and practical artifacts for community banks and credit unions adopting AI safely.`

Primary keywords:

- AI banking research
- AI readiness banking
- AI governance community banks
- AI training credit unions
- bank AI adoption
- credit union AI adoption

Important:

SEO should not turn this into generic content sludge. The page’s credibility matters more than keyword stuffing.

## 14. Analytics Events

Track:

- `research_viewed`
- `research_subscribe_clicked`
- `research_article_clicked`
- `research_artifact_clicked`
- `research_artifact_downloaded`
- `research_cta_assessment_clicked`
- `research_cta_indepth_clicked`
- `research_cta_foundation_clicked`

Props:

- content_slug
- content_type
- category
- role_audience
- cta_type

## 15. Acceptance Criteria

The research page is successful when:

- It clearly presents The AI Banking Brief as a serious research surface.
- It does not feel like a generic blog.
- Legacy essays remain accessible.
- At least one featured brief appears.
- The archive is easy to scan.
- The page includes newsletter signup.
- The page includes clear CTAs into the assessment/course ladder.
- The page has a path for practical artifacts.
- The page supports role-based browsing.
- The page strengthens trust in The AI Banking Institute.

## 16. Out of Scope for V1

Do not build these yet:

- Full searchable content database.
- Complex CMS.
- Paid research subscription.
- Member-only research vault.
- Advanced personalization by reader role.
- AI-generated content feed.
- Daily news operation.

## 17. Related Issue

This file corresponds to GitHub issue #98:

`Design brief: Rebuild /research as The AI Banking Brief credibility and lead engine`

## 18. Final North Star

The research page should make a banker think:

> “These people are paying attention to the right things. They understand banking. I should trust their assessment and course.”

That is the job.
