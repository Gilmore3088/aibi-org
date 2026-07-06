// CourseLaunchMap — concise learner orientation for the Foundation course.
//
// This is the "what am I doing here?" moment on the enrolled course home.
// It states the repeated learner loop before the learner sees the
// packet tracker: understand, try, build, save. Keep this as product UI,
// not marketing copy.

import Link from 'next/link';
import { modules, getArtifactFirst } from '@content/courses/foundation-program';
import type { LMSModule } from '@/components/lms';

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

interface CourseLaunchMapProps {
  readonly currentModule: LMSModule;
  readonly completedModules: readonly number[];
}

const LOOP_STEPS = [
  {
    label: 'Understand',
    title: 'See the work product',
    body: 'Begin with the artifact you will leave with.',
  },
  {
    label: 'Try',
    title: 'Run the AiBI Lab',
    body: 'Use sample banking data, not sensitive bank records.',
  },
  {
    label: 'Build',
    title: 'Shape the artifact',
    body: 'Turn the lab result into review-ready work product.',
  },
  {
    label: 'Save',
    title: 'Keep the evidence',
    body: 'Review the output and keep the manager-ready proof.',
  },
] as const;

const TOOLBOX_PATH = [
  'Library',
  'AiBI Lab',
  'My Toolbox',
] as const;

const PROOF_SYSTEM = [
  {
    label: 'Foundation Packet',
    title: 'Submitted work products',
    body: 'One manager-ready artifact per module.',
  },
  {
    label: 'My Toolbox',
    title: 'Reusable prompts',
    body: 'Only prompts and playbooks you have tested.',
  },
] as const;

export function CourseLaunchMap({ currentModule, completedModules }: CourseLaunchMapProps) {
  const currentArtifact = getArtifactFirst(currentModule.num);
  const nextArtifacts = modules
    .filter((module) => !completedModules.includes(module.number))
    .slice(0, 4)
    .map((module) => ({
      module,
      artifact: getArtifactFirst(module.number),
    }));

  return (
    <section
      className="foundation-launch-map"
      aria-labelledby="foundation-launch-heading"
      style={{
        marginBottom: 40,
        border: '1px solid var(--ink-a10)',
        borderRadius: 28,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: 'var(--shadow-soft)',
        fontFamily: FONT_INTER,
      }}
    >
      <div
        className="foundation-launch-map__grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.96fr) minmax(320px, 0.72fr)',
          minHeight: 360,
        }}
      >
        <div
          className="foundation-launch-map__overview"
          style={{
            padding: 'clamp(22px, 3vw, 34px)',
            background: 'var(--ink)',
            color: 'var(--cream)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 28,
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 12px',
                color: 'var(--gold)',
                fontSize: '0.75rem',
                fontWeight: 850,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              How this course works
            </p>
            <h1
              id="foundation-launch-heading"
              style={{
                margin: 0,
                maxWidth: 760,
                color: '#fff',
                fontSize: 'clamp(1.875rem, 4.2vw, 3.375rem)',
                lineHeight: 1,
                letterSpacing: '-0.035em',
                fontWeight: 850,
              }}
            >
              Build one real banking artifact every module.
            </h1>
            <p
              style={{
                margin: '16px 0 0',
                maxWidth: 620,
                color: 'rgba(255,255,255,0.78)',
                fontSize: '1.0625rem',
                lineHeight: 1.55,
                fontWeight: 550,
              }}
            >
              Each module is a short adult-learning loop: see the outcome,
              retrieve the rule, practice in the lab, and transfer reviewed
              work into your Packet or Toolbox.
            </p>
          </div>

          <div
            className="foundation-launch-map__steps"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
              gap: 10,
            }}
          >
            {LOOP_STEPS.map((step, index) => (
              <div
                key={step.label}
                className="foundation-launch-map__step"
                style={{
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 16,
                  padding: '14px 14px 15px',
                  background: index === 0 ? 'rgba(211,171,76,0.16)' : 'rgba(255,255,255,0.055)',
                }}
              >
                <p
                  style={{
                    margin: '0 0 8px',
                    color: 'var(--gold)',
                    fontSize: '0.625rem',
                    fontWeight: 850,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {String(index + 1).padStart(2, '0')} · {step.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: '#fff',
                    fontSize: '0.875rem',
                    lineHeight: 1.25,
                    fontWeight: 800,
                  }}
                >
                  {step.title}
                </p>
                <p
                  style={{
                    margin: '6px 0 0',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.75rem',
                    lineHeight: 1.38,
                    fontWeight: 600,
                  }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div
            className="foundation-launch-map__proof"
            aria-label="Where course work goes"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
              borderTop: '1px solid rgba(255,255,255,0.14)',
              paddingTop: 14,
            }}
          >
            {PROOF_SYSTEM.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'grid',
                  gap: 5,
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: 'var(--gold)',
                    fontSize: '0.625rem',
                    fontWeight: 850,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: '#fff',
                    fontSize: '0.9375rem',
                    lineHeight: 1.2,
                    fontWeight: 850,
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: 'rgba(255,255,255,0.68)',
                    fontSize: '0.75rem',
                    lineHeight: 1.35,
                    fontWeight: 650,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside
          aria-label="Current packet target"
          className="foundation-launch-map__target"
          style={{
            padding: 'clamp(22px, 3vw, 30px)',
            background: 'var(--cream-2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 22,
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 10px',
                color: 'var(--gold-deep)',
                fontSize: '0.75rem',
                fontWeight: 850,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Your next save
            </p>
            <h3
              style={{
                margin: 0,
                color: 'var(--ink)',
                fontSize: 'clamp(1.4375rem, 2.4vw, 2rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                fontWeight: 850,
              }}
            >
              {currentArtifact?.saved ?? currentModule.output}
            </h3>
            <p
              style={{
                margin: '12px 0 0',
                color: 'var(--slate-600)',
                fontSize: '0.9375rem',
                lineHeight: 1.5,
                fontWeight: 650,
              }}
            >
              {currentArtifact?.mustProve ??
                'Save enough source, AI-assisted work, and human review for a manager to inspect.'}
            </p>
          </div>

          <div
            aria-label="Upcoming packet artifacts"
            style={{
              display: 'grid',
              gap: 8,
            }}
          >
            {nextArtifacts.map(({ module, artifact }) => (
              <div
                key={module.number}
                className="foundation-launch-map__artifact-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px minmax(0, 1fr)',
                  gap: 12,
                  alignItems: 'center',
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 14,
                  background: '#fff',
                  padding: '10px 12px',
                }}
              >
                <span
                  aria-label={`Module ${module.number}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: module.number === currentModule.num ? 'var(--gold)' : 'var(--cream)',
                    color: 'var(--ink)',
                    fontSize: '0.8125rem',
                    fontWeight: 850,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {String(module.number).padStart(2, '0')}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--ink)',
                      fontSize: '0.875rem',
                      lineHeight: 1.25,
                      fontWeight: 800,
                    }}
                  >
                    {artifact?.saved ?? module.keyOutput}
                  </p>
                  <p
                    style={{
                      margin: '3px 0 0',
                      color: 'var(--slate-500)',
                      fontSize: '0.75rem',
                      lineHeight: 1.28,
                      fontWeight: 650,
                    }}
                  >
                    {module.number === currentModule.num ? 'Current module' : 'Coming up'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="foundation-launch-map__toolbox"
            aria-label="Toolbox preview"
            style={{
              border: '1px solid var(--ink-a10)',
              borderRadius: 16,
              background: '#fff',
              padding: 14,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: 12,
                alignItems: 'center',
              }}
              className="foundation-launch-map__toolbox-head"
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--gold-deep)',
                    fontSize: '0.625rem',
                    fontWeight: 850,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  Toolbox
                </p>
                <p
                  style={{
                    margin: '4px 0 0',
                    color: 'var(--ink)',
                    fontSize: '0.875rem',
                    lineHeight: 1.25,
                    fontWeight: 850,
                  }}
                >
                  Where tested prompts become reusable work assets.
                </p>
              </div>
              <Link
                href="/dashboard/toolbox"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 44,
                  padding: '8px 11px',
                  borderRadius: 10,
                  background: 'var(--cream)',
                  color: 'var(--ink)',
                  fontSize: '0.625rem',
                  fontWeight: 850,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Open
              </Link>
            </div>
            <ol
              className="foundation-launch-map__toolbox-path"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${TOOLBOX_PATH.length}, minmax(0, 1fr))`,
                gap: 8,
                margin: '12px 0 0',
                padding: 0,
                listStyle: 'none',
              }}
            >
              {TOOLBOX_PATH.map((step, index) => (
                <li
                  key={step}
                  style={{
                    minHeight: 58,
                    borderRadius: 12,
                    background: index === 1 ? 'var(--ink)' : 'var(--cream)',
                    color: index === 1 ? '#fff' : 'var(--ink)',
                    padding: '10px 11px',
                    display: 'grid',
                    alignContent: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      color: index === 1 ? 'var(--gold)' : 'var(--gold-deep)',
                      fontSize: '0.5625rem',
                      fontWeight: 850,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      lineHeight: 1.15,
                      fontWeight: 850,
                    }}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="foundation-launch-map__actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link
              href={`/courses/foundation/program/${currentModule.num}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                padding: '11px 15px',
                borderRadius: 12,
                background: 'var(--ink)',
                color: 'var(--cream)',
                fontSize: '0.75rem',
                fontWeight: 850,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Open module
            </Link>
            <Link
              href="/courses/foundation/program/toolkit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                padding: '11px 15px',
                borderRadius: 12,
                border: '1px solid var(--ink-a10)',
                background: '#fff',
                color: 'var(--ink)',
                fontSize: '0.75rem',
                fontWeight: 850,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              View packet
            </Link>
            <Link
              href="/dashboard/toolbox"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 44,
                padding: '11px 15px',
                borderRadius: 12,
                border: '1px solid var(--ink-a10)',
                background: '#fff',
                color: 'var(--ink)',
                fontSize: '0.75rem',
                fontWeight: 850,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Open toolbox
            </Link>
          </div>
        </aside>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 980px) {
              .foundation-launch-map__grid {
                grid-template-columns: 1fr !important;
              }
              .foundation-launch-map__steps {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
            }
            @media (max-width: 720px) {
              .foundation-launch-map {
                border-radius: 20px !important;
              }
              .foundation-launch-map__overview,
              .foundation-launch-map__target {
                padding: 18px !important;
                gap: 16px !important;
              }
              .foundation-launch-map__overview > div:first-child > p:last-child {
                display: none !important;
              }
              .foundation-launch-map__steps {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 8px !important;
              }
              .foundation-launch-map__toolbox-head {
                grid-template-columns: 1fr !important;
              }
              .foundation-launch-map__toolbox {
                padding: 12px !important;
              }
              .foundation-launch-map__toolbox-head a {
                min-height: 44px !important;
              }
              .foundation-launch-map__toolbox-head p:last-child {
                display: none !important;
              }
              .foundation-launch-map__toolbox-path {
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              }
              .foundation-launch-map__step {
                display: grid !important;
                grid-template-columns: 1fr !important;
                gap: 5px !important;
                align-items: start !important;
                min-height: 78px !important;
                padding: 10px !important;
              }
              .foundation-launch-map__step p:first-child {
                margin: 0 !important;
              }
              .foundation-launch-map__step p:last-child {
                display: none !important;
              }
              .foundation-launch-map__proof {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 9px !important;
                padding-top: 12px !important;
              }
              .foundation-launch-map__proof p:last-child {
                display: none !important;
              }
              .foundation-launch-map__artifact-row:nth-child(n + 3) {
                display: none !important;
              }
              .foundation-launch-map__toolbox-path li {
                min-height: 54px !important;
                padding: 9px !important;
              }
              .foundation-launch-map__actions {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 8px !important;
              }
              .foundation-launch-map__actions a:first-child {
                grid-column: 1 / -1 !important;
              }
              .foundation-launch-map__actions a {
                padding: 10px 12px !important;
                letter-spacing: 0.1em !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}
