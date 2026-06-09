# Assessment user flow & data taxonomy

_Map + audit of the AI Readiness Assessment as of 2026-06-09. Covers the free
funnel (v3), the paid In-Depth (v4), and the legacy v1/v2 paths still readable
from stored rows._

> **Status (2026-06-09):** the following items from this audit were actioned in
> the same change set:
> - Playbooks authored for **executive, operations, training-hr** → every free
>   role now has a dedicated best-match playbook.
> - Lossy role collapse removed — the free role is now persisted directly
>   (migration 00040 already permits it) and read back un-collapsed, so
>   `marketing`, `operations`, `retail-branch`, `it-infosec` resolve to their
>   own playbooks. (redundancy #5)
> - v4 dimension labels in the upsell now import from `v4/types.ts`. (#1)
> - The results-view playbook list now derives from `playbooks/data.ts`. (#2)
> - v2/v3 tiers + `SEVEN_DAY_PLAN`/`SIGNATURE_INSIGHT` extracted to
>   `content/assessments/shared/free-readiness.ts`. (#3, #4-partial)
> - `useAssessmentV2` → `useAssessmentV3`.
>
> Deferred: redirecting the post-capture inline render to `/results/[id]`
> (two-render-paths cleanup), the larger v2/v3 personalization-narrative
> extraction (PERSONAS/TIER_CLOSING_CTA/PRACTICE_PICTURE — legacy-coupling
> risk), and any cross-version dimension/role bridge.

## 1. User flow

```mermaid
flowchart TD
    Landing["/assessment<br/>landing: free vs $99"]

    %% ---------- FREE PATH (v3) ----------
    Start["/assessment/start"] -. redirect .-> Take
    Landing -->|Start free| Take["/assessment/take<br/>AssessmentPage"]
    Take --> Hook["useAssessmentV2()<br/>⚠️ name says v2, loads v3 content"]
    Hook --> Q12["12 questions<br/>v3 pool · 1 per signal"]
    Q12 --> Reveal["score + tier<br/>getTierV3() · 12–48"]
    Reveal --> Gate["EmailGate<br/>email + optional first name / institution / role"]
    Gate --> API["POST /api/capture-email<br/>version='v3'"]
    API --> DB[("user_profiles<br/>readiness_version='v3'<br/>role = mapped to v2 Role")]
    API --> Inline["ResultsViewV3 (rendered inline)<br/>⚠️ render path #1"]
    Inline -. history.replaceState .-> Results
    DB --> Results["/results/[id]<br/>ResultsViewV3<br/>⚠️ render path #2 (server)"]

    %% ---------- PAID PATH (v4) ----------
    Landing -->|Get in-depth| InDepth["/assessment/in-depth<br/>landing + PurchaseButton"]
    InDepth --> Stripe["Stripe checkout →<br/>course_enrollments"]
    Stripe --> TakeP["/assessment/in-depth/take<br/>auth + purchase gated"]
    TakeP --> HookP["useAssessmentV4()"]
    HookP --> Q48["48 questions · v4 pool"]
    Q48 --> SubmitP["POST /api/assessment/in-depth/submit<br/>server-scored · version='v4'"]
    SubmitP --> DBP[("user_profiles<br/>readiness_version='v4'<br/>role = v4 Role (10)")]
    DBP --> ResultsP["/assessment/in-depth/results/[id]<br/>PaidReport · 8 dimensions"]
    Results -. v4 row → redirect .-> ResultsP

    %% ---------- LEGACY (read-only) ----------
    DB -. v2 / v1 row .-> LegacyFree["ResultsViewV2<br/>(read-only legacy)"]
    DBP -. v2 row .-> LegacyPaid["InDepthBriefingView<br/>(read-only legacy)"]

    classDef warn fill:#FEF7DA,stroke:#B7791F,color:#3a2c00;
    classDef legacy fill:#f1f1f1,stroke:#999,color:#555;
    class Hook,Inline,Results warn;
    class Start,LegacyFree,LegacyPaid legacy;
```

### What's live vs legacy

| Version | What it is | Entry | Result view | Status |
|---|---|---|---|---|
| **v3** | Free 12-signal snapshot | `/assessment/take` | `ResultsViewV3` | **LIVE** (only free path) |
| **v4** | Paid 48-question In-Depth | `/assessment/in-depth/take` (auth+purchase) | `PaidReport` | **LIVE** (only paid path) |
| v2 | Old In-Depth briefing | none | `ResultsViewV2` / `InDepthBriefingView` | read-only legacy |
| v1 | Old 8-question free | none | `ResultsViewV2` | dead (hook never mounted) |

### Clunky spots in the flow

1. **Misleading hook name.** The free v3 flow runs on `useAssessmentV2()`, which
   imports entirely from `@content/assessments/v3/*`. The "V2" is a leftover.
   Rename → `useAssessmentV3` (or `useFreeAssessment`).
2. **The v3 result renders from two places.** Once inline in
   `take/_client.tsx` right after capture, and again server-side at
   `/results/[id]`. Both must be fed the same props — this is exactly why the
   role fix had to touch both call sites. Options: (a) after capture, redirect
   to `/results/[id]` instead of rendering inline, or (b) keep inline but funnel
   both through one wrapper that owns the prop shape.
3. **`/assessment/start` is a pure redirect** to `/assessment/take`. Fine to
   keep for old links, but it's dead surface area.
4. **Four content versions live side by side.** v1 is dead and v2 is read-only;
   only stored rows keep them alive. They can be quarantined behind a single
   `legacy/` boundary so new work only ever touches v3/v4.

## 2. Data taxonomy

Three taxonomies (roles, dimensions, tiers) are each defined per-version, and
the versions don't share IDs — so several bridge/mapping tables exist only to
translate between them.

### Roles — 3 lists + 1 bridge, with lossy collapses

| Free funnel (9) | → v2 Role (8, DB column) | v4 Role (10, paid) |
|---|---|---|
| executive | executive | executive |
| compliance-risk | compliance-risk | compliance-risk |
| operations | **operator** | operations |
| retail-branch | **operator** ⚠️ collapses with operations | retail-branch |
| lending | lending | lending-credit |
| marketing | marketing | marketing-product |
| it-infosec | **it** | it-infosec |
| training-hr | training-hr | training-hr |
| — | — | bsa-aml ⚠️ paid-only |
| other | other | other |

- `FREE_ROLE_TO_V2` (`content/assessments/v3/roles.ts`) collapses
  `retail-branch` **and** `operations` both into `operator`, losing the retail
  vs ops distinction the results view would want for playbook matching.
- There is **no v2↔v4 role map**. The two paid/free taxonomies drift freely.

### Dimensions — fully renamed every version, no bridge

| | Count | IDs |
|---|---|---|
| v2 | 8 | current-ai-usage, experimentation-culture, ai-literacy-level, quick-win-potential, leadership-buy-in, security-posture, training-infrastructure, builder-potential |
| v3 | 12 | strategic-value, approved-tool-path, data-safety-reflexes, prompting-skill, role-fit, human-review, documentation, vendor-awareness, customer-impact-awareness, workflow-readiness, training-culture, leadership-visibility |
| v4 | 8 | ai-access-architecture, model-risk-validation, compliance-explainability, data-security-guardrails, workflow-orchestration, bounded-autonomy-human-review, vendor-risk-interoperability, governance-roles-human-capital |

⚠️ **The 8 v4 dimension labels are hard-coded a second time** inside
`ResultsViewV3.tsx` (the "8-dimension diagnostic" upsell list). Any rename to
`v4/types.ts` silently desyncs the upsell. Should import from `v4/types.ts`.

### Tiers / bands — duplicated and name-colliding

- v2 and v3 tiers are **byte-for-byte identical** (`starting-point`,
  `early-stage`, `building-momentum`, `ready-to-scale`, thresholds 12–48) but
  defined in two separate files.
- v1 reuses the **same tier IDs** with different score ranges.
- v4 reuses `building-momentum` as a band name at a totally different threshold
  (60–74 normalized). Any code keying on tier ID without version context is
  ambiguous.

### Redundancy summary (highest leverage first)

| # | Redundancy | Where | Fix |
|---|---|---|---|
| 1 | v4 dimension list hard-coded in the UI | `ResultsViewV3.tsx` upsell vs `v4/types.ts` | import the labels |
| 2 | Playbook list hard-coded in the UI | `ResultsViewV3.tsx` `PLAYBOOKS` vs `playbooks/data.ts` `PLAYBOOK_INDEX` | derive from `data.ts` |
| 3 | v2/v3 tiers duplicated | `v2/scoring.ts` ≈ `v3/scoring.ts` | share one constant |
| 4 | v2/v3 tier-level personalization duplicated (PERSONAS, MATURITY_LADDER, SEVEN_DAY_PLAN, TIER_CLOSING_CTA, …) | `v2/personalization.ts` ≈ `v3/personalization.ts` | extract shared tier content |
| 5 | Lossy role collapse | `FREE_ROLE_TO_V2` (retail-branch+operations → operator) | keep retail-branch distinct, or map directly to a playbook |
| 6 | No cross-version dimension/role bridge | everywhere | only matters if results are ever compared across versions; otherwise document and leave |

## 3. Playbook coverage

`playbooks/data.ts` already defines **6** playbooks:
`compliance, retail, marketing, lending, bsa-aml, infosec`.

The free assessment (`ResultsViewV3.tsx`) only wires **4** of them and collapses
the rest to retail:

| Free role | Should match | Currently matches |
|---|---|---|
| compliance-risk | compliance | compliance ✅ |
| lending | lending | lending ✅ |
| it-infosec | infosec | infosec ✅ |
| retail-branch | retail | retail ✅ |
| **marketing** | **marketing** (built!) | retail ❌ |
| operations | _(no playbook)_ | retail |
| executive | _(no playbook)_ | retail |
| training-hr | _(no playbook)_ | retail |
| other | _(fallback)_ | retail |

- **Quick win:** `marketing` (and `bsa-aml`) already exist — wire them in.
- **Gap:** `executive`, `operations`, `training-hr` have no dedicated playbook.
  "Playbooks for all" means authoring those three to the `PlaybookData` shape.
