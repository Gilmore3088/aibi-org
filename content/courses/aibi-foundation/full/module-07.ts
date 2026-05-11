// Foundation Full — Module 7: Safe AI Use II — The Regulatory Landscape
// Five regulatory lenses + bank-specific First-Call List.
// Spec: Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-07-spec.md

import type { FoundationModule } from '../types';

export const module07: FoundationModule = {
  number: 7,
  id: 'f7-regulatory-landscape',
  trackId: 'full',
  trackPosition: '7',
  title: 'Safe AI Use II — The Regulatory Landscape',
  pillar: 'understanding',
  estimatedMinutes: 30,
  keyOutput: 'First-Call List + scenario-routed regulatory crosswalk',
  dailyUseOutcomes: [
    'A First-Call List with the named owner of each regulatory lens at your bank.',
    'A scenario-routed crosswalk that turns "what rule applies when" into a one-question lookup.',
  ],
  activityTypes: ['adaptive-scenario', 'sort-classify'],
  whyThisExists: `Module 4 covered the data tiers — the *what* of safe AI use. Module 7 covers the *why* — the regulatory lenses that explain why each tier exists and what each lens demands. The two modules together turn data discipline from rule-following into reasoned judgment.

The First-Call List is the operational artifact: when something goes wrong with AI at the bank, who picks up the phone first? The scenario-routing skill — given an incident, name the lens — is the diagnostic that gets the right person on the call.`,
  learningObjectives: [
    'Name the five regulatory lenses and the primary sources for each.',
    'Route an AI use case or incident to the right lens within thirty seconds.',
    'Build a First-Call List with named owners at your bank for every lens.',
    'Walk away ready to answer the question "what rule applies when?"',
  ],
  sections: [
    {
      id: 'f7-five-lenses',
      title: 'The five regulatory lenses',
      content: `| Lens | What it governs | Primary sources |
|---|---|---|
| **Model Risk** | When AI influences financial or regulatory decisions | SR 11-7 / OCC 2011-12; OCC Bulletin 2025-26 (community bank flexibility) |
| **Third-Party Risk** | Vendors including AI vendors and AI features added to existing tools | Interagency TPRM Guidance (June 2023); FFIEC IT Handbook |
| **Fair Lending & Consumer Protection** | Credit decisions, marketing, communications | ECOA / Reg B; FCRA; UDAAP; Joint Statement on Automated Systems |
| **BSA/AML & Privacy** | Suspicious activity, customer NPI | BSA; FFIEC BSA/AML Manual; GLBA / Reg P |
| **Cybersecurity & IT Risk** | Confidentiality, integrity, availability | FFIEC IT Handbook; NIST AI RMF + Cyber AI Profile |

Most AI use cases trigger more than one lens. Adverse action driven by an AI scoring tool: Model Risk + Fair Lending. Vendor pitches an AI module: TPRM + whichever lens the use case touches. NPI pasted into ChatGPT: GLBA/privacy + Cybersecurity. The skill is recognizing which lens carries the strictest documentation burden — that is the lens that drives the response.`,
    },
    {
      id: 'f7-first-call-list',
      title: 'The First-Call List',
      content: `Every lens has a named owner at your bank. The owner may have other titles. The point is: when something happens, you do not have to think about who to call.

The minimum list:

- **Model Risk Owner** — typically risk or finance leadership for institutions over $1B; CFO for smaller banks.
- **TPRM Owner** — vendor management or procurement; sometimes IT.
- **Compliance Officer** — fair lending, UDAAP, ECOA matters.
- **BSA Officer** — every bank has one by name.
- **IT/Security Lead** — internal owner; MSP partner if outsourced.
- **AI Program Owner** — may not exist yet at your bank. If not, the gap is a finding waiting to happen.

The list lives on the back of the Routing Card. The next time something goes wrong, the first call is already named.`,
      tryThis: 'Pull your bank\'s organizational chart. Map names to the six lens-owner roles above. If any role is unstaffed, that is the gap an examiner will find first.',
    },
  ],
  activities: [
    {
      id: '7.1',
      title: 'Regulator routing scenarios',
      description: 'Eight scenarios; route each to the lens with the strictest documentation burden. Platform reveals correct routing and the secondary lenses to consider.',
      activityType: 'adaptive-scenario',
      estimatedMinutes: 20,
      fields: [
        {
          id: 'routing',
          label: 'For each of the eight scenarios, name the primary lens and the first call.',
          type: 'textarea',
          minLength: 200,
          required: true,
          placeholder: 'Scenario 1 (AI-scoring loan committee tool): Model Risk lens; first call to model-risk owner.\nScenario 2 (vendor adds AI module): TPRM lens; first call to vendor management.\n…',
        },
      ],
      completionTrigger: 'save-response',
    },
    {
      id: '7.2',
      title: 'Build your First-Call List',
      description: 'Sort six lens-owner roles to named individuals at your bank.',
      activityType: 'sort-classify',
      estimatedMinutes: 8,
      fields: [
        {
          id: 'first-call-list',
          label: 'Name + email/extension for each role.',
          type: 'textarea',
          minLength: 100,
          required: true,
          placeholder: 'Model Risk Owner: …\nTPRM Owner: …\nCompliance Officer: …\nBSA Officer: …\nIT/Security Lead: …\nAI Program Owner: …',
        },
      ],
      completionTrigger: 'artifact-download',
      artifactId: '07-first-call-list',
    },
  ],
  artifacts: [
    {
      id: '07-first-call-list',
      title: 'First-Call List',
      description: 'Named owners for the six lens-owner roles at your bank. Lives on the back of the Data-Tier Routing Card.',
      format: 'pdf+md',
      triggeredBy: '7.2',
      dynamic: true,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/07-first-call-list.md',
    },
    {
      id: '07-regulatory-crosswalk',
      title: 'Regulatory Crosswalk',
      description: 'Five lenses with primary sources and what each one looks like in a community-bank examination.',
      format: 'pdf+md',
      triggeredBy: 'module-complete',
      dynamic: false,
      templatePath:
        'Plans/foundation-v2/aibi-foundation-v2/artifacts/07-regulatory-crosswalk.md',
    },
  ],
  dependencies: ['f4-five-never-dos'],
  forwardLinks: ['f15-vendor-pitch', 'f18-incident-response', 'f19-examiner-prep', 'm3-spotting-misuse'],
  specRef:
    'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-07-spec.md',
} as const;
