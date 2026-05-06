// src/app/dashboard/toolbox/library/[slug]/page.tsx
//
// Plan C — Library detail page. SSR. Renders the current version's content
// with kind-aware sections (workflow vs template). Includes a Save button
// that posts to /api/toolbox/save with origin='library' (Plan F).

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { getLibrarySkill } from '@/lib/toolbox/library';
import { getRecipesUsingSkill } from '@/lib/toolbox/recipes';
import { Paywall } from '../../_components/Paywall';
import { ForkButton } from './ForkButton';
import type { ToolboxPillar } from '@/lib/toolbox/types';

const PILLAR_LABEL: Record<ToolboxPillar, string> = { A: 'Accessible', B: 'Boundary-Safe', C: 'Capable' };
const PILLAR_COLOR: Record<ToolboxPillar, string> = {
  A: 'var(--color-sage)',
  B: 'var(--color-cobalt)',
  C: 'var(--color-terra)',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const access = await getPaidToolboxAccess();
  if (!access) return { title: 'Playbooks Library | The AI Banking Institute' };
  const detail = await getLibrarySkill(slug);
  if (!detail) return { title: 'Library Skill not found | The AI Banking Institute' };
  return {
    title: `${detail.skill.title} — Playbooks Library | The AI Banking Institute`,
    description: detail.skill.description ?? undefined,
  };
}

export default async function LibrarySkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const access = await getPaidToolboxAccess();
  if (!access) return <Paywall />;

  const { slug } = await params;
  const detail = await getLibrarySkill(slug);
  if (!detail) notFound();

  const { skill, currentVersion } = detail;
  const content = currentVersion.content as Record<string, unknown>;
  const usedInRecipes = await getRecipesUsingSkill(skill.slug);

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)]">
      <div className="border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 lg:px-10">
          <Link
            href="/dashboard/toolbox/library"
            className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-terra)]"
          >
            ← Back to Library
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: PILLAR_COLOR[skill.pillar] }}
              aria-label={`Pillar ${skill.pillar} (${PILLAR_LABEL[skill.pillar]})`}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
              {skill.category} · {skill.complexity ?? 'intermediate'} · {skill.kind}
            </span>
          </div>
          <h1 className="font-serif text-4xl leading-tight text-[color:var(--color-ink)]">
            {skill.title}
          </h1>
          {skill.description && (
            <p className="max-w-3xl text-sm leading-relaxed text-[color:var(--color-slate)]">
              {skill.description}
            </p>
          )}
          <ForkButton librarySkillId={skill.id} versionId={currentVersion.id} />
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
        {skill.kind === 'workflow' ? (
          <WorkflowSections content={content} />
        ) : (
          <TemplateSections content={content} />
        )}

        {skill.course_source_ref && (
          <p className="mt-12 border-t border-[color:var(--color-ink)]/10 pt-6 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
            Sourced from {skill.course_source_ref}
          </p>
        )}

        {usedInRecipes.length > 0 && (
          <section className="mt-12 border-t border-[color:var(--color-ink)]/10 pt-6">
            <h2 className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-slate)]">
              Used in recipes
            </h2>
            <ul className="mt-3 space-y-2">
              {usedInRecipes.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/dashboard/toolbox/cookbook/${r.slug}`}
                    className="text-base text-[color:var(--color-ink)] underline decoration-[color:var(--color-ink)]/20 underline-offset-4 hover:text-[color:var(--color-terra)] hover:decoration-[color:var(--color-terra)]"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}

function WorkflowSections({ content }: { content: Record<string, unknown> }) {
  const fields: { key: string; label: string }[] = [
    { key: 'purpose', label: 'Purpose' },
    { key: 'success', label: 'What success looks like' },
    { key: 'questions', label: 'Questions the AI will ask' },
    { key: 'customGuard', label: 'Banking guardrail' },
  ];

  const steps = content.steps;
  const guardrails = content.guardrails;
  const samples = content.samples;

  return (
    <>
      {fields.map(({ key, label }) => {
        const v = content[key];
        if (!v || typeof v !== 'string') return null;
        return (
          <Section key={key} label={label}>
            <p className="whitespace-pre-line text-base leading-relaxed text-[color:var(--color-ink)]">
              {v}
            </p>
          </Section>
        );
      })}

      {Array.isArray(steps) && steps.length > 0 && (
        <Section label="Steps">
          <ol className="list-decimal space-y-2 pl-6 text-base leading-relaxed text-[color:var(--color-ink)]">
            {(steps as string[]).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Section>
      )}

      {Array.isArray(guardrails) && guardrails.length > 0 && (
        <Section label="Standard guardrails">
          <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed text-[color:var(--color-ink)]">
            {(guardrails as string[]).map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </Section>
      )}

      {Array.isArray(samples) && samples.length > 0 && (
        <Section label="Worked examples">
          <div className="space-y-6">
            {(samples as Array<{ title: string; prompt: string }>).map((s, i) => (
              <div key={i} className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                  {s.title}
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-[color:var(--color-ink)]">
                  {s.prompt}
                </pre>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

function TemplateSections({ content }: { content: Record<string, unknown> }) {
  const systemPrompt = typeof content.system_prompt === 'string' ? content.system_prompt : null;
  const userTemplate = typeof content.user_prompt_template === 'string' ? content.user_prompt_template : null;
  const variables = Array.isArray(content.variables) ? content.variables : [];
  const example = content.example as { input?: Record<string, string>; output?: string } | undefined;

  return (
    <>
      {systemPrompt && (
        <Section label="System prompt">
          <pre className="whitespace-pre-wrap rounded-none border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-4 font-mono text-xs leading-relaxed text-[color:var(--color-ink)]">
            {systemPrompt}
          </pre>
        </Section>
      )}

      {userTemplate && (
        <Section label="User prompt template">
          <pre className="whitespace-pre-wrap rounded-none border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-4 font-mono text-xs leading-relaxed text-[color:var(--color-ink)]">
            {userTemplate}
          </pre>
        </Section>
      )}

      {variables.length > 0 && (
        <Section label="Variables">
          <ul className="space-y-2">
            {(variables as Array<{ name: string; label: string; type: string; required?: boolean }>).map((v, i) => (
              <li key={i} className="flex items-baseline gap-3 text-sm text-[color:var(--color-ink)]">
                <code className="font-mono text-xs text-[color:var(--color-terra)]">{`{{${v.name}}}`}</code>
                <span>{v.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                  {v.type}
                  {v.required ? ' · required' : ''}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {example && (example.input || example.output) && (
        <Section label="Example">
          {example.input && (
            <div>
              <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-slate)]">
                Input
              </p>
              <pre className="mt-2 whitespace-pre-wrap border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-4 font-mono text-xs text-[color:var(--color-ink)]">
                {JSON.stringify(example.input, null, 2)}
              </pre>
            </div>
          )}
          {example.output && (
            <div className="mt-4">
              <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-slate)]">
                Output
              </p>
              <pre className="mt-2 whitespace-pre-wrap border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-4 font-mono text-xs text-[color:var(--color-ink)]">
                {example.output}
              </pre>
            </div>
          )}
        </Section>
      )}
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        {label}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
