// Derives presentation data for the In-Depth Briefing from a loaded
// assessment response.
//
// Source-of-truth: the dimension breakdown stored on user_profiles is the
// authoritative scoring artifact. Each dimension is 6 questions × 1–4
// points = 24 max; eight dimensions = 192 raw max. We sum the breakdown
// to compute composite + phase rather than trusting the stored
// readiness_score, which is computed by the free-flow tier function on
// a 12–48 scale and does NOT reconcile with the dimension sums for a
// 48-question submission.
//
// The free-flow scoring engine (getTierV2) maps 12–48 → four tiers. For
// In-Depth, we map normalized composite (0–100) → four phases (Curious /
// Coordinated / Programmatic / Native), matching the design's rubric.

import type { DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';

// ── Phase mapping (composite-driven) ────────────────────────────────────────

export type Phase = 'Curious' | 'Coordinated' | 'Programmatic' | 'Native';

export function phaseForNormalized(pct: number): Phase {
  if (pct >= 90) return 'Native';
  if (pct >= 75) return 'Programmatic';
  if (pct >= 50) return 'Coordinated';
  return 'Curious';
}

// ── Pillar mapping ──────────────────────────────────────────────────────────

export type Pillar = 'Strategy' | 'Risk' | 'Stack' | 'Talent';

export const PILLAR_BY_DIMENSION: Record<Dimension, Pillar> = {
  'current-ai-usage': 'Stack',
  'experimentation-culture': 'Strategy',
  'ai-literacy-level': 'Talent',
  'quick-win-potential': 'Strategy',
  'leadership-buy-in': 'Strategy',
  'security-posture': 'Risk',
  'training-infrastructure': 'Talent',
  'builder-potential': 'Talent',
};

// ── Composed score ──────────────────────────────────────────────────────────

export interface ComposedScore {
  readonly rawScore: number; // sum of dim scores, e.g. 119
  readonly rawMax: number; // sum of dim maxScores, e.g. 192
  readonly normalized: number; // 0..100
  readonly phase: Phase;
}

export function composeScore(
  breakdown: Record<Dimension, DimensionScore>,
): ComposedScore {
  let rawScore = 0;
  let rawMax = 0;
  for (const entry of Object.values(breakdown)) {
    if (!entry) continue;
    rawScore += entry.score;
    rawMax += entry.maxScore;
  }
  const normalized = rawMax > 0 ? Math.round((rawScore / rawMax) * 100) : 0;
  return { rawScore, rawMax, normalized, phase: phaseForNormalized(normalized) };
}

export function normalizeDimension(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
}

// ── Bar terrain ─────────────────────────────────────────────────────────────

export type Terrain = 'weak' | 'mid' | 'strong';

export function terrainForPct(pct: number): Terrain {
  if (pct < 50) return 'weak';
  if (pct < 75) return 'mid';
  return 'strong';
}

// ── Dimension presentation row ──────────────────────────────────────────────

export interface DimRow {
  readonly id: Dimension;
  readonly code: string;
  readonly label: string;
  readonly subhead: string;
  readonly pillar: Pillar;
  readonly raw: number;
  readonly max: number;
  readonly pct: number;
  readonly terrain: Terrain;
}

const SUBHEADS: Record<Dimension, string> = {
  'current-ai-usage': 'Where AI shows up in the work today',
  'experimentation-culture': 'Whether trying new things is allowed',
  'ai-literacy-level': 'Shared vocabulary across the bench',
  'quick-win-potential': 'Workflows that pay back quickly',
  'leadership-buy-in': 'Sponsorship at the top of the org chart',
  'security-posture': 'Policy, controls, examiner posture',
  'training-infrastructure': 'How fluency gets to the rest of the staff',
  'builder-potential': 'People who can ship a workflow',
};

const DISPLAY_ORDER: readonly Dimension[] = [
  'leadership-buy-in',
  'experimentation-culture',
  'quick-win-potential',
  'security-posture',
  'current-ai-usage',
  'ai-literacy-level',
  'training-infrastructure',
  'builder-potential',
] as const;

export function buildDimRows(
  breakdown: Record<Dimension, DimensionScore>,
): readonly DimRow[] {
  return DISPLAY_ORDER.map((id, idx) => {
    const entry = breakdown[id];
    const raw = entry?.score ?? 0;
    const max = entry?.maxScore ?? 1;
    const pct = normalizeDimension(raw, max);
    return {
      id,
      code: `D0${idx + 1}`,
      label: DIMENSION_LABELS[id],
      subhead: SUBHEADS[id],
      pillar: PILLAR_BY_DIMENSION[id],
      raw,
      max,
      pct,
      terrain: terrainForPct(pct),
    };
  });
}

// ── Deep-dive selection ─────────────────────────────────────────────────────

export function selectDeepDives(rows: readonly DimRow[]): readonly DimRow[] {
  const sorted = [...rows].sort((a, b) => b.pct - a.pct);
  const top = sorted.slice(0, 3);
  const bottom = sorted.slice(-3);
  const out: DimRow[] = [];
  const seen = new Set<string>();
  for (const r of [...top, ...bottom]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out.sort((a, b) => b.pct - a.pct);
}

export function postureFor(pct: number): string {
  if (pct >= 85) return 'Top decile';
  if (pct >= 70) return 'Strong';
  if (pct >= 55) return 'Coordinated';
  if (pct >= 40) return 'Room to move';
  return 'Below cohort';
}

// ── Per-dimension deep-dive content (authored, banker-direct) ───────────────
//
// Three variants per dimension keyed on terrain. Each has:
//   - headline: a verb-first H3, with the dimension label inline (no
//     prefix/duplication trick).
//   - narrative: a two-sentence body — observation, then implication.
//   - recommendations: three concrete 90-day actions, dimension-specific.

interface DimDeepDive {
  readonly headline: string;
  readonly narrative: readonly [string, string];
  readonly recommendations: readonly [string, string, string];
}

type DimContent = Record<Terrain, DimDeepDive>;

const DEEP_DIVE_CONTENT: Record<Dimension, DimContent> = {
  'leadership-buy-in': {
    strong: {
      headline: 'Leadership has bought in. Now make the conviction transferable.',
      narrative: [
        'A high score here means the CEO, the board, and the senior team are pulling in the same direction on AI — that is the precondition every other dimension assumes.',
        'The risk at this level is that the conviction lives in one or two people. Codify it so the program survives a leadership transition.',
      ],
      recommendations: [
        'Document the institution’s AI posture in a one-page memo signed by the CEO.',
        'Add a recurring "AI program" slot to the monthly leadership review — not a guest topic.',
        'Brief the board annually on outcomes (hours · dollars · trust) so renewal of conviction is data-backed.',
      ],
    },
    mid: {
      headline: 'Leadership is interested. They are not yet committed.',
      narrative: [
        'A mid-range score here usually means the CEO has nodded along but no senior name is on the line. The program runs on permission, not sponsorship.',
        'Without a senior owner the program will plateau the first time it asks for budget or staff time.',
      ],
      recommendations: [
        'Get a single executive to put their name on the AI program — calendar, not just title.',
        'Bring one concrete win to the next leadership meeting, with the dollars or hours it produced.',
        'Establish a 12-month roadmap leadership has signed off on before asking for more pilots.',
      ],
    },
    weak: {
      headline: 'There is no leadership sponsor for AI. Everything else compounds off this.',
      narrative: [
        'When the lowest score in the dossier is here, the institution is doing AI in the gaps of other people’s calendars. That cannot scale.',
        'Naming a senior sponsor is the single highest-leverage move of the next quarter — every other dimension improves faster once this one moves.',
      ],
      recommendations: [
        'Name a 1.0-FTE AI program lead, or 0.5 with explicit backfill, in the next 30 days.',
        'Have the CEO send a one-paragraph announcement to all staff naming the lead.',
        'Block one hour a month of CEO calendar for AI program review — the protected slot signals seriousness.',
      ],
    },
  },
  'experimentation-culture': {
    strong: {
      headline: 'Trying new things is allowed here. Convert exploration into evidence.',
      narrative: [
        'A strong score means staff have permission to try AI tools and report back without fear. That posture is rarer than it sounds.',
        'The next move is to make experiments legible — without writeups, your wins do not compound into institutional knowledge.',
      ],
      recommendations: [
        'Adopt a one-page "experiment writeup" template — what was tried, what happened, who else should know.',
        'Share two writeups per quarter at the all-staff meeting — normalize the practice of reporting.',
        'Track a monthly count of experiments started and shipped. Two numbers, not a dashboard.',
      ],
    },
    mid: {
      headline: 'Curiosity exists. The container for it does not yet.',
      narrative: [
        'Mid-range scores here usually mean a few people are tinkering, but there is no institutional shape around what they are doing.',
        'Without an explicit container — protected time, a writeup template, a forum to share back — experiments stay private and the institution does not learn.',
      ],
      recommendations: [
        'Block two protected hours a month for sanctioned AI experimentation by named staff.',
        'Introduce a "what I tried this week" five-minute slot at an existing team meeting.',
        'Adopt a single rubric for "what counts as a shipped experiment" so everyone uses the same bar.',
      ],
    },
    weak: {
      headline: 'Experimentation is not happening — or it is happening in the dark.',
      narrative: [
        'A low score here is usually one of two things: nobody has tried anything, or people have but they are doing it on personal devices because they do not believe they have permission.',
        'Either way, the fix is the same — give explicit, written permission with explicit, written boundaries.',
      ],
      recommendations: [
        'Publish a one-page "what is allowed" memo so staff stop guessing at the boundaries.',
        'Identify two staff members and ask them — by name — to spend two hours this month on one workflow.',
        'Treat the first three experiments as practice. The point is the writeup discipline, not the outcome.',
      ],
    },
  },
  'quick-win-potential': {
    strong: {
      headline: 'Quick-win workflows are visible. The work is to ship them, then ship the next ones.',
      narrative: [
        'A high score means staff can name the workflows where AI assistance would pay back quickly — and someone has likely already started on one.',
        'Risk: visibility without measurement. If wins ship without numbers, the budget conversation next year will be harder, not easier.',
      ],
      recommendations: [
        'Pick the highest-confidence quick win and measure it on hours saved per quarter for two consecutive quarters.',
        'Maintain a public backlog of three to five quick-win candidates with named owners and target ship dates.',
        'When a quick win lands, do a written postmortem so the pattern can be applied elsewhere.',
      ],
    },
    mid: {
      headline: 'Some quick wins are visible. The pipeline of next ones is not.',
      narrative: [
        'A mid-range score usually means one win has shipped or is close, but there is no thinking yet about the second or third.',
        'A program without a backlog is a sequence of heroic individual efforts. Build the pipeline now while one is fresh.',
      ],
      recommendations: [
        'List five workflows that take more than two hours and ask which AI assist would meaningfully shorten.',
        'Rank them by hours saved × frequency. The top one is your next pilot.',
        'Use the same measurement rubric (hours · dollars · risk) for every pilot so they can be compared.',
      ],
    },
    weak: {
      headline: 'Nobody has named a workflow yet — start with one repetitive task.',
      narrative: [
        'A low score here is rarely a capability issue. It is usually that no one has been given the explicit task of identifying where AI assist would help.',
        'The fastest unlock is to assign that task, with a deadline, to one person.',
      ],
      recommendations: [
        'Ask each department head: "What do you do every week that takes more than two hours and feels mechanical?"',
        'Pick the single most-repeated answer. That is your first pilot.',
        'Set a four-week clock on the pilot. Either it produces measured time savings, or you learn the constraint and move on.',
      ],
    },
  },
  'security-posture': {
    strong: {
      headline: 'Your AI guardrails would survive a regulator’s read.',
      narrative: [
        'A strong score here means you have written policy, vendor controls, and a clear answer to "who signs the indemnification letter."',
        'The work now is to keep the artifacts current as the tooling evolves. Yesterday’s policy ages faster than yesterday’s exam manual.',
      ],
      recommendations: [
        'Re-read the AI policy quarterly. Add an "exceptions register" appendix for case-by-case approvals.',
        'Cross-walk your policy to the most recent NCUA / OCC AI letter in the next board packet.',
        'Add an AI clause to the next two vendor renewals — tenancy, training-data exclusion, prompt retention.',
      ],
    },
    mid: {
      headline: 'You have some policy. Examiners will want more specifics.',
      narrative: [
        'Mid-range scores typically mean a one-paragraph policy exists, or sensible verbal norms exist, but the structure required at exam time is partial.',
        'The cost of formalizing now is one weekend of writing. The cost of being asked at exam time is much higher.',
      ],
      recommendations: [
        'Promote your verbal AI norms into a board-ratified one-page policy.',
        'Inventory the AI tools in use today, even if the list is shorter than you expect.',
        'Add AI clauses (tenancy, training exclusion, audit log term) to your next vendor master agreement renegotiation.',
      ],
    },
    weak: {
      headline: 'Your AI guardrails are the most predictable source of an audit finding.',
      narrative: [
        'A low score here is the dimension most likely to surface in a regulator conversation in the next 18 months.',
        'The fix is procedural, not technical — written policy, model inventory, vendor due diligence. None of it requires new tools, just calendared work.',
      ],
      recommendations: [
        'Publish a one-page AI Use Policy in 30 days — what is allowed, what is not, who approves exceptions.',
        'Build a model and tool inventory. One row per AI tool: name, vendor, data class, owner.',
        'Add AI-specific questions to the existing vendor risk assessment template.',
      ],
    },
  },
  'current-ai-usage': {
    strong: {
      headline: 'AI shows up across the work — your problem is now to make it compound.',
      narrative: [
        'A high score here means tools are not just installed, they are habitually used. The behavior change has happened.',
        'The risk at this level is that adoption stalls without shared practice. Different teams reinvent the same prompts.',
      ],
      recommendations: [
        'Stand up a shared prompt library — one document, owned by one person, updated weekly.',
        'Identify the three most-used workflows and document them as institutional patterns, not personal habits.',
        'Track tool seat utilization. Pay for seats people use, not seats that exist.',
      ],
    },
    mid: {
      headline: 'AI is in use, but unevenly — the map is the gap.',
      narrative: [
        'Mid-range scores here usually mean a handful of departments have integrated AI tools and the rest have not. The cause is not technology — it is uneven sponsorship.',
        'The single fastest unlock is to map current usage so the gaps stop being invisible.',
      ],
      recommendations: [
        'Run a 30-day usage audit. One row per department: tool, frequency, primary use case.',
        'Bring the map to the leadership team. Decisions about expansion get easier when the picture is shared.',
        'Pair a department that is using AI well with one that is not. Peer pull beats top-down push.',
      ],
    },
    weak: {
      headline: 'AI is not part of the work yet. Pick one tool and one team.',
      narrative: [
        'A low score here is the most common starting point. There is no shame in it — but there is no excuse for staying there.',
        'The opening move is small and deliberate: one tool, one team, one month, with a written outcome.',
      ],
      recommendations: [
        'Choose one enterprise-grade AI tool (Microsoft Copilot, Google Workspace, ChatGPT Enterprise) and one team to pilot it.',
        'Define one workflow the pilot will improve. Measure it the week before and four weeks after.',
        'Report the result at the next leadership meeting — even if the result is "not much yet."',
      ],
    },
  },
  'ai-literacy-level': {
    strong: {
      headline: 'Shared vocabulary is in place. Defend it against drift as tooling evolves.',
      narrative: [
        'A strong score means staff can name what AI is doing in their workflow, what it is not doing, and what it should not be trusted with.',
        'Maintaining literacy is harder than building it the first time — new tools, new behaviors, new people all dilute the baseline.',
      ],
      recommendations: [
        'Refresh the "what AI is and is not" primer once a year. Tie it to staff onboarding.',
        'Run an annual literacy sample — three questions, ten staff per department — to detect drift.',
        'Sponsor two staff to attend an external AI program annually. They become the literacy pipeline.',
      ],
    },
    mid: {
      headline: 'Some staff are fluent. The branch is not.',
      narrative: [
        'Mid-range literacy scores typically mean the board and senior leadership have been briefed but member-facing staff have not — which is the inverse of what an examiner will expect.',
        'The literacy gap usually closes faster than the policy gap — but only if someone owns it.',
      ],
      recommendations: [
        'Add a 20-minute AI literacy module to the next all-staff training cycle.',
        'Build a "common questions" FAQ for member-facing staff — what to say if a member asks how AI is used.',
        'Assign one trainer to be the institutional AI literacy lead. Calendar, not title.',
      ],
    },
    weak: {
      headline: 'Literacy is the dimension most likely to produce a member-facing incident.',
      narrative: [
        'When staff cannot accurately describe what AI is doing in their workflow, two things happen — they overtrust it, or they panic about it. Both produce bad member moments.',
        'Literacy is the cheapest dimension to move. A 30-minute team session and a one-page primer get most of the lift.',
      ],
      recommendations: [
        'Run a 30-minute AI primer with every team in the next 60 days.',
        'Publish a one-page glossary — five terms, one paragraph each, plain English.',
        'Add an AI question to the monthly all-hands so the topic stays in the room.',
      ],
    },
  },
  'training-infrastructure': {
    strong: {
      headline: 'You have a training mechanism that scales. Use it.',
      narrative: [
        'A high score here means new staff will inherit a working AI fluency, not have to discover it. That is a structural advantage most peers do not have.',
        'The work now is to keep the training current as tools and policy evolve — and to make completion a non-optional part of onboarding.',
      ],
      recommendations: [
        'Tie AI training completion to the first 30 days of new-hire onboarding.',
        'Refresh the training annually, sourcing one update from each pillar (Strategy / Risk / Stack / Talent).',
        'Sample completion rates quarterly. If they drop below 85%, escalate to HR + COO.',
      ],
    },
    mid: {
      headline: 'You have training, but completion is uneven.',
      narrative: [
        'A mid-range score usually means the materials exist — a course, a deck, a webinar — but completion is voluntary or inconsistent.',
        'The mechanism is fine. The accountability is what is missing.',
      ],
      recommendations: [
        'Mandate completion of the AI primer for all member-facing staff by a fixed date.',
        'Add training completion to the manager scorecard. If managers are not held to it, neither will staff.',
        'Set a 70% completion floor and report progress weekly until it is hit.',
      ],
    },
    weak: {
      headline: 'There is no training mechanism. Build the smallest one that works.',
      narrative: [
        'When no training infrastructure exists, the temptation is to procure an LMS or hire a vendor. Neither is necessary for a community institution at this stage.',
        'A 30-minute recorded primer plus a one-page FAQ plus a sign-off in the HRIS gets you 80% of the value at 5% of the cost.',
      ],
      recommendations: [
        'Record a 30-minute primer and post it where staff already go (intranet, Teams channel).',
        'Build a one-page FAQ. Three sections: what AI is, what we use it for, what we do not.',
        'Get an explicit acknowledgement from each staff member that they have completed both.',
      ],
    },
  },
  'builder-potential': {
    strong: {
      headline: 'You have builders. Protect their time and ship their work.',
      narrative: [
        'A high score here means you have staff who can take a workflow from idea to shipped artifact — and that is the rarest resource in community banking AI today.',
        'The risk is that builders get pulled back into operational work and the pipeline dries up.',
      ],
      recommendations: [
        'Block two Fridays a month, explicitly sponsored by the COO, for builders to ship.',
        'Maintain a public list of three workflows the builders own. Outcomes report monthly.',
        'When a builder ships, name them in the all-hands. Visibility of the practice is the recruiting pitch.',
      ],
    },
    mid: {
      headline: 'You have users. You do not yet have builders.',
      narrative: [
        'Mid-range scores here typically mean staff are comfortable using AI but no one has crossed the line into shipping a workflow others rely on.',
        'The structural change required is permission and protected time — neither requires a new hire.',
      ],
      recommendations: [
        'Name two builders by name. Block two protected Fridays a month for their workflow work.',
        'Adopt a "shipped" rubric — when is a workflow finished, who owns it, how is it discovered.',
        'Sponsor one builder to attend an external AI engineering program once a year.',
      ],
    },
    weak: {
      headline: 'You have no builder bench yet — start by naming two people.',
      narrative: [
        'A low score here is rarely about talent. It is about explicit permission, calendar protection, and a written bar for what "shipped" means.',
        'The first cohort of builders does not need three people — it needs two, on the record, with the COO sponsoring their time.',
      ],
      recommendations: [
        'Identify two staff — one operations, one member-facing — to spend two Fridays a month on AI workflow building.',
        'Define one workflow each will ship by the end of the quarter. Written outcome, named consumer.',
        'Treat absences from builder Fridays as fire-drill events. The protection is the program.',
      ],
    },
  },
};

export function deepDiveContent(row: DimRow): DimDeepDive {
  return DEEP_DIVE_CONTENT[row.id][row.terrain];
}

// ── Lowest-dimension hook ───────────────────────────────────────────────────
//
// Verb-first imperative for the "if you only act on one thing" callout and
// the action register row 01. Per-dimension authored to read as a CEO
// would say it out loud, not as a marketing tagline.

const LOWEST_IMPERATIVES: Record<Dimension, string> = {
  'leadership-buy-in':
    'Name a 1.0-FTE AI program lead — or 0.5 with explicit backfill — within thirty days.',
  'experimentation-culture':
    'Publish a one-page "what is allowed" memo so staff stop guessing at the boundaries.',
  'quick-win-potential':
    'Pick one repetitive two-hour-a-week task and pilot AI assistance on it for four weeks.',
  'security-posture':
    'Publish a one-page AI Use Policy in thirty days and ratify it at the next board meeting.',
  'current-ai-usage':
    'Choose one enterprise AI tool and one team. Pilot one workflow for four weeks. Measure.',
  'ai-literacy-level':
    'Run a thirty-minute AI primer with every team within the next sixty days.',
  'training-infrastructure':
    'Record a thirty-minute primer, publish a one-page FAQ, and get every staff member to acknowledge both.',
  'builder-potential':
    'Name two builders this month and block two Fridays a month, sponsored by the COO.',
};

export interface LowestHook {
  readonly row: DimRow;
  readonly imperative: string;
}

export function lowestHook(rows: readonly DimRow[]): LowestHook {
  const lowest = [...rows].sort((a, b) => a.pct - b.pct)[0];
  return {
    row: lowest,
    imperative: LOWEST_IMPERATIVES[lowest.id],
  };
}

// ── Insight (composite-phase keyed) ─────────────────────────────────────────
// Replaces the prior tier-id-keyed lookup. Same voice; keyed off the
// composed phase so it always reconciles with the displayed composite.

export interface Insight {
  readonly pull: string;
  readonly body: string;
}

export function insightForPhase(phase: Phase): Insight {
  switch (phase) {
    case 'Curious':
      return {
        pull:
          'You are at the start of the work. The cost of waiting is now higher than the cost of starting.',
        body:
          'A small, well-scoped first move — one repetitive workflow, one named owner, one written boundary — produces more learning than a vendor evaluation. The shape of the first ninety days matters more than the size of the first investment.',
      };
    case 'Coordinated':
      return {
        pull:
          'You have experimentation. What you do not yet have is a program — and the gap between those two is the work.',
        body:
          'Isolated wins do not compound on their own. They compound when someone is responsible for converting them into shared practice, written boundaries, and a backlog the board can read. Naming that someone is the first action.',
      };
    case 'Programmatic':
      return {
        pull:
          'You have earned the right to a program — and the cost of not committing to one is now higher than the cost of building it.',
        body:
          'You have governance scaffolding, an engaged leadership team, and working pilots. What you do not yet have is a single person whose year has been bent around AI. The institutions that move from Coordinated to Programmatic share one structural choice: they name an owner.',
      };
    case 'Native':
      return {
        pull:
          'You operate AI as a strategic capability. The compounding question is replication speed.',
        body:
          'Your wins now belong to a program, not a heroic individual. The next twelve weeks are about codifying what works for the next wave of staff so the program survives turnover and accelerates through expansion.',
      };
  }
}

// ── Re-read date ────────────────────────────────────────────────────────────

export function rereadDate(completedAt: string): string {
  const completed = new Date(completedAt);
  const reread = new Date(completed.getTime() + 90 * 24 * 60 * 60 * 1000);
  return reread.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function filingRef(profileId: string): string {
  const tail = profileId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `AIBI-${tail}`;
}
