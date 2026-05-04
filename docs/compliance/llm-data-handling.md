# LLM Data Handling — Provider Stance

**Status:** Filled by Plan D, 2026-05-04.

This document is the audit trail for §5.3a of the AiBI Toolbox design spec
(`docs/superpowers/specs/2026-04-29-aibi-toolbox-design.md`). It records
the data-handling stance of each LLM provider used in the AiBI Toolbox
Playground, on the specific API tier in use, with a verification date and
link to the provider's published terms.

**Review cadence:** quarterly, by the engineering owner. Each review
either re-confirms the stance (and updates the "Last verified" date) or
files an issue if the terms have changed. Next review due: 2026-08-04.

**Owner:** James Gilmore (`@Gilmore3088`).

---

## Anthropic
- **Tier in use:** Commercial API (paid, default).
- **Last verified:** 2026-05-04.
- **Provider terms link:** https://www.anthropic.com/legal/commercial-terms (data handling clauses) and https://www.anthropic.com/legal/privacy (Inputs and Outputs section).
- **Stance:** Anthropic does not train on customer prompts or completions submitted via the paid Commercial API by default. Customer Inputs and Outputs are processed solely to provide the API service. No opt-in to model training is configured for the AiBI Toolbox.

## OpenAI
- **Tier in use:** OpenAI API (paid, post-March 2023 default).
- **Last verified:** 2026-05-04.
- **Provider terms link:** https://openai.com/policies/api-data-usage-policies/ and https://openai.com/policies/business-terms/.
- **Stance:** As of OpenAI's March 2023 policy update, API inputs and outputs are not used to train OpenAI models by default. The AiBI Toolbox does not opt in to data sharing for model improvement. OpenAI retains API data for up to 30 days for abuse and misuse monitoring, then deletes it (see policy page for the current retention window).

## Google (Gemini)
- **Tier in use:** Gemini API, **paid tier only**. (The Toolbox does not use the free tier for production traffic.)
- **Last verified:** 2026-05-04.
- **Provider terms link:** https://ai.google.dev/gemini-api/terms (paid services data use clauses).
- **Stance:** On the paid Gemini API tier, Google does not use prompts or responses to improve Google products (including not using them to train Google's generative models) under current terms. **Important caveat:** the free Gemini API tier has different terms (prompts may be used to improve products, and human reviewers may read and annotate inputs/outputs). The Toolbox enforces paid-tier billing on its `GEMINI_API_KEY`; if a learner-facing key were ever swapped for a free-tier key, this stance would not hold and the doc would need to be updated immediately.

---

## Surfacing in product

The Playground UI shows a "Last verified [date] — provider data-handling stance" link beneath the model picker (`src/app/dashboard/toolbox/_components/ModelPicker.tsx`). The `STANCE_LAST_VERIFIED` constant in that file MUST be kept in lockstep with the dates in this document.

## Review log

| Date | Reviewer | Outcome |
|---|---|---|
| 2026-05-04 | @Gilmore3088 | Initial fill (Plan D). All three stances verified against current provider terms. |
