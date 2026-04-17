// WeekContent — Renders week content with role-track-aware sections
// Server Component: receives the resolved CohortWeek + learner's track
// Role-track content is shown prominently for the learner's track; others collapsed

import type { CohortWeek, RoleTrack } from '@content/courses/aibi-s';
import { ROLE_TRACK_META } from '@content/courses/aibi-s';
import { RoleTrackBadge } from './RoleTrackBadge';

interface WeekContentProps {
  readonly week: CohortWeek;
  readonly roleTrack: RoleTrack | null;
}

// Minimal markdown-to-JSX: bold, tables, and paragraphs.
// For full rendering, replace with a shared MarkdownRenderer component.
function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  let inTable = false;
  let tableRows: string[][] = [];

  function flushTable() {
    if (tableRows.length < 2) {
      tableRows = [];
      inTable = false;
      return;
    }
    const headers = tableRows[0];
    const body = tableRows.slice(2); // skip separator row
    nodes.push(
      <div key={key++} className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[color:var(--color-cobalt)]/20">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left py-2 pr-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-cobalt)]"
                >
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} className="border-b border-[color:var(--color-cobalt)]/10">
                {row.map((cell, ci) => (
                  <td key={ci} className="py-2 pr-4 font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    tableRows = [];
    inTable = false;
  }

  for (const line of lines) {
    if (line.startsWith('|')) {
      inTable = true;
      tableRows.push(line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1));
      continue;
    }

    if (inTable) {
      flushTable();
    }

    if (line.trim() === '') {
      nodes.push(<div key={key++} className="mb-2" aria-hidden="true" />);
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      nodes.push(
        <p key={key++} className="font-serif font-bold text-[color:var(--color-ink)] mb-2 leading-relaxed">
          {line.slice(2, -2)}
        </p>,
      );
    } else if (line.startsWith('**')) {
      // Inline bold within paragraph
      const parts = line.split(/\*\*(.*?)\*\*/g);
      nodes.push(
        <p key={key++} className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed mb-3">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="font-bold text-[color:var(--color-ink)]">
                {part}
              </strong>
            ) : (
              part
            ),
          )}
        </p>,
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      nodes.push(
        <li
          key={key++}
          className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed ml-4 mb-1 list-disc"
        >
          {line.slice(2)}
        </li>,
      );
    } else {
      nodes.push(
        <p key={key++} className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed mb-3">
          {line}
        </p>,
      );
    }
  }

  if (inTable) {
    flushTable();
  }

  return <>{nodes}</>;
}

export function WeekContent({ week, roleTrack }: WeekContentProps) {
  const trackMeta = roleTrack ? ROLE_TRACK_META[roleTrack] : null;
  const trackContent = roleTrack ? week.roleTrackContent[roleTrack] : null;

  return (
    <div>
      {/* Learning goals */}
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

      {/* Role track spotlight */}
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

      {/* Core sections */}
      {week.sections.map((section) => (
        <section key={section.id} className="mb-12" aria-labelledby={`section-${section.id}`}>
          <h2
            id={`section-${section.id}`}
            className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-4"
          >
            {section.title}
          </h2>
          <div className="prose-bank">{renderContent(section.content)}</div>

          {section.subsections && section.subsections.length > 0 && (
            <div className="mt-6 space-y-6">
              {section.subsections.map((sub) => (
                <div key={sub.id} className="pl-4 border-l border-[color:var(--color-cobalt)]/20">
                  <h3 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-3">
                    {sub.title}
                  </h3>
                  <div>{renderContent(sub.content)}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Skill examples for this track */}
      {trackContent && trackContent.skillExamples.length > 0 && (
        <section className="mb-12 bg-[color:var(--color-parch)] border border-[color:var(--color-cobalt)]/10 rounded-sm p-6" aria-labelledby="examples-heading">
          <h2
            id="examples-heading"
            className="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-4"
          >
            Track <span className="italic">Examples</span>
          </h2>
          <p className="font-sans text-xs text-[color:var(--color-slate)] mb-4">
            Concrete examples for the {trackMeta?.label} track
          </p>
          <ul className="space-y-3" role="list">
            {trackContent.skillExamples.map((example, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-1 font-mono text-[9px] text-[color:var(--color-cobalt)]"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">
                  {example}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
