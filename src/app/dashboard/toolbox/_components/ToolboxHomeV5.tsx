'use client';

/**
 * ToolboxHomeV5 — Ledger-refresh port of the /my-toolbox v5 visual
 * onto the real Supabase-backed /dashboard/toolbox surface.
 *
 * Drop-in replacement for the legacy ToolboxPanel (line 1242 of
 * ToolboxApp.tsx). Same prop signature; same callbacks. The parent
 * still owns run/edit/export/delete; this component owns the v5
 * layout, the pin state, the type filter, search, kit cards, and
 * the side drawer.
 *
 * Scope: Foundation-tier port only. See #183 scope comment for why
 * the Starter-tier (read-only) variant lives in #219 instead.
 *
 * What's NOT here yet, by design:
 * - Server-backed pin persistence (uses localStorage; TODO #219).
 * - Real kit adoption (kit click toasts; content gated on #184).
 * - Shared-with-you (empty state; sharing model gap-of-gap noted in
 *   the schema audit — institution_memberships table doesn't exist).
 * - Reference catalog merged with user skills (catalog lives in the
 *   Library tab; merging is a follow-up once #184 content lands).
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  isWorkflowSkill,
  type ToolboxSkill,
} from '@/lib/toolbox/types';
import { SourceBacklink } from './SourceBacklink';

// Pin state is NOT user-scoped today. On a shared browser, user B will
// see user A's pin set on first load. There is no data leakage — the
// server's RLS predicate (auth.uid() = user_id on toolbox_skills) means
// foreign skill IDs return nothing and the tile silently drops — but it
// is UX/privacy pollution. The proper fix is the server-backed
// toolbox_pins table tracked in #219; this key disappears entirely when
// that ships.
const LS_PIN_KEY = 'aibi.toolbox.pinned-v5';

type TileType = 'prompt' | 'skill' | 'agent' | 'playbook';

interface KitCard {
  readonly key: 'bsa' | 'lender' | 'bm' | 'compl';
  readonly role: string;
  readonly headline: string;
  readonly description: string;
  readonly toolCount: number;
  readonly active: boolean;
  readonly shipped: boolean;
}

const STARTER_KITS: readonly KitCard[] = [
  {
    key: 'bsa',
    role: 'BSA officer',
    headline: 'SAR-ready, day one.',
    description: 'Narrative drafting, voice control, and red-flag triage.',
    toolCount: 5,
    active: false,
    shipped: true,
  },
  {
    key: 'lender',
    role: 'Lender',
    headline: 'Credit memos & denials.',
    description: 'Borrower context, debt-coverage logic, plain-English denials.',
    toolCount: 5,
    active: false,
    shipped: false,
  },
  {
    key: 'bm',
    role: 'Branch manager',
    headline: 'Coaching, complaints, comms.',
    description: 'Member-facing language, fair coaching notes, weekly huddle prep.',
    toolCount: 4,
    active: false,
    shipped: false,
  },
  {
    key: 'compl',
    role: 'Compliance',
    headline: 'Examiner-ready writing.',
    description: 'Vendor risk language, exception letters, regulator-friendly summaries.',
    toolCount: 5,
    active: false,
    shipped: false,
  },
];

function inferTileType(skill: ToolboxSkill): TileType {
  if (!isWorkflowSkill(skill)) return 'prompt';
  const cmd = (skill.cmd || '').toLowerCase();
  if (cmd.includes('agent') || cmd.includes('chain')) return 'agent';
  if (cmd.includes('playbook') || cmd.includes('kit')) return 'playbook';
  if (cmd.includes('check') || cmd.includes('extract')) return 'skill';
  return 'prompt';
}

const TILE_LABELS: Readonly<Record<TileType, string>> = {
  prompt: 'Prompt',
  skill: 'Skill',
  agent: 'Agent',
  playbook: 'Playbook',
};

function plain(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function readPinned(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(LS_PIN_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

function writePinned(set: ReadonlySet<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_PIN_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Quota exceeded or private mode — ignore.
  }
}

export interface ToolboxHomeV5Props {
  readonly skills: readonly ToolboxSkill[];
  readonly librarySlugMap: Readonly<Record<string, string>>;
  readonly onRun: (skill: ToolboxSkill) => void;
  readonly onEdit: (skill: ToolboxSkill) => void;
  readonly onExport: (skill: ToolboxSkill) => void;
  readonly onDelete: (id: string) => void;
  readonly onBrowse: () => void;
  readonly onBuild: () => void;
}

export function ToolboxHomeV5({
  skills,
  librarySlugMap,
  onRun,
  onEdit,
  onExport,
  onDelete,
  onBrowse,
  onBuild,
}: ToolboxHomeV5Props): JSX.Element {
  const [activeType, setActiveType] = useState<TileType | null>(null);
  const [search, setSearch] = useState('');
  const [pinned, setPinned] = useState<Set<string>>(() => readPinned());
  const [drawerSkillId, setDrawerSkillId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Toast lifecycle
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Persist pins
  useEffect(() => { writePinned(pinned); }, [pinned]);

  const togglePin = (id: string): void => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Skill projection — every skill becomes a tile with computed type +
  // pin state. We sort: pinned first (by recency), then unpinned by
  // most-recent modified.
  const tiles = useMemo(() => {
    const enriched = skills.map((s) => ({
      skill: s,
      type: inferTileType(s),
      pinned: pinned.has(s.id),
    }));
    return enriched.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const aMod = a.skill.modified ? Date.parse(a.skill.modified) : 0;
      const bMod = b.skill.modified ? Date.parse(b.skill.modified) : 0;
      return bMod - aMod;
    });
  }, [skills, pinned]);

  // Single pass: filter for visibility, then split pinned vs grid based
  // on the tile's own `pinned` flag. Pinned shelf shows up to 4; any
  // overflow falls through into the grid (still marked as pinned via
  // the ★ on the tile, so the user sees they've over-pinned).
  const { pinnedTiles, gridTiles, typeCounts } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const counts: Record<TileType, number> = { prompt: 0, skill: 0, agent: 0, playbook: 0 };
    const visible: typeof tiles = [];
    for (const t of tiles) {
      counts[t.type] += 1;
      const matchType = !activeType || t.type === activeType;
      if (!matchType) continue;
      if (q) {
        const hay = `${t.skill.name ?? ''} ${t.skill.desc ?? ''} ${t.skill.cmd ?? ''}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }
      visible.push(t);
    }
    const allPinned = visible.filter((t) => t.pinned);
    const unpinned = visible.filter((t) => !t.pinned);
    return {
      pinnedTiles: allPinned.slice(0, 4),
      gridTiles: [...allPinned.slice(4), ...unpinned],
      typeCounts: counts,
    };
  }, [tiles, activeType, search]);

  // Stats — real counts off the current skill set.
  const stats = useMemo(() => {
    const total = skills.length;
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
    let newCount = 0;
    let staleCount = 0;
    let productionCount = 0;
    for (const s of skills) {
      if (s.created && Date.parse(s.created) >= weekAgo) newCount += 1;
      if (s.modified && Date.parse(s.modified) < monthAgo) staleCount += 1;
      if (s.maturity === 'production') productionCount += 1;
    }
    const keptPct = total > 0 ? Math.round((productionCount / total) * 100) : null;
    return { total, newCount, staleCount, keptPct };
  }, [skills]);

  const drawerSkill = useMemo(
    () => (drawerSkillId ? skills.find((s) => s.id === drawerSkillId) ?? null : null),
    [drawerSkillId, skills],
  );

  const empty = skills.length === 0;

  return (
    <>
      <section className="mx-auto max-w-[1180px] px-7 pb-16 pt-10 text-[color:var(--ledger-ink)]">
        {/* ROLE + H1 */}
        <header className="pb-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--ledger-muted)]">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--ledger-accent)] align-middle" />
            Your desk · Foundation tier
          </p>
          <h1 className="mt-4 font-serif text-[64px] leading-[0.95] tracking-[-0.035em] text-[color:var(--ledger-ink)] md:text-[88px]">
            Your <em className="italic text-[color:var(--ledger-accent)]">toolbox.</em>
          </h1>
        </header>

        {/* STATS RIBBON — suppressed when empty so a new desk doesn't open
            on a bare 0 / 0 / 0 / — band (the editorial empty state speaks instead). */}
        {!empty && <Stats stats={stats} />}

        {/* ASK BAR */}
        <form
          className="mt-6 flex items-stretch border border-[color:var(--ledger-ink)] bg-[color:var(--ledger-paper-warm)]"
          onSubmit={(e) => e.preventDefault()}
        >
          <span className="grid place-items-center px-5 text-[color:var(--ledger-accent)]" aria-hidden>
            <SearchIcon />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ask your toolbox — find by name, command, or purpose…"
            className="flex-1 bg-transparent py-4 font-serif text-lg tracking-[-0.01em] text-[color:var(--ledger-ink)] outline-none placeholder:italic placeholder:text-[color:var(--ledger-soft)]"
            aria-label="Search toolbox"
          />
          <button
            type="submit"
            className="grid place-items-center bg-[color:var(--ledger-ink)] px-5 text-[color:var(--ledger-paper-warm)] transition-colors hover:bg-[color:var(--ledger-accent)]"
            aria-label="Search"
          >
            <ArrowRightIcon />
          </button>
        </form>

        {/* TYPE FILTER */}
        <TypeFilter
          activeType={activeType}
          counts={typeCounts}
          onSelect={setActiveType}
        />

        {/* STARTER KITS */}
        <SectionHeader
          eyebrow="Starter kits"
          headline={<>Pick a <em className="italic text-[color:var(--ledger-accent)]">role.</em> Adopt a desk.</>}
          right="4 curated · BSA shipped, 3 awaiting SME sign-off"
        />
        <KitGrid
          onAdopt={() => setToast('BSA kit already in your toolbox')}
          onNotify={(k) => setToast(`We'll email you when the ${k.role} kit ships`)}
        />

        {/* SHARED WITH YOU — honest empty state */}
        <SharedWithYouEmpty />

        {/* PINNED SHELF */}
        {pinnedTiles.length > 0 && (
          <>
            <SectionHeader
              eyebrow="Pinned"
              headline={<>On your <em className="italic text-[color:var(--ledger-accent)]">shelf.</em></>}
              right={`${pinnedTiles.length} pinned`}
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pinnedTiles.map(({ skill, type }) => (
                <Tile
                  key={skill.id}
                  skill={skill}
                  type={type}
                  pinned
                  librarySlugMap={librarySlugMap}
                  onOpen={() => setDrawerSkillId(skill.id)}
                  onRun={() => onRun(skill)}
                  onTogglePin={() => togglePin(skill.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* GRID — all other skills */}
        {!empty && (
          <>
            <SectionHeader
              eyebrow={`${gridTiles.length} ${gridTiles.length === 1 ? 'skill' : 'skills'}`}
              headline={<>All your <em className="italic text-[color:var(--ledger-accent)]">assets.</em></>}
              right={
                <button
                  type="button"
                  onClick={onBuild}
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--ledger-accent)] hover:text-[color:var(--ledger-accent-light)]"
                >
                  + New skill
                </button>
              }
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {gridTiles.map(({ skill, type, pinned: isPinned }) => (
                <Tile
                  key={skill.id}
                  skill={skill}
                  type={type}
                  pinned={isPinned}
                  librarySlugMap={librarySlugMap}
                  onOpen={() => setDrawerSkillId(skill.id)}
                  onRun={() => onRun(skill)}
                  onTogglePin={() => togglePin(skill.id)}
                />
              ))}
            </div>
            {gridTiles.length === 0 && pinnedTiles.length === 0 && (
              <p className="mt-8 text-center font-serif italic text-[color:var(--ledger-muted)]">
                Nothing matches that filter. Try clearing the type or the search.
              </p>
            )}
          </>
        )}

        {empty && <EmptyState onBrowse={onBrowse} onBuild={onBuild} />}
      </section>

      {/* DRAWER */}
      {drawerSkill && (
        <Drawer
          skill={drawerSkill}
          librarySlugMap={librarySlugMap}
          onClose={() => setDrawerSkillId(null)}
          onRun={() => { onRun(drawerSkill); setDrawerSkillId(null); }}
          onEdit={() => { onEdit(drawerSkill); setDrawerSkillId(null); }}
          onExport={() => { onExport(drawerSkill); setToast('Export started'); }}
          onDelete={() => { onDelete(drawerSkill.id); setDrawerSkillId(null); }}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 bg-[color:var(--ledger-ink)] px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--ledger-paper-warm)] shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}

/* ============== Subcomponents ============== */

function Stats({ stats }: { readonly stats: { total: number; newCount: number; staleCount: number; keptPct: number | null } }): JSX.Element {
  return (
    <div className="grid grid-cols-2 border border-[color:var(--ledger-rule-strong)] bg-[color:var(--ledger-paper-warm)] sm:grid-cols-4">
      <StatCell value={String(stats.total)} label="In your toolbox" />
      <StatCell value={String(stats.newCount)} label="New this week" tone={stats.newCount > 0 ? 'good' : 'neutral'} />
      <StatCell value={String(stats.staleCount)} label="Stale (30d+)" tone={stats.staleCount > 0 ? 'weak' : 'neutral'} />
      <StatCell value={stats.keptPct === null ? '—' : `${stats.keptPct}%`} label="In production" />
    </div>
  );
}

function StatCell({ value, label, tone = 'neutral' }: { value: string; label: string; tone?: 'neutral' | 'good' | 'weak' }): JSX.Element {
  const toneColor =
    tone === 'good' ? 'text-[color:var(--ledger-accent-2)]'
    : tone === 'weak' ? 'text-[color:var(--ledger-weak)]'
    : 'text-[color:var(--ledger-ink)]';
  return (
    <div className="flex flex-col gap-1.5 border-r border-[color:var(--ledger-rule)] px-6 py-5 last:border-r-0">
      <div className={`font-serif text-4xl leading-none tracking-[-0.025em] ${toneColor}`}>{value}</div>
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--ledger-muted)]">{label}</div>
    </div>
  );
}

function TypeFilter({
  activeType,
  counts,
  onSelect,
}: {
  readonly activeType: TileType | null;
  readonly counts: Readonly<Record<TileType, number>>;
  readonly onSelect: (t: TileType | null) => void;
}): JSX.Element {
  const items: readonly { key: TileType; label: string }[] = [
    { key: 'prompt', label: 'Prompts' },
    { key: 'skill', label: 'Skills' },
    { key: 'agent', label: 'Agents' },
    { key: 'playbook', label: 'Playbooks' },
  ];
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => {
        const isActive = activeType === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onSelect(isActive ? null : it.key)}
            className={`flex items-center gap-4 border px-4 py-3.5 text-left transition-colors ${
              isActive
                ? 'border-[color:var(--ledger-ink)] bg-[color:var(--ledger-ink)] text-[color:var(--ledger-paper-warm)]'
                : 'border-[color:var(--ledger-rule)] bg-[color:var(--ledger-paper-warm)] hover:border-[color:var(--ledger-ink-2)]'
            }`}
            aria-pressed={isActive}
          >
            <div className="grid h-8 w-8 flex-shrink-0 place-items-center border border-[color:var(--ledger-rule)] bg-[color:var(--ledger-bg)]">
              <DocIcon />
            </div>
            <div className="flex flex-col gap-1">
              <span className={`font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] ${isActive ? 'text-[color:rgba(244,241,231,0.7)]' : 'text-[color:var(--ledger-muted)]'}`}>{it.label}</span>
              <span className={`font-serif text-2xl leading-none tracking-[-0.02em] ${isActive ? 'text-[color:var(--ledger-paper-warm)]' : 'text-[color:var(--ledger-ink)]'}`}>{counts[it.key]}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  headline,
  right,
}: {
  readonly eyebrow: string;
  readonly headline: ReactNode;
  readonly right?: ReactNode;
}): JSX.Element {
  return (
    <div className="mt-11 flex items-baseline gap-4 border-b border-[color:var(--ledger-rule-strong)] pb-3">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--ledger-accent)]">{eyebrow}</span>
      <h2 className="font-serif text-3xl leading-none tracking-[-0.025em] text-[color:var(--ledger-ink)]">{headline}</h2>
      {right !== undefined && (
        <span className="ml-auto font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ledger-muted)]">{right}</span>
      )}
    </div>
  );
}

function KitGrid({
  onAdopt,
  onNotify,
}: {
  readonly onAdopt: (kit: KitCard) => void;
  readonly onNotify: (kit: KitCard) => void;
}): JSX.Element {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STARTER_KITS.map((kit) =>
        // A shipped kit is adoptable (the whole card is a button). A kit still
        // in SME review is NOT adoptable — it shows an honest "in review" state
        // with a notify affordance, so the click no longer flips a marker that
        // swaps no content (#229). When real content lands, set `shipped: true`
        // (or wire a per-kit pendingReview flag from PR #225) and it reverts to
        // the adoptable card.
        kit.shipped ? (
          <ShippedKitCard key={kit.key} kit={kit} onAdopt={onAdopt} />
        ) : (
          <ComingSoonKitCard key={kit.key} kit={kit} onNotify={onNotify} />
        ),
      )}
    </div>
  );
}

function ShippedKitCard({
  kit,
  onAdopt,
}: {
  readonly kit: KitCard;
  readonly onAdopt: (kit: KitCard) => void;
}): JSX.Element {
  return (
    <article
      className="flex cursor-pointer flex-col border border-[color:var(--ledger-rule-strong)] bg-[color:var(--ledger-paper-warm)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--ledger-ink)] hover:shadow-md"
      onClick={() => onAdopt(kit)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAdopt(kit); } }}
      role="button"
      tabIndex={0}
      aria-label={`Adopt ${kit.role} starter kit`}
    >
      <div className="flex flex-col gap-1.5 border-b border-[color:var(--ledger-rule)] px-4 py-3.5">
        <div className="flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[color:var(--ledger-accent)]">
          <span>{kit.role}</span>
          <span className="bg-[color:var(--ledger-accent)] px-1.5 py-0.5 text-[8px] tracking-[0.2em] text-[color:var(--ledger-paper-warm)]">✓ Live</span>
        </div>
        <h3 className="font-serif text-xl leading-tight tracking-[-0.02em] text-[color:var(--ledger-ink)]">{kit.headline}</h3>
        <p className="mt-0.5 font-serif text-[13px] italic leading-snug text-[color:var(--ledger-muted)]">{kit.description}</p>
      </div>
      <div className="flex items-center gap-3 border-t border-dashed border-[color:var(--ledger-rule)] bg-[color:var(--ledger-paper-warm)] px-4 py-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ledger-muted)]">
        <span><b className="font-bold text-[color:var(--ledger-ink-2)]">{kit.toolCount}</b> tools</span>
        <span className="ml-auto font-bold tracking-[0.18em] text-[color:var(--ledger-accent-2)]">In your toolbox ✓</span>
      </div>
    </article>
  );
}

function ComingSoonKitCard({
  kit,
  onNotify,
}: {
  readonly kit: KitCard;
  readonly onNotify: (kit: KitCard) => void;
}): JSX.Element {
  return (
    <article className="flex flex-col border border-[color:var(--ledger-rule)] bg-[color:var(--ledger-parch)]">
      <div className="flex flex-col gap-1.5 border-b border-[color:var(--ledger-rule)] px-4 py-3.5">
        <div className="flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[color:var(--ledger-muted)]">
          <span>{kit.role}</span>
          <span className="border border-[color:var(--ledger-rule-strong)] px-1.5 py-0.5 text-[8px] tracking-[0.2em] text-[color:var(--ledger-muted)]">
            In review
          </span>
        </div>
        <h3 className="font-serif text-xl leading-tight tracking-[-0.02em] text-[color:var(--ledger-ink-2)]">{kit.headline}</h3>
        <p className="mt-0.5 font-serif text-[13px] italic leading-snug text-[color:var(--ledger-muted)]">{kit.description}</p>
      </div>
      <div className="flex items-center gap-3 border-t border-dashed border-[color:var(--ledger-rule)] px-4 py-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ledger-muted)]">
        <span><b className="font-bold text-[color:var(--ledger-ink-2)]">{kit.toolCount}</b> prompts in SME review</span>
        <button
          type="button"
          onClick={() => onNotify(kit)}
          className="ml-auto font-bold tracking-[0.18em] text-[color:var(--ledger-accent)] underline-offset-2 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ledger-accent"
        >
          Notify me →
        </button>
      </div>
    </article>
  );
}

function SharedWithYouEmpty(): JSX.Element {
  return (
    <div className="mt-8 border border-[color:var(--ledger-accent)]/30 bg-[color:var(--ledger-accent)]/[0.06] px-6 py-5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--ledger-accent)]">Shared with you</p>
      <p className="mt-3 font-serif text-base leading-relaxed text-[color:var(--ledger-ink-2)]">
        Colleague-to-colleague tool sharing is on the roadmap. The institution membership model and the share-link table both land in a follow-up issue. For now, share skills via Markdown export (the drawer download button).
      </p>
    </div>
  );
}

function Tile({
  skill,
  type,
  pinned,
  librarySlugMap,
  onOpen,
  onRun,
  onTogglePin,
}: {
  readonly skill: ToolboxSkill;
  readonly type: TileType;
  readonly pinned: boolean;
  readonly librarySlugMap: Readonly<Record<string, string>>;
  readonly onOpen: () => void;
  readonly onRun: () => void;
  readonly onTogglePin: () => void;
}): JSX.Element {
  const desc = skill.desc || (isWorkflowSkill(skill) ? skill.purpose : '');
  const accentClass =
    type === 'prompt' ? 'before:bg-[color:var(--ledger-accent)]'
    : type === 'skill' ? 'before:bg-[color:var(--ledger-ink-2)]'
    : type === 'agent' ? 'before:bg-[color:var(--ledger-accent-2)]'
    : 'before:bg-[color:var(--ledger-weak)]';
  const tagColor =
    type === 'prompt' ? 'text-[color:var(--ledger-accent)]'
    : type === 'skill' ? 'text-[color:var(--ledger-ink-2)]'
    : type === 'agent' ? 'text-[color:var(--ledger-accent-2)]'
    : 'text-[color:var(--ledger-weak)]';
  return (
    <article
      className={`group relative flex cursor-pointer flex-col border border-[color:var(--ledger-rule)] bg-[color:var(--ledger-paper-warm)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--ledger-ink)] hover:shadow-md`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onOpen(); } }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${skill.name}`}
    >
      {/* Doc preview region */}
      <div className={`relative flex h-[140px] flex-col gap-1.5 overflow-hidden border-b border-[color:var(--ledger-rule)] bg-[color:#FBF8EE] px-4 pt-3.5 pb-3 before:absolute before:inset-y-0 before:left-0 before:w-[3px] ${accentClass}`}>
        <div className="flex items-baseline justify-between">
          <span className={`font-mono text-[8px] font-bold uppercase tracking-[0.22em] ${tagColor}`}>
            {skill.cmd || TILE_LABELS[type]}
          </span>
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[color:var(--ledger-muted)]">
            {skill.maturity || 'draft'}
          </span>
        </div>
        <div className="font-serif text-[13px] italic font-medium leading-tight tracking-[-0.01em] text-[color:var(--ledger-ink)]">
          {plain(skill.name)}
        </div>
        {desc && (
          <p className="line-clamp-3 font-serif text-[11.5px] leading-snug text-[color:var(--ledger-muted)]">{desc}</p>
        )}
        {pinned && (
          <span aria-hidden className="pointer-events-none absolute right-2 top-2 text-sm leading-none text-[color:var(--ledger-accent)]">★</span>
        )}
      </div>

      {/* Meta footer */}
      <div className="flex flex-col gap-2 bg-[color:var(--ledger-paper-warm)] px-4 pb-3 pt-3">
        <span className={`font-mono text-[8.5px] font-bold uppercase tracking-[0.22em] ${tagColor}`}>{TILE_LABELS[type]}</span>
        <h3 className="font-serif text-[17px] leading-snug tracking-[-0.015em] text-[color:var(--ledger-ink)]">{plain(skill.name)}</h3>
        <div className="mt-1">
          <SourceBacklink source={skill.source} sourceRef={skill.sourceRef} librarySlugMap={librarySlugMap} />
        </div>
        <div className="mt-2 flex items-center gap-2 border-t border-dashed border-[color:var(--ledger-rule)] pt-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRun(); }}
            className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--ledger-accent)] hover:text-[color:var(--ledger-accent-light)]"
          >
            ▶ Run
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
            className="ml-auto text-base leading-none text-[color:var(--ledger-accent)] transition-opacity hover:opacity-70"
            aria-label={pinned ? 'Unpin' : 'Pin to shelf'}
            aria-pressed={pinned}
          >
            {pinned ? '★' : '☆'}
          </button>
        </div>
      </div>
    </article>
  );
}

function Drawer({
  skill,
  librarySlugMap,
  onClose,
  onRun,
  onEdit,
  onExport,
  onDelete,
}: {
  readonly skill: ToolboxSkill;
  readonly librarySlugMap: Readonly<Record<string, string>>;
  readonly onClose: () => void;
  readonly onRun: () => void;
  readonly onEdit: () => void;
  readonly onExport: () => void;
  readonly onDelete: () => void;
}): JSX.Element {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
  const body = isWorkflowSkill(skill)
    ? formatWorkflowSkillBody(skill)
    : (skill.userPromptTemplate || skill.systemPrompt || '');
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-[color:var(--ledger-ink)]/45"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-[51] w-[640px] max-w-[96vw] overflow-y-auto bg-[color:var(--ledger-bg)] shadow-2xl"
        role="dialog"
        aria-label={`Skill detail: ${skill.name}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[color:var(--ledger-rule)] bg-[color:var(--ledger-bg)] px-7 py-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--ledger-accent)]">
            {(skill.cmd || skill.maturity || 'skill')} · {skill.version || 'v1'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-base leading-none text-[color:var(--ledger-soft)] hover:text-[color:var(--ledger-ink)]"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        <div className="px-7 pb-12 pt-7">
          {/* Document preview */}
          <div className="relative mb-6 border border-[color:var(--ledger-rule-strong)] bg-[color:#FBF8EE] px-6 py-6 shadow before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[color:var(--ledger-accent)]">
            <div className="flex items-baseline justify-between border-b-2 border-[color:var(--ledger-ink)] pb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--ledger-muted)]">
              <span>{skill.cmd || skill.maturity}</span>
              <span>{skill.modified ? `Edited ${formatRelativeDate(skill.modified)}` : ''}</span>
            </div>
            <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.025em] text-[color:var(--ledger-ink)]">
              {plain(skill.name)}
            </h2>
            {skill.desc && (
              <p className="mt-3 font-serif text-[15px] leading-relaxed text-[color:var(--ledger-ink-2)]">{skill.desc}</p>
            )}
            <div className="mt-4">
              <SourceBacklink source={skill.source} sourceRef={skill.sourceRef} librarySlugMap={librarySlugMap} />
            </div>
          </div>

          {/* Primary actions */}
          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={onRun}
              className="flex flex-1 items-center justify-center gap-2 bg-[color:var(--ledger-ink)] px-5 py-3.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-[color:var(--ledger-paper-warm)] transition-colors hover:bg-[color:var(--ledger-accent)]"
            >
              ▶ Run in Playground
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="border border-[color:var(--ledger-rule-strong)] bg-[color:var(--ledger-paper-warm)] px-4 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ledger-ink-2)] transition-colors hover:border-[color:var(--ledger-ink)]"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onExport}
              className="border border-[color:var(--ledger-rule-strong)] bg-[color:var(--ledger-paper-warm)] px-4 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ledger-ink-2)] transition-colors hover:border-[color:var(--ledger-ink)]"
            >
              Export
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete "${plain(skill.name)}"? This cannot be undone.`)) onDelete();
              }}
              className="border border-[color:var(--ledger-weak)]/40 bg-[color:var(--ledger-paper-warm)] px-4 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ledger-weak)] transition-colors hover:border-[color:var(--ledger-weak)]"
            >
              Delete
            </button>
          </div>

          {/* Body */}
          {body && (
            <section className="mt-7 border-t border-[color:var(--ledger-rule)] pt-5">
              <div className="mb-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[color:var(--ledger-accent)]">
                {isWorkflowSkill(skill) ? 'Workflow definition' : 'Prompt body'}
              </div>
              <pre className="whitespace-pre-wrap border border-[color:var(--ledger-rule)] bg-[color:var(--ledger-parch)] px-5 py-4 font-mono text-[12.5px] leading-relaxed text-[color:var(--ledger-ink-2)]">
                {body}
              </pre>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}

function EmptyState({ onBrowse, onBuild }: { readonly onBrowse: () => void; readonly onBuild: () => void }): JSX.Element {
  return (
    <section className="mx-auto mt-16 max-w-2xl border border-[color:var(--ledger-rule-strong)] bg-[color:var(--ledger-paper-warm)] px-8 py-16 text-center">
      <h2 className="font-serif text-4xl tracking-[-0.025em] text-[color:var(--ledger-ink)]">
        Your toolbox is <em className="italic text-[color:var(--ledger-accent)]">empty.</em>
      </h2>
      <p className="mt-3 font-serif text-base leading-relaxed text-[color:var(--ledger-muted)]">
        Pick up any prompt from the Library — your saved copies live here,
        ready to re-run.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={onBrowse}
          className="bg-[color:var(--ledger-ink)] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--ledger-paper-warm)] transition-colors hover:bg-[color:var(--ledger-accent)]"
        >
          Browse Library →
        </button>
        <button
          type="button"
          onClick={onBuild}
          className="border border-[color:var(--ledger-rule-strong)] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--ledger-ink)] transition-colors hover:border-[color:var(--ledger-ink)]"
        >
          Build from scratch
        </button>
      </div>
    </section>
  );
}

/* ============== Helpers ============== */

function formatRelativeDate(iso: string): string {
  const t = Date.parse(iso);
  if (!t) return '';
  const now = Date.now();
  const days = Math.round((now - t) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  return `${Math.round(days / 365)} years ago`;
}

function formatWorkflowSkillBody(skill: import('@/lib/toolbox/types').ToolboxWorkflowSkill): string {
  const sections: string[] = [];
  if (skill.purpose) sections.push(`PURPOSE\n${skill.purpose}`);
  if (skill.success) sections.push(`SUCCESS\n${skill.success}`);
  if (skill.steps?.length) sections.push(`STEPS\n${skill.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
  if (skill.guardrails?.length) sections.push(`GUARDRAILS\n${skill.guardrails.map((g) => `- ${g}`).join('\n')}`);
  return sections.join('\n\n');
}

function SearchIcon(): JSX.Element {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path d="M16 16 L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M5 12 L19 12 M13 6 L19 12 L13 18" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none" />
      <line x1="5" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1" />
      <line x1="5" y1="8.5" x2="9" y2="8.5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="5" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
