// AiBI In-Depth Diagnostic — v4 Starter Artifact Mapping
//
// Each dimension has ONE primary starter artifact (the artifact prescribed
// in spec Section 9 for that dimension as the lowest score) plus the
// supporting artifacts named in Section 4 for that dimension.
//
// Used by: the paid report's "recommended starter artifacts" panel,
// driven by the weakest-dimension logic.

import type { Dimension } from './types';

export interface StarterArtifactRef {
  readonly title: string;
  readonly description: string;
}

export interface DimensionArtifacts {
  readonly primary: StarterArtifactRef;
  readonly supporting: readonly StarterArtifactRef[];
}

export const ARTIFACT_MAP: Record<Dimension, DimensionArtifacts> = {
  'ai-access-architecture': {
    primary: {
      title: 'Approved AI Tools List',
      description:
        'A short, named list of the AI tools you are allowed to use, with the data classes allowed in each. Replaces "I think this is approved" with a written answer.',
    },
    supporting: [
      {
        title: 'AI Use-Case Inventory',
        description:
          'A running list of where AI shows up in your work — tools, tasks, data classes, who reviews.',
      },
      {
        title: 'Data Handling Reference Card',
        description: 'One page on what data goes where, and what never goes into a public tool.',
      },
    ],
  },
  'model-risk-validation': {
    primary: {
      title: 'AI Workflow Review Checklist',
      description:
        'A short checklist you run on AI-assisted work that influences a decision — output accuracy, source verification, override capture, drift signal.',
    },
    supporting: [
      {
        title: 'AI Evidence Packet Template',
        description: 'A template for capturing prompt + output + edits + reviewer for any AI-supported decision.',
      },
      {
        title: 'Quarterly AI Practice Review',
        description: 'A simple recurring review on what AI tools you depend on, what changed, what worked, what failed.',
      },
    ],
  },
  'compliance-explainability': {
    primary: {
      title: 'AI Output Review Checklist',
      description:
        'The checklist for any AI-assisted output that touches a customer or a regulated decision — source verification, claims check, reviewer signoff.',
    },
    supporting: [
      {
        title: 'Principal Reason Traceability Table',
        description: 'For AI-assisted credit work — the structured trail from principal reasons through to adverse-action language.',
      },
      {
        title: 'Compliance AI Playbook',
        description: 'Your personal playbook for which AI uses touch which compliance rules, with the review pattern for each.',
      },
    ],
  },
  'data-security-guardrails': {
    primary: {
      title: 'Safe AI Use Checklist',
      description:
        'Your personal "what never goes in / what to strip first" reference. The single most-leveraged artifact in the entire diagnostic for daily AI work.',
    },
    supporting: [
      {
        title: 'Red / Yellow / Green Use Card',
        description: 'A one-page classification of data types and which AI tools each is allowed in.',
      },
      {
        title: 'Data Handling Reference Card',
        description: 'A quick reference for what data goes where, with examples drawn from your role.',
      },
    ],
  },
  'workflow-orchestration': {
    primary: {
      title: 'AI Workflow SOP Template',
      description:
        'The four-step template that turns ad-hoc AI use into documented work: input → AI draft → review → final output. The artifact that lets a colleague run your workflow without you.',
    },
    supporting: [
      {
        title: 'Saved Skill Template',
        description: 'A structured format for the prompts that work — role, format, source, self-check, edit.',
      },
      {
        title: 'Workflow Mapping Worksheet',
        description: 'For mapping a recurring task before you build the SOP — what happens, who touches it, where AI fits.',
      },
    ],
  },
  'bounded-autonomy-human-review': {
    primary: {
      title: 'Human Review Checklist',
      description:
        'A defined review path for AI-assisted work, tiered by stakes (Low / Medium / High) with named reviewers for the High tier.',
    },
    supporting: [
      {
        title: 'Agent Review Checklist',
        description: 'For AI workflows that handle multiple steps — the explicit checkpoints where a human reviews.',
      },
      {
        title: 'AI Workflow SOP Template',
        description: 'The same four-step template, paired with explicit human-review steps.',
      },
    ],
  },
  'vendor-risk-interoperability': {
    primary: {
      title: 'AI Vendor Review Addendum',
      description:
        'A short AI-specific overlay to your existing vendor review — model behavior, training data, drift notifications, output explainability.',
    },
    supporting: [
      {
        title: 'Approved AI Tools List',
        description: 'Names the vendor AI tools you may use and the data classes allowed in each.',
      },
      {
        title: 'Vendor AI Verdict Memo',
        description: 'A template for documenting your conclusion on a vendor AI feature — keep, gate, or avoid.',
      },
    ],
  },
  'governance-roles-human-capital': {
    primary: {
      title: 'AI Acceptable Use Standard',
      description:
        'A clear written rule for what AI use is acceptable, what is restricted, and how staff can ask. Gives you permission and gives leadership a defensible policy.',
    },
    supporting: [
      {
        title: 'Training Rollout Plan',
        description: 'A simple plan for who learns what AI skill in what order — by role, not by tool.',
      },
      {
        title: 'Department Readiness Map',
        description: 'A view of where each department sits across the eight dimensions, to focus training and review attention.',
      },
    ],
  },
};

export function getDimensionArtifacts(dimension: Dimension): DimensionArtifacts {
  return ARTIFACT_MAP[dimension];
}
