'use client';

// ContentGate — wraps content that requires a higher certification level.
// If the user holds the required credential, renders children normally.
// If not, renders a blurred preview with an unlock overlay and CTA.
//
// Credential check is done client-side via a prop passed down from a server
// component that queried course_enrollments. This component is intentionally
// a thin presentation layer — the server decides access, this component displays it.

import type { ContentLevel } from '@content/courses/aibi-p/prompt-library';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEVEL_LABELS: Record<ContentLevel, string> = {
  p: 'AiBI-P',
  s: 'AiBI-S',
  l: 'AiBI-L',
} as const;

const LEVEL_DESCRIPTIONS: Record<ContentLevel, string> = {
  p: 'the AI Banking Practitioner certification',
  s: 'the AI Banking Specialist certification',
  l: 'the AI Banking Leader certification',
} as const;

const COURSE_PATHS: Record<ContentLevel, string> = {
  p: '/courses/aibi-p/purchase',
  s: '/coming-soon?interest=specialist',
  l: '/coming-soon?interest=leader',
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LEVEL_ORDER: Record<ContentLevel, number> = { p: 1, s: 2, l: 3 };

function userHasAccess(
  requiredLevel: ContentLevel,
  userLevel: ContentLevel | null,
): boolean {
  if (!userLevel) return false;
  return LEVEL_ORDER[userLevel] >= LEVEL_ORDER[requiredLevel];
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ContentGateProps {
  readonly requiredLevel: ContentLevel;
  // The highest certification level the current user holds, or null if none.
  // Pass from a server component that checked course_enrollments.
  readonly userLevel: ContentLevel | null;
  readonly children: React.ReactNode;
  // Optional: short description of what the gated content contains.
  // Displayed in the unlock overlay to motivate the upgrade.
  readonly previewDescription?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContentGate({
  requiredLevel,
  userLevel,
  children,
  previewDescription,
}: ContentGateProps) {
  const hasAccess = userHasAccess(requiredLevel, userLevel);

  if (hasAccess) {
    return <>{children}</>;
  }

  const label = LEVEL_LABELS[requiredLevel];
  const description = LEVEL_DESCRIPTIONS[requiredLevel];
  const coursePath = COURSE_PATHS[requiredLevel];

  return (
    <div className="relative rounded-sm overflow-hidden">
      {/* Blurred preview of children — shows shape/structure but not content */}
      <div
        className="select-none pointer-events-none"
        aria-hidden="true"
        style={{ filter: 'blur(6px)', opacity: 0.45 }}
      >
        {children}
      </div>

      {/* Unlock overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-linen) 88%, transparent)' }}
        role="region"
        aria-label={`Content requires ${label} certification`}
      >
        {/* Credential badge */}
        <div
          className="inline-flex items-center px-3 py-1 mb-4 font-mono text-[10px] uppercase tracking-[0.25em] rounded-sm border"
          style={{
            borderColor: 'var(--color-terra)',
            color: 'var(--color-terra)',
            backgroundColor: 'var(--color-terra-pale)',
          }}
        >
          {label} Required
        </div>

        {/* Heading */}
        <h3
          className="font-serif text-lg font-bold mb-2"
          style={{ color: 'var(--color-ink)' }}
        >
          Unlock with {label}
        </h3>

        {/* Description */}
        <p
          className="font-sans text-sm leading-relaxed mb-2 max-w-xs"
          style={{ color: 'var(--color-ink)', opacity: 0.75 }}
        >
          This content is included with {description}.
        </p>

        {/* Optional preview description */}
        {previewDescription && (
          <p
            className="font-sans text-sm leading-relaxed mb-4 max-w-xs"
            style={{ color: 'var(--color-ink)', opacity: 0.65 }}
          >
            {previewDescription}
          </p>
        )}

        {/* CTA */}
        <a
          href={coursePath}
          className="inline-flex items-center gap-2 px-5 py-2.5 font-sans text-sm font-medium rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: 'var(--color-terra)',
            color: 'var(--color-linen)',
            // @ts-expect-error — CSS custom property for focus ring
            '--tw-ring-color': 'var(--color-terra)',
          }}
        >
          Learn about {label}
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
