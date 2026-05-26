---
reviewer: Conversion specialist (independent)
date: 2026-05-26
branch: feature/redesign-mockup-system
---

# Review — Conversion lens

## Executive summary

- **Most surprising finding:** the `/research` and `/research/the-widening-ai-gap` pages ship a completely **different global navigation** (Education · For Institutions · Research · About · Take Assessment · Sign In) than every other page on the site (Home · Course · Assessment · Sandbox · Toolbox · Teams · Start Free). Two different mental models of the site live in the same build. Severe trust hit when a visitor sails from the Brief back to "/" and the chrome shifts under them.
- **Top-of-funnel H1 fails Krug's "what is this":** the home H1 reads "Train people to use AI without losing control." That speaks to a CHRO who already bought the premise. A visitor in 5 seconds learns nothing about *who you are* or *what you sell* until the subhead. Lead with the noun, not the verb.
- **The purchase page hides a 7-button site-nav at the top, then gates the only payment button behind "Sign in to enroll"** — auth-wall before paywall is among the most studied conversion killers in checkout UX. There is no guest checkout, no "create account at the end," and no preview of what's behind the sign-in.
- **Pricing is hard to parse everywhere:** "$295 · $199 at 10+ · Lifetime access" appears inline as a dot-separated string. Visitors scanning at 8 seconds will read this as one number. Break it apart.
- **The assessment is doing one thing right that the rest of the site is not** — the "Try it · 4 sample questions · No email needed" widget directly above the email gate is the strongest pre-commit pattern on the site. It is the only page that successfully removes the "what happens after I click?" anxiety.

## Per-page findings

### `/`

**First-fold verdict:** mixed — eyebrow + subhead salvage the H1, but the H1 itself does not answer "what is this."

- **HIGH** H1 "Train people to use AI without losing control." reads as an internal value-prop. The eyebrow "Built for banks, credit unions, and regulated teams" + subhead "Independent AI assessment and education for community banks and credit unions" do the work the H1 should be doing. Swap them: lead with "AI training and readiness assessment for community banks and credit unions," then "Train people to use AI without losing control" becomes the supporting line.
- **HIGH** Above-the-fold CTA stack offers four choices in close visual proximity: "Take the assessment" (likely primary), "View the curriculum", "Sample report 62 / 100 readiness", and a top-right "Start Free." Hick's-law violation. The user has to read all four before picking. The "Sample report" card is graphically dominant and competes with the actual CTA.
- **MEDIUM** The product suite block "01 Free Readiness Assessment / 02 In-Depth / 03 AiBI-Foundation" is three priced options on a single comparison row. Good — but the numbers in "$99 · $79 at 10+ by request" and "$295 · $199 at 10+ · Lifetime access" run together. Stack vertically with bold on the headline price.
- **MEDIUM** Section H2s are conversational ("One command center. Three places it sends you." / "Useful work becomes a reusable asset.") — beautiful as editorial, weak as scanning anchors. A visitor scrolling fast learns nothing from them. Add a 2–4 word kicker above each ("Platform" / "Toolbox" / "Outcomes") — the kickers are already in the design system; use them.
- **LOW** "Sample report" card with the "62/100 readiness" ring on the hero invites the question "is that mine?" — no, it's an example. Label it "Example output — not your score yet."

### `/assessment`

**First-fold verdict:** pass — the strongest first fold on the site.

- **GOOD (do not change)** The H1 "See where you stand. Find the dimension dragging you down." plus the live "Try it · 4 sample questions · No email needed" widget removes the two biggest assessment-funnel anxieties (will I waste my time / will you spam me). Keep.
- **MEDIUM** Three options ("Readiness Baseline / In-Depth Report / Team View") appear directly under the live try-it widget, but the second one is "Get In-Depth · $99" — that CTA shows up *before* the visitor has completed the free one. That violates the funnel logic the spec describes. Demote the In-Depth and Team CTAs to a secondary band; the primary CTA on this page should be a single, dominant "Take the assessment" button.
- **HIGH** Sub-heading "Three assessments. One readiness signal." — by the time the visitor reaches it they have already seen three sample questions, a sample report, and three pricing tiers. This is the third "compare your options" surface on a page whose job is to convert *one* action. Cut or move below the fold.
- **LOW** The eyebrow "Assessments · Free baseline + $99 in-depth" surfaces the upsell in the first six words of the page. Surfacing a paid number above the free CTA primes loss aversion. Drop the "$99" until after the free flow is complete.

### `/education`

**First-fold verdict:** mixed — the page is honest but reads as a catalog, not a path.

- **HIGH** H1 "Use our assessments to measure you or your team's readiness." is grammatically clumsy ("you or your team's") and instructs the visitor instead of describing the offer. Rewrite to a noun phrase: "Assessments and certifications for community-bank teams."
- **MEDIUM** The page presents 1 free + 1 paid assessment, the AiBI-Foundation course, and AiBI-S/L credentials — four products on one page with parallel CTA buttons ("Take the free assessment →", "Begin the In-Depth Assessment →", "View the curriculum", "Book a briefing"). No visual hierarchy among the four. New visitors will bounce to whichever has the bolder label, which today is roughly tied.
- **MEDIUM** "$99 · $79 at 10+ by request" — "by request" is conversion friction. If you can't self-serve the volume discount, hide it from the scan and put it in fine print or an "Institutions" link.
- **LOW** "AiBI-S Specialist and AiBI-L Leader." appears as an H2 without a single CTA below it that lets the visitor act on it. If those credentials aren't available yet, say so (and provide a notify-me); if they are, they need a primary action.

### `/for-institutions`

**First-fold verdict:** pass — clearest "who is this for" of any page.

- **MEDIUM** Top-right CTA changes from "Start Free" (every other page) to "Book Briefing" on this page only. Defensible — institutional audience — but the inconsistent global nav makes the rest of the site feel like a different product. Resolve by keeping both CTAs in the header on every page and toggling visual emphasis by route.
- **HIGH** The "Three ways to build" block stacks Free Readiness, Per-banker Course, and Organizational Rollout side by side with three primary CTAs ("Begin the assessment", "View the curriculum", "Request a pilot"). For an institutional buyer who lands on this page from a referral, the most likely intent is "talk to a human" — make "Book Executive Briefing" the dominant CTA and demote the other two to secondary.
- **MEDIUM** "Get this quote in writing" / "Get a Quote" / "Get Seat Pricing" / "Book a Briefing" / "Book Executive Briefing" — five different CTA verbs for what is functionally the same conversion (talk to sales). Pick two: "Book a briefing" (primary), "Request seat pricing" (secondary).
- **LOW** "Institution Dashboard · First National · Sample" — make sure "Sample" is visually heavy. Buyers who screenshot this will share it as if it were real reporting.

### `/about`

**First-fold verdict:** mixed — H1 is editorial, not scannable.

- **MEDIUM** H1 "For the community banks and credit unions that anchor towns — not the twenty largest banks." is a 20-word manifesto. Beautiful as a pull quote inside the page, weak as the first line a visitor reads. Above this, the eyebrow should answer "what is this page" — likely just "About The AI Banking Institute."
- **MEDIUM** Six principles ("Bankers, not platforms." / "Sourced numbers only." / "Regulator-aligned by design." / "Reviewed work, not quizzes." / "Self-paced, role-aware." / "Plain language, plain prices.") are H3s with body underneath. Good structure. But the page ends without a "now what" — last block is "Start with the readiness assessment. Or book a briefing." which gives two equally weighted CTAs. Pick one as primary.
- **LOW** No founder name, no photo, no credentials visible in the visible text I parsed. About pages convert when a real person is visible. Confirm Founder bio is present and above the fold of the second screen.

### `/security`

**First-fold verdict:** pass — strongest trust-signal first fold.

- **GOOD** "Aligned with SR 11-7, the Interagency TPRM Guidance, ECOA / Reg B, and the AIEOG AI Lexicon — published by the US Treasury, FBIIC, and FSSCC in February 2026" appears in the first 200 words. This is the regulatory citation pattern every other page should adopt above the fold.
- **HIGH** Form fields visible above the fold: "Your name / Work email / Institution / Email me the guide." Three fields is fine. But there's no privacy line ("We email the guide. We don't sell your address.") next to the submit button. Single biggest abandonment factor on lead-magnet forms.
- **MEDIUM** Six chapter cards are H3s in a grid with no CTAs. The visitor cannot peek at any chapter to evaluate quality before handing over an email. Add a "Read the first chapter free" link below the form to reduce gate-anxiety.
- **LOW** "Free download The Safe AI Use Guide." reads as two stacked H2s in the extracted text — confirm visually one is a kicker.

### `/research`

**First-fold verdict:** fail — different global nav, ambiguous first action.

- **BLOCKER** Global nav on this page is `Education · For Institutions · Research · About · Take Assessment · Sign In`. On every other page it is `Home · Course · Assessment · Sandbox · Toolbox · Teams · Start Free`. Two navigations = two products. Pick one.
- **HIGH** H1 "The AI Banking Brief." is the brand name of the newsletter, not a description. A visitor arriving cold via SEO or LinkedIn has no idea this is research vs. a newsletter vs. an archive. Eyebrow + subhead exist ("Independent AI research for community banks and credit unions. Sourced, examiner-aware, free.") — promote the subhead to H1, demote "The AI Banking Brief" to kicker.
- **HIGH** Two primary CTAs side by side: "Take the assessment →" and "Subscribe →". They are competing for the same click and the page can't decide which it wants. For a research index, "Subscribe" should be primary; "Take the assessment" is the cross-sell.
- **MEDIUM** The four-number "state of AI at the desk" chart shows "66% / 57% / 55% / 48%" with single-line source attributions. Strong scannable trust signal — keep.
- **MEDIUM** The marquee ticker repeats the same five sourced statistics twice in the first fold (FDIC · GARTNER · PERSONETICS · GAO · MOTLEY FOOL · FDIC · GARTNER · PERSONETICS · GAO · MOTLEY FOOL). Either remove the duplication or make it a true marquee (CSS scroll), not duplicated DOM.

### `/research/the-widening-ai-gap`

**First-fold verdict:** mixed — strong headline, weak conversion path.

- **HIGH** Same nav-mismatch BLOCKER as `/research`.
- **MEDIUM** H1 "The widening AI gap — and what it means for community banks." is excellent — specific, audience-named, claim-led.
- **HIGH** Article-end CTA "See where your institution stands in under three minutes." with "Take the assessment" is the right cross-sell, but it appears at the bottom of a 912-word article. A sticky CTA (right rail or footer) is standard for long-form. Without it, every scroll-bounce mid-article is lost.
- **MEDIUM** "The AI Banking Brief." subscribe CTA at the bottom competes with the assessment CTA at the bottom. Pick one bottom-of-article action.

### `/my-toolbox`

**First-fold verdict:** fail — page sells the course, doesn't preview the toolbox.

- **BLOCKER** This page is reachable from the main nav as "Toolbox" but the first-fold experience is a paywall: "Enroll · $295" / "Browse the preview" / "Get with the Course · $295" appear above any actual toolbox content. A visitor who clicked "Toolbox" expecting to see the toolbox sees pricing. This is the bait-and-switch pattern users back-button from. Either rename the nav item to "Toolbox preview" or actually let visitors browse a few prompts before the paywall.
- **HIGH** "View 3 saved variations" is presented as a CTA without context — variations of what? The visitor hasn't seen the original yet.
- **MEDIUM** Six category cards (Compliance / Branch / Retail / Marketing / Lending / BSA-AML / IT-InfoSec) — good visible breadth. But every card resolves to the same paywall. Let at least one prompt be fully readable to demonstrate the "every prompt is a fully-built artifact" claim that appears as the H2.
- **LOW** "KYC Refresh: Frontline Guide" — this single fully-shown prompt artifact in the page body IS the proof the H2 promises. Surface it higher; it's currently buried mid-page.

### `/courses/foundation/program/purchase`

**First-fold verdict:** fail — the highest-stakes page on the site has the weakest conversion path.

- **BLOCKER** The primary CTA above the fold is "Sign in to enroll." Auth-before-payment is the single most expensive friction pattern in e-commerce checkout. A visitor who arrived from a marketing page with a credit card ready is now asked to remember (or create) an account password before they can give you $295. Stripe Checkout supports guest checkout — use it, capture the email *during* Stripe Checkout, and provision the account on `payment.success` (which is what the CLAUDE.md webhook plan already describes).
- **HIGH** Above the price, the visible text is: "AI Banking Foundation. In less than two weeks, every community banking employee can write better, summarize faster, think clearer, and avoid risky AI mistakes — safely and confidently, on the model your institution already trusts." Five verbs in one breath. The promise is strong but the scan can't catch any single hook. Lead with the outcome the buyer is actually paying for: "Become safely productive with AI in twelve modules. Lifetime access. $295."
- **HIGH** "Per seat $199 at 10+ seats $295" — the visible text concatenates the seat discount and the single price in a way no visitor will parse on first pass. Stack them: "**$295** · one-time · lifetime access" with "$199/seat at 10+ — see team pricing" as a secondary line below.
- **MEDIUM** Seven FAQs appear below the curriculum. Refund policy ("Finish Module 01, ask for refund within 14 days, no exit interview") is buried as FAQ #07. Surface it as a trust-band directly under the price button: "14-day refund. No exit interview." Big lever for first-time buyers.
- **MEDIUM** Two visible "Enroll" CTAs ("Enroll · AiBI-Foundation" top card, "Enroll — $295 →" bottom). Both currently route through the sign-in wall. After the wall is removed, leave both — long pages need a bottom CTA.
- **LOW** The course-shell sidebar (Awareness 01-02, Understanding 03-05, Creation 06-09, Application 10-12) renders for a non-enrolled visitor, which makes the structure visible but also gives the impression they have access already. Confirm visually the lock state is unambiguous.

## Cross-page patterns

1. **Inconsistent global navigation.** The site ships two distinct headers (the marketing nav and the research nav). Highest-leverage cross-page fix on the site. Estimated effort: 1 hour.
2. **Pricing is concatenated with dots and middots.** Every paid product reads "$X · $Y at 10+ · feature" as a single line. Visitors scanning at 8 seconds will not parse it. Stack vertically in every appearance. Estimated effort: 2 hours.
3. **Hick's-law violations.** Five surfaces (home hero, education catalog, for-institutions "three ways", assessment top, research index) show three or more parallel CTAs at equal weight. Pick a primary on each.
4. **Editorial H2s with no kicker.** The Ledger / mockup aesthetic favors conversational section headlines ("Useful work becomes a reusable asset."). They scan poorly. Add the 2–4 word mono kickers that already exist in the design system above every H2.
5. **CTA verb sprawl.** Across the site: "Take the assessment", "Begin the assessment", "Start the assessment", "Start Free", "Start Free Assessment", "Take Assessment". Pick one verb per action and use it everywhere. Same problem with "Book Briefing" / "Book a briefing" / "Book a Briefing" / "Book Executive Briefing" / "Schedule" / "Get a Quote" / "Get this quote in writing" / "Get Seat Pricing" / "Request a pilot." This is six different ways to ask for the same call.
6. **Trust signals exist but are unevenly surfaced.** `/security` puts the SR 11-7 / AIEOG citations in the first 200 words. `/`, `/assessment`, `/education`, `/courses/.../purchase` do not. The single most important credibility cue for a regulated audience is buried on pages with sales intent.
7. **The "demo before commit" pattern works.** The assessment's 4-question try-it widget is the one pattern that demonstrably reduces "what happens when I click" anxiety. Replicate on `/my-toolbox` (let visitors read one prompt fully) and `/courses/foundation/program/purchase` (let visitors read Module 01's first lesson fully).

## Top 5 highest-impact fixes

| # | Fix | Effort | Conversion-impact rationale |
|---|-----|--------|---|
| 1 | **Remove the sign-in wall on `/courses/foundation/program/purchase`.** Route the "Enroll — $295" button directly to Stripe Checkout (collect email there), provision the Supabase Auth account on `payment.success`. | 1 day | This is the single most measured friction pattern in checkout UX. Baymard's checkout-usability research puts forced-account-creation among the top three drop-off causes. For a $295 product with cold-traffic conversion in the low single digits, removing this can move conversion 20–40%. |
| 2 | **Unify the global navigation across `/research/*` with the rest of the site.** | 1 hour | Two different navs = two products. Visitors who cross the boundary lose orientation. Cheapest fix on the list by hours-to-impact. |
| 3 | **Rewrite the home H1 and primary CTA hierarchy.** Lead with what the institute IS, not what it does. Make exactly one CTA dominant. | 2 hours | The 5-second test is failing today. Every downstream conversion is metered by how confidently the home page positions itself. |
| 4 | **Stack pricing across the site.** "$295" as the dominant number, "lifetime access" / "$199 at 10+" as secondary lines beneath. | 2 hours | Hick's law and basic scanning research. Cheap, sitewide. |
| 5 | **Add a sticky in-article CTA on `/research/*`** with "Take the assessment" and surface the regulatory-citation trust band on `/`, `/assessment`, and `/courses/foundation/program/purchase`. | half day | Articles convert poorly without sticky CTAs. Sales pages without regulator-aligned citations under-convert for an examiner-anxious audience. Both are well-understood B2B funnel patterns. |
