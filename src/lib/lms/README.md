# LMS Harness

The canonical course-rendering layer. One `CourseConfig` interface, one
shared shell (`src/components/lms/`), and a small library of module-body
templates (`Tabbed` / `Linear` / `Custom`). Foundation runs on this
harness today; future self-paced courses inherit the same architecture.

## What lives where

```
src/lib/lms/                       — this directory
├── types.ts                       — canonical CourseConfig and view types
├── progress.ts                    — pure progress merge + lookup helpers
├── adapters.ts                    — legacy-number ↔ id progress shape
├── module-body/                   — body templates
│   ├── Tabbed.tsx                 — Foundation pattern (Learn/Practice/Apply)
│   ├── Linear.tsx                 — sequential steps with progress dots
│   └── Custom.tsx                 — pass-through escape hatch
└── README.md                      — this file

src/components/lms/                — UI layer (sidebar, top bar, mobile nav)
content/courses/<slug>/            — per-course config + content
```

The data layer (`src/lib/lms/`) imports nothing from the UI layer.
The UI layer (`src/components/lms/`) imports types from
`@/lib/lms`. Course content (`content/courses/<slug>/`) imports both.

## How to add a new course

Five concrete steps. Foundation took the long path; the harness is
calibrated so a new course should take an afternoon to scaffold.

### 1. Write `content/courses/<slug>/course-config.ts`

```typescript
import type { CourseConfig } from '@/lib/lms';

export const myCourseConfig: CourseConfig = {
  slug: 'my-course',
  dbProductKey: 'my-course',          // Stripe / Supabase product key
  brand: {
    name: 'My Course Title',
    shortCode: 'MyCourse',
    wordmark: 'MY COURSE',
    accentColorVar: 'var(--ledger-accent)',
  },
  terminology: {
    itemLabel: 'Module',              // or 'Unit', 'Lesson', 'Session'
    sectionLabel: 'Pillar',           // or 'Phase', 'Theme'
  },
  promise: 'One-line course promise.',
  audience: 'Who this course is for.',
  sections: [
    { id: 'part-1', label: 'Part One', colorVar: 'var(--ledger-accent)' },
    { id: 'part-2', label: 'Part Two', colorVar: 'var(--ledger-accent-2)' },
  ],
  modules: [
    {
      id: 'm-01',
      number: 1,
      title: 'First Module',
      href: '/courses/my-course/1',
      sectionId: 'part-1',
      estimatedMinutes: 30,
      bodyTemplate: 'tabbed',         // or 'linear' or 'custom'
    },
    // ...
  ],
  // Optional:
  // aiFeatures: { ... },
  // aiBudget: { perCourseDailyCents: 500 },
  // certificateRequirements: [...],
  // crossCourseNav: [...],
};
```

### 2. Pick a body template per module

| Template | Use when | Example |
|---|---|---|
| `tabbed` | Module has parallel content surfaces a learner can browse freely. Three tabs (Learn / Practice / Apply) by default. | Foundation modules |
| `linear` | Module is a sequential workflow — step 1 leads to step 2 to step 3. Step rail shows progress. | AI simulation flows |
| `custom` | Layout is one-off. The page renders whatever it wants — harness only provides the breadcrumb + nav. | Capstones, galleries |

Each module declares its template via `bodyTemplate`. A single course
can mix templates — most modules `tabbed`, a final capstone `custom`.

### 3. Write the route at `src/app/courses/<slug>/[module]/page.tsx`

```tsx
import { Tabbed, Linear, Custom } from '@/lib/lms/module-body';
import { resolveCourseView, findModule } from '@/lib/lms';
import { myCourseConfig } from '@content/courses/my-course/course-config';

export default async function ModulePage({ params }) {
  const progress = await fetchProgress();              // your data source
  const view = resolveCourseView(myCourseConfig, progress);
  const mod = findModule(view, params.module);
  if (!mod) return notFound();

  if (mod.bodyTemplate === 'tabbed') {
    return (
      <Tabbed
        storagePrefix="my-course-m"
        moduleNumber={Number(mod.number)}
        learnContent={<LearnPanel mod={mod} />}
        practiceContent={<PracticePanel mod={mod} />}
        applyContent={<ApplyPanel mod={mod} />}
      />
    );
  }
  // ...handle linear / custom
}
```

### 4. Render the shell at `src/app/courses/<slug>/layout.tsx`

Wrap the route tree in `<CourseShell>` from `@/components/lms`. Pass
the harness modules array and the learner's progress; the shell renders
sidebar, top bar, and mobile nav from the config.

### 5. Wire the database product key

If your course charges money, set `dbProductKey` to the value your
Stripe product writes into `course_enrollments.product`. Foundation's
`dbProductKey: 'aibi-p'` is preserved for legacy webhook retries even
though its `slug` is `'foundation'` — slug is for routing, dbProductKey
is for payments.

## The progress contract

`CourseProgress` is the runtime shape the harness expects:

```typescript
interface CourseProgress {
  readonly completedModuleIds: readonly string[];
  readonly currentModuleId: string | null;  // null = pre-enrollment
}
```

Pass it to `resolveCourseView(config, progress)` to get a
`ResolvedCourseView` with each module statused as `'completed'`,
`'current'`, `'locked'`, or `'coming-soon'`. The shell consumes the
resolved view; nothing else.

Foundation stores progress as `completed_modules: number[]` in
Supabase. Use `progressFromLegacyNumbers` in `@/lib/lms` to convert:

```typescript
import { progressFromLegacyNumbers } from '@/lib/lms';

const progress = progressFromLegacyNumbers(
  myCourseConfig.modules,
  { completed_modules: [1, 2, 3], current_module: 4 },
);
```

New courses should store `completedModuleIds + currentModuleId`
directly in Supabase and skip the adapter.

## Course-specific metadata

The harness `CourseModule` is intentionally lean. If your course has
fields the harness doesn't carry (Foundation has `pillar`, `keyOutput`,
`learnerOutcome`), keep them in a course-local keyed map alongside the
config — see Foundation's `FOUNDATION_MODULES_META` pattern in
`content/courses/foundation-program/course-config.ts`:

```typescript
export const MY_MODULES_META: Record<string, MyModuleMeta> = { ... };
```

This keeps the harness `CourseConfig` portable across courses while
giving each course room for its own per-module shape.

## AI features

If your course calls AI providers (Anthropic, OpenAI, Gemini),
declare each feature in `aiFeatures` on the config:

```typescript
aiFeatures: {
  myFeature: {
    provider: 'anthropic',
    model: 'claude-opus-4-7',
    maxTokens: 1000,
    maxTurns: 3,
    rateLimit: { perLearnerDaily: 20 },
  },
},
aiBudget: { perCourseDailyCents: 500 },
```

Server-side, use `createFeatureHandler` from `src/lib/ai-harness/feature-handler.ts`
to mount the endpoint. It enforces auth, per-learner rate limits, and
per-course daily budget caps, and writes usage rows for telemetry.

> Status note (2026-05-17): The AI feature handler currently imports
> types from `src/lib/course-harness/` (the AiBI-S-era harness). When
> AiBI-S becomes a shipping product, those imports move to `@/lib/lms`
> and the old harness directory is deleted.

## Contract test

`src/lib/lms/__tests__/example-course.config.ts` is a minimal valid
`CourseConfig` that compiles and resolves. It serves as a copy-paste
starter for new courses and as a regression guard: changes to
`CourseConfig` that break the example surface immediately in CI.

## What's deliberately out of scope

- **AiBI-L (workshop format).** The harness is designed for self-paced
  courses. AiBI-L's instructor-led sessions stay bespoke; if a workshop
  product is ever brought into the harness, add an `experienceType:
  'self-paced' | 'workshop'` discriminator to `CourseConfig` at that time.
- **Activity primitives (Drill, Builder, IterationTracker).** These
  still live under Foundation's `_components/`. Move them into
  `src/components/lms/activity/` only when a second course actually
  needs them.
- **AISimulation component.** A generic AI-simulation UI is speculative
  without a real consumer; AiBI-S's beat components are bespoke by
  design. Build the shared piece when the second course makes the
  shared shape obvious.
