// TrackChrome — track-aware governance margin notes.
//
// Per the Transformation Vision (`AiBI_Transformation_Vision.md`), the highest-
// moat differentiation is environmental intelligence: a Risk & Compliance
// learner should see governance margin notes inline on lessons that touch
// regulated material; a Customer-Facing learner should see member-comms
// framing; a Technical learner should see config/secret-handling reminders.
//
// This component renders a single editorial side-note styled like a ledger
// reviewer's annotation — narrow column, mono caps kicker, gold hairline.
// It is intentionally quiet: a calibrated nudge, not a banner.
//
// Render rules:
//   - Only renders when `activeTrack` is set AND the lesson has a matching
//     governance hook (see GOVERNANCE_HOOKS below).
//   - Never on M0 lessons (the data-discipline rule itself is the lesson).
//   - Quiet by default; opens to a full-width strip on small screens so it
//     doesn't get hidden in a narrow rail.
//
// Surface: mounted by the lesson page just below `LessonShellHeader`, before
// `ModalityView`. The component returns null when no hook fires, so it
// vanishes from lessons that don't earn the margin note.

import type { Track } from './types';

interface GovernanceNote {
  /** Mono-caps kicker label */
  readonly kicker: string;
  /** One-sentence editorial note */
  readonly body: string;
  /** Citation source (regulator, framework, statute) */
  readonly source: string;
}

type LessonKey = string; // `${moduleId}.${ordinal}` or full lesson id

// Per-(track, lesson-prefix) governance hooks. The lesson key match is
// prefix-based on lesson_id (e.g. 'm2' matches every M2 lesson; 'm3.4'
// matches only m3.4). Most specific match wins.
const GOVERNANCE_HOOKS: Record<Track, Record<LessonKey, GovernanceNote>> = {
  risk_compliance: {
    m2: {
      kicker: 'Supervisory note',
      body: 'Treat every AI-assisted draft as if an examiner will read it. Keep a record of which prompts produced material that left your desk.',
      source: 'SR 11-7 — Model Risk Management',
    },
    'm3.4': {
      kicker: 'Examiner perspective',
      body: 'The spot-the-violation drill mirrors the calibration an examiner brings to the same review. The two scenarios you find hardest are usually the ones you will see in real findings.',
      source: 'Interagency Guidance · TPRM',
    },
    m4: {
      kicker: 'Governance note',
      body: 'A saved skill that runs on regulated material is a model under SR 11-7 if it influences a decision. Document its inputs, outputs, and review point alongside the skill.',
      source: 'SR 11-7 §III · Model inventory',
    },
    m5: {
      kicker: 'Pre-deployment note',
      body: 'Anything prototyped here is a draft. No system of record, no customer surface, no money movement until your model risk function has reviewed.',
      source: 'OCC Bulletin 2011-12 · 2024 update',
    },
  },
  customer_facing: {
    'm0.2': {
      kicker: 'Member-comms reminder',
      body: 'The "describe the situation" move applies in voicemail transcripts, chat overflow, and dispute notes — anywhere a member detail can leak into a prompt.',
      source: 'Reg E · UDAAP',
    },
    m3: {
      kicker: 'Reg DD / Reg E reminder',
      body: 'When drafting replies about fees, holds, or disclosures, name the regulation the model is paraphrasing. If the model invents a citation, the letter cannot leave your desk.',
      source: 'Reg E §1005 · Reg DD §1030',
    },
    m4: {
      kicker: 'Member-facing review',
      body: 'A skill that produces member-facing output needs a human review point before send. The guardrail check captures it; the skill record should name who reviews.',
      source: 'UDAAP · CFPB Examination Manual',
    },
  },
  back_office: {
    m2: {
      kicker: 'Operational note',
      body: 'Process memos and campaign briefs often contain confidential-marked language even when no PII is visible. Mark the file before deciding whether to paste it.',
      source: 'Internal classification policy',
    },
    m4: {
      kicker: 'Process discipline',
      body: 'A skill that runs on a recurring back-office task should record its inputs and outputs in the same place the task already lives — the spreadsheet, the ticket, the queue. Not a separate folder.',
      source: 'Operational documentation',
    },
  },
  technical: {
    'm0.2': {
      kicker: 'Secret-handling note',
      body: 'Logs, configs, and stack traces frequently contain customer PII or credentials. Sanitise aggressively before paste; an AI tool does not honour your retention policy.',
      source: 'NIST 800-53 · SC-12, SC-28',
    },
    m4: {
      kicker: 'Vendor due-diligence',
      body: 'A skill that generates vendor evaluation checklists is itself subject to your vendor governance program. Document the prompt the same way you would document a sourced template.',
      source: 'Interagency TPRM · 2024',
    },
    m5: {
      kicker: 'Architecture note',
      body: 'Prototype builders execute code. Treat the build environment as a development boundary — no production credentials, no real connection strings, no shared service principals.',
      source: 'Internal SDLC policy',
    },
  },
  leadership: {
    m1: {
      kicker: 'Strategic note',
      body: 'Most AI value at a community bank shows up in the efficiency-ratio line. Closing the ten-point gap is a governance, not a procurement, question.',
      source: 'FDIC QBP Q4 2024',
    },
    m4: {
      kicker: 'Oversight note',
      body: 'A skill library inside a bank is a model inventory in disguise. Decide who governs it before the third skill ships.',
      source: 'SR 11-7 · §III',
    },
    m5: {
      kicker: 'Capital allocation',
      body: 'A prototype that survives a stakeholder demo is not yet a product. Resource it like a pilot — a small team, a fixed budget, a clear go/no-go date.',
      source: 'Internal investment policy',
    },
  },
};

function findHook(track: Track, moduleId: string, lessonId: string): GovernanceNote | null {
  const hooks = GOVERNANCE_HOOKS[track];
  if (!hooks) return null;
  // Most specific match first: full lesson id, then module id.
  return hooks[lessonId] ?? hooks[moduleId] ?? null;
}

interface TrackChromeProps {
  readonly activeTrack: Track | null | undefined;
  readonly moduleId: string;
  readonly lessonId: string;
}

export function TrackChrome({ activeTrack, moduleId, lessonId }: TrackChromeProps) {
  if (!activeTrack) return null;
  const note = findHook(activeTrack, moduleId, lessonId);
  if (!note) return null;

  return (
    <aside
      className="my-6 border-l-2 border-[var(--ledger-accent)] pl-4 py-2 bg-[color-mix(in_srgb,var(--ledger-accent)_4%,transparent)]"
      aria-label="Track-specific governance note"
    >
      <div className="font-mono uppercase tracking-[0.18em] text-[0.6rem] text-[var(--ledger-accent)] mb-1">
        {note.kicker}
      </div>
      <p className="font-serif text-[0.95rem] text-[var(--ledger-ink)] leading-snug">
        {note.body}
      </p>
      <div className="mt-1.5 font-mono uppercase tracking-[0.14em] text-[0.55rem] text-[var(--ledger-muted)]">
        {note.source}
      </div>
    </aside>
  );
}
