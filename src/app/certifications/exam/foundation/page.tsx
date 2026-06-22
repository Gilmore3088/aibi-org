// /certifications/exam/foundation — Foundation final exam page
//
// Auth + enrollment gated. The exam runs entirely client-side via the
// existing useExam hook (a 12-question random draw from a 40-question
// pool, 5-topic distribution). Submission posts to
// /api/certifications/exam/submit which records the attempt (currently a
// no-op stub — schema persistence is deferred per the overnight plan).
//
// Server Component: reads enrollment server-side and gates access.
//
// 2026-05-27: Ported to the mockup design system. Italics removed; Inter
// throughout; navy/cream/gold/slate tokens. Eligibility notice reads as
// a calm progress checkpoint, not a "locked" gate.

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CourseShell,
  LMSTopBar,
  toLMSModules,
  type LMSModule,
} from '@/components/lms';
import { foundationCourseConfig } from '@content/courses/foundation-program';
import { getEnrollment } from '@/app/courses/foundation/program/_lib/getEnrollment';
import { ExamRunner } from './_components/ExamRunner';

export const metadata: Metadata = {
  title: 'Foundation Final Exam | AiBI-Foundation',
  description:
    'The AiBI-Foundation final proficiency exam — 12 questions across five topics.',
};

// Minimum completed modules required before the exam unlocks. The exam is
// the capstone for AiBI-Foundation, so by default we require every module.
const REQUIRED_COMPLETED_MODULES = foundationCourseConfig.modules.length;

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

export default async function FoundationExamPage() {
  const enrollment = await getEnrollment();

  if (!enrollment) {
    redirect('/auth/login?next=/certifications/exam/foundation');
  }

  const completedCount = enrollment.completed_modules.length;
  const eligible = completedCount >= REQUIRED_COMPLETED_MODULES;

  const lmsModules: readonly LMSModule[] = toLMSModules(
    foundationCourseConfig.modules,
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
              fontFamily: INTER_STACK,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
              textDecoration: 'none',
            }}
          >
            COURSE OVERVIEW
          </Link>
        }
      />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 36px 80px' }}>
        {!eligible ? (
          <NotEligibleYetNotice
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

function NotEligibleYetNotice({
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
          fontFamily: INTER_STACK,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 14px',
        }}
      >
        Final Exam
      </p>
      <h1
        style={{
          fontFamily: INTER_STACK,
          fontWeight: 700,
          fontSize: 'clamp(34px, 5vw, 50px)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 0 14px',
          color: 'var(--ink)',
        }}
      >
        Finish the course, then sit the exam.
      </h1>
      <p
        style={{
          fontFamily: INTER_STACK,
          fontSize: 17,
          fontWeight: 400,
          lineHeight: 1.55,
          color: 'var(--slate-600)',
          margin: '0 0 28px',
          maxWidth: '60ch',
        }}
      >
        The AiBI-Foundation final exam draws across every topic covered in
        the {REQUIRED_COMPLETED_MODULES} modules. Complete the remaining modules and return here
        to begin.
      </p>
      <div
        style={{
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
          background: 'var(--cream-2)',
          padding: '22px 24px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: 20,
          alignItems: 'center',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: INTER_STACK,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--slate-500)',
            }}
          >
            Progress
          </div>
          <div
            style={{
              fontFamily: INTER_STACK,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginTop: 4,
              color: 'var(--ink)',
            }}
          >
            {completed} / {required}
          </div>
        </div>
        <div
          style={{
            fontFamily: INTER_STACK,
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--slate-600)',
            lineHeight: 1.55,
          }}
        >
          Complete every module, then return here to begin the exam.
        </div>
        <Link
          href={`/courses/foundation/program/${currentModule}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: INTER_STACK,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            padding: '12px 20px',
            borderRadius: 12,
            background: 'var(--ink)',
            color: 'var(--cream)',
            textDecoration: 'none',
          }}
        >
          RESUME MODULE {String(currentModule).padStart(2, '0')}
        </Link>
      </div>
    </section>
  );
}
