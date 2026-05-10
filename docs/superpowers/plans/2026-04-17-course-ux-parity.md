# Course UX Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring AiBI-S and AiBI-L course pages up to AiBI Foundations's interactive standard — collapsible accordion sections, mini TOC, reading time, compact sticky headers, and key takeaways across all three courses.

**Architecture:** Extract LearnSection and MarkdownRenderer from AiBI Foundations's `_components/` into shared `src/components/courses/`. Parameterize accent color. Replace WeekContent's section dump and AiBI-L's inline SectionBlock with the shared LearnSection. Extract a shared CourseHeader from ModuleHeader. Add `keyTakeaways` field to all three course content types and populate for every module/week/session.

**Tech Stack:** Next.js 14 (App Router), TypeScript strict, Tailwind CSS, CSS custom properties for brand colors.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/components/courses/MarkdownRenderer.tsx` | Shared markdown renderer (moved from AiBI Foundations) |
| Create | `src/components/courses/LearnSection.tsx` | Shared collapsible accordion with accent color prop |
| Create | `src/components/courses/CourseHeader.tsx` | Shared sticky header band with accent color prop |
| Modify | `src/app/courses/aibi-p/_components/LearnSection.tsx` | Replace with re-export from shared |
| Modify | `src/app/courses/aibi-p/_components/MarkdownRenderer.tsx` | Replace with re-export from shared |
| Modify | `src/app/courses/aibi-p/_components/ModuleHeader.tsx` | Replace with import from shared CourseHeader |
| Modify | `src/app/courses/aibi-p/[module]/page.tsx` | Pass `keyTakeaways` to LearnSection |
| Modify | `src/app/courses/aibi-s/_components/WeekContent.tsx` | Replace section dump with shared LearnSection |
| Modify | `src/app/courses/aibi-s/[week]/page.tsx` | Replace inline header with shared CourseHeader |
| Modify | `src/app/courses/aibi-l/[session]/page.tsx` | Remove SectionBlock, use shared LearnSection + CourseHeader |
| Modify | `content/courses/aibi-p/types.ts` | Add `keyTakeaways` to Module interface |
| Modify | `content/courses/aibi-s/types.ts` | Add `keyTakeaways` to CohortWeek interface |
| Modify | `content/courses/aibi-l/types.ts` | Add `keyTakeaways` to WorkshopSession interface |
| Modify | `content/courses/aibi-p/module-1.ts` through `module-9.ts` | Add keyTakeaways data |
| Modify | `content/courses/aibi-s/weeks/week-1.ts` through `week-6.ts` | Add keyTakeaways data |
| Modify | `content/courses/aibi-l/sessions/session-1.ts` through `session-4.ts` | Add keyTakeaways data |

---

### Task 1: Move MarkdownRenderer to shared location

**Files:**
- Create: `src/components/courses/MarkdownRenderer.tsx`
- Modify: `src/app/courses/aibi-p/_components/MarkdownRenderer.tsx`

- [ ] **Step 1: Create shared MarkdownRenderer**

Copy the existing MarkdownRenderer to the shared location with one change: make the accent color configurable via an optional prop so blockquote borders can use the course's accent color instead of hardcoded terra.

```typescript
// src/components/courses/MarkdownRenderer.tsx

interface MarkdownRendererProps {
  readonly content: string;
  readonly className?: string;
  readonly accentColor?: string;
}
```

The implementation is identical to the current `src/app/courses/aibi-p/_components/MarkdownRenderer.tsx` except:
- Add the `accentColor` prop (default: `'var(--color-terra)'`)
- In the blockquote rendering (line 25 of the original), replace the hardcoded `border-[color:var(--color-terra)]` with a `style` attribute using `accentColor`

Change this line in `renderBlock`:
```typescript
// Before (hardcoded terra):
return `<blockquote class="my-6 border-l-[3px] border-[color:var(--color-terra)] ...

// After (parameterized — use a data attribute the component reads):
return `<blockquote class="my-6 border-l-[3px] ...
```

Since `renderBlock` is a plain function without access to props, the simplest approach: pass `accentColor` into the component and apply the border color via a wrapper style. Keep `renderBlock` unchanged, but wrap blockquotes with a CSS variable override.

Actually, simpler: move `accentColor` into the component and use a CSS custom property on the wrapper div:

```typescript
export function MarkdownRenderer({ content, className, accentColor = 'var(--color-terra)' }: MarkdownRendererProps) {
  const blocks = content.split(/\n\n+/);
  const html = blocks.map(renderBlock).join('');

  return (
    <div
      className={`prose-aibi text-sm leading-relaxed text-[color:var(--color-ink)] ${className ?? ''}`}
      style={{ '--accent-color': accentColor } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

And update the blockquote in `renderBlock` to use `var(--accent-color)`:
```typescript
return `<blockquote class="my-6 border-l-[3px] bg-[color:var(--color-parch)] px-6 py-5 rounded-r-[2px]" style="border-left-color: var(--accent-color)"><p class="font-serif italic text-base text-[color:var(--color-ink)] leading-relaxed">${quoteHtml}</p></blockquote>`;
```

- [ ] **Step 2: Replace original with re-export**

```typescript
// src/app/courses/aibi-p/_components/MarkdownRenderer.tsx
export { MarkdownRenderer } from '@/components/courses/MarkdownRenderer';
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: No errors. All existing imports from `./MarkdownRenderer` still resolve via the re-export.

- [ ] **Step 4: Commit**

```bash
cd /Users/jgmbp/Projects/aibi-phase-2
git add src/components/courses/MarkdownRenderer.tsx src/app/courses/aibi-p/_components/MarkdownRenderer.tsx
git commit -m "refactor: extract MarkdownRenderer to shared courses location"
```

---

### Task 2: Move LearnSection to shared location with accent color prop

**Files:**
- Create: `src/components/courses/LearnSection.tsx`
- Modify: `src/app/courses/aibi-p/_components/LearnSection.tsx`

- [ ] **Step 1: Create shared LearnSection**

The shared version changes from the original:
1. Import `Section` type locally (not from `@content/courses/aibi-p`) — define the interface inline since all three courses use the same shape
2. Import `MarkdownRenderer` from `@/components/courses/MarkdownRenderer`
3. Add `accentColor` prop (default `'var(--color-terra)'`)
4. Replace all hardcoded `var(--color-terra)` references with the `accentColor` prop
5. Remove the `moduleNumber` prop (unused in the component body)
6. Add a `unitLabel` prop (default `'module'`) for the "After this module/week/session" text

```typescript
// src/components/courses/LearnSection.tsx
'use client';

import { useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface LearnSectionItem {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly subsections?: readonly LearnSectionItem[];
}

interface LearnSectionProps {
  readonly sections: readonly LearnSectionItem[];
  readonly keyTakeaways?: readonly string[];
  readonly accentColor?: string;
  readonly unitLabel?: string;
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function LearnSection({
  sections,
  keyTakeaways,
  accentColor = 'var(--color-terra)',
  unitLabel = 'module',
}: LearnSectionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      {/* Key takeaways */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="mb-6 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-5">
          <p
            className="font-serif-sc text-[10px] uppercase tracking-[0.18em] mb-3"
            style={{ color: accentColor }}
          >
            After this {unitLabel}
          </p>
          <ul className="space-y-2">
            {keyTakeaways.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: accentColor }}
                  aria-hidden="true"
                />
                <span className="font-sans text-sm text-[color:var(--color-ink)]/80 leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mini TOC */}
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Section navigation">
        {sections.map((section, idx) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setOpenIndex(idx)}
            className={[
              'px-3 py-1.5 rounded-[2px] font-sans text-xs transition-all',
              idx === openIndex
                ? 'text-[color:var(--color-linen)]'
                : 'bg-[color:var(--color-parch)] text-[color:var(--color-ink)]/70 hover:bg-[color:var(--color-parch-dark)]',
            ].join(' ')}
            style={idx === openIndex ? { backgroundColor: accentColor } : undefined}
          >
            {idx + 1}. {section.title.length > 30 ? section.title.slice(0, 30) + '...' : section.title}
          </button>
        ))}
      </nav>

      {/* Collapsible sections */}
      <div className="space-y-2">
        {sections.map((section, idx) => {
          const isOpen = idx === openIndex;
          const readTime = estimateReadingTime(section.content);
          const allSubContent = section.subsections
            ? section.subsections.map((s) => s.content).join(' ')
            : '';
          const totalReadTime = readTime + (allSubContent ? estimateReadingTime(allSubContent) : 0);

          return (
            <div
              key={section.id}
              className="border border-[color:var(--color-ink)]/10 rounded-[3px] overflow-hidden"
            >
              {/* Section header */}
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
                className={[
                  'w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors',
                  isOpen
                    ? 'bg-[color:var(--color-parch)]'
                    : 'bg-[color:var(--color-linen)] hover:bg-[color:var(--color-parch)]/50',
                ].join(' ')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="font-mono text-[10px] tabular-nums shrink-0"
                    style={{ color: accentColor }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-serif text-lg text-[color:var(--color-ink)] leading-snug truncate">
                    {section.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[9px] text-[color:var(--color-slate)] uppercase tracking-wider hidden sm:block">
                    {totalReadTime} min read
                  </span>
                  <svg
                    className="w-4 h-4 transition-transform duration-200"
                    style={{ color: accentColor, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>

              {/* Section content */}
              {isOpen && (
                <div className="px-5 py-6 bg-[color:var(--color-linen)]">
                  <MarkdownRenderer content={section.content} accentColor={accentColor} />

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-6 space-y-6 border-l-2 border-[color:var(--color-parch-dark)] pl-5">
                      {section.subsections.map((sub) => (
                        <div key={sub.id}>
                          <h4 className="font-serif text-base font-semibold text-[color:var(--color-ink)] mb-3">
                            {sub.title}
                          </h4>
                          <MarkdownRenderer content={sub.content} accentColor={accentColor} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Next section prompt */}
                  {idx < sections.length - 1 && (
                    <div className="mt-6 pt-4 border-t border-[color:var(--color-ink)]/10">
                      <button
                        type="button"
                        onClick={() => setOpenIndex(idx + 1)}
                        className="font-serif-sc text-[11px] uppercase tracking-[0.18em] hover:opacity-70 transition-opacity flex items-center gap-2"
                        style={{ color: accentColor }}
                      >
                        Next: {sections[idx + 1].title}
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {idx === sections.length - 1 && (
                    <div className="mt-6 pt-4 border-t border-[color:var(--color-ink)]/10">
                      <p className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-slate)]">
                        Reading complete. Switch to the Practice tab to try it with AI.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace AiBI Foundations's LearnSection with re-export**

```typescript
// src/app/courses/aibi-p/_components/LearnSection.tsx
export { LearnSection } from '@/components/courses/LearnSection';
export type { LearnSectionItem } from '@/components/courses/LearnSection';
```

- [ ] **Step 3: Update AiBI Foundations module page import**

In `src/app/courses/aibi-p/[module]/page.tsx`, the existing import `import { LearnSection } from '../_components/LearnSection'` still works via re-export. No change needed to the import.

However, remove the `moduleNumber` prop from the JSX call (line 106) since it's no longer accepted:

```tsx
// Before:
<LearnSection
  sections={mod.sections}
  moduleNumber={moduleNum}
/>

// After:
<LearnSection sections={mod.sections} />
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/jgmbp/Projects/aibi-phase-2
git add src/components/courses/LearnSection.tsx src/app/courses/aibi-p/_components/LearnSection.tsx src/app/courses/aibi-p/[module]/page.tsx
git commit -m "refactor: extract LearnSection to shared courses location with accent color prop"
```

---

### Task 3: Create shared CourseHeader component

**Files:**
- Create: `src/components/courses/CourseHeader.tsx`
- Modify: `src/app/courses/aibi-p/_components/ModuleHeader.tsx`

- [ ] **Step 1: Create shared CourseHeader**

Generalize ModuleHeader to work for all three courses. The pattern: a sticky, pillar-colored banner with unit label + title on the left, metadata on the right.

```typescript
// src/components/courses/CourseHeader.tsx

interface CourseHeaderMeta {
  readonly label: string;
  readonly value: string;
}

interface CourseHeaderProps {
  readonly unitLabel: string;
  readonly unitNumber: number;
  readonly title: string;
  readonly accentColor: string;
  readonly meta?: readonly CourseHeaderMeta[];
}

export function CourseHeader({
  unitLabel,
  unitNumber,
  title,
  accentColor,
  meta,
}: CourseHeaderProps) {
  const formattedNumber = String(unitNumber).padStart(2, '0');

  return (
    <header
      className="sticky top-[70px] z-40 w-full px-8 py-4"
      style={{ backgroundColor: accentColor }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">
            {unitLabel} {formattedNumber}
          </span>
          <h1 className="font-serif italic text-2xl lg:text-3xl text-white leading-tight">
            {title}
          </h1>
        </div>

        {meta && meta.length > 0 && (
          <div className="flex items-center gap-6">
            {meta.map((item) => (
              <span
                key={item.label}
                className="font-mono text-[10px] tracking-widest text-white/60 uppercase"
              >
                {item.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Replace ModuleHeader with wrapper around CourseHeader**

```typescript
// src/app/courses/aibi-p/_components/ModuleHeader.tsx
import { PILLAR_META } from '@content/courses/aibi-p';
import type { Pillar } from '@content/courses/aibi-p';
import { CourseHeader } from '@/components/courses/CourseHeader';

interface ModuleHeaderProps {
  readonly moduleNumber: number;
  readonly title: string;
  readonly pillar: Pillar;
  readonly estimatedMinutes: number;
  readonly keyOutput: string;
}

export function ModuleHeader({
  moduleNumber,
  title,
  pillar,
  estimatedMinutes,
  keyOutput,
}: ModuleHeaderProps) {
  const meta = PILLAR_META[pillar];

  return (
    <CourseHeader
      unitLabel="Module"
      unitNumber={moduleNumber}
      title={title}
      accentColor={meta.colorVar}
      meta={[
        { label: 'time', value: `${estimatedMinutes} min` },
        { label: 'output', value: keyOutput },
        { label: 'pillar', value: meta.label },
      ]}
    />
  );
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: No errors. AiBI Foundations module pages render identically.

- [ ] **Step 4: Commit**

```bash
cd /Users/jgmbp/Projects/aibi-phase-2
git add src/components/courses/CourseHeader.tsx src/app/courses/aibi-p/_components/ModuleHeader.tsx
git commit -m "refactor: extract CourseHeader from ModuleHeader for cross-course reuse"
```

---

### Task 4: Apply LearnSection to AiBI-S weeks

**Files:**
- Modify: `src/app/courses/aibi-s/_components/WeekContent.tsx`

- [ ] **Step 1: Replace section dump with LearnSection**

The WeekContent component currently renders three blocks: learning goals, role track spotlight, and a flat section dump. Keep the learning goals and role track spotlight. Replace the section dump (lines 211-235) and the track examples section (lines 237-265) with the shared LearnSection.

The `renderContent` function (lines 14-123) is no longer needed since LearnSection uses MarkdownRenderer.

```typescript
// src/app/courses/aibi-s/_components/WeekContent.tsx
import type { CohortWeek, RoleTrack } from '@content/courses/aibi-s';
import { ROLE_TRACK_META } from '@content/courses/aibi-s';
import { RoleTrackBadge } from './RoleTrackBadge';
import { LearnSection } from '@/components/courses/LearnSection';

interface WeekContentProps {
  readonly week: CohortWeek;
  readonly roleTrack: RoleTrack | null;
}

export function WeekContent({ week, roleTrack }: WeekContentProps) {
  const trackMeta = roleTrack ? ROLE_TRACK_META[roleTrack] : null;
  const trackContent = roleTrack ? week.roleTrackContent[roleTrack] : null;

  return (
    <div>
      {/* Learning goals — keep unchanged (lines 132-155 of original) */}
      <section className="mb-12" aria-labelledby="learning-goals-heading">
        <h2
          id="learning-goals-heading"
          className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-6"
        >
          Learning <span className="italic">Goals</span>
        </h2>
        <div className="w-10 h-px bg-[color:var(--color-cobalt)] mb-6" aria-hidden="true" />
        <ol className="space-y-3" role="list">
          {week.learningGoals.map((goal, i) => (
            <li key={i} className="flex items-start gap-4">
              <span
                className="shrink-0 font-mono text-[11px] tabular-nums text-[color:var(--color-cobalt)] mt-0.5 w-4"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">
                {goal}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Role track spotlight — keep unchanged (lines 157-209 of original) */}
      {trackContent && trackMeta && roleTrack && (
        <div
          className="mb-12 rounded-sm p-6"
          style={{
            backgroundColor: 'var(--color-parch)',
            border: '1px solid rgba(45,74,122,0.15)',
            borderLeft: '3px solid var(--color-cobalt)',
          }}
          role="note"
          aria-label={`Role-track content for ${trackMeta.label}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <RoleTrackBadge track={roleTrack} size="sm" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-cobalt)]">
              Your Track This Week
            </span>
          </div>

          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-slate)] mb-1">
              Platform Focus
            </p>
            <p className="font-sans text-sm text-[color:var(--color-ink)]">{trackContent.platformFocus}</p>
          </div>

          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-slate)] mb-2">
              Deep Dive Topics
            </p>
            <ul className="space-y-1.5" role="list">
              {trackContent.deepDiveTopics.map((topic, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-[color:var(--color-cobalt)]"
                    aria-hidden="true"
                  />
                  <span className="font-sans text-sm text-[color:var(--color-slate)]">{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[color:var(--color-cobalt)]/10">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-slate)] mb-2">
              Assignment Variation
            </p>
            <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">
              {trackContent.activityVariations}
            </p>
          </div>
        </div>
      )}

      {/* Core sections — NEW: collapsible accordion via shared LearnSection */}
      <LearnSection
        sections={week.sections}
        keyTakeaways={week.keyTakeaways}
        accentColor="var(--color-cobalt)"
        unitLabel="week"
      />
    </div>
  );
}
```

Note: The track examples section (lines 237-265 of original) is removed because it was a flat dump of `trackContent.skillExamples`. These examples are better surfaced via the role track spotlight card above, which already shows deep dive topics and assignment variation. If user wants the examples preserved, they can be added as a subsection to the last LearnSection section — but removing the flat dump is the parity improvement.

- [ ] **Step 2: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: May fail if `week.keyTakeaways` doesn't exist on the type yet. That's OK — Task 7 adds it. For now, temporarily comment out the `keyTakeaways={week.keyTakeaways}` line to verify the structural change compiles.

- [ ] **Step 3: Commit**

```bash
cd /Users/jgmbp/Projects/aibi-phase-2
git add src/app/courses/aibi-s/_components/WeekContent.tsx
git commit -m "feat(aibi-s): replace section dump with shared LearnSection accordion"
```

---

### Task 5: Add compact sticky header to AiBI-S week pages

**Files:**
- Modify: `src/app/courses/aibi-s/[week]/page.tsx`

- [ ] **Step 1: Replace the large cobalt header div with CourseHeader**

The current AiBI-S week page has a large, non-sticky header (lines 78-149) that takes ~70 lines. Replace it with the shared CourseHeader (compact, sticky, single-row) plus a brief subtitle line below it.

In `src/app/courses/aibi-s/[week]/page.tsx`:

1. Add import: `import { CourseHeader } from '@/components/courses/CourseHeader';`
2. Remove the `PHASE_COLORS` constant (no longer needed)
3. Replace the header div (lines 78-149) with:

```tsx
{/* Compact sticky header */}
<CourseHeader
  unitLabel="Week"
  unitNumber={week.number}
  title={week.title}
  accentColor="var(--color-cobalt)"
  meta={[
    { label: 'live', value: `${week.estimatedLiveMinutes} min` },
    { label: 'assignment', value: `${week.estimatedAssignmentMinutes} min` },
    { label: 'output', value: week.keyOutput },
  ]}
/>
```

Keep the RoleTrackBadge but move it into the content area:

```tsx
<article className="mx-auto px-8 lg:px-16 py-4">
  {/* Role track badge + completion indicator */}
  <div className="flex items-center justify-between mb-4">
    {roleTrack && <RoleTrackBadge track={roleTrack} size="sm" />}
    {isCompleted && (
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-[color:var(--color-cobalt)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cobalt)]">
          Completed
        </span>
      </div>
    )}
  </div>

  <CourseTabs ... />
</article>
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jgmbp/Projects/aibi-phase-2
git add src/app/courses/aibi-s/[week]/page.tsx
git commit -m "feat(aibi-s): replace large header with compact sticky CourseHeader"
```

---

### Task 6: Apply LearnSection and CourseHeader to AiBI-L sessions

**Files:**
- Modify: `src/app/courses/aibi-l/[session]/page.tsx`

- [ ] **Step 1: Remove inline SectionBlock and replace with shared components**

The current AiBI-L session page has:
- An inline `SectionBlock` component (lines 35-60) — delete it
- A large inline header (lines 98-123) — replace with CourseHeader
- A breadcrumb (lines 82-95) — keep it

Updated imports:

```typescript
import { CourseHeader } from '@/components/courses/CourseHeader';
import { LearnSection } from '@/components/courses/LearnSection';
```

Remove the `SectionBlock` function entirely (lines 35-60).

Replace the `<header>` block (lines 98-123) with:

```tsx
{/* Breadcrumb — keep unchanged */}
<nav className="mx-auto px-8 lg:px-16 pt-6 mb-4" aria-label="Breadcrumb">
  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]">
    <Link href="/courses/aibi-l" className="text-[color:var(--color-sage)] hover:opacity-70 transition-opacity">
      AiBI-L
    </Link>
    <span className="text-[color:var(--color-slate)]" aria-hidden="true">/</span>
    <span className="text-[color:var(--color-slate)]">Session {workshopSession.number}</span>
  </div>
</nav>

{/* Compact sticky header */}
<CourseHeader
  unitLabel="Session"
  unitNumber={workshopSession.number}
  title={workshopSession.title}
  accentColor="var(--color-sage)"
  meta={[
    { label: 'duration', value: `${workshopSession.durationMinutes} min` },
    { label: 'time', value: workshopSession.startTime },
  ]}
/>
```

Replace the `learnContent` prop of CourseTabs. Change from the SectionBlock loop to:

```tsx
learnContent={
  <>
    {/* Core question */}
    <p className="font-serif italic text-lg text-[color:var(--color-slate)] leading-relaxed mb-8 max-w-xl">
      {workshopSession.coreQuestion}
    </p>

    {/* Collapsible sections */}
    <LearnSection
      sections={workshopSession.sections}
      keyTakeaways={workshopSession.keyTakeaways}
      accentColor="var(--color-sage)"
      unitLabel="session"
    />

    {/* Sourced statistics — keep unchanged */}
    {workshopSession.statistics && workshopSession.statistics.length > 0 && (
      <section className="mb-16 border-t border-[color:var(--color-sage)]/10 pt-8" aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-slate)] mb-4">
          Sources
        </h2>
        <div className="space-y-2">
          {workshopSession.statistics.map((stat) => (
            <div key={stat.value} className="flex items-baseline gap-3">
              <p className="font-sans text-xs text-[color:var(--color-slate)]">{stat.value}</p>
              <span className="font-mono text-[9px] text-[color:var(--color-slate)]">
                {stat.source} ({stat.year})
              </span>
            </div>
          ))}
        </div>
      </section>
    )}
  </>
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: May fail on `workshopSession.keyTakeaways` — same as Task 4, temporarily comment out until Task 7.

- [ ] **Step 3: Commit**

```bash
cd /Users/jgmbp/Projects/aibi-phase-2
git add src/app/courses/aibi-l/[session]/page.tsx
git commit -m "feat(aibi-l): replace SectionBlock dump with shared LearnSection + CourseHeader"
```

---

### Task 7: Add keyTakeaways to all three course content types

**Files:**
- Modify: `content/courses/aibi-p/types.ts`
- Modify: `content/courses/aibi-s/types.ts`
- Modify: `content/courses/aibi-l/types.ts`

- [ ] **Step 1: Add keyTakeaways to AiBI Foundations Module interface**

In `content/courses/aibi-p/types.ts`, add to the `Module` interface:

```typescript
export interface Module {
  readonly number: number;
  readonly id: string;
  readonly title: string;
  readonly pillar: Pillar;
  readonly estimatedMinutes: number;
  readonly keyOutput: string;
  readonly keyTakeaways?: readonly string[];  // ADD THIS LINE
  readonly sections: readonly Section[];
  readonly tables?: readonly ContentTable[];
  readonly activities: readonly Activity[];
  readonly artifacts?: readonly ArtifactDefinition[];
  readonly mockupRef: string;
  readonly roleSpecific?: boolean;
}
```

- [ ] **Step 2: Add keyTakeaways to AiBI-S CohortWeek interface**

In `content/courses/aibi-s/types.ts`, add to the `CohortWeek` interface:

```typescript
export interface CohortWeek {
  readonly number: number;
  readonly phase: Phase;
  readonly title: string;
  readonly estimatedLiveMinutes: number;
  readonly estimatedAssignmentMinutes: number;
  readonly learningGoals: readonly string[];
  readonly whyThisWeekExists: string;
  readonly keyTakeaways?: readonly string[];  // ADD THIS LINE
  readonly sections: readonly Section[];
  readonly tables?: readonly ContentTable[];
  readonly activities: readonly Activity[];
  readonly keyOutput: string;
  readonly roleTrackContent: Record<RoleTrack, RoleTrackContent>;
  readonly mockupRef?: string;
}
```

- [ ] **Step 3: Add keyTakeaways to AiBI-L WorkshopSession interface**

In `content/courses/aibi-l/types.ts`, add to the `WorkshopSession` interface:

```typescript
export interface WorkshopSession {
  readonly number: SessionNumber;
  readonly title: string;
  readonly durationMinutes: number;
  readonly startTime: string;
  readonly coreQuestion: string;
  readonly purpose: string;
  readonly keyTakeaways?: readonly string[];  // ADD THIS LINE
  readonly sections: readonly ContentSection[];
  readonly activity: FacilitatedActivity;
  readonly deliverable: string;
  readonly statistics?: readonly SourcedStatistic[];
}
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: No errors. The field is optional so no content files need updating yet.

- [ ] **Step 5: Uncomment keyTakeaways props in Tasks 4 and 6**

If you commented out `keyTakeaways={week.keyTakeaways}` and `keyTakeaways={workshopSession.keyTakeaways}` during Tasks 4 and 6, uncomment them now.

- [ ] **Step 6: Verify build again**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/jgmbp/Projects/aibi-phase-2
git add content/courses/aibi-p/types.ts content/courses/aibi-s/types.ts content/courses/aibi-l/types.ts
git add src/app/courses/aibi-s/_components/WeekContent.tsx src/app/courses/aibi-l/[session]/page.tsx
git commit -m "feat: add keyTakeaways field to all three course content types"
```

---

### Task 8: Populate keyTakeaways for AiBI Foundations modules 1-9

**Files:**
- Modify: `content/courses/aibi-p/module-1.ts` through `module-9.ts`

- [ ] **Step 1: Add keyTakeaways to each module**

Add a `keyTakeaways` property to each module object. 3-4 bullets per module, phrased as outcomes ("You will be able to..."). Each takeaway should be specific and actionable, not generic.

Add the `keyTakeaways` array after `keyOutput` in each module file. Examples:

**module-1.ts** (Navigating the Regulatory Landscape):
```typescript
keyTakeaways: [
  'Name the five regulatory frameworks that apply to AI in community banking and explain when each triggers',
  'Distinguish governed from ungoverned AI use and apply the distinction to your daily workflows',
  'Complete a Regulatory Cheatsheet mapping your current AI tools to the frameworks that govern them',
],
```

**module-2.ts** (The AI Ecosystem):
```typescript
keyTakeaways: [
  'Classify tools you already have access to by capability tier: general-purpose, productivity-embedded, and banking-specific',
  'Evaluate an AI tool against the five institutional readiness criteria before recommending adoption',
  'Map your current tool stack to the AI ecosystem framework and identify coverage gaps',
],
```

**module-3.ts** (Data Classification):
```typescript
keyTakeaways: [
  'Apply the four data classification tiers to any document or dataset you encounter',
  'Determine which data tier is safe to use with which AI tool in your institution',
  'Write a data handling note for a skill that specifies input restrictions and output constraints',
],
```

**module-4.ts** (Prompt Engineering):
```typescript
keyTakeaways: [
  'Structure prompts using the five-component framework: role, context, task, constraints, output format',
  'Diagnose why a prompt produces poor output and apply targeted fixes',
  'Write a reusable prompt template that a colleague can use without prompt engineering knowledge',
],
```

**module-5.ts** (Building Your First Skill):
```typescript
keyTakeaways: [
  'Build a complete AI skill from a real banking workflow using the Skill Builder template',
  'Test your skill against edge cases and document the failure modes in a gotcha section',
  'Practice with AI in the sandbox to iterate on your skill before institutional deployment',
],
```

**module-6.ts** (Testing and Iteration):
```typescript
keyTakeaways: [
  'Run your skill through a structured test plan covering the four failure categories',
  'Interpret AI output quality using the accuracy-relevance-completeness rubric',
  'Document test results in a format that a compliance officer could review',
],
```

**module-7.ts** (Workflow Automation):
```typescript
keyTakeaways: [
  'Identify which steps in a multi-step banking workflow are candidates for AI automation',
  'Build a two-step automation that chains AI output into a downstream process',
  'Calculate time savings per automation cycle and project annual impact',
],
```

**module-8.ts** (Institutional Communication):
```typescript
keyTakeaways: [
  'Write a one-page brief that explains an AI use case to a non-technical executive',
  'Present time and cost savings in the format your CFO expects to see',
  'Handle the three most common objections to AI adoption from board members and examiners',
],
```

**module-9.ts** (Capstone):
```typescript
keyTakeaways: [
  'Submit a complete work product that demonstrates governed AI skill deployment',
  'Self-assess your submission against the five-dimension grading rubric before final upload',
  'Prepare for the reviewer feedback process and understand what earns the AiBI Foundations credential',
],
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Update AiBI Foundations module page to pass keyTakeaways**

In `src/app/courses/aibi-p/[module]/page.tsx`, update the LearnSection call:

```tsx
<LearnSection
  sections={mod.sections}
  keyTakeaways={mod.keyTakeaways}
/>
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/jgmbp/Projects/aibi-phase-2
git add content/courses/aibi-p/module-*.ts src/app/courses/aibi-p/[module]/page.tsx
git commit -m "feat(aibi-p): add key takeaways to all 9 modules"
```

---

### Task 9: Populate keyTakeaways for AiBI-S weeks 1-6

**Files:**
- Modify: `content/courses/aibi-s/weeks/week-1.ts` through `week-6.ts`

- [ ] **Step 1: Add keyTakeaways to each week**

Add `keyTakeaways` after `whyThisWeekExists` in each week file. 3-4 bullets per week.

**week-1.ts** (From Personal Skills to Institutional Assets):
```typescript
keyTakeaways: [
  'Distinguish a personal AI skill from an institutional asset across six governance dimensions',
  'Complete a departmental work audit scoring 10+ workflows by automation potential',
  'Identify the top 3 automation candidates in your department ranked by hours saved',
],
```

**week-2.ts** (Building Your AI Workspace):
```typescript
keyTakeaways: [
  'Configure a governed AI workspace for your department with documented access controls',
  'Set up prompt libraries and shared templates your team can use immediately',
  'Establish naming conventions and version control practices for departmental AI assets',
],
```

**week-3.ts** (Your First Departmental Automation):
```typescript
keyTakeaways: [
  'Build and deploy one automation that saves measurable time for your team',
  'Document the automation with enough detail that a colleague can maintain it',
  'Establish a measurement baseline to track time savings over the next 30 days',
],
```

**week-4.ts** (Measuring Impact):
```typescript
keyTakeaways: [
  'Calculate actual time and cost savings from your deployed automation',
  'Build an impact report formatted for your department head and compliance team',
  'Evaluate a vendor AI tool using the institutional readiness framework',
],
```

**week-5.ts** (Training Your Team):
```typescript
keyTakeaways: [
  'Design a 30-minute training session customized to your team roles and comfort levels',
  'Create a departmental skill library with ownership matrix and escalation paths',
  'Write training materials that teach governed AI use without requiring prompt engineering expertise',
],
```

**week-6.ts** (The Departmental Playbook):
```typescript
keyTakeaways: [
  'Assemble a complete departmental AI playbook with governed use cases and measurement criteria',
  'Define ownership, escalation, and retirement rules for every AI asset your team uses',
  'Submit your capstone process improvement package for AiBI-S credential review',
],
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jgmbp/Projects/aibi-phase-2
git add content/courses/aibi-s/weeks/week-*.ts
git commit -m "feat(aibi-s): add key takeaways to all 6 weeks"
```

---

### Task 10: Populate keyTakeaways for AiBI-L sessions 1-4

**Files:**
- Modify: `content/courses/aibi-l/sessions/session-1.ts` through `session-4.ts`

- [ ] **Step 1: Add keyTakeaways to each session**

Add `keyTakeaways` after `purpose` in each session file. 3-4 bullets per session.

**session-1.ts** (The Strategic Landscape):
```typescript
keyTakeaways: [
  'Quantify the efficiency ratio opportunity for your institution using FDIC benchmark data',
  'Complete your AI Maturity Scorecard across six readiness dimensions',
  'Identify where your institution stands relative to peer adoption patterns',
],
```

**session-2.ts** (Governance and Policy):
```typescript
keyTakeaways: [
  'Draft an AI governance framework covering ownership, approval workflows, and risk classification',
  'Map your current AI use cases to the applicable regulatory frameworks',
  'Define the board reporting cadence and format for AI governance updates',
],
```

**session-3.ts** (ROI and Roadmap):
```typescript
keyTakeaways: [
  'Build a 3-year AI roadmap with department-by-department ROI projections using your actual financial data',
  'Model three investment scenarios (conservative, moderate, aggressive) with projected efficiency gains',
  'Calculate the payback period for AI investment across your top priority departments',
],
```

**session-4.ts** (Board Presentation):
```typescript
keyTakeaways: [
  'Assemble a board-ready AI strategy presentation from your workshop deliverables',
  'Practice handling the five most common board objections to AI investment',
  'Establish quarterly check-in cadence to track roadmap progress over 12 months',
],
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jgmbp/Projects/aibi-phase-2
git add content/courses/aibi-l/sessions/session-*.ts
git commit -m "feat(aibi-l): add key takeaways to all 4 sessions"
```

---

### Task 11: Final build verification and visual check

- [ ] **Step 1: Full build**

Run: `cd /Users/jgmbp/Projects/aibi-phase-2 && npm run build`
Expected: Build succeeds with zero errors.

- [ ] **Step 2: Kill any zombie dev servers**

Run: `lsof -ti:3000,3001 | xargs kill -9 2>/dev/null; cd /Users/jgmbp/Projects/aibi-phase-2 && npm run dev`

- [ ] **Step 3: Visual check — all three courses**

Open in browser and verify:
- `/courses/aibi-p/1` — LearnSection with terra accent, key takeaways box, sticky header
- `/courses/aibi-s/1` — LearnSection with cobalt accent, key takeaways box, compact sticky header
- `/courses/aibi-l/1` — LearnSection with sage accent, key takeaways box, compact sticky header

Check that:
- Accordion opens/closes correctly
- Mini TOC highlights active section
- Reading time shows on desktop, hidden on mobile
- Key takeaways box shows with correct accent color and "After this module/week/session" label
- Sticky headers stay below the main nav (top-[70px])
- Tab switching (Learn/Practice/Apply) still works

- [ ] **Step 4: Commit any final fixes**
