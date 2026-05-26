/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  EyebrowChip,
} from '@/components/mockup';

export const metadata: Metadata = {
  title: 'Redesign Audit — The AI Banking Institute',
  description: 'Internal audit of the mockup-system redesign sprint. Status, ported routes, component library, token swatches.',
  robots: { index: false, follow: false },
};

const PORTED: { path: string; phase: string; sketch: string; note?: string }[] = [
  { path: '/', phase: '2a', sketch: 'mockup.html', note: 'hero report, platform preview, path builder, role preview, sandbox, save-to-toolbox, CTA' },
  { path: '/assessment', phase: '2b', sketch: 'assessment.html', note: 'live mini-quiz with side score panel' },
  { path: '/assessment/take', phase: '2b', sketch: '— (moved from /assessment)', note: 'live 12-q flow preserved from before' },
  { path: '/results', phase: '2c', sketch: 'results.html', note: 'animated dimension bars, email PDF, team signal' },
  { path: '/courses', phase: '2d', sketch: 'course.html', note: 'interactive module preview' },
  { path: '/playground', phase: '2e', sketch: 'sandbox.html', note: 'workbench with type-on output, scenario pills, review tags' },
  { path: '/practice', phase: '2j', sketch: '_jsx-sources/practice-sandbox-interior.jsx', note: 'signed-in interior — role+scenario picker, prompt workspace, review checklist' },
  { path: '/my-toolbox', phase: '2f', sketch: 'toolbox.html', note: 'role filter, prompt detail, copy to clipboard' },
  { path: '/my-toolbox/skill-builder', phase: '2g', sketch: 'tool-skill-builder.html', note: 'companion ribbon, tabbed output' },
  { path: '/my-toolbox/skills/example-skill', phase: '2g', sketch: 'tool-saved-skill.html', note: 'version selector, related assets — dynamic [slug]' },
  { path: '/for-institutions', phase: '2h', sketch: 'teams.html', note: 'dashboard preview, 5-step chain, sizer with live calc' },
  { path: '/playbooks', phase: '2i', sketch: '—', note: 'index of 6 role playbooks' },
  { path: '/playbooks/compliance', phase: '2i', sketch: 'playbook-compliance.html' },
  { path: '/playbooks/retail', phase: '2i', sketch: 'playbook-retail.html' },
  { path: '/playbooks/marketing', phase: '2i', sketch: 'playbook-marketing.html' },
  { path: '/playbooks/lending', phase: '2i', sketch: 'playbook-lending.html' },
  { path: '/playbooks/bsa-aml', phase: '2i', sketch: 'playbook-bsa-aml.html' },
  { path: '/playbooks/infosec', phase: '2i', sketch: 'playbook-infosec.html' },
  { path: '/about', phase: '3+4', sketch: '— (gap)', note: 'MockupShell wrapper' },
  { path: '/faq', phase: '3+4', sketch: '— (gap)', note: '6 Q&A cards' },
  { path: '/security', phase: '3+4', sketch: '— (gap)' },
  { path: '/certifications', phase: '3+4', sketch: '— (gap)' },
  { path: '/education', phase: '3+4', sketch: '— (gap)' },
  { path: '/briefing-preview', phase: '3+4', sketch: '— (gap)' },
  { path: '/privacy', phase: '3+4', sketch: '— (gap)' },
  { path: '/terms', phase: '3+4', sketch: '— (gap)' },
  { path: '/ai-use-disclaimer', phase: '3+4', sketch: '— (gap)' },
];

const PARTIAL: { path: string; note: string }[] = [
  { path: '/dashboard', note: 'mockup-scope wrapper + SiteHeader; internal ledger-dash markup unchanged' },
  { path: '/courses/foundation/program', note: 'mockup-scope wrapper via layout; CourseShell + module pages keep existing chrome' },
];

const COMPONENTS = [
  { file: 'Button.tsx', exports: 'Button, ArrowGlyph', purpose: 'gold / ink / ghost-dark / ghost-light variants, md+lg sizes, polymorphic (button or Link)' },
  { file: 'SiteHeader.tsx', exports: 'SiteHeader', purpose: 'seal + two-line wordmark + pill nav + mobile horizontal nav + primary CTA' },
  { file: 'Section.tsx', exports: 'Section, SectionHead', purpose: 'page section wrapper (cream/white/ink surfaces) + kicker+h2+lede heading' },
  { file: 'Card.tsx', exports: 'Card, InfoBox, IconBadge', purpose: 'white/cream surface, optional elevation; InfoBox solid/line; IconBadge ink/gold' },
  { file: 'CtaBand.tsx', exports: 'CtaBand', purpose: 'dark navy band with kicker + h2 + body + 1-2 action buttons' },
  { file: 'EyebrowChip.tsx', exports: 'EyebrowChip', purpose: 'gold-tinted pill chip for hero kickers' },
  { file: 'MockupShell.tsx', exports: 'MockupShell', purpose: 'composed wrapper for static gap-pages — hero + N sections + CTA in one prop' },
  { file: 'index.ts', exports: '— (barrel)', purpose: 'public surface' },
];

const TOKENS = [
  { name: '--ink', hex: '#071A2F', note: 'primary dark — hero/CTA' },
  { name: '--ink-2', hex: '#0B2745', note: 'ink hover' },
  { name: '--gold', hex: '#C8A24A', note: 'single accent / primary CTA fill' },
  { name: '--gold-2', hex: '#D8B867', note: 'gold hover' },
  { name: '--gold-soft', hex: '#E6D39B', note: 'on-dark kicker / metadata' },
  { name: '--gold-deep', hex: '#9A7A2F', note: 'on-light kicker / metadata' },
  { name: '--cream', hex: '#F7F3EA', note: 'page background' },
  { name: '--cream-2', hex: '#EFE7D7', note: 'recessed cream' },
  { name: '--slate-50', hex: '#F8FAFC', note: 'lightest neutral' },
  { name: '--slate-200', hex: '#E2E8F0', note: 'hairline rules' },
  { name: '--slate-500', hex: '#64748B', note: 'mid neutral text' },
  { name: '--slate-600', hex: '#475569', note: 'body neutral' },
  { name: '--emerald-700', hex: '#047857', note: 'success / saved confirmation' },
];

const RADII = [
  { token: '--r-pill', px: '999px', note: 'eyebrow chips, pill buttons' },
  { token: '--r-sm', px: '8px', note: 'sketch ribbon' },
  { token: '--r-md', px: '12px', note: 'buttons, infoboxes, small surfaces' },
  { token: '--r-lg', px: '16px', note: 'feature pieces, scenario cards' },
  { token: '--r-xl', px: '24px', note: 'content cards, suite cards' },
  { token: '--r-2xl', px: '28px', note: 'hero cards, role cards' },
  { token: '--r-3xl', px: '32px', note: 'large feature cards, dark CTA band' },
];

const COMMITS: { sha: string; phase: string; summary: string }[] = [
  { sha: '17c16db', phase: '6', summary: 'docs: redesign-sprint completion + Phase 6 cleanup deferral' },
  { sha: '92520ef', phase: '5b', summary: 'feat(lms): mockup-scope wrap on LMS interior (partial)' },
  { sha: '2976dda', phase: '5a', summary: 'feat(dashboard): mockup-scope + SiteHeader (partial)' },
  { sha: 'e93704c', phase: '3+4', summary: 'feat(gap-pages): 9 marketing gap pages via MockupShell' },
  { sha: 'd14cd57', phase: '2j', summary: 'feat(practice): practice-sandbox-interior → /practice' },
  { sha: '266a741', phase: '2i', summary: 'feat(playbooks): 6 role playbooks via shared template' },
  { sha: '862c9d6', phase: '2h', summary: 'feat(teams): teams.html → /for-institutions' },
  { sha: '6be3afc', phase: '2g', summary: 'feat(toolbox): skill-builder + saved-skill' },
  { sha: 'ba6c252', phase: '2f', summary: 'feat(toolbox): toolbox.html → /my-toolbox' },
  { sha: '45524a2', phase: '2e', summary: 'feat(playground): sandbox.html → /playground' },
  { sha: '59eb4af', phase: '2d', summary: 'feat(courses): course.html → /courses' },
  { sha: '7d4cf04', phase: '2c', summary: 'feat(results): results.html → /results' },
  { sha: '8cc880f', phase: '2b', summary: 'feat(assessment): landing → /assessment' },
  { sha: '2fda587', phase: '2a', summary: 'feat(home): mockup.html → /' },
  { sha: '2828143', phase: '—', summary: 'chore(sketches): stash practice-sandbox-interior.jsx' },
  { sha: 'b0ffd50', phase: '1', summary: 'feat(design): mockup component library' },
  { sha: '82893c1', phase: '0', summary: 'docs(design): retire Ledger for the mockup design system' },
  { sha: '7e24055', phase: '0', summary: 'chore: carry uncommitted main-branch changes' },
];

type FollowUpStatus = 'done' | 'partial' | 'pending';
const FOLLOW_UPS: { num: string; title: string; status: FollowUpStatus; note: string }[] = [
  {
    num: '01',
    title: 'Dashboard panels → mockup look',
    status: 'done',
    note: 'Token remap (2026-05-26) unified palette + Inter across all --ledger-* references. /dashboard now renders with mockup colors + font without per-panel edits. Layout radii intentionally preserved.',
  },
  {
    num: '02',
    title: 'CourseShell + foundation/program module pages',
    status: 'done',
    note: 'Same fast-path: token remap covers every --ledger-* reference in the LMS interior. CourseShell sidebar, module pages, and quick-wins all pick up mockup palette + Inter.',
  },
  {
    num: '03',
    title: 'Auth surface (/auth/*)',
    status: 'done',
    note: '/auth/login, /auth/signup, /auth/forgot-password, /auth/reset-password verified 200 with mockup chrome. LedgerSurface internal lockup suppressed via showHeader={false} as before.',
  },
  {
    num: '04',
    title: 'Token sweep + migration',
    status: 'partial',
    note: 'Visual unification achieved via value remap in tokens-ledger.css (Phase 6 fast-path). All 99 --color-* and 130 --ledger-* references now resolve to mockup palette. Per-file source cleanup (replacing var names) is purely code hygiene — can be done incrementally, not blocking.',
  },
  {
    num: '05',
    title: 'Delete legacy token files, rename tokens-mockup.css → tokens.css',
    status: 'pending',
    note: 'Still risky. Deleting --ledger-bg, --color-ink, etc. would 404 every reference. Safer order: do incremental var-name cleanup (item #4 second pass) first, then delete. Not blocking visual unification — system already looks mockup.',
  },
  {
    num: '06',
    title: 'Push branch + open PR',
    status: 'pending',
    note: 'All 22+ commits remain local on feature/redesign-mockup-system. Push requires explicit approval per CLAUDE.md. Vercel will build a preview URL on first push.',
  },
];

export default function RedesignAuditPage() {
  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/redesign-audit" cta={{ label: 'Live home →', href: '/' }} />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip>Internal · Redesign Audit · 2026-05-26</EyebrowChip>
            <h1>22 routes ported. 2 wrapped. Zero pushed.</h1>
            <p className="mk-lede">
              Full inventory of the mockup-system redesign sprint shipped to
              <code style={{ background: 'var(--on-dark-10)', padding: '2px 8px', borderRadius: 4, marginLeft: 6, fontSize: '0.9em' }}>
                feature/redesign-mockup-system
              </code>
              . Status, ported routes, component library, token swatches, and follow-up work.
            </p>
          </div>

          {/* Score summary card */}
          <div className="mk-hreport">
            <div className="mk-hreport-left">
              <div className="mk-k">Sprint snapshot</div>
              <div className="mk-v">22</div>
              <div className="mk-u">routes shipped</div>
              <div className="mk-tier">17 commits · 0 pushed</div>
            </div>
            <div className="mk-hreport-right">
              <div className="mk-k">By Phase</div>
              <div className="mk-hdims">
                {[
                  { name: 'Phase 0 — doctrine', pct: 100 },
                  { name: 'Phase 1 — library', pct: 100 },
                  { name: 'Phase 2 — page ports', pct: 100 },
                  { name: 'Phase 3+4 — gap pages', pct: 100 },
                  { name: 'Phase 5a — dashboard', pct: 70 },
                  { name: 'Phase 5b — LMS interior', pct: 65 },
                  { name: 'Phase 5c — auth surfaces', pct: 75 },
                  { name: 'Phase 6 — token remap', pct: 80 },
                  { name: 'Phase 6 — file deletion', pct: 0 },
                  { name: 'Push to remote', pct: 0 },
                ].map((d) => (
                  <div key={d.name} className="mk-hdim">
                    <div className="mk-row">
                      <span className="mk-nm">{d.name}</span>
                      <span className="mk-lv">{d.pct}%</span>
                    </div>
                    <div className="mk-bar">
                      <div className="mk-fill" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTED ROUTES */}
      <Section variant="std">
        <SectionHead
          kicker="Ported routes"
          heading={<>22 routes shipped to the mockup design system.</>}
          lede={<>Each route uses the new SiteHeader, mockup tokens, mockup CSS classes, and the mockup component library. Click any path to open the live preview.</>}
        />
        <div className="mk-cats">
          {PORTED.map((r) => (
            <div key={r.path} className="mk-cat">
              <div className="mk-bar" />
              <div className="mk-body">
                <div className="mk-top">
                  <span
                    className="mk-pic"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--r-md)',
                      background: 'var(--gold)',
                      color: 'var(--ink)',
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {r.phase}
                  </span>
                  <span className="mk-ct">{r.sketch}</span>
                </div>
                <h3>
                  <Link href={r.path} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <code style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: 'var(--ink)' }}>{r.path}</code>
                  </Link>
                </h3>
                {r.note && <p style={{ minHeight: 'auto' }}>{r.note}</p>}
                <Link href={r.path} style={{ color: 'var(--gold-deep)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  Open live →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* PARTIAL */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="Partial wrap"
          heading={<>2 surfaces inherit the chrome but keep their interior.</>}
          lede={<>These pages have the new font, page background, and global nav, but their internal panels still use the prior Ledger token system. Deep port deferred — see follow-ups.</>}
        />
        <div className="mk-cats">
          {PARTIAL.map((r) => (
            <div key={r.path} className="mk-cat">
              <div className="mk-bar" style={{ background: 'var(--slate-400)' }} />
              <div className="mk-body">
                <div className="mk-top">
                  <span className="mk-ct" style={{ color: 'var(--slate-500)' }}>Partial</span>
                </div>
                <h3>
                  <Link href={r.path} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <code style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: 'var(--ink)' }}>{r.path}</code>
                  </Link>
                </h3>
                <p style={{ minHeight: 'auto' }}>{r.note}</p>
                <Link href={r.path} style={{ color: 'var(--gold-deep)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  Open live →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* COMPONENT LIBRARY */}
      <Section variant="std">
        <SectionHead
          kicker="Component library"
          heading={<>src/components/mockup/* — 8 files.</>}
          lede={<>The shared primitives used by every ported route. Class-based against src/styles/mockup.css.</>}
        />
        <div className="mk-cats">
          {COMPONENTS.map((c) => (
            <div key={c.file} className="mk-cat">
              <div className="mk-bar" />
              <div className="mk-body">
                <div className="mk-top">
                  <span className="mk-pic">
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </span>
                  <span className="mk-ct">{c.exports}</span>
                </div>
                <h3 style={{ fontSize: 18 }}>
                  <code style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14 }}>{c.file}</code>
                </h3>
                <p style={{ minHeight: 'auto' }}>{c.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* TOKEN PALETTE */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="Tokens · src/styles/tokens-mockup.css"
          heading={<>Color palette.</>}
          lede={<>Bare names (--ink, --gold, --cream) so React ports stay byte-for-byte identical to the source sketches. Coexists with --ledger-* and --color-* until the LMS interior + dashboard panels migrate.</>}
        />
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          }}
        >
          {TOKENS.map((t) => (
            <div key={t.name} className="mk-card-white" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: t.hex, height: 80, borderBottom: '1px solid var(--ink-a10)' }} />
              <div style={{ padding: 16 }}>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 13 }}>
                  {t.name}
                </div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'var(--slate-500)', marginTop: 4 }}>
                  {t.hex}
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-600)', marginTop: 8 }}>{t.note}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* RADII */}
      <Section variant="std">
        <SectionHead
          kicker="Radii scale"
          heading={<>Seven steps from chip to hero.</>}
          lede={<>Mockup system uses generous radii (12–32px). Ledger&apos;s 2–4px ceiling was retired with the 2026-05-26 doctrine update.</>}
        />
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          }}
        >
          {RADII.map((r) => (
            <div key={r.token} className="mk-card-white" style={{ padding: 20 }}>
              <div
                style={{
                  height: 60,
                  background: 'var(--ink)',
                  borderRadius: `var(${r.token})`,
                  marginBottom: 16,
                }}
              />
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 13 }}>
                {r.token}
              </div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'var(--slate-500)', marginTop: 4 }}>
                {r.px}
              </div>
              <div style={{ fontSize: 12, color: 'var(--slate-600)', marginTop: 8 }}>{r.note}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* TYPOGRAPHY */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="Typography"
          heading={<>Inter — one family, five weights.</>}
          lede={<>Newsreader, Geist, and JetBrains Mono from the Ledger era are retained on unmigrated surfaces during migration. New work uses Inter only. JetBrains Mono survives as the tabular-numerics + kicker font.</>}
        />
        <div className="mk-card-white" style={{ padding: 32 }}>
          <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 600, fontSize: 56, lineHeight: 1.04, letterSpacing: '-0.02em' }}>
            H1 · 56px / 600 — Inter Semibold
          </div>
          <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 600, fontSize: 36, lineHeight: 1.08, marginTop: 24 }}>
            H2 · 36px / 600 — Inter Semibold
          </div>
          <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 600, fontSize: 22, lineHeight: 1.2, marginTop: 24 }}>
            H3 · 22px / 600 — Inter Semibold
          </div>
          <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 400, fontSize: 18, lineHeight: 1.55, color: 'var(--slate-600)', marginTop: 24, maxWidth: '60ch' }}>
            Lede · 18px / 400 — Inter Regular. Used for hero ledes, section ledes, and body emphasis. Slate-600 on cream surfaces for AA contrast.
          </div>
          <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 400, fontSize: 16, lineHeight: 1.55, marginTop: 24, maxWidth: '60ch' }}>
            Body · 16px / 400 — Inter Regular. Default paragraph weight. Ink on cream or white.
          </div>
          <div style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontWeight: 700, fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-deep)', marginTop: 32 }}>
            Kicker · JetBrains Mono · 0.18em tracking · uppercase · gold-deep
          </div>
        </div>
      </Section>

      {/* BUTTON SHOWCASE */}
      <Section variant="std">
        <SectionHead
          kicker="Buttons · 4 variants × 2 sizes"
          heading={<>The full button taxonomy.</>}
        />
        <div className="mk-card-white" style={{ padding: 32, display: 'grid', gap: 24 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="gold">Gold · md</Button>
            <Button variant="ink">Ink · md</Button>
            <Button variant="ghost-light">Ghost-light · md</Button>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="gold" size="lg">Gold · lg</Button>
            <Button variant="ink" size="lg">Ink · lg</Button>
            <Button variant="ghost-light" size="lg">Ghost-light · lg</Button>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: 24, background: 'var(--ink)', borderRadius: 16 }}>
            <Button variant="gold" size="lg">Gold on dark</Button>
            <Button variant="ghost-dark" size="lg">Ghost-dark</Button>
          </div>
        </div>
      </Section>

      {/* COMMITS */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="Commit log · feature/redesign-mockup-system"
          heading={<>17 commits, all local.</>}
          lede={<>None pushed to origin. Push requires explicit go-ahead per CLAUDE.md.</>}
        />
        <div className="mk-card-white" style={{ padding: 0, overflow: 'hidden' }}>
          {COMMITS.map((c, i) => (
            <div
              key={c.sha}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto 1fr',
                gap: 16,
                padding: 16,
                alignItems: 'center',
                borderTop: i === 0 ? '0' : '1px solid var(--slate-200)',
              }}
            >
              <code style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'var(--slate-500)' }}>
                {c.sha}
              </code>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--r-pill)',
                  background: 'var(--gold-a20)',
                  color: 'var(--gold-deep)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Phase {c.phase}
              </span>
              <span style={{ fontSize: 14, color: 'var(--ink)' }}>{c.summary}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* FOLLOW-UPS */}
      <Section variant="std">
        <SectionHead
          kicker="Follow-up status · post-remap"
          heading={<>Items 01–04 substantively done via the token remap.</>}
          lede={<>The 2026-05-26 token-remap commit unified the palette + font across every unmigrated surface without per-file edits. Items 05 (file deletion) and 06 (push to remote) remain.</>}
        />
        <div style={{ display: 'grid', gap: 12 }}>
          {FOLLOW_UPS.map((item) => {
            const statusBg =
              item.status === 'done'
                ? 'rgba(4,120,87,0.12)'
                : item.status === 'partial'
                ? 'var(--gold-a20)'
                : 'var(--slate-100)';
            const statusFg =
              item.status === 'done'
                ? 'var(--emerald-800)'
                : item.status === 'partial'
                ? 'var(--gold-deep)'
                : 'var(--slate-500)';
            const statusLabel =
              item.status === 'done' ? 'Done' : item.status === 'partial' ? 'Partial' : 'Pending';
            return (
              <div
                key={item.num}
                className="mk-card-white"
                style={{ padding: 20, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'flex-start' }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--ink)',
                    color: 'var(--gold)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {item.num}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--slate-600)', margin: '6px 0 0', lineHeight: 1.55 }}>
                    {item.note}
                  </p>
                </div>
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--r-pill)',
                    background: statusBg,
                    color: statusFg,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    flex: 'none',
                  }}
                >
                  {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* COPY REVIEW */}
      <Section variant="std" surface="ink">
        <SectionHead
          kicker="Copy review · 2026-05-26"
          heading={<>The visual upgraded. The copy regressed. Here&apos;s the gap.</>}
          lede={
            <>
              The mockup migration dropped a lot of high-quality copy. The new pages READ but
              they no longer SELL the way the old pages did. Full diff:{' '}
              <code style={{ background: 'var(--on-dark-10)', padding: '2px 6px', borderRadius: 4 }}>
                docs/redesign-copy-review.md
              </code>
              .
            </>
          }
        />
        <div className="mk-cats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {[
            {
              tag: 'P0 · Biggest hit',
              title: '/security — regulatory citations dropped',
              note: 'Lost SR 11-7, ECOA/Reg B, AIEOG Lexicon, Interagency TPRM Guidance. The six-chapter outline and the "Free Safe AI Use Guide" CTA are also gone. The compliance officer\'s buy signal vanished.',
            },
            {
              tag: 'P0',
              title: '/ home — product trio body copy',
              note: '"A starter artifact you can take to your team this week", "AI assets you can use immediately", "credential your examiner respects" — all replaced with generic two-word outcomes.',
            },
            {
              tag: 'P0',
              title: '/assessment — "dimension dragging you down"',
              note: 'The best single line in the whole pre-redesign site is gone. So is "scored on reviewed work" and the "this week" urgency.',
            },
            {
              tag: 'P1',
              title: '/for-institutions — anti-positioning lost',
              note: '"No software seats. No vendor lock-in." was load-bearing for buyers comparing us to nCino or JackHenry AI offerings. Replaced with generic "use assessment data".',
            },
            {
              tag: 'P1',
              title: '/about — audience targeting lost',
              note: '"...for the community banks and credit unions that anchor towns and neighborhoods — not for the twenty largest banks. Here is why." → softer "we started The Institute because..." The market-position declaration is gone.',
            },
            {
              tag: 'P2',
              title: 'No sourced statistics anywhere',
              note: 'CLAUDE.md: "No unsourced statistics in any user-facing copy." The new pages contain zero sourced stats. 66% Bank Director, 57% Gartner, 65% FDIC efficiency ratio — all missing from first folds.',
            },
            {
              tag: 'P2',
              title: 'Verbs weakened',
              note: 'use / build / start → was: operationalize / evidence / ship / submit / examined. Buyers respond to transactional verbs, not descriptive ones.',
            },
            {
              tag: 'P2',
              title: 'Pricing specifics dropped',
              note: '"$99 · $79 at 10+ by request" and "$295 · $199 at 10+ · Lifetime access" → generic "$99" / "$295". Volume + lifetime were buy signals.',
            },
          ].map((c) => (
            <div key={c.title} className="mk-card-white">
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--r-pill)',
                    background: 'var(--gold-a20)',
                    color: 'var(--gold-deep)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {c.tag}
                </span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--slate-600)', margin: '8px 0 0', lineHeight: 1.55 }}>
                {c.note}
              </p>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 32,
            padding: 24,
            border: '1px solid var(--gold-a40)',
            background: 'var(--gold-a10)',
            borderRadius: 'var(--r-lg)',
            color: '#fff',
          }}
        >
          <div className="mk-k" style={{ color: 'var(--gold-soft)', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Recommended next step
          </div>
          <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.55, color: 'var(--on-dark-80)' }}>
            ~2 working days of copy restoration before pushing the branch to production. Pull each
            high-value sentence from <code style={{ background: 'var(--on-dark-10)', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em' }}>main</code> via{' '}
            <code style={{ background: 'var(--on-dark-10)', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em' }}>git show</code>{' '}
            and paste into the new pages. Visual chrome stays — only the copy moves.
          </p>
        </div>
      </Section>

      {/* QUICK LINKS */}
      <Section variant="std" surface="white">
        <SectionHead kicker="Quick links" heading={<>Jump to a route.</>} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['/', '/assessment', '/results', '/courses', '/playground', '/practice', '/my-toolbox', '/for-institutions', '/playbooks'].map((p) => (
            <Button key={p} variant="ghost-light" href={p}>
              {p}
            </Button>
          ))}
        </div>
      </Section>
    </div>
  );
}
