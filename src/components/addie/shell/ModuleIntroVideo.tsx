// ModuleIntroVideo — 2-3 minute module overview at the top of every
// /foundation/[moduleId] landing page. When the operator has recorded
// the video, renders a real player with captions + transcript. Until
// then, renders an honest "Intro video in production" placeholder using
// the existing addie-video-frame chrome and the module illustration as
// a visual anchor.

import { ModuleIllustration } from '@/components/addie/illustrations/ModuleIllustration';

type ModuleKey = 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5';

interface ModuleIntroVideoProps {
  readonly moduleId: ModuleKey;
  readonly moduleTitle: string;
  readonly moduleOrdinal: number;
  readonly videoUrl?: string | null;
  readonly captionUrl?: string | null;
  readonly durationS?: number | null;
  readonly transcript?: string | null;
}

function formatDuration(s: number | null | undefined): string {
  if (!s || s <= 0) return '2:30';
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, '0')}`;
}

export function ModuleIntroVideo({
  moduleId,
  moduleTitle,
  moduleOrdinal,
  videoUrl,
  captionUrl,
  durationS,
  transcript,
}: ModuleIntroVideoProps) {
  const duration = formatDuration(durationS);

  return (
    <section
      aria-labelledby="module-intro-video-heading"
      className="my-8 lg:my-10"
    >
      <header className="flex items-baseline justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)]">
            Module {moduleOrdinal} · Intro
          </span>
          <h2
            id="module-intro-video-heading"
            className="font-serif text-[1.125rem] text-[var(--ledger-ink)]"
          >
            What this module is about
          </h2>
        </div>
        <span className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] tabular-nums">
          {duration}
        </span>
      </header>

      {videoUrl ? (
        <figure className="addie-video-frame w-full">
          <video
            controls
            preload="metadata"
            className="w-full aspect-video rounded-[6px]"
            crossOrigin="anonymous"
          >
            <source src={videoUrl} />
            {captionUrl ? (
              <track kind="captions" src={captionUrl} srcLang="en" label="English" default />
            ) : null}
            Sorry, your browser does not support embedded video.
          </video>
          <figcaption className="mt-3 flex items-center justify-between gap-3 px-1">
            <span className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
              Captions enabled
            </span>
            {transcript ? (
              <details className="text-sm">
                <summary className="cursor-pointer font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]">
                  Read transcript
                </summary>
                <div className="mt-3 max-h-[280px] overflow-y-auto border-l-2 border-[var(--ledger-rule)] pl-4 font-serif text-[var(--ledger-ink-2)] leading-relaxed whitespace-pre-wrap">
                  {transcript}
                </div>
              </details>
            ) : null}
          </figcaption>
        </figure>
      ) : (
        <PlaceholderFrame
          moduleId={moduleId}
          moduleTitle={moduleTitle}
          duration={duration}
        />
      )}
    </section>
  );
}

function PlaceholderFrame({
  moduleId,
  moduleTitle,
  duration,
}: {
  moduleId: ModuleKey;
  moduleTitle: string;
  duration: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Intro video for ${moduleTitle} — in production`}
      className="addie-video-frame relative w-full"
    >
      <div className="aspect-video flex items-center justify-center px-8 py-6">
        <div className="w-full max-w-md text-[var(--ledger-ink-2)]">
          <ModuleIllustration module={moduleId} />
        </div>
      </div>
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="addie-chip" data-tone="accent">
          Intro video · in production
        </span>
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-3">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)] tabular-nums">
          {duration}
        </span>
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[var(--ledger-ink)] text-[var(--ledger-paper)]"
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 2l9 5-9 5V2z" />
          </svg>
        </span>
      </div>
      <div className="absolute bottom-4 left-4">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--ledger-muted)]">
          Read the outline below
        </span>
      </div>
    </div>
  );
}
