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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const access = await getPaidToolboxAccess();
  if (!access) return { title: 'Toolbox Library | The AI Banking Institute' };
  const detail = await getLibrarySkill(slug);
  if (!detail) return { title: 'Library skill not found | The AI Banking Institute' };
  return {
    title: `${detail.skill.title} — Toolbox Library | The AI Banking Institute`,
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
    <main className="min-h-screen bg-[color:var(--cream)]">
      <div className="border-b border-[color:var(--ink-a10)] bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 lg:px-10">
          <Link
            href="/dashboard/toolbox/library"
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)] hover:text-[color:var(--ink)]"
          >
            ← BACK TO LIBRARY
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
            {skill.category} · {skill.complexity ?? 'intermediate'} · {skill.kind}
          </p>
          <h1 className="text-4xl font-bold leading-tight text-[color:var(--ink)] md:text-5xl">
            {skill.title}
          </h1>
          {skill.description && (
            <p className="max-w-3xl text-base leading-relaxed text-[color:var(--slate-600)]">
              {skill.description}
            </p>
          )}
          <ForkButton librarySkillId={skill.id} versionId={currentVersion.id} />
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        {skill.kind === 'workflow' ? (
          <WorkflowSections content={content} />
        ) : (
          <TemplateSections content={content} />
        )}

        {skill.course_source_ref && (
          <p className="mt-12 border-t border-[color:var(--ink-a10)] pt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
            Sourced from {skill.course_source_ref}
          </p>
        )}

        {usedInRecipes.length > 0 && (
          <section className="mt-12 border-t border-[color:var(--ink-a10)] pt-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
              Used in recipes
            </h2>
            <ul className="mt-3 space-y-2">
              {usedInRecipes.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/dashboard/toolbox/cookbook/${r.slug}`}
                    className="text-base font-semibold text-[color:var(--ink)] underline decoration-[color:var(--ink-a15)] underline-offset-4 hover:text-[color:var(--gold-deep)] hover:decoration-[color:var(--gold)]"
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
    { key: 'questions', label: 'Questions the model will ask' },
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
            <p className="whitespace-pre-line text-base leading-relaxed text-[color:var(--ink)]">
              {v}
            </p>
          </Section>
        );
      })}

      {Array.isArray(steps) && steps.length > 0 && (
        <Section label="Steps">
          <ol className="list-decimal space-y-2 pl-6 text-base leading-relaxed text-[color:var(--ink)]">
            {(steps as string[]).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Section>
      )}

      {Array.isArray(guardrails) && guardrails.length > 0 && (
        <Section label="Standard guardrails">
          <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed text-[color:var(--ink)]">
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
              <div
                key={i}
                className="rounded-[16px] border border-[color:var(--ink-a10)] bg-white p-5 shadow-[var(--shadow-soft)]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--slate-500)]">
                  {s.title}
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-[color:var(--ink)]">
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
          <pre className="whitespace-pre-wrap rounded-[16px] border border-[color:var(--ink-a10)] bg-white p-5 font-mono text-xs leading-relaxed text-[color:var(--ink)] shadow-[var(--shadow-soft)]">
            {systemPrompt}
          </pre>
        </Section>
      )}

      {userTemplate && (
        <Section label="User prompt template">
          <pre className="whitespace-pre-wrap rounded-[16px] border border-[color:var(--ink-a10)] bg-white p-5 font-mono text-xs leading-relaxed text-[color:var(--ink)] shadow-[var(--shadow-soft)]">
            {userTemplate}
          </pre>
        </Section>
      )}

      {variables.length > 0 && (
        <Section label="Variables">
          <ul className="space-y-2">
            {(variables as Array<{ name: string; label: string; type: string; required?: boolean }>).map((v, i) => (
              <li key={i} className="flex items-baseline gap-3 text-sm text-[color:var(--ink)]">
                <code className="font-mono text-xs font-semibold text-[color:var(--gold-deep)]">{`{{${v.name}}}`}</code>
                <span>{v.label}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--slate-500)]">
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--slate-500)]">
                Input
              </p>
              <pre className="mt-2 whitespace-pre-wrap rounded-[16px] border border-[color:var(--ink-a10)] bg-white p-5 font-mono text-xs text-[color:var(--ink)] shadow-[var(--shadow-soft)]">
                {JSON.stringify(example.input, null, 2)}
              </pre>
            </div>
          )}
          {example.output && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--slate-500)]">
                Output
              </p>
              <pre className="mt-2 whitespace-pre-wrap rounded-[16px] border border-[color:var(--ink-a10)] bg-white p-5 font-mono text-xs text-[color:var(--ink)] shadow-[var(--shadow-soft)]">
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
    <section className="mt-10">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
        {label}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
