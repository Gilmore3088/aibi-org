# System Rebrand

_Started 2026-05-09 23:52 UTC_

---

## User

help me rebrand the entire system -----

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: questions_v2]_

## User

Questions answered:
- scope: Keep AI Banking Institute name, refresh everything else
- name_direction: Keep "The AI Banking Institute" + AiBI nickname
- feel: Explore a few options
- current_vibe: very claude-esque 
- audience: All of the above equally
- color_direction: 4, 2, 1, 5, 0
- type_direction: Explore a few options
- deliverable: Full brand guidelines document (multi-page)
- must_keep: the Practitioner name, the Readiness name, the Ai Banking Institute name, 
- inspiration: IbisWorld, https://corporatefinanceinstitute.com/ for the function - teaching professionals. for LMS: https://www.linkedin.com/learning/intro-to-snowflake-for-devs-data-scientists-data-engineers/intro-and-course-overview. ;;; general idea came from https://genaipi.org/, lms https://trailhead.salesforce.com/ ////// type of courses https://genaipi.org/courses

## Assistant

_[tool: snip]_

_[tool: update_todos]_

I'll add a Tweaks panel so you can explore brand directions live in the briefing — and replace the circular "R" mark (which reads as a magazine logomark) with several institute-appropriate alternatives.

_[tool: snip]_

_[tool: str_replace_edit]_

Doing all 5 comment fixes plus the Tweaks build in one pass.

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: snip]_

Done. Changes applied:

**Comments**
- Title now reads "AI Readiness *Brief.*" — one line
- "Pressure" → "Impact" on all three operating implications
- "~15 min" → "~5 min" — less exaggerated
- "Copy it. Run it. Refine it." caption moved above the prompt window
- Footer reframed away from magazine-issue language to "The AI Banking Institute · aibankinginstitute.com / Confidential · Do not redistribute"

**Tweaks panel** (toggle from the toolbar)
- **Direction** — Editorial (current) · **Ledger** (Navy + Bone + Gold, default) · Signal (Ink + Cobalt) · Field (Forest + Sage)
- **Brand mark** — Lockup, Glyph + Type, Square Seal, Monogram, Wordmark, Pill Badge (no more circular "R")
- **Headline style** — Serif italic vs Sans display
- **Paper grain** — on/off

The circular monogram is gone; default is the AiBI lockup with the navy/gold institute palette. Toggle Tweaks to swap directions and marks live — settings persist.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: snip]_

Done. Added a **Download .md** button next to Copy in the prompt window's title bar, and updated the caption to: *"Take this prompt to the AI tool your institution already trusts — or save it as a `.md` file on your computer for reuse."* The right-side span now reads "Save · reuse · refine". Clicking Download saves it as `aibi-email-rewrite-prompt.md`.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: snip]_

Done. Stripped magazine-y meta — masthead now shows just the date. Pub line drops the duplicate institute name (since the lockup already carries it) and reads "Confidential · Personal".

## User

Apply drawing

## Assistant

_[tool: snip]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: grep]_

_[tool: read_file]_

Removing all section tags (01–06) across the brief and centering the title.

_[tool: update_todos]_

_[tool: str_replace_edit]_

Already removed in the same pass — all six section tags (01–06) are gone, and the section heads now show just the title.

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Unified into a single block — dropped the awkward grid split and the redundant "Save · reuse · refine" tag. The caption now reads as one continuous line above the prompt window.

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Date is back in the top-right — "May 9, 2026" in serif with a small uppercase mono caption underneath, balancing the lockup on the left without re-adding the magazine masthead clutter.

## User

drop "prepared this week" ----this is a report (free version) that is generated after someone takes an assessment. its a one time generated. if they take another assessment, it will generate a new report.

## Assistant

_[tool: str_replace_edit]_

Dropped. Just the date now.

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Added a "What do you want to learn next?" track picker beneath the recommended next step — four cards (Prompts · Compliance · Agents · Skills), each with a numbered label, short framing line, and an "Open track ↗" CTA. Hover flips the card to ink with the gold accent. Collapses to 2-up on narrow viewports.

## User

Apply comment

## Assistant

_[tool: run_script]_

_[tool: snip]_

Numbers dropped from all four learn cards.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Dropped.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Updated.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

Cards now sit as discrete buttons with breathing room between them — selectable circle in the corner, "Choose this →" CTA, and a hover state that fills with ink and pops a gold check. Reads as a survey choice, not a content grid.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: snip]_

Replaced with "© 2026 The AI Banking Institute".

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: snip]_

Switched the title bar to `align-items: last baseline` — the bottom line of the recipient block ("Mid-size Credit Union · Operations") now sits on the same baseline as the bottom of "Brief.", instead of bottom-aligning the boxes (which let the title's descender space push the recipient up visually).

## User

excellent. i love it. now how to save and move to next project?

## Assistant

_[tool: snip]_

Glad it landed. A few options for what to do next:

**Save / share this report**
- **Download** — open the file menu (top of the chat) and pick "Download project" to grab the HTML. It's self-contained and opens in any browser.
- **Save as PDF** — I can run a print-ready PDF export if you want a paper/email-friendly version.
- **Standalone HTML** — I can bundle it into a single offline file you can email or upload anywhere.
- **PPTX** — exportable as editable PowerPoint slides (less ideal here since this is a long-form report, not a deck).

Just say which one and I'll do it.

**Start the next project**
- Click the project switcher (top-left of the app, where the project name shows) and hit **+ New project** — or open the org/home view to start fresh. This project will stay saved and findable in your project list.

What's next on your list?

## User

well its still in the AI banking Institute project

## Assistant

Right — each chat lives in its own project sandbox, and this one is "AI Banking Institute." To move on:

1. **Save what's here** — your work is auto-saved. Use the file menu / download option if you want a local copy of the HTML.
2. **Start a new project** — click the project picker (top-left of the app, where this project's name shows) and hit **+ New project**. The AI Banking Institute project stays in your project list, findable by name whenever you want to come back.
3. **Or keep going here** — if your next task is related (a follow-up report, a deck version of this brief, more pages for the institute), staying in this project keeps all the brand assets, palette, and components in reach. New project = fresh sandbox = re-establishing context.

What's the next thing you're tackling? If it's still institute-related, I'd stay; if it's a totally different brand or product, new project is the move.

## User

how to start a new page?

## Assistant

A few ways depending on what you mean:

**A new HTML page in this same project** (recommended if it's institute-related — keeps the palette, components, and brand in reach):
- Just tell me what you want — e.g. "make a landing page for the institute," "build a deck version of this brief," "create the assessment intake form." I'll create a new file alongside the briefing.
- I can also link them: a nav bar, a "view the report" button on a landing page, etc.

**A brand-new project** (fresh sandbox, no shared files):
- Click the project name in the top-left of the app → **+ New project** (or go to the home view and start one from there).

What are you trying to make next?

## User

GitHub connected

## Assistant

Welcome — paste a github.com repository URL (repo, folder, or single file) and I'll explore the structure with you and pull in any files you'd like to use as design reference. Useful for things like component libraries, theme tokens, existing pages to redesign, or assets like logos and fonts.

## User

i want to design the LMS and user experience of the course

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: questions_v2]_

Got the picture — Next.js LMS for the AiBI-Practitioner course: 12 modules across 4 pillars (Awareness · Understanding · Creation · Application), pillar-themed activities with a Toolbox sidebar, and a content vocabulary you've already built (terra accent, parch/linen paper, serif/serif-sc/mono type scale).

Before I start mocking, a few questions to anchor the direction:

## User

Questions answered:
- scope: Course overview / landing page (logged-in)
- fidelity: Clickable prototype with real navigation
- variations: we have the existing brand options decided in this project. 
- module_layout: Side-by-side: lesson on left, activity workspace on right, Stepped/wizard flow (one section at a time), Video/visual-led with activities below, Decide for me
- progress_feel: Quiet & professional (subtle ticks, no streaks)
- activity_emphasis: Treated as the artifact: each activity feels like a real document/output
- toolbox: Both — personal artifacts + reference library
- audience: Mixed — design for the broadest banker
- device: Both equally
- ai_in_lms: i have 'Use with Claude" or "use with OpenAI" or " Use with Gemini" etc. each have an API connected. iw ant to show users they can use different models. 
- tweaks: Module-page layout (long-form vs stepped vs split), Sidebar density (compact vs roomy), Progress style (quiet vs gamified)
- anything_else: making a good user experience for learning and building an AI skillset to improve their work. Thats our goal. Improve the user's AI capability. everything should be focused on that. but not giving them a book to read. they learn by doing and doing once they believe.  it needs to give the spcific examples live we already have.

## Assistant

_[tool: snip]_

_[tool: update_todos]_

Plan locked. Building a clickable LMS prototype with:
- **Course overview** (logged-in landing) as the main entry
- **Module page** with three layout variants exposed as tweaks (long-form / stepped / split)
- **Activity workspace** that feels like an artifact, with model picker (Claude / OpenAI / Gemini)
- **Toolbox** (artifacts + library)
- Persistent sidebar w/ density tweak; quiet vs light gamification toggle

Brand from this project's existing system (terra/parch/serif). Real navigation between screens via React state.

_[tool: snip]_

_[tool: copy_starter_component]_

_[tool: write_file]_

_[tool: grep]_

_[tool: snip]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: list_files]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

LMS prototype is up. The shell pulls together:

- **Sidebar** with 4 pillars, 12 modules, learner card, density toggle
- **Overview** with hero, resume strip, outcomes, structured pillar list
- **Module page** in three layouts — Split, Stepped, Long-form (Tweaks)
- **Activity workspace** in module 07 — full prompt scaffolding form, model picker (Claude / OpenAI / Gemini), simulated run + reviewer note, save-to-Toolbox
- **Toolbox** with saved artifacts table + reference library
- **Tweaks panel** persists density, progress style, and module layout

Try Tweaks → jump to module 07 to see the activity under each layout.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: snip]_

Moved — the model picker is gone from the module top bar; the one inside the activity workspace is now the only one on that page.

## User

its still there

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: snip]_

Removed model pickers from the Overview and Toolbox top bars too — the only one left is inside the activity workspace where it belongs.

## User

model picker should be in everyactivity area connected to AI 
....i should be able to have different layouts across different pages. in a perfect world, i have a course bulder that enables me to add more. or a few templates.

## Assistant

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: grep]_

_[tool: read_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

_[tool: snip]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: snip]_

Toolbox now shows version history per artifact — current version pill on each row, expand to see a v1→vN timeline with the model used and the note, plus Compare / Restore actions. Each entry remembers which model produced each version (Claude / OpenAI / Gemini).

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

Goal line is now constrained to a single line with ellipsis overflow.

## User

Apply comment

## Assistant

_[tool: snip]_

_[tool: str_replace_edit]_

Footer simplified to a single primary action plus a quiet back link.

## User

Apply comment

## Assistant

_[tool: snip]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: snip]_

Goal lines trimmed across all 12 modules so each fits on one line at the current size.

## User

what happens after finish course?   woudl nice to have a course summary which recapped their toolbox, usage (tokens, minutes, etc), next steps, social share, downloadable pdf

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Added a **Brand lockup** tweak with four variants — open Tweaks to cycle:

- **Stack** — current "Ai" tile + two-line wordmark
- **Wordmark** — typeset "AI Banking *Institute*" with an est. tagline, no mark
- **Mono** — circular Ai monogram + small caps line
- **Crest** — split A/i tiles (one outline, one filled) + serif italic name

If none feel right, tell me which direction to push (more institutional / more software-y / sharper monogram / etc.) and I'll iterate.

## User

overall this should in the same bran ass the AI reeading Brief. thats the whole reason of staying in this project

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: snip]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: snip]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: snip]_

Brand pulled into line with the Brief:

- **Lockup is now a typographic wordmark** — *AiBI* in serif italic + "The AI Banking Institute" small caps under it. No more monogram circle.
- **Ledger palette applied** — parchment paper (#F4F1E7), navy ink (#0E1B2D), gold accent (#B5862A), navy secondary. All terra references re-aliased to gold so the rest of the UI inherits without per-element edits.

Tell me if any specific surface looks off under Ledger and I'll tune it.

## User

Apply comment

## Assistant

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: snip]_

The AiBI lockup is in the LMS sidebar — *AiBI* serif italic + "The AI Banking Institute" small caps, matching the Brief masthead exactly (same metrics, 2px gap). If you're not seeing it, hard-refresh once.

## User

Apply comment

## Assistant

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

Subtitles tightened to single lines on Overview, Toolbox, and Complete (the Module subtitle was already single-line). Copy shortened where needed and `whiteSpace: nowrap` added so they don't wrap on narrower viewports.

## User

can you design a comprehensive design system for the entire website so my designer can rebuilding?

## Assistant

_[tool: snip]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: snip]_

_[tool: update_todos]_

_[tool: done]_

_[tool: snip]_

`Design System.html` is up — a printable single-page reference styled like the rest of the project. 21 numbered sections, each with a live demo on the left and the spec / dos & don'ts on the right.

What's inside:
- **Brand & voice** — wordmark, on-dark variant, house voice rules
- **Color · Ledger** — every token (`--ink`, `--paper`, `--accent`, `--weak`…) with hex + var name + usage
- **Typography** — full Newsreader/Geist/JetBrains scale, role table with line-height & tracking
- **Layout** — 8-pt scale visualization, 12-col grid demo
- **Rules / Radii / Shadow** — the lines and corners doing the work
- **Components** — buttons, pills, progress dots, cards, sidebar, topbar, section header, tables, model picker, version timeline, form fields, reviewer note
- **Iconography, motion, voice & copy** — guardrails for the things designers usually overdo

Print-friendly (`Cmd-P` gives a clean handoff PDF). Tell me if you want a section split out, more variants per component, or a Storybook-style interactive companion.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: snip]_

Both fixed:

- **Spacing scale** is now true-to-scale — each square is rendered at its actual size in pixels (4px square through 96px), with the value and token name set as a small caption beside it. So "16 · s-4" is literally a 16×16 box.
- **Radii** now in a 5-column comparison frame: each cell shows an 88×88 ink square at its radius, with the px value, var name, and a one-line usage rule beneath. The pill cell uses a wider rectangle so the rounded ends actually read.

## User

this is the wordbook in the briefing buster!!

## Assistant

_[tool: view_image]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Updated:

- House voice sample replaced with the truthful version: "I built this because I love AI and want to help people use it to improve something they already do well. Bankers have a real need to understand it — not be sold it." Set in serif roman (no italics).
- Removed the "italic stays italic" guidance from the on-ink wordmark rules since the lockup is no longer italic.

## User

ensure the the workmark is the main driver of design acorss the system

## Assistant

_[tool: grep]_

_[tool: snip]_

_[tool: grep]_

_[tool: read_file]_

_[tool: snip]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

## Assistant

_[tool: str_replace_edit]_

Now I'll propagate the wordmark cadence (bold sans uppercase + two-tone ink/slate) across the system.

**Design System** — section eyebrows + add a "Wordmark cadence" specimen:

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: snip]_

The wordmark cadence — bold sans uppercase, two-tone (ink primary, slate secondary), tight tracking, line-height 1 — now drives the system:

- **Design System** — all 22 section eyebrows replaced. "01 / Brand" was mono caps muted; now reads as **01** BRAND with the number set in ink and the label in slate, mirroring the wordmark stack.
- **LMS sidebar** — "AiBI Practitioner" header and the four pillar group labels (Foundations / Practice / Frontier / Translation) lifted to bold sans caps in ink, with the pillar swatch acting as the only color cue.
- **LMS topbar breadcrumb** — was mono muted/terra; now bold sans caps with the trailing crumb in ink and earlier crumbs in slate. Matches the masthead in the Brief.

Same DNA at four scales now: lockup (24px) → page header (13px) → sidebar / breadcrumb (11–12px). The serif still owns longform display titles, ledes, and the reviewer note voice — those stay editorial — but every short label and structural marker speaks the wordmark's language.

## User

good deal. now what

## Assistant

A few directions, ranked by what would round out the package vs. extend it:

**Round out the LMS itself**
1. **Reviewer workspace** — the other side of the activity. A banker reviewing a learner's submitted brief, leaving the margin notes that already exist as a component. Closes the loop.
2. **Cohort + cadence view** — calendar / weekly rhythm of the program, office hours, peer reviews. Shows the institute as a *program*, not just modules.
3. **Onboarding** — a new learner's first 5 minutes: intake (role, what they want to use AI for), placement, first module unlocked. Makes the program feel real.
4. **Certificate of completion** — print-ready, single page, ledger aesthetic.

**Sell the institute**
5. **Marketing site** — public landing page. Problem statement, curriculum at a glance, "built by a banker" voice, signup. The Brief as a *recruiting tool*.
6. **Sales deck** — 8–10 slides for credit union ops leaders. Pulls the Briefing's ledger DNA into deck form.

**Sharpen what's there**
7. **Real module content for one module end-to-end** (currently scaffolded). Pick "Prompting credit memos" — write the actual reading, the actual activity prompt, the actual rubric. Pressure-tests whether the design holds when the content is real.
8. **Mobile view** of the LMS — phone frame, condensed sidebar as a drawer, modules as a vertical list.

My pick if forced: **#1 Reviewer workspace** + **#5 Marketing site**. They cover both halves of the institute (the practice and the pitch) and reuse the system you've already paid for.

Which one (or which combo)?

## User

no reviewer workspace. give me 5, 7, 3

## Assistant

_[tool: questions_v2]_

Three focused builds. Quick questions before I start so I don't waste effort on the wrong direction:

## User

https://www.aibankinginstitute.com/

## Assistant

_[tool: web_fetch]_

## Assistant

_[tool: web_fetch]_

I pulled the site's text/IA via fetch — got the structure, copy, and nav, but **not the visual layout** (fetch returns text, not pixels). Enough to know:

- Hero is "**Turning Bankers into *Builders.***" with italic clause — same italic-clause pattern I used in the Briefing.
- Two pillars: the 12-question Readiness Assessment + AiBI-Practitioner certification.
- Has an ROI calculator ("Run your own numbers") with FTE / loaded cost / hours-saved inputs.
- Newsletter sign-up: "The AI Banking Brief. Fortnightly research, no marketing."
- Nav: Take Assessment · Education · For institutions · Research · About · Security & Governance · Verify a credential.

To design *with* what you have rather than against it, I need one of:

1. **GitHub repo URL** — best. Paste it and I'll read the actual components, tokens, copy.
2. **A screenshot or two** of the homepage and one inner page (drop them in chat).
3. **Both.**

Once I see the visuals I can decide whether to:
- redesign the homepage as a **v2** that pulls the LMS/Briefing system forward (consistent wordmark cadence, ledger palette), or
- build the **inner pages** that are missing or thin (Education detail, For institutions, Research index, Verify), or
- design the **assessment intake** flow (which then hands off to the onboarding I'm about to build — they're the same surface).

Which do you want me to look at?

## User

this is the page content with the footer. i like this alot for the first entry

