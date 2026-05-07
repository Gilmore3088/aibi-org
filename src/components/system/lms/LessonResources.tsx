/**
 * <LessonResources> — right rail of the LMS view.
 *
 * Three slots: a "tools used in this module" mini-card, a downloadable
 * resources list (PDF/DOCX/CSV/LINK), and an optional dark-band citation
 * pull from the module reading.
 */

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export interface LessonTool {
  readonly name: string;
  readonly note?: string;
}

export interface LessonResource {
  readonly title: string;
  readonly href: string;
  readonly type: "PDF" | "DOCX" | "CSV" | "LINK";
}

export interface LessonResourcesProps {
  readonly moduleLabel?: string;
  readonly tools?: readonly LessonTool[];
  readonly resources?: readonly LessonResource[];
  readonly citation?: { readonly text: string; readonly source: string };
  readonly className?: string;
}

export function LessonResources({
  moduleLabel = "For this module",
  tools,
  resources,
  citation,
  className,
}: LessonResourcesProps) {
  return (
    <aside
      className={cn("bg-linen border-l border-hairline px-s6 py-s5 space-y-s6", className)}
      aria-label="Lesson resources"
    >
      <p className="font-mono text-label-sm uppercase tracking-widest text-slate border-b border-hairline pb-s3">
        {moduleLabel}
      </p>

      {tools && tools.length > 0 && (
        <div className="border border-hairline bg-linen p-s4">
          <h4 className="font-serif text-body-md mb-s2">Tools used here</h4>
          <ul className="space-y-s2 text-body-sm">
            {tools.map((tool) => (
              <li key={tool.name} className="grid grid-cols-[10px_1fr] gap-s2 items-baseline">
                <span aria-hidden="true" className="block w-[6px] h-[6px] bg-terra rounded-full mt-[6px]" />
                <span>
                  <span className="font-medium">{tool.name}</span>
                  {tool.note && <span className="text-slate"> — {tool.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resources && resources.length > 0 && (
        <ul className="space-y-s2 text-body-sm">
          {resources.map((res) => (
            <li
              key={res.href}
              className="border-b border-dotted border-hairline pb-s2 last:border-b-0"
            >
              <Link
                href={res.href}
                className="grid grid-cols-[44px_1fr] gap-s2 hover:text-terra transition-colors duration-fast"
              >
                <span className="font-mono text-label-sm uppercase tracking-wide text-slate">
                  {res.type}
                </span>
                <span className="text-terra">{res.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {citation && (
        <blockquote className="bg-ink text-cream p-s4 font-serif italic text-body-sm leading-snug">
          {citation.text}
          <span className="block font-sans not-italic font-mono text-label-sm uppercase tracking-widest text-cream/60 mt-s3">
            {citation.source}
          </span>
        </blockquote>
      )}
    </aside>
  );
}
