// RolePathCard — displays a learner's personalized role-based learning path
// Server Component: pure display, no interactivity required
// Shown on the course overview page between the hero and the pillars section
// Only renders when enrollment.onboarding_answers includes a supported role

import Link from 'next/link';
import type { RolePath } from '@content/courses/aibi-p/role-paths';
import { PLATFORM_META } from '@content/courses/aibi-p';

interface RolePathCardProps {
  readonly rolePath: RolePath;
}

const PLATFORM_ICONS: Record<string, React.ReactElement> = {
  chatgpt: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  claude: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  copilot: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  gemini: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  notebooklm: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  perplexity: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
};

function ToolRow({
  platform,
  rationale,
  index,
}: {
  platform: string;
  rationale: string;
  index: number;
}) {
  const meta = PLATFORM_META[platform as keyof typeof PLATFORM_META];
  const icon = PLATFORM_ICONS[platform] ?? PLATFORM_ICONS['chatgpt'];

  return (
    <div className="flex items-start gap-4 py-4" style={{ borderTop: index === 0 ? 'none' : '1px solid rgba(181,81,46,0.08)' }}>
      <div
        className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-parch)', border: '1px solid rgba(181,81,46,0.15)', color: meta?.colorVar ?? 'var(--color-terra)' }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold mb-1"
          style={{ color: meta?.colorVar ?? 'var(--color-terra)' }}
        >
          {meta?.label ?? platform}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-slate)' }}>
          {rationale}
        </p>
      </div>
    </div>
  );
}

function QuickWinItem({ text, index }: { text: string; index: number }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="flex-shrink-0 font-mono text-[10px] font-bold mt-0.5 w-5 h-5 rounded-sm flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-terra)', color: 'var(--color-linen)' }}
        aria-hidden="true"
      >
        {index + 1}
      </span>
      <span className="text-xs leading-relaxed" style={{ color: 'var(--color-slate)' }}>
        {text}
      </span>
    </li>
  );
}

export function RolePathCard({ rolePath }: RolePathCardProps) {
  const startHereModule = rolePath.deepDiveModules.find(
    (m) => m.moduleNumber === rolePath.startHereModule,
  ) ?? rolePath.deepDiveModules[0];

  return (
    <section
      aria-labelledby="role-path-heading"
      className="mb-24 rounded-sm overflow-hidden"
      style={{ border: '1px solid rgba(181,81,46,0.15)' }}
    >
      {/* Header band */}
      <div
        className="px-8 py-6 flex items-center justify-between"
        style={{ backgroundColor: 'var(--color-terra)', color: 'var(--color-linen)' }}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] mb-1 opacity-70">
            Your Recommended Focus
          </p>
          <h2
            id="role-path-heading"
            className="font-serif text-2xl font-bold"
          >
            {rolePath.label} Path
          </h2>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-sm"
          style={{ backgroundColor: 'rgba(245,240,230,0.15)', border: '1px solid rgba(245,240,230,0.2)' }}
          aria-hidden="true"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-wider">Personalized</span>
        </div>
      </div>

      {/* Body — two columns on md+ */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
        style={{
          backgroundColor: 'var(--color-linen)',
          '--tw-divide-color': 'rgba(181,81,46,0.1)',
          divideColor: 'rgba(181,81,46,0.1)',
        } as React.CSSProperties}
      >
        {/* Left: top tools */}
        <div className="p-8">
          <h3
            className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4"
            style={{ color: 'var(--color-dust)' }}
          >
            Top 3 Tools for {rolePath.label}
          </h3>
          <div>
            {rolePath.recommendedTools.slice(0, 3).map((tool, i) => (
              <ToolRow
                key={tool.platform}
                platform={tool.platform}
                rationale={tool.rationale}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* Right: start here + quick wins */}
        <div className="p-8 flex flex-col gap-8">
          {/* Start Here */}
          <div>
            <h3
              className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4"
              style={{ color: 'var(--color-dust)' }}
            >
              Start Here
            </h3>
            <Link
              href={`/courses/aibi-p/${rolePath.startHereModule}`}
              className="group block rounded-sm p-5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'var(--color-parch)',
                border: '1px solid rgba(181,81,46,0.12)',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ['--tw-ring-color' as any]: 'var(--color-terra)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.2em] mb-1"
                    style={{ color: 'var(--color-terra)' }}
                  >
                    Module {rolePath.startHereModule} — Highest Value for {rolePath.label}
                  </p>
                  <p
                    className="font-serif text-base font-bold mb-2"
                    style={{ color: 'var(--color-ink)' }}
                  >
                    {startHereModule?.title}
                  </p>
                  {startHereModule && (
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-slate)' }}>
                      Focus: {startHereModule.focusSection}
                    </p>
                  )}
                </div>
                <svg
                  className="flex-shrink-0 w-4 h-4 mt-0.5 transition-transform group-hover:translate-x-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  style={{ color: 'var(--color-terra)' }}
                >
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          </div>

          {/* Quick wins */}
          <div>
            <h3
              className="font-mono text-[10px] uppercase tracking-[0.2em] mb-4"
              style={{ color: 'var(--color-dust)' }}
            >
              3 Quick Wins for {rolePath.label}
            </h3>
            <ol className="space-y-3" aria-label={`Quick wins for ${rolePath.label} learners`}>
              {rolePath.quickWins.map((win, i) => (
                <QuickWinItem key={i} text={win} index={i} />
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Peer benchmark footer */}
      <div
        className="px-8 py-4 flex items-center gap-3"
        style={{ backgroundColor: 'var(--color-parch)', borderTop: '1px solid rgba(181,81,46,0.1)' }}
      >
        <svg
          className="flex-shrink-0 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ color: 'var(--color-terra)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-xs italic" style={{ color: 'var(--color-slate)' }}>
          {rolePath.peerBenchmark}
        </p>
      </div>
    </section>
  );
}
