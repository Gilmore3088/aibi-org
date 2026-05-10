// ActivityRenderer — dispatcher for the 8 activity types.
//
// Phase 5 SCAFFOLDING. Each activity type renders a clearly-marked stub
// that:
//   1. Shows the activity title, description, time estimate.
//   2. Shows the form fields the activity will collect.
//   3. Shows a "what this engine will do" callout explaining the
//      interactive behavior the platform must build.
//
// The actual interactive engines (multi-model parallel streaming,
// drag-and-drop classifier with adaptive feedback, branching scenario
// engine, build-and-test environment with adversarial inputs, annotation
// overlay, tabletop simulation engine, schema-validated artifact store,
// and the deferred Type 8 real-world capture with NPI guard) are
// substantial engineering products. They will be built one at a time
// and swapped in here without changing this dispatcher's interface.
//
// The form-field collection IS real. Module activities have proper typed
// fields (text/textarea/radio/select/file) which we render as a normal
// HTML form. That alone is enough to capture learner work for activities
// where the interactive engine is not yet live; the platform still gets
// the artifact data.

import type { Activity, ActivityType } from '@content/courses/aibi-foundation';
import { ACTIVITY_TYPE_META, DEFERRED_ACTIVITY_TYPES } from '@content/courses/aibi-foundation';

interface ActivityRendererProps {
  readonly activity: Activity;
  readonly index: number;
}

function ActivityFields({ activity }: { readonly activity: Activity }) {
  return (
    <div className="space-y-4">
      {activity.fields.map((field) => {
        const id = `${activity.id}-${field.id}`;
        const labelEl = (
          <label
            htmlFor={id}
            className="block font-display text-[15px] text-[color:var(--color-ink)] mb-1"
          >
            {field.label}
            {field.required && <span aria-hidden="true" className="text-[color:var(--color-terra)] ml-1">*</span>}
          </label>
        );
        const baseInput =
          'w-full bg-[color:var(--color-linen)] border border-[color:var(--color-rule,#d8cfbe)] focus:border-[color:var(--color-terra)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-terra)] py-2 px-3 text-[color:var(--color-ink)]';
        if (field.type === 'textarea') {
          return (
            <div key={field.id}>
              {labelEl}
              <textarea
                id={id}
                name={field.id}
                rows={4}
                placeholder={field.placeholder}
                minLength={field.minLength}
                required={field.required}
                className={`${baseInput} resize-y`}
              />
            </div>
          );
        }
        if (field.type === 'select') {
          return (
            <div key={field.id}>
              {labelEl}
              <select
                id={id}
                name={field.id}
                required={field.required}
                className={baseInput}
                defaultValue=""
              >
                <option value="" disabled>Select…</option>
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          );
        }
        if (field.type === 'radio') {
          return (
            <fieldset key={field.id}>
              <legend className="block font-display text-[15px] text-[color:var(--color-ink)] mb-1">
                {field.label}
                {field.required && <span aria-hidden="true" className="text-[color:var(--color-terra)] ml-1">*</span>}
              </legend>
              <div className="space-y-1">
                {field.options?.map((o) => (
                  <label key={o.value} className="flex items-center gap-2 text-[color:var(--color-ink)]">
                    <input type="radio" name={field.id} value={o.value} required={field.required} />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        }
        if (field.type === 'file') {
          return (
            <div key={field.id}>
              {labelEl}
              <input
                id={id}
                name={field.id}
                type="file"
                required={field.required}
                className="block w-full text-sm text-[color:var(--color-ink)]"
              />
            </div>
          );
        }
        return (
          <div key={field.id}>
            {labelEl}
            <input
              id={id}
              name={field.id}
              type="text"
              placeholder={field.placeholder}
              required={field.required}
              minLength={field.minLength}
              className={baseInput}
            />
          </div>
        );
      })}
    </div>
  );
}

const ENGINE_DESCRIPTION: Record<ActivityType, string> = {
  'single-prompt':
    'Send your prompt to a single model and capture the response. The platform stores the input, output, and any iteration the learner makes.',
  'multi-model':
    'Side-by-side parallel inference across Claude, ChatGPT, and Gemini (and Copilot Chat where available). Three responses stream simultaneously; the learner annotates and picks.',
  'sort-classify':
    'Drag-and-drop classifier. Adaptive feedback explains why each item belongs in its tier when the learner gets one wrong. Item bank rotated quarterly.',
  'adaptive-scenario':
    'Branching scenario engine. Each choice consequences forward; wrong picks branch to "what would happen" so the lesson sticks. Twine-compatible authoring under the hood.',
  'build-test':
    'Build-and-test environment with adversarial inputs. The learner builds a system prompt or workflow; the platform stress-tests it against three attack patterns and reports which it resisted.',
  'find-flaw':
    'Annotation overlay over AI output. The learner highlights claims to verify; the platform reveals planted issues and links to primary sources.',
  'tabletop-sim':
    'Multi-step incident simulation. Linear with decision points. Captures the path; reveals the rubric at the end.',
  'real-world-capture':
    'Sanitized real-artifact upload with NPI regex guard. The platform soft-blocks suspicious patterns and processes the artifact under guidance. Deferred at v2 launch.',
};

function EngineCallout({ activityType }: { readonly activityType: ActivityType }) {
  const isDeferred = (DEFERRED_ACTIVITY_TYPES as readonly ActivityType[]).includes(activityType);
  return (
    <aside
      className={`mt-5 p-4 border-l-2 ${
        isDeferred
          ? 'border-[color:var(--color-error,#9b2226)] bg-[color:var(--color-parch)]'
          : 'border-[color:var(--color-cobalt)] bg-[color:var(--color-parch)]'
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.10em] mb-2"
        style={{ color: isDeferred ? 'var(--color-error, #9b2226)' : 'var(--color-cobalt)' }}
      >
        {isDeferred ? 'Activity engine deferred at v2 launch' : 'Activity engine pending'}
        {' · '}
        {ACTIVITY_TYPE_META[activityType].platformLabel}
        {' '}
        {ACTIVITY_TYPE_META[activityType].label}
      </p>
      <p className="text-sm text-[color:var(--color-ink)] leading-relaxed">
        {ENGINE_DESCRIPTION[activityType]}
        {' '}
        {isDeferred
          ? 'Until then, the form below captures the learner\'s work for review.'
          : 'Until the engine ships, the form below captures the learner\'s work as a fallback.'}
      </p>
    </aside>
  );
}

export function ActivityRenderer({ activity, index }: ActivityRendererProps) {
  return (
    <article
      id={activity.id}
      aria-labelledby={`${activity.id}-heading`}
      className="bg-[color:var(--color-parch)] py-7 px-7 mb-6 border-l-4 border-[color:var(--color-terra)]"
    >
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-1">
            Activity {String(index + 1).padStart(2, '0')} · {activity.id}
          </p>
          <h3
            id={`${activity.id}-heading`}
            className="font-display text-xl text-[color:var(--color-ink)]"
          >
            {activity.title}
          </h3>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-[color:var(--color-muted,#5b5346)] flex-shrink-0">
          {activity.estimatedMinutes} min
        </span>
      </header>

      <p className="text-[color:var(--color-ink)] leading-relaxed mb-5">
        {activity.description}
      </p>

      <EngineCallout activityType={activity.activityType} />

      <form className="mt-6" aria-label={`${activity.title} fields`}>
        <ActivityFields activity={activity} />
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="font-mono text-[11px] uppercase tracking-[0.10em] py-2 px-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] opacity-60 cursor-not-allowed"
          >
            Save response
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)]">
            Persistence wired in Phase 5
          </span>
        </div>
      </form>

      {activity.artifactId && (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)]">
          Triggers artifact: {activity.artifactId}
        </p>
      )}
    </article>
  );
}
