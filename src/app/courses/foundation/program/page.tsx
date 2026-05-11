// /courses/foundation/program — Course overview (LMS prototype reskin)
//
// Server Component. Reads enrollment state, then renders the prototype's
// OverviewScreen pattern through the shared <CourseShell> primitives.
// V4 expanded module details (includes / practice / artifact / boundary) are
// preserved via the existing data source and rendered inline inside the
// pillar grouping.

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  modules,
  foundationProgramCourseConfig,
  V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER,
} from '@content/courses/foundation-program';
import {
  CourseShell,
  LMSTopBar,
  LMS_PILLARS,
  PillarTag,
  PrimaryButton,
  ProgressDot,
  getModuleStatus,
  toLMSModules,
  type LMSModule,
} from '@/components/lms';
import { getEnrollmentResult, isFetchError } from './_lib/getEnrollment';
import { courseJsonLd, jsonLdString } from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'AiBI-Foundation | The AI Banking Institute',
  description:
    'AiBI-Foundation teaches every staff member at a community bank or credit union how to use AI tools safely, professionally, and with regulatory confidence.',
};

const FOUNDATION_COURSE_JSONLD = courseJsonLd({
  name: 'AiBI-Foundation — Banking AI for Community Financial Institutions',
  description:
    'AiBI-Foundation teaches every staff member at a community bank or credit union how to use AI tools safely, professionally, and with regulatory confidence. 12 modules covering Awareness, Understanding, Creation, and Application of AI for community banking work.',
  slug: '/courses/foundation/program',
  modules: 12,
  hours: 7,
  priceUSD: 295,
});

const LEARNER_OUTCOMES = [
  'Choose the right prompt strategy for the job',
  'Write safer, clearer prompts for daily banking work',
  'Summarize banking documents responsibly',
  'Review AI outputs for errors and unsupported claims',
  'Avoid entering sensitive data into public tools',
  'Use AI for communication, meetings, policy review, and productivity',
] as const;

export default async function CourseOverviewPage() {
  const enrollmentResult = await getEnrollmentResult();
  const fetchFailed = isFetchError(enrollmentResult);
  const enrollment = fetchFailed ? null : enrollmentResult;
  const completedModules = enrollment?.completed_modules ?? [];
  const currentModule = enrollment?.current_module ?? 1;
  const completedCount = completedModules.length;
  const totalModules = modules.length;
  const totalMinutes = foundationProgramCourseConfig.estimatedMinutes;
  const pct = Math.round((completedCount / totalModules) * 100);

  const lmsModules: readonly LMSModule[] = toLMSModules(
    foundationProgramCourseConfig.modules,
  );
  const currentMod = lmsModules.find((m) => m.num === currentModule) ?? lmsModules[0];

  return (
    <CourseShell
      modules={lmsModules}
      completed={completedModules}
      current={currentModule}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(FOUNDATION_COURSE_JSONLD) }}
      />
      <LMSTopBar
        crumbs={['Education', 'AiBI-Foundation']}
        right={
          <span
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ledger-muted)',
            }}
          >
            {completedCount}/{totalModules} complete
          </span>
        }
      />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 36px 80px' }}>
        {/* Hero */}
        <section style={{ marginBottom: 56 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ledger-accent)',
              }}
            >
              {completedCount > 0 ? 'Welcome back' : 'Begin here'}
            </span>
            <span
              style={{
                flex: 1,
                height: 1,
                background: 'var(--ledger-rule)',
              }}
            />
          </div>

          <h1
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontWeight: 500,
              fontSize: 'clamp(46px, 6vw, 76px)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              margin: '0 0 18px',
              color: 'var(--ledger-ink)',
            }}
          >
            Banking AI{' '}
            <em
              style={{
                color: 'var(--ledger-accent)',
                fontStyle: 'normal',
                fontWeight: 500,
              }}
            >
              Foundation.
            </em>
          </h1>
          <p
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontStyle: 'italic',
              fontSize: 22,
              lineHeight: 1.4,
              color: 'var(--ledger-ink-2)',
              margin: '0 0 12px',
              maxWidth: '62ch',
            }}
          >
            {foundationProgramCourseConfig.promise}
          </p>
          <p
            style={{
              color: 'var(--ledger-slate)',
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: '62ch',
              margin: 0,
            }}
          >
            In less than two weeks, write better, summarize faster, think clearer,
            and avoid risky AI mistakes — using the model your institution already
            trusts.
          </p>

          {fetchFailed && (
            <p
              style={{
                marginTop: 24,
                padding: '12px 16px',
                borderLeft: '2px solid var(--ledger-weak)',
                background: 'rgba(142,59,42,0.06)',
                fontSize: 14,
                color: 'var(--ledger-ink)',
              }}
            >
              Couldn&rsquo;t load your progress right now.{' '}
              <Link
                href="/auth/login"
                style={{ textDecoration: 'underline', color: 'var(--ledger-ink)' }}
              >
                Sign in
              </Link>{' '}
              to resume, or refresh the page in a moment.
            </p>
          )}

          {/* Resume strip */}
          <div
            style={{
              marginTop: 32,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: 24,
              alignItems: 'center',
              background: 'var(--ledger-ink)',
              color: 'var(--ledger-paper)',
              padding: '22px 26px',
              borderRadius: 2,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                style={{
                  fontFamily: 'var(--ledger-mono)',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(244,241,231,0.6)',
                }}
              >
                {completedCount > 0 ? 'Currently on' : 'Start with'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--ledger-mono)',
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  color: 'var(--ledger-accent-light)',
                }}
              >
                Module {String(currentMod.num).padStart(2, '0')} &middot;{' '}
                {currentMod.mins} min
              </span>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--ledger-serif)',
                  fontWeight: 500,
                  fontSize: 26,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: 'var(--ledger-paper)',
                }}
              >
                {currentMod.title}
              </h3>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 13,
                  color: 'rgba(244,241,231,0.72)',
                  lineHeight: 1.5,
                  maxWidth: '62ch',
                }}
              >
                {currentMod.goal}
              </p>
            </div>
            <PrimaryButton
              as="a"
              href={`/courses/foundation/program/${currentMod.num}`}
              style={{
                background: 'var(--ledger-accent)',
                color: 'var(--ledger-paper)',
              }}
            >
              {completedCount > 0 ? 'Resume' : 'Start'}{' '}
              <span
                style={{
                  fontFamily: 'var(--ledger-serif)',
                  fontStyle: 'italic',
                  textTransform: 'none',
                  letterSpacing: 0,
                  fontSize: 14,
                }}
              >
                →
              </span>
            </PrimaryButton>
          </div>

          {/* Stats */}
          <div
            style={{
              marginTop: 18,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              borderTop: '1px solid var(--ledger-rule-strong)',
              borderBottom: '1px solid var(--ledger-rule)',
            }}
          >
            {[
              {
                k: 'Progress',
                v: `${pct}%`,
                sub: `${completedCount} of ${totalModules} modules`,
              },
              {
                k: 'Time committed',
                v: `${totalMinutes}m`,
                sub: 'across all modules',
              },
              {
                k: 'Per seat',
                v: '$295',
                sub: '$199 at 10+ seats',
              },
              {
                k: 'Format',
                v: 'Self-paced',
                sub: 'On your schedule',
              },
            ].map((r, i) => (
              <div
                key={r.k}
                style={{
                  padding: '18px 22px',
                  borderRight: i < 3 ? '1px solid var(--ledger-rule)' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    fontSize: 9.5,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--ledger-muted)',
                  }}
                >
                  {r.k}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--ledger-serif)',
                    fontWeight: 500,
                    fontSize: 30,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    marginTop: 6,
                    color: 'var(--ledger-ink)',
                  }}
                >
                  {r.v}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--ledger-slate)',
                    marginTop: 4,
                  }}
                >
                  {r.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What you'll do (outcomes) */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 0.85fr',
            gap: 28,
            marginBottom: 64,
          }}
        >
          <div
            style={{
              border: '1px solid var(--ledger-rule)',
              padding: 26,
              background: 'var(--ledger-paper)',
              borderRadius: 3,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ledger-accent)',
                marginBottom: 14,
              }}
            >
              What you will be able to do
            </div>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'grid',
                gap: 10,
              }}
            >
              {LEARNER_OUTCOMES.map((outcome) => (
                <li
                  key={outcome}
                  style={{
                    display: 'flex',
                    gap: 10,
                    fontSize: 14,
                    color: 'var(--ledger-ink-2)',
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      marginTop: 7,
                      width: 6,
                      height: 6,
                      background: 'var(--ledger-accent)',
                      flex: 'none',
                    }}
                  />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              border: '1px solid var(--ledger-rule)',
              padding: 26,
              background: 'var(--ledger-parch)',
              borderRadius: 3,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ledger-accent)',
                marginBottom: 14,
              }}
            >
              Required outputs
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {foundationProgramCourseConfig.artifacts.map((artifact) => (
                <div key={artifact.id}>
                  <div
                    style={{
                      fontFamily: 'var(--ledger-serif)',
                      fontSize: 16,
                      fontWeight: 500,
                      color: 'var(--ledger-ink)',
                    }}
                  >
                    {artifact.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--ledger-slate)',
                      lineHeight: 1.5,
                    }}
                  >
                    {artifact.description}
                  </div>
                </div>
              ))}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--ledger-serif)',
                    fontSize: 16,
                    fontWeight: 500,
                    color: 'var(--ledger-ink)',
                  }}
                >
                  Final practical assessment
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: 'var(--ledger-slate)',
                    lineHeight: 1.5,
                  }}
                >
                  Submit a reviewed work product package that demonstrates safe,
                  practical AI use.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course structure */}
        <section
          style={{
            background: 'var(--ledger-parch)',
            padding: '34px 36px',
            border: '1px solid var(--ledger-rule)',
            borderRadius: 3,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 8,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--ledger-serif)',
                fontWeight: 500,
                fontSize: 32,
                letterSpacing: '-0.02em',
                margin: 0,
                color: 'var(--ledger-ink)',
              }}
            >
              Course structure
            </h2>
            <span
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ledger-muted)',
              }}
            >
              4 pillars &middot; {totalModules} modules
            </span>
          </div>
          <p
            style={{
              color: 'var(--ledger-slate)',
              fontSize: 14,
              maxWidth: '58ch',
              margin: '0 0 28px',
            }}
          >
            Each module is roughly 20–40 minutes of learning, practice, and a
            single banking artifact you walk away with.
          </p>

          {LMS_PILLARS.map((pillar) => {
            const pillarMods = lmsModules.filter((m) => m.pillar === pillar.id);
            if (pillarMods.length === 0) return null;
            const totalPillarMin = pillarMods.reduce((s, m) => s + m.mins, 0);

            return (
              <div key={pillar.id} style={{ marginBottom: 32 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 14,
                    marginBottom: 14,
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--ledger-rule)',
                    flexWrap: 'wrap',
                  }}
                >
                  <PillarTag pillarId={pillar.id} size="lg" />
                  <span
                    style={{
                      fontFamily: 'var(--ledger-mono)',
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--ledger-muted)',
                    }}
                  >
                    {pillarMods.length} modules &middot; {totalPillarMin} min
                  </span>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {pillarMods.map((mod) => {
                    const status = getModuleStatus(
                      mod.num,
                      completedModules,
                      currentModule,
                    );
                    const locked = status === 'locked';
                    const expanded = V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER.get(
                      mod.num,
                    );
                    const href = `/courses/foundation/program/${mod.num}`;
                    const cardStyle: React.CSSProperties = {
                      textAlign: 'left',
                      background: 'var(--ledger-paper)',
                      border: '1px solid var(--ledger-rule)',
                      borderRadius: 3,
                      padding: '18px 22px',
                      display: 'grid',
                      gridTemplateColumns: '24px 56px 1fr auto auto',
                      gap: 18,
                      alignItems: 'center',
                      opacity: locked ? 0.55 : 1,
                      transition: 'border-color .15s, background .15s',
                      textDecoration: 'none',
                      color: 'inherit',
                    };
                    const interior = (
                      <>
                        <ProgressDot status={status} size={11} />
                        <span
                          style={{
                            fontFamily: 'var(--ledger-mono)',
                            fontSize: 11,
                            color: 'var(--ledger-muted)',
                            letterSpacing: '0.06em',
                          }}
                        >
                          M{String(mod.num).padStart(2, '0')}
                        </span>
                        <div>
                          <div
                            style={{
                              fontFamily: 'var(--ledger-serif)',
                              fontSize: 19,
                              fontWeight: 500,
                              letterSpacing: '-0.01em',
                              color:
                                status === 'current'
                                  ? 'var(--ledger-accent)'
                                  : 'var(--ledger-ink)',
                            }}
                          >
                            {mod.title}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: 'var(--ledger-slate)',
                              marginTop: 3,
                              lineHeight: 1.5,
                            }}
                          >
                            {expanded?.goal ?? mod.output}
                          </div>
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--ledger-mono)',
                            fontSize: 10,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: 'var(--ledger-muted)',
                          }}
                        >
                          {mod.mins} min
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--ledger-serif)',
                            fontStyle: 'italic',
                            fontSize: 18,
                            color: locked
                              ? 'var(--ledger-rule-strong)'
                              : 'var(--ledger-ink)',
                          }}
                        >
                          {locked ? '·' : '→'}
                        </span>
                      </>
                    );

                    if (locked) {
                      return (
                        <div
                          key={mod.num}
                          style={{ ...cardStyle, cursor: 'not-allowed' }}
                          aria-disabled
                          title="Complete the previous module to unlock"
                        >
                          {interior}
                        </div>
                      );
                    }
                    return (
                      <Link key={mod.num} href={href} style={cardStyle}>
                        {interior}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              color: 'var(--ledger-slate)',
            }}
          >
            More credentials launching soon: AiBI-S (Specialist) and AiBI-L (Leader).
          </p>
        </section>
      </div>
    </CourseShell>
  );
}
