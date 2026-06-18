'use client';

// Earned artifact panel shown after Module 6 Activity 6.1 is submitted.
// Surfaces the Skill Template Library — one PDF (server-rendered from
// the same five markdown files listed) plus a grid of individual .md
// downloads so a learner can paste a single template into Claude /
// ChatGPT / Gemini and start using it the same day.
//
// Per design principles: lead with the artifact. The CTA is the work
// product, not the tool. (Banned hype phrasing has been scrubbed —
// "institution-grade" / "immediate deployment" were promotional voice.
// Replaced with specific, concrete copy.)

import { TEMPLATE_FILES } from '../../_lib/skillDiagnosisData';
import { DownloadIcon } from './DownloadIcon';

export function DiagnosisArtifactPanel() {
  return (
    <div className="mt-6 pt-5 border-t border-[color:var(--ink-a10)]">
      <p className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold-deep)] mb-1">
        Your artifact is ready
      </p>
      <h4 className="font-sans text-base font-bold text-[color:var(--ink)] mb-1">
        Skill Template Library
      </h4>
      <p className="font-sans text-base leading-relaxed text-[color:var(--slate-600)] mb-4">
        Five reusable skill templates — Meeting Summary, Regulatory
        Research, Loan Pipeline, Exception Report, Marketing Content —
        ready to paste into ChatGPT, Claude, or Gemini.
      </p>

      <div className="flex flex-wrap gap-3">
        <a
          href="/api/courses/artifacts/skill-template-library"
          className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--ink)] hover:bg-[color:var(--ink-2)] px-5 py-2 font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold-soft)] hover:text-[color:var(--gold)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-2"
          aria-label="Download Skill Template Library PDF"
        >
          <DownloadIcon />
          DOWNLOAD PDF
        </a>
      </div>

      <div className="mt-5">
        <p className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--slate-500)] mb-3">
          Individual skill templates (.md)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {TEMPLATE_FILES.map((file) => (
            <a
              key={file.name}
              href={`/api/courses/artifacts/skill-templates/${file.name}`}
              download={file.name}
              className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--ink-a10)] bg-white px-4 py-2 font-sans text-sm font-semibold text-[color:var(--ink)] hover:border-[color:var(--gold)] hover:text-[color:var(--gold-deep)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)] focus:ring-offset-2"
              aria-label={`Download ${file.label} skill template`}
            >
              <DownloadIcon />
              {file.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
