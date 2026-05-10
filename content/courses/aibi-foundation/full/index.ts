// Foundation Full — 20-module track scaffold.
//
// AUTHORING STATUS (2026-05-09): metadata-complete, sections/activities deferred.
// This file contains the canonical track shape — number, id, title, pillar,
// minutes, key output, daily-use outcomes, activity types, dependencies, and
// the spec ref pointing to the rich markdown source.
//
// Each module's full sections, activities, tables, and artifacts will be
// authored from the matching spec in
//   Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full/module-NN-spec.md
// in a follow-up session. The route layer can render the metadata immediately
// (track outline, module headers, time estimates, pillar tags); the content
// pages bind to the deeper fields once authored.
//
// Pillar order is strictly linear (defensible-to-examiners design):
//   Awareness     1-4
//   Understanding 5-10
//   Creation      11-15
//   Application   16-20
//
// EDITORIAL DECISIONS (2026-05-09):
// - Module 5 (Cybersecurity & AI Threats) ships text-only at launch.
//   Voice-clone / deepfake elements deferred.
// - Module 20 (Final Practitioner Lab) uses synthetic inputs at launch.
//   Activity Type 8 (real-world capture + NPI regex guard) deferred.

import type { FoundationModule, Track } from '../types';
import { TRACK_META } from '../types';

const SPEC_BASE =
  'Plans/foundation-v2/aibi-foundation-v2/modules/foundation-full';

// Helper to keep the 20 entries scannable. Sections and activities are empty
// arrays at scaffold stage; the route layer should treat empty sections as
// "spec pending" and link to specRef for the canonical content.
function stub(args: {
  number: number;
  id: string;
  title: string;
  pillar: FoundationModule['pillar'];
  minutes: number;
  keyOutput: string;
  dailyUseOutcomes: readonly string[];
  activityTypes: readonly FoundationModule['activityTypes'][number][];
  dependencies?: readonly string[];
  forwardLinks?: readonly string[];
}): FoundationModule {
  return {
    number: args.number,
    id: args.id,
    trackId: 'full',
    trackPosition: String(args.number),
    title: args.title,
    pillar: args.pillar,
    estimatedMinutes: args.minutes,
    keyOutput: args.keyOutput,
    dailyUseOutcomes: args.dailyUseOutcomes,
    activityTypes: args.activityTypes,
    sections: [],
    activities: [],
    dependencies: args.dependencies,
    forwardLinks: args.forwardLinks,
    specRef: `${SPEC_BASE}/module-${String(args.number).padStart(2, '0')}-spec.md`,
  } as const;
}

export const fullModules: readonly FoundationModule[] = [
  stub({
    number: 1,
    id: 'f1-ai-for-your-workday',
    title: 'AI for Your Workday',
    pillar: 'awareness',
    minutes: 20,
    keyOutput: 'Rewritten Member Communication',
    dailyUseOutcomes: [
      'A Rewritten Member Communication ready to send.',
      'A multi-model preference note recording which AI felt right and why.',
    ],
    activityTypes: ['multi-model', 'single-prompt'],
    forwardLinks: ['f2-what-ai-is'],
  }),
  stub({
    number: 2,
    id: 'f2-what-ai-is',
    title: 'What AI Is and Is Not',
    pillar: 'awareness',
    minutes: 25,
    keyOutput: 'Hallucination Catch Log + AI Claim Review reference card',
    dailyUseOutcomes: [
      'Hallucination Catch Log entry with the exact wording fabricated.',
      'A five-point claim-scan reference for the next AI output you receive.',
    ],
    activityTypes: ['find-flaw', 'single-prompt'],
    dependencies: ['f1-ai-for-your-workday'],
    forwardLinks: ['f3-how-ai-got-here'],
  }),
  stub({
    number: 3,
    id: 'f3-how-ai-got-here',
    title: 'How AI Got Here, in Plain English',
    pillar: 'awareness',
    minutes: 20,
    keyOutput: '"What this means for my bank" briefing card',
    dailyUseOutcomes: [
      'A one-page briefing the learner could hand to their CEO without translation.',
    ],
    activityTypes: ['adaptive-scenario', 'single-prompt'],
    forwardLinks: ['f4-five-never-dos'],
  }),
  stub({
    number: 4,
    id: 'f4-five-never-dos',
    title: "Safe AI Use I — Data and the Five Never-Do's",
    pillar: 'awareness',
    minutes: 25,
    keyOutput: "Personal Data-Tier Routing Card with signed Five Never-Do's",
    dailyUseOutcomes: [
      'A signed Routing Card with role-specific examples in each of the four tiers.',
      "The five never-do's internalized as reflex, not policy.",
    ],
    activityTypes: ['sort-classify', 'adaptive-scenario'],
    forwardLinks: ['f5-cybersecurity'],
  }),
  stub({
    number: 5,
    id: 'f5-cybersecurity',
    title: 'Cybersecurity & AI Threats',
    pillar: 'understanding',
    minutes: 30,
    keyOutput: 'Prompt-Injection Defense Card + Personal Threat Awareness Card',
    dailyUseOutcomes: [
      'A defensive system prompt the learner has stress-tested against three injection patterns.',
      'A Personal Threat Awareness Card listing the AI-augmented attack patterns.',
    ],
    activityTypes: ['build-test', 'find-flaw', 'tabletop-sim'],
    dependencies: ['f4-five-never-dos'],
    forwardLinks: ['f6-talking-with-members', 'f18-incident-response'],
  }),
  stub({
    number: 6,
    id: 'f6-talking-with-members',
    title: 'Talking About AI With Members',
    pillar: 'understanding',
    minutes: 20,
    keyOutput: 'Five Member-Conversation Script Cards',
    dailyUseOutcomes: [
      'Five rehearsed-but-personal conversation cards for the questions members are starting to ask.',
    ],
    activityTypes: ['adaptive-scenario', 'single-prompt'],
    forwardLinks: ['f18-incident-response', 'f19-examiner-prep'],
  }),
  stub({
    number: 7,
    id: 'f7-regulatory-landscape',
    title: 'Safe AI Use II — The Regulatory Landscape',
    pillar: 'understanding',
    minutes: 30,
    keyOutput: 'First-Call List + scenario-routed regulatory crosswalk',
    dailyUseOutcomes: [
      'A First-Call List with the named owner of each regulatory lens at your bank.',
      'A scenario-routed crosswalk that turns "what rule applies when" into a one-question lookup.',
    ],
    activityTypes: ['adaptive-scenario', 'sort-classify'],
    forwardLinks: ['f18-incident-response', 'f19-examiner-prep'],
  }),
  stub({
    number: 8,
    id: 'f8-prompting',
    title: 'Prompting Fundamentals',
    pillar: 'understanding',
    minutes: 30,
    keyOutput: 'Prompt Strategy Cheat Sheet (multi-model annotated)',
    dailyUseOutcomes: [
      'A cheat sheet built from your own work, annotated with which model handled which technique best.',
    ],
    activityTypes: ['multi-model', 'build-test', 'find-flaw'],
    dependencies: ['f1-ai-for-your-workday'],
    forwardLinks: ['f10-projects-context', 'f17-prompt-library'],
  }),
  stub({
    number: 9,
    id: 'f9-work-profile',
    title: 'Your AI Work Profile',
    pillar: 'understanding',
    minutes: 20,
    keyOutput: 'AI Work Profile with top-3 candidates and signed boundaries',
    dailyUseOutcomes: [
      'A scored task inventory showing where AI fits and where it does not.',
      "Five signed 'I will not use AI for' boundaries.",
    ],
    activityTypes: ['build-test', 'real-world-capture'],
    forwardLinks: ['f10-projects-context', 'f16-role-cases', 'f17-prompt-library'],
  }),
  stub({
    number: 10,
    id: 'f10-projects-context',
    title: 'Projects and Context',
    pillar: 'understanding',
    minutes: 20,
    keyOutput: 'Project Brief deployable in two platforms',
    dailyUseOutcomes: [
      'A reusable Project Brief covering role, context, rules, format, and what-to-ask-me.',
      'The brief deployed in both Claude Projects and a Custom GPT for direct comparison.',
    ],
    activityTypes: ['build-test'],
    dependencies: ['f8-prompting'],
    forwardLinks: ['f11-document-workflows', 'f17-prompt-library'],
  }),
  stub({
    number: 11,
    id: 'f11-document-workflows',
    title: 'Document Workflows',
    pillar: 'creation',
    minutes: 30,
    keyOutput: 'Document Workflow Prompt + model-strength notes',
    dailyUseOutcomes: [
      'A reusable prompt for the document task you do most often.',
      'Notes on which model handled summarize, extract, compare, format-shift, and grounded Q&A best.',
    ],
    activityTypes: ['multi-model', 'build-test', 'find-flaw'],
    dependencies: ['f10-projects-context'],
    forwardLinks: ['f17-prompt-library'],
  }),
  stub({
    number: 12,
    id: 'f12-spreadsheet-workflows',
    title: 'Spreadsheet Workflows',
    pillar: 'creation',
    minutes: 30,
    keyOutput: 'Three Excel-AI patterns',
    dailyUseOutcomes: [
      'Three reusable Excel patterns: formula generation, narrative commentary, anomaly hunting.',
      'A documented false-positive catch from the anomaly lab.',
    ],
    activityTypes: ['build-test', 'find-flaw'],
    dependencies: ['f8-prompting', 'f11-document-workflows'],
    forwardLinks: ['f13-tools-comparison', 'f14-agents', 'f17-prompt-library'],
  }),
  stub({
    number: 13,
    id: 'f13-tools-comparison',
    title: 'AI Tools Comparison Lab',
    pillar: 'creation',
    minutes: 30,
    keyOutput: 'Tool Choice Map',
    dailyUseOutcomes: [
      'A decision tree built from your own multi-model comparisons, not vendor marketing.',
    ],
    activityTypes: ['multi-model', 'build-test'],
    forwardLinks: ['f15-vendor-pitch', 'f17-prompt-library'],
  }),
  stub({
    number: 14,
    id: 'f14-agents',
    title: 'Agents and Workflow Thinking',
    pillar: 'creation',
    minutes: 30,
    keyOutput: 'Workflow Map + Agent Design Sketch',
    dailyUseOutcomes: [
      'A multi-step workflow map for one of your top-3 candidates from Module 9.',
      'An agent design sketch the learner can hand to IT or the AI program owner.',
    ],
    activityTypes: ['build-test'],
    dependencies: ['f9-work-profile', 'f10-projects-context'],
    forwardLinks: ['f17-prompt-library'],
  }),
  stub({
    number: 15,
    id: 'f15-vendor-pitch',
    title: 'Vendor Pitch Decoder',
    pillar: 'creation',
    minutes: 30,
    keyOutput: 'Vendor Evaluation Scorecard',
    dailyUseOutcomes: [
      'A 12-question scorecard you can apply to the next AI vendor pitch.',
      'A working ability to spot substance, hype, and the specific evasions vendors use.',
    ],
    activityTypes: ['find-flaw', 'build-test'],
    dependencies: ['f7-regulatory-landscape'],
    forwardLinks: ['f17-prompt-library'],
  }),
  stub({
    number: 16,
    id: 'f16-role-cases',
    title: 'Role-Based Use Cases',
    pillar: 'application',
    minutes: 40,
    keyOutput: 'Role Use-Case Card',
    dailyUseOutcomes: [
      'A specific application of AI to your role, mapped to the patterns from Modules 11-15.',
    ],
    activityTypes: ['build-test'],
    dependencies: ['f9-work-profile'],
    forwardLinks: ['f17-prompt-library', 'f20-final-lab'],
  }),
  stub({
    number: 17,
    id: 'f17-prompt-library',
    title: 'Personal Prompt Library',
    pillar: 'application',
    minutes: 30,
    keyOutput: 'Personal Prompt Library — schema-conformant collection (spine artifact)',
    dailyUseOutcomes: [
      'A library of 5+ tested prompts conforming to the 18-field schema.',
      'Forward-compatibility with the Specialist Departmental Skill Library.',
    ],
    activityTypes: ['build-test'],
    dependencies: ['f8-prompting', 'f10-projects-context'],
    forwardLinks: ['f20-final-lab'],
  }),
  stub({
    number: 18,
    id: 'f18-incident-response',
    title: 'Incident Response Drill',
    pillar: 'application',
    minutes: 30,
    keyOutput: 'Incident Response Checklist + Member Notification Template',
    dailyUseOutcomes: [
      'A seven-step IR runbook the learner has walked through.',
      'A starter notification template for the first AI-related data event.',
    ],
    activityTypes: ['tabletop-sim'],
    dependencies: ['f5-cybersecurity', 'f6-talking-with-members', 'f7-regulatory-landscape'],
    forwardLinks: ['f20-final-lab'],
  }),
  stub({
    number: 19,
    id: 'f19-examiner-prep',
    title: 'Examiner Q&A Practice',
    pillar: 'application',
    minutes: 20,
    keyOutput: 'Examiner Q&A Prep Card',
    dailyUseOutcomes: [
      'Five examiner questions answered with the backing artifacts named.',
    ],
    activityTypes: ['adaptive-scenario'],
    dependencies: ['f6-talking-with-members', 'f7-regulatory-landscape'],
    forwardLinks: ['f20-final-lab'],
  }),
  stub({
    number: 20,
    id: 'f20-final-lab',
    title: 'Final Practitioner Lab',
    pillar: 'application',
    minutes: 60,
    keyOutput: 'Final Practitioner Lab Package — certifying artifact',
    dailyUseOutcomes: [
      'A complete capstone package demonstrating practical judgment across all four pillars.',
    ],
    // NOTE: real-world-capture (Type 8) deferred at v2 launch — Final Lab uses
    // synthetic inputs only. Synthesis happens via build-test + find-flaw.
    activityTypes: ['build-test', 'find-flaw', 'multi-model'],
    dependencies: ['f17-prompt-library', 'f18-incident-response', 'f19-examiner-prep'],
  }),
] as const;

export const fullTrack: Track = {
  ...TRACK_META.full,
  modules: fullModules,
} as const;

export function getFullModule(position: string) {
  return fullModules.find((m) => m.trackPosition === position);
}
