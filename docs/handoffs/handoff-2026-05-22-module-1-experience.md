# Handoff — Module 1 guided-experience prototype (design phase)

**Date:** 2026-05-22 · **Context:** Designing the *learner experience* (UI/UX) for Foundation Module 1 as a clickable prototype, before wiring into Next.js. All 12 module *contents* are already locked in `docs/foundation-course-modules.md`. This handoff captures the owner's latest, detailed refinement brief so a fresh session executes it without losing the thread.

## Files (in the brainstorm folder — session-local, gitignored)
- **`.superpowers/brainstorm/43125-1779397393/content/module-1-experience.html`** — the clickable prototype (current = "v4", brand-recolored to Ledger). Deep-linkable: `#s=<0-6>&demo=1`.
- **`.superpowers/brainstorm/43125-1779397393/content/module-1-canvas.html`** — a design-canvas board that tiles all 7 screens live (embeds the prototype via iframes). Open this to review/compare.
- Verify any change with Playwright screenshots (worktree `~/Projects/TheAiBankingInstitute/.worktrees/foundation-build` has playwright). **Prove it yourself — never hand the owner a localhost link to QA.** See memory [[build-to-craft-and-prove]].

## Current state (what's already built)
Three-zone guided flow: left = module journey (6 steps + purpose lines + "You'll earn"); center = one beat at a time in a contained learning card; right = living Toolbox (teases locked cards → fills on earn, with a progress meter). Start screen → 6 stepped beats → recognition close. Inline SVG iconography + a hero illustration + an annotated email infographic. Micro-motion (step fade, tile fill, after-card delayed entry, card-earn pop, progress fill). Per-tile personalized Step-1 responses, per-option Step-2 nudges, "made-up example" label on the email, "You earned…" Step-5 heading, "You can now…" Step-6 list, "Keep out of public tools" + freeing line on Step-4, momentum button labels. **Owner verdict: structurally right, but still "underwhelming" — lacks emotional weight / "moments."**

## ✅ PALETTE — RESOLVED 2026-05-22: Full Ledger brand
Owner chose **Full Ledger brand** (gold accent `#7C5814`, parchment `#ECE9DF`/paper `#F4F1E7`, ink `#0E1B2D`, navy `#1E3A5F` as the positive/earned color, oxblood `#8E3B2A` destructive-only). **The current v4 build is already on this palette — no recolor needed.** Point #10's "teal/navy as the main system" is **overridden** by this decision. BUT the *craft intents* inside #10 still apply within the Ledger palette: serif (Newsreader) for major titles only; clean sans for UI/body; **reduce letter-spaced all-caps labels**; increase active-state contrast; gold reserved for accent + "earned" moments while navy does the positive workhorse role; shadows/borders used with more confidence.

## The refinement brief (owner, 2026-05-22) — make existing moments LAND HARDER, don't add content

**Core problem:** every screen has the same emotional weight → flat. Module 1 needs **three high-impact moments** with visibly different intensity:
1. **Welcome** — "this is professional; I know what I'm about to do."
2. **Email transformation (Step 3)** — "oh, *that's* what AI does for me." (the unforgettable moment)
3. **Toolbox payoff (Step 5)** — "I earned something; my kit has begun."

**THE 3 HIGHEST-IMPACT FIXES (do these first):**
1. **Step 3 dramatically more visual** — progressive reveal: (1) messy email alone → (2) the plain-English instruction → (3) the cleaned-up result. Even if all end visible, reveal them in sequence. After card visibly cleaner/more structured (Subject · Action · Owner · Deadline · Escalation), difference obvious before reading. Keep "Sample training email — no real customer information" label.
2. **Step 5 real earned-card payoff** — heading "**You earned your first two cards.**" Cards as product cards (name + "Use when…" + "Saved to Toolbox ✓"). Toolbox panel visibly comes alive: card slides in, check appears, progress fills, "2 cards saved · Your kit has begun."
3. **Step 6 stronger recognition** (not "complete") — "You're ready," then a **"You can now…"** capability list (5 items, gently revealed), then identity line, then Module 2 teaser + "Continue to Module 2."

**Full point list:**
1. Welcome = real product entry point: subtitle "A calm first step into practical, safe AI use." + three promises ("You'll see where AI fits…", "You'll watch one messy email become clear", "You'll save your first two Toolbox cards") + two cards shown "unlocks in this module." Hero illustration should preview the module: **messy note → clear email → saved card** (more premium/relevant, less generic floating cards).
2. **Bigger, more dominant center card** — increase card width, title size, body readability, internal spacing, hierarchy, button prominence. It currently feels compressed inside the chrome; pull the eye to the active beat. Especially Step 3.
3. **Step 1 feedback more specific per choice** (already per-tile; make sure each is distinct & intelligent — see examples in brief).
4. **Step 2 = relief, not information** — add a top line "The map is smaller than it feels." Make the reassurance **"You don't need all of them. Start with one."** visually prominent (it's the emotional payoff), not buried.
5. Step 3 — see #1 above (hero/progressive reveal).
6. Step 4 — calm already; make the freeing line stronger: **"You can still get the help. Just remove the identifying details."** Safety should feel enabling.
7. Step 5 — see #2 above.
8. Step 6 — see #3 above.
9. **Right Toolbox = living companion, not status box** — must visibly change at Step 5 (this teaches "the course builds something personal"). Before: "Your kit starts here. / 0 of 2." After: "2 cards saved / Rewrite ✓ / Summarize ✓ / Your kit has begun. / 10 more modules to fill it."
10. **Typography & palette confidence** — serif for major titles only; clean sans for UI/body; **reduce letter-spaced all-caps labels** (they read "design concept," not finished product); increase contrast on active states; more polished/clickable buttons; **palette per the OPEN DECISION above**; use shadows/borders with more confidence (currently slightly flat).
11. **Micro-motion** — step fade/slide; selected tiles fill + check; Step 3 After reveals after the prompt; Step 5 cards slide into Toolbox; Toolbox progress fills; Step 6 "You can now" list gently reveals. Subtle, not gamified.
12. **Buttons momentum-oriented** — "Continue to the two kinds of tools," "See the email transformation," "Learn the safety habit," "Save your cards," "See what you can do now," "Continue to Module 2." (mostly done — keep.)

**Target feeling:** "I was guided. I saw something useful happen. I stayed safe. I earned something. I'm ready for what's next."

## Resume command
New session: *"Continue the Module 1 experience prototype — read `docs/handoffs/handoff-2026-05-22-module-1-experience.md`, open `module-1-canvas.html`, and execute the refinement brief (lead with the 3 highest-impact fixes). First confirm the palette decision."* After the design is locked, wire it into the Next.js app (the lesson→earned-card→Toolbox plumbing already works on `feature/foundation-build` — see [[project-foundation-course-experience]]).
