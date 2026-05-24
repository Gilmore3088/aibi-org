// /foundation-canvas — operator-only review surface that renders every
// Foundation Course lesson as a thumbnail iframe in a single grid.
//
// Built 2026-05-24 in response to "I can't see the whole course at once."
// Lives outside the (addie) route group so it doesn't get the AddieNav
// chrome — this page is its own canvas. Gated via OPERATOR_EMAILS like
// /admin/*, returns 404 to non-operators so the URL isn't discoverable.

import { notFound } from 'next/navigation';
import { getOperatorContext } from '@/lib/addie/auth/isOperator';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { isPreviewAuthBypassEnabled } from '@/lib/auth/previewBypass';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface LessonRow {
  id: string;
  module_id: string;
  ordinal: number;
  title: string;
  modality: string;
  duration_min: number;
}

interface ModuleRow {
  id: string;
  ordinal: number;
  title: string;
  tier: 'free' | 'paid';
}

interface ModuleGroup {
  module: ModuleRow;
  lessons: LessonRow[];
}

async function loadCourse(): Promise<ModuleGroup[]> {
  const svc = getAddieServiceClient();
  const [{ data: modules }, { data: lessons }] = await Promise.all([
    svc.from('modules').select('id, ordinal, title, tier').eq('published', true).order('ordinal'),
    svc.from('lessons').select('id, module_id, ordinal, title, modality, duration_min').eq('published', true).order('ordinal'),
  ]);
  const moduleRows = (modules ?? []) as ModuleRow[];
  const lessonRows = (lessons ?? []) as LessonRow[];
  return moduleRows.map((m) => ({
    module: m,
    lessons: lessonRows.filter((l) => l.module_id === m.id).sort((a, b) => a.ordinal - b.ordinal),
  }));
}

export default async function FoundationCanvas() {
  const ctx = await getOperatorContext();
  // Operator OR local-dev preview bypass OR plain NODE_ENV === 'development'.
  // The canvas is a read-only review surface — no destructive actions, no
  // PII exposure (lesson titles + iframe of public-render pages). In dev
  // we don't gate it; production needs OPERATOR_EMAILS + a signed-in
  // operator session.
  const isDev = process.env.NODE_ENV !== 'production';
  if (!ctx.isOperator && !isPreviewAuthBypassEnabled() && !isDev) notFound();

  const groups = await loadCourse();
  const lessonCount = groups.reduce((n, g) => n + g.lessons.length, 0);

  return (
    <div className="min-h-screen bg-[var(--ledger-bg)] text-[var(--ledger-ink)] py-10 px-6">
      <header className="max-w-[1800px] mx-auto mb-10">
        <div className="font-mono uppercase tracking-[0.2em] text-[0.7rem] text-[var(--ledger-accent)] mb-2">
          Operator canvas · {ctx.email}
        </div>
        <h1 className="font-serif text-4xl leading-tight">
          Foundation Course — every lesson at a glance
        </h1>
        <p className="text-sm text-[var(--ledger-muted)] mt-2 max-w-2xl">
          {lessonCount} lessons across {groups.length} modules + the post-M3 gate.
          Each tile is a live iframe of the lesson at viewport size, scaled
          down. Click any tile to open the lesson full-size in a new tab.
        </p>

        {/* Diagnostic */}
        <aside className="mt-5 rounded-[4px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-5 py-4 max-w-3xl">
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-2">
            What this canvas surfaces
          </div>
          <ol className="text-sm text-[var(--ledger-ink-2)] space-y-1.5 list-decimal pl-5">
            <li>
              <strong className="text-[var(--ledger-ink)] font-semibold">Visual sameness across M0–M3 free lessons.</strong>{' '}
              Every lesson shares the hero-illustration + scrolling-body + TOC-rail template. Distinct module illustrations carry most of the differentiation.
            </li>
            <li>
              <strong className="text-[var(--ledger-ink)] font-semibold">m0.2 (v2 shell) is the visual outlier.</strong>{' '}
              Step-progress header, no hero illustration, no right rail. This is the migration target for the other 23 lessons.
            </li>
            <li>
              <strong className="text-[var(--ledger-ink)] font-semibold">M4 + M5 paid lessons all show the same PaywallPreview.</strong>{' '}
              To anon viewers (this canvas included unless you set <code className="font-mono text-[0.85em] bg-[var(--ledger-parch)] px-1 rounded-[2px]">PREVIEW_AUTH_BYPASS=true</code>), all 9 paid lessons look identical. The paywall should preview lesson-specific content, not be generic.
            </li>
          </ol>
        </aside>
      </header>

      <main className="max-w-[1800px] mx-auto space-y-12">
        {groups.map((g) => (
          <section key={g.module.id}>
            <header className="flex items-baseline gap-3 pb-3 mb-5 border-b border-[var(--ledger-rule)]">
              <span className="font-mono uppercase tracking-[0.2em] text-[0.7rem] text-[var(--ledger-accent)] font-semibold">
                {g.module.id.toUpperCase()}
              </span>
              <h2 className="font-serif text-2xl">{g.module.title}</h2>
              <span className={`font-mono uppercase tracking-[0.16em] text-[0.6rem] px-2 py-0.5 rounded-[2px] ${
                g.module.tier === 'paid'
                  ? 'bg-[color-mix(in_srgb,var(--ledger-accent)_15%,var(--ledger-paper))] text-[var(--ledger-accent)]'
                  : 'text-[var(--ledger-muted)]'
              }`}>
                {g.module.tier}
              </span>
              <span className="ml-auto font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)] tabular-nums">
                {g.lessons.length} lessons
              </span>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {g.lessons.map((l) => (
                <a
                  key={l.id}
                  href={`/foundation/${l.module_id}/${l.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block group rounded-[4px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] overflow-hidden hover:border-[var(--ledger-ink)] transition-colors duration-[120ms]"
                >
                  <div className="relative w-full bg-white border-b border-[var(--ledger-rule)]" style={{ aspectRatio: '16 / 10' }}>
                    {/* Scaled iframe — the live lesson at thumbnail size */}
                    <div
                      className="absolute inset-0 origin-top-left pointer-events-none"
                      style={{
                        width: '1280px',
                        height: '800px',
                        transform: 'scale(0.375)',
                        transformOrigin: 'top left',
                      }}
                    >
                      <iframe
                        src={`/foundation/${l.module_id}/${l.id}`}
                        title={`${l.id} — ${l.title}`}
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-accent)] mb-0.5">
                        {l.id}
                      </div>
                      <div className="font-serif text-[0.95rem] text-[var(--ledger-ink)] truncate">
                        {l.title}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono uppercase tracking-[0.14em] text-[0.55rem] text-[var(--ledger-muted)]">
                        {l.modality}
                      </div>
                      <div className="font-mono tabular-nums text-[0.65rem] text-[var(--ledger-muted)]">
                        {l.duration_min}m
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* Gate as a separate row */}
        <section>
          <header className="flex items-baseline gap-3 pb-3 mb-5 border-b border-[var(--ledger-rule-strong)]">
            <span className="font-mono uppercase tracking-[0.2em] text-[0.7rem] text-[var(--ledger-accent)] font-semibold">
              GATE
            </span>
            <h2 className="font-serif text-2xl">Three-way fork after Module 3</h2>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <a
              href="/foundation/gate"
              target="_blank"
              rel="noreferrer"
              className="block rounded-[4px] border-2 border-[var(--ledger-accent)] bg-[var(--ledger-paper)] overflow-hidden hover:border-[var(--ledger-ink)] transition-colors duration-[120ms]"
            >
              <div className="relative w-full bg-white border-b border-[var(--ledger-rule)]" style={{ aspectRatio: '16 / 10' }}>
                <div
                  className="absolute inset-0 origin-top-left pointer-events-none"
                  style={{ width: '1280px', height: '800px', transform: 'scale(0.375)', transformOrigin: 'top left' }}
                >
                  <iframe src="/foundation/gate" title="Gate" className="w-full h-full border-0" loading="lazy" />
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-accent)] mb-0.5">/foundation/gate</div>
                <div className="font-serif text-[0.95rem] text-[var(--ledger-ink)]">Pay · Email-to-keep · Decline</div>
              </div>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
