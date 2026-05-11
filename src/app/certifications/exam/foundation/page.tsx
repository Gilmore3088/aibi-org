// /certifications/exam/foundation — Foundation final exam page
//
// Auth + enrollment gated. The exam runs entirely client-side via the
// existing useExam hook (a 12-question random draw from a 40-question
// pool, 5-topic distribution). Submission posts to
// /api/certifications/exam/submit which records the attempt (currently a
// no-op stub — schema persistence is deferred per the overnight plan).
//
// Server Component: reads enrollment server-side and gates access.

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CourseShell,
  LMSTopBar,
  toLMSModules,
  type LMSModule,
} from '@/components/lms';
import { foundationProgramCourseConfig } from '@content/courses/foundation-program';
import { getEnrollment } from '@/app/courses/foundation/program/_lib/getEnrollment';
import { ExamRunner } from './_components/ExamRunner';

export const metadata: Metadata = {
  title: 'Foundation Final Exam | AiBI-Foundation',
  description:
    'The AiBI-Foundation final proficiency exam — 12 questions across five topics.',
};

// Minimum completed modules required before the exam unlocks. The exam is
// the capstone for AiBI-Foundation, so by default we require all 12 modules.
// Lower this if the operator wants to allow earlier access for review.
const REQUIRED_COMPLETED_MODULES = 12;

export default async function FoundationExamPage() {
  const enrollment = await getEnrollment();

  if (!enrollment) {
    redirect('/auth/login?next=/certifications/exam/foundation');
  }

  const completedCount = enrollment.completed_modules.length;
  const eligible = completedCount >= REQUIRED_COMPLETED_MODULES;

  const lmsModules: readonly LMSModule[] = toLMSModules(
    foundationProgramCourseConfig.modules,
  );

  return (
    <CourseShell
      modules={lmsModules}
      completed={enrollment.completed_modules}
      current={enrollment.current_module}
    >
      <LMSTopBar
        crumbs={['Education', 'AiBI-Foundation', 'Final Exam']}
        right={
          <Link
            href="/courses/foundation/program"
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ledger-muted)',
              textDecoration: 'none',
            }}
          >
            ← Course overview
          </Link>
        }
      />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 36px 80px' }}>
        {!eligible ? (
          <LockedNotice
            completed={completedCount}
            required={REQUIRED_COMPLETED_MODULES}
            currentModule={enrollment.current_module}
          />
        ) : (
          <ExamRunner />
        )}
      </div>
    </CourseShell>
  );
}

function LockedNotice({
  completed,
  required,
  currentModule,
}: {
  readonly completed: number;
  readonly required: number;
  readonly currentModule: number;
}) {
  return (
    <section>
      <p
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: 10.5,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ledger-accent)',
          margin: '0 0 14px',
        }}
      >
        Locked
      </p>
      <h1
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontWeight: 500,
          fontSize: 'clamp(36px, 5vw, 54px)',
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          margin: '0 0 14px',
          color: 'var(--ledger-ink)',
        }}
      >
        Finish the{' '}
        <em
          style={{
            color: 'var(--ledger-accent)',
            fontStyle: 'italic',
            fontWeight: 400,
          }}
        >
          course
        </em>{' '}
        to unlock the exam.
      </h1>
      <p
        style={{
          fontFamily: 'var(--ledger-serif)',
          fontStyle: 'italic',
          fontSize: 19,
          lineHeight: 1.5,
          color: 'var(--ledger-ink-2)',
          margin: '0 0 24px',
          maxWidth: '60ch',
        }}
      >
        The AiBI-Foundation final exam is the capstone — it draws across
        every pillar you covered in the twelve modules.
      </p>
      <div
        style={{
          border: '1px solid var(--ledger-rule)',
          borderRadius: 3,
          background: 'var(--ledger-paper)',
          padding: '20px 22px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ledger-muted)',
            }}
          >
            Progress
          </div>
          <div
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontSize: 30,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginTop: 4,
              color: 'var(--ledger-ink)',
            }}
          >
            {completed} / {required}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'var(--ledger-sans)',
            fontSize: 13.5,
            color: 'var(--ledger-slate)',
            lineHeight: 1.55,
          }}
        >
          Complete every module, then return here.
        </div>
        <Link
          href={`/courses/foundation/program/${currentModule}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--ledger-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontWeight: 600,
            padding: '12px 20px',
            borderRadius: 2,
            background: 'var(--ledger-ink)',
            color: 'var(--ledger-paper)',
            textDecoration: 'none',
          }}
        >
          Resume Module {String(currentModule).padStart(2, '0')} →
        </Link>
      </div>
    </section>
  );
}
