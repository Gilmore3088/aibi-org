'use client';

// A playbook's skills: pick one, fill in the blanks, copy the finished prompt
// or download it as a Claude Skill. Locked skills show what they do and how to
// unlock them; their instructions are never sent to the browser.

import { useMemo, useState } from 'react';
import type { BankerSkill } from '@content/skills';
import { fillPrompt } from '@/lib/skills/render';

export type OpenSkill = Pick<
  BankerSkill,
  'id' | 'slug' | 'name' | 'useWhen' | 'youGet' | 'apps' | 'usesTemplate' | 'fields' | 'instructions' | 'checks' | 'neverPaste'
> & { readonly open: true };

export type LockedSkill = Pick<BankerSkill, 'id' | 'slug' | 'name' | 'useWhen' | 'youGet' | 'apps'> & {
  readonly open: false;
};

export type SkillView = OpenSkill | LockedSkill;

export interface SkillSection {
  readonly title: string;
  readonly skills: readonly SkillView[];
}

export function SkillLibrary({
  sections,
  unlock,
}: {
  readonly sections: readonly SkillSection[];
  readonly unlock: { readonly label: string; readonly href: string; readonly note: string };
}) {
  const first = sections.flatMap((s) => s.skills).find((s) => s.open) ?? sections[0]?.skills[0];
  const [activeId, setActiveId] = useState(first?.id);
  const all = sections.flatMap((s) => s.skills);
  const active = all.find((s) => s.id === activeId) ?? first;

  return (
    <div className="sk" data-testid="skill-library">
      <label className="sk-pick">
        <span>Pick a skill</span>
        <select value={active?.id} onChange={(e) => setActiveId(e.target.value)}>
          {sections.map((section) => (
            <optgroup key={section.title} label={section.title}>
              {section.skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.open ? '' : ' (locked)'}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <div className="sk-list">
        {sections.map((section) => (
          <div key={section.title} className="sk-group">
            <p className="sk-group-h">
              {section.title} <span>{section.skills.length}</span>
            </p>
            <ul role="list">
              {section.skills.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={s.id === active?.id ? 'is-on' : undefined}
                    aria-pressed={s.id === active?.id}
                    onClick={() => setActiveId(s.id)}
                  >
                    <span className="sk-name">{s.name}</span>
                    <span className="sk-apps">{s.open ? s.apps.join(' · ') : 'Locked'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {active && (active.open ? <SkillPanel key={active.id} skill={active} /> : <LockedPanel skill={active} unlock={unlock} />)}
    </div>
  );
}

function SkillPanel({ skill }: { readonly skill: OpenSkill }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => fillPrompt(skill, values), [skill, values]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the prompt stays selectable below.
    }
  };

  return (
    <section className="sk-panel" aria-label={skill.name}>
      <header className="sk-head">
        <p className="sk-id">
          {skill.id} · {skill.apps.join(' · ')}
          {skill.usesTemplate ? ' · uses your template' : ''}
        </p>
        <h3>{skill.name}</h3>
        <p className="sk-when">{skill.useWhen}</p>
      </header>

      <div className="sk-form">
        {skill.fields.map((f) => {
          const id = `sk-${skill.slug}-${f.key}`;
          const common = {
            id,
            value: values[f.key] ?? '',
            placeholder: f.example,
            onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [f.key]: e.target.value })),
          };
          return (
            <label key={f.key} htmlFor={id} className="sk-field">
              <span>
                {f.label}
                {!f.required && <em> optional</em>}
              </span>
              {f.kind === 'choice' && f.options ? (
                <select {...common}>
                  <option value="">Choose…</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.kind === 'long' ? (
                <textarea rows={4} {...common} />
              ) : (
                <input type="text" {...common} />
              )}
            </label>
          );
        })}
      </div>

      <div className="sk-actions">
        <button type="button" className="sk-primary" onClick={copy} aria-live="polite">
          {copied ? 'Copied' : 'Copy the filled-in prompt'}
        </button>
        <a className="sk-secondary" href={`/api/skills/${skill.slug}/download`}>
          Download for Claude
        </a>
      </div>
      <p className="sk-hint">
        Download, then upload it in Claude under Customize › Skills. It also works in Claude for Excel, PowerPoint, Word and Outlook.
      </p>

      <details className="sk-preview">
        <summary>See the full prompt</summary>
        <pre>{prompt}</pre>
      </details>

      <div className="sk-checks">
        <p className="sk-sub">Check before you use it</p>
        <ul>
          {skill.checks.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="sk-never">
          <strong>Never paste:</strong> {skill.neverPaste}
        </p>
      </div>

      <Feedback slug={skill.slug} />
    </section>
  );
}

function Feedback({ slug }: { readonly slug: string }) {
  const [state, setState] = useState<'ask' | 'note' | 'sent'>('ask');
  const [worked, setWorked] = useState<boolean | null>(null);
  const [note, setNote] = useState('');

  const send = async (didWork: boolean, text?: string) => {
    setState('sent');
    try {
      await fetch(`/api/skills/${slug}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worked: didWork, ...(text ? { note: text } : {}) }),
      });
    } catch {
      // Feedback is best-effort; the thank-you still shows.
    }
  };

  if (state === 'sent') return <p className="sk-fb">Thanks. We use this to decide which skills to improve first.</p>;
  if (state === 'note' && worked === false) {
    return (
      <div className="sk-fb">
        <label htmlFor={`sk-fb-${slug}`}>What went wrong? Optional, no customer details.</label>
        <textarea id={`sk-fb-${slug}`} rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="button" className="sk-secondary" onClick={() => send(false, note)}>
          Send
        </button>
      </div>
    );
  }
  return (
    <div className="sk-fb">
      <span>Did this work?</span>
      <button type="button" onClick={() => send(true)}>
        Yes
      </button>
      <button
        type="button"
        onClick={() => {
          setWorked(false);
          setState('note');
        }}
      >
        Not quite
      </button>
    </div>
  );
}

function LockedPanel({
  skill,
  unlock,
}: {
  readonly skill: LockedSkill;
  readonly unlock: { readonly label: string; readonly href: string; readonly note: string };
}) {
  return (
    <section className="sk-panel is-locked" aria-label={skill.name}>
      <header className="sk-head">
        <p className="sk-id">
          {skill.id} · {skill.apps.join(' · ')}
        </p>
        <h3>{skill.name}</h3>
        <p className="sk-when">{skill.useWhen}</p>
      </header>
      <p className="sk-get">
        <strong>You get:</strong> {skill.youGet}
      </p>
      <div className="sk-unlock">
        <p>{unlock.note}</p>
        <a className="sk-primary" href={unlock.href}>
          {unlock.label}
        </a>
      </div>
    </section>
  );
}
