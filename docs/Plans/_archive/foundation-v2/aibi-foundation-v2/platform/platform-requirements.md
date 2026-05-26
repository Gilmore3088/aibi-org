# AiBI-Foundation v2 · Platform Requirements

Technical brief for the platform engineering team. The course requires capabilities beyond a standard LMS.

---

## 1. Multi-model API access (mandatory)

The platform must support parallel API calls to:

| Provider | Model class | Use in course |
|---|---|---|
| Anthropic | Claude (current default model) | Long-context document Q&A, careful drafting, multi-model comparison |
| OpenAI | GPT (current flagship) | General drafting, multi-model comparison, agent activities |
| Google | Gemini (current flagship) | Multi-model comparison, web-grounded research |
| Microsoft | M365 Copilot Chat (Graph / Bing) | Where available — to mirror the bank's most likely production tool |
| Perplexity | Search-grounded model | Research/citation activities only |

### Required API features

- **Parallel inference.** Activity type 2 (multi-model comparison) requires 3+ models receiving the same prompt at once.
- **Streaming.** Display tokens as they arrive — important for activities that compare *speed* and watching outputs unfold.
- **System prompt control.** Platform must be able to set system prompts on the learner's behalf for activity type 5 (build & test).
- **Adversarial test runner.** Platform sends pre-authored adversarial inputs against learner-built system prompts.
- **Token & cost telemetry.** Per-learner, per-module visibility into API consumption for cost management.

### Cost management

Each Foundation Full learner is estimated to consume:

- Roughly 200–300 model calls across 20 modules
- Most calls under 2K tokens
- A handful (Modules 11, 13, 17, 20) over 10K tokens for document/library work

Budget: ~$2–4 per learner in API costs at current 2026 pricing. Course price ($495) supports this with margin.

### API key strategy

- Course-owned keys (BYOK not required of bank or learner)
- Per-learner rate limits to prevent abuse
- Per-bank visibility into aggregate usage for the Foundation Champion
- No learner content sent to model training (verify with each provider's enterprise terms)

---

## 2. Activity-specific UI capabilities

### Side-by-side comparison view (activity type 2)

Three-column layout. Each column streams from a different model. Below each: "pick this," "highlight strengths," "merge into capture."

### Drag-and-drop classifier (type 3)

Touch-friendly. Items as cards. Categories as drop zones. Adaptive feedback below each card after placement. "Done" button locks final state and captures.

### Branching scenario engine (type 4)

Author-facing: simple node-and-edge editor where each node is a scenario step with text + 2–4 options, each option leading to another node or an outcome.

Learner-facing: text-driven scenario interface with persistent transcript and rubric scoring at end.

### Build-and-test environment (type 5)

System prompt editor (textarea, syntax-friendly). "Run" button sends a battery of pre-authored inputs against the learner's system prompt and reports results in a results table.

### Annotation overlay (type 6)

AI output displayed; learner can highlight a span and add a flag (hallucination / overreach / compliance issue / unverified claim). On submit, platform reveals the author's pre-coded flaws and scores match.

### Tabletop simulation engine (type 7)

Linear scenario with decision points. Each decision is a card; each consequence is the next card. Final card is a rubric scorecard.

### Real-world upload with NPI guard (type 8)

Upload box with explicit warning: "Do not upload anything containing real member NPI." Optional client-side regex scan for patterns that look like SSNs, account numbers, full names. Soft-block on detection with manual override.

---

## 3. Personal artifact store

Every learner has a persistent artifact store accessible across modules.

### Storage shape

```
learner_id
└── artifacts
    ├── module_01_member_communication.md
    ├── module_02_hallucination_log.md
    ├── module_04_data_tier_routing_card.md
    ├── ...
    ├── module_17_personal_prompt_library.md   ← spine artifact
    └── module_20_final_lab_package.md
```

### Required operations

- **Add to library:** any activity capture can be tagged for inclusion in the Personal Prompt Library
- **Export all:** download as ZIP of markdown files; or as a single PDF portfolio
- **Share with manager:** generate a manager-review link with read-only access
- **Quarterly refresh prompt:** at 90 days post-completion, prompt the learner to re-test their library entries against current model output

### Schema enforcement

The Personal Prompt Library schema is fixed (defined in `course-guide.md` Section 9). The platform validates every library entry against the schema before saving. Missing required fields prompt the learner; do not silently accept.

This is critical because Specialist tier rolls libraries up by schema. A non-conforming library breaks the upgrade.

---

## 4. Sandbox isolation

The platform is the **learning environment**, not a production tool. To enforce this:

- **Synthetic content only** for guided activities (no real member data)
- **Upload guard** for type 8 activities (NPI detector)
- **Watermark** every AI output displayed in the platform: "Generated in AiBI Foundation training environment. Apply patterns at your bank using approved tools."
- **No data export of model outputs** beyond the artifact store. Learners cannot bulk-extract model responses for non-training use.

---

## 5. Telemetry the bank needs

Beyond the LMS basics (enrolled, started, completed):

| Metric | Why it matters |
|---|---|
| **Activity completion rate** per module | Identifies modules where learners drop off |
| **Average activities per session** | Indicates whether the activity-driven model is working (target: 3+) |
| **Adaptive feedback triggers** per learner | Reveals common misconceptions for the cohort |
| **Multi-model preference distribution** | Aggregate "which model do learners prefer for which task" — informs the bank's tool decisions |
| **Library entry count at completion** | The real measure of skill (target: ≥5 per learner) |
| **Library entry count at 90 days** | Retention measure — are learners still using it (target: ≥3 actively used) |
| **Pre-flight escalations** logged | If learners hit the "I don't know — ask compliance" gate, that's working as intended; track volume |
| **Quarterly refresh activity** | Are learners returning to update their library each quarter |

---

## 6. Quarterly refresh tooling

The platform must support author-driven quarterly refresh:

- **Activity calibration runner:** automated re-run of every multi-model activity against current models; flag activities where new model output deviates from authored expectations
- **Planted-error rotation:** Modules 2, 12, 15, 18, 20 carry planted errors; the platform supports an authored bank of errors and rotates which is presented per cohort
- **Regulation reference checker:** Modules 4, 7 cite specific guidance; platform pings author when regulation pages 404 or change

---

## 7. Accessibility and accommodation

- WCAG 2.1 AA minimum
- Keyboard navigation through all activities including drag-and-drop (alternative click-to-place)
- Screen-reader compatible scenario engine
- Captions on the (minimal) video content
- Time accommodations: a learner can extend any activity timer by 50% on request

---

## 8. Identity and SSO

- SAML / OIDC SSO with the bank's M365 tenant (most $500M community banks)
- LMS connector standards (SCORM 2004 / xAPI / cmi5) so banks with existing LMS can host
- Standalone hosted option for banks without a centralized LMS

---

## 9. Build vs. buy notes

For the implementation team weighing build vs. integrate:

**Buy:**
- LMS / video hosting (any standard)
- Authentication / SSO (Azure AD / Okta)
- Storage for artifact store (S3 or Azure Blob)

**Build:**
- Activity engines for types 2, 3, 4, 5, 6, 7 — these are course-specific
- Multi-model orchestrator and cost telemetry
- Schema-validated artifact store with library export
- Author tools for scenario branching and adaptive feedback

**Don't reinvent:**
- Use LangChain / Vercel AI SDK / similar for the API orchestration layer
- Use established A/B drag-drop libraries for type 3
- Use a graph-based scenario format (e.g., Twine-compatible) for types 4 and 7

---

*Engineering should sequence: API orchestrator → artifact store → activity types in order of frequency (2, 3, 4, 5, 6, 7, 8, 1). Type 1 is trivial; type 5 is the most complex.*
