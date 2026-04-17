# Design System Specification: The Digital Curator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** 

Unlike traditional banking interfaces that feel cold and transactional, this system treats information as a prestigious collection. We are moving away from the "app-in-a-box" aesthetic toward a **High-End Editorial** experience. By blending the academic authority of an institutional archive with the sleek precision of modern fintech, we create an environment that feels both historic and prophetic.

To break the "template" look, designers must employ **intentional asymmetry**. Hero sections should utilize oversized typography that bleeds off-center, balanced by generous "breathing room" (white space). Overlapping elements—such as a serif headline partially masking a technical data visualization—create a sense of layered depth that feels bespoke rather than automated.

---

## 2. Colors: Tonal Architecture
The palette is rooted in the tactile world: sun-bleached parchment, kiln-fired clay, and oxidized minerals.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning. Structural boundaries must be defined solely through background color shifts. Use `surface_container_low` (#f5f3ee) to set off a section from the main `surface` (#fbf9f4). This creates a sophisticated, "borderless" UI that feels like a single, cohesive document rather than a collection of widgets.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- **Base Layer:** `surface` (Parchment).
- **Secondary Plane:** `surface_container` for grouping related content.
- **Topmost Layer:** `surface_container_lowest` (Pure White) for high-priority interactive cards, creating a "lifted" effect without heavy shadows.

### The "Glass & Gradient" Rule
To inject "soul" into the technical blocks:
- **CTAs:** Use a subtle linear gradient from `primary` (#9a4028) to `primary_container` (#b9573e) at a 135-degree angle. 
- **Floating Overlays:** Use `surface_variant` at 80% opacity with a `20px` backdrop-blur to create a "frosted glass" effect. This ensures the Parchment background bleeds through, maintaining a warm, organic feel.

---

## 3. Typography: Editorial Authority
The type system is a dialogue between the past (Serif) and the future (Sans/Mono).

- **Headings (Cormorant/Newsreader):** Use `display-lg` through `headline-sm` for narrative storytelling and high-level titles. These should be set with tighter letter-spacing (-0.02em) to feel like a premium printed journal.
- **UI & Technical (DM Sans/Work Sans/Inter):** Use `title-md` and `body-lg` for functional instructions. The shift to a sans-serif font signals to the user that they are moving from "learning" to "acting."
- **Code & Skill Blocks (DM Mono):** Use for technical data points or institutional records to convey modern precision.

---

## 4. Elevation & Depth: Tonal Layering
We achieve hierarchy through light and color, not structure.

- **The Layering Principle:** Depth is achieved by "stacking" the surface tiers. For example, place a `surface_container_lowest` card atop a `surface_container_low` section. This creates a soft, natural lift that mimics fine stationery.
- **Ambient Shadows:** When an element must float (e.g., a modal), use a highly diffused shadow: `box-shadow: 0 20px 40px rgba(27, 28, 25, 0.05)`. The shadow color is derived from `on_surface`, ensuring it looks like natural ambient light.
- **The "Ghost Border" Fallback:** If a container requires definition for accessibility (e.g., a form input), use a "Ghost Border": `outline_variant` at 20% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons: The Action Pillar
- **Primary:** Terracotta (`primary`) with white text. Apply a subtle 4px corner radius (`md`). States should transition smoothly—on hover, shift to `primary_container`.
- **Secondary:** Transparent background with a `primary` text color. Use the "Ghost Border" logic only on hover.

### Cards: The Knowledge Vessel
Cards must **forbid divider lines**. Separate the header from the body using a `title-sm` font weight and a vertical spacing of `1.5rem`. Use `surface_container_lowest` for the card background to make it "pop" against the Parchment `surface`.

### Pillar Chips: The Four Foundations
Use the four pillars to categorize content. These chips should be low-chroma and professional:
- **Sage (#8BA88E):** For Sustainability/Growth.
- **Cobalt (#4A6FA5):** For Stability/Security.
- **Amber (#D4A373):** For Heritage/Capital.
- **Terra (#C25E44):** For Innovation/Action.

### Input Fields
Inputs should feel like a fillable form in a ledger. Use a bottom-only "Ghost Border" (20% `outline_variant`) that transitions to a full 1px `primary` border only upon focus. This keeps the initial view clean and academic.

---

## 6. Do's and Don'ts

### Do:
- **Do** use asymmetric layouts where text is left-aligned and imagery or data is offset to the right.
- **Do** use `display-lg` typography for "Impact Quotes" or "Institutional Stats."
- **Do** allow elements to overlap slightly (e.g., a chip overlapping a card edge) to break the grid.

### Don't:
- **Don't** use high-contrast black (#000000). Always use `on_surface` (#1B1C19) for text to maintain the charcoal/navy sophistication.
- **Don't** use traditional "Drop Shadows" with high opacity.
- **Don't** use iconography that is too playful or rounded. Use thin-stroke, geometric icons to maintain the "Tech-Forward" feel.
- **Don't** use dividers to separate list items. Use `16px` of vertical white space and a subtle background hover state (`surface_container_high`).

---

**Director's Note:** Remember, AiBI is not just a bank; it is an institute of higher learning. Every pixel should feel like it was placed by a curator, not a framework. Lean into the Parchment and Terracotta to provide a warmth that counters the coldness of traditional digital finance.