'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Wordmark } from '@/components/brand';
import { ProgressBar } from '@/app/assessment/_components/ProgressBar';
import { QuestionCard } from '@/app/assessment/_components/QuestionCard';
import { useAssessmentV4 } from '@/app/assessment/in-depth/_lib/useAssessmentV4';
import {
  TEAM_DEPARTMENT_LABELS,
  TEAM_DEPARTMENTS,
  type TeamDepartment,
} from '@/lib/team-assessment/constants';
import { ROLE_V4_META, ROLES_V4, type RoleV4 } from '@content/assessments/v4/roles';
import { EMAIL_RE } from '@/lib/email/validate';

type IntakeStatus = 'intake' | 'questions' | 'submitting' | 'done' | 'existing';

interface TeamAssessmentClientProps {
  readonly token: string;
  readonly institutionName: string;
  readonly seatsPurchased: number;
}

interface StartResponse {
  readonly status?: 'ready' | 'existing';
  readonly resultUrl?: string;
  readonly error?: string;
}

interface SubmitResponse {
  readonly ok?: boolean;
  readonly duplicate?: boolean;
  readonly resultUrl?: string;
  readonly error?: string;
}


const intakeProof = [
  { value: '48', label: 'questions' },
  { value: '8', label: 'readiness dimensions' },
  { value: '10+', label: 'responses unlock the team view' },
] as const;

const intakeSteps = [
  {
    label: 'Identify',
    detail: 'Work email, department, and role keep the cohort report useful.',
  },
  {
    label: 'Assess',
    detail: 'Answer the full diagnostic once. Most people finish in 12-15 minutes.',
  },
  {
    label: 'Report',
    detail: 'You get a personal report. Leaders see aggregate patterns only.',
  },
] as const;

export function TeamAssessmentClient({
  token,
  institutionName,
  seatsPurchased,
}: TeamAssessmentClientProps): JSX.Element {
  const storageKey = useMemo(() => `aibi-team-assessment-v4-${token}`, [token]);
  const state = useAssessmentV4(storageKey);
  const submittedRef = useRef(false);
  const [status, setStatus] = useState<IntakeStatus>('intake');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState<TeamDepartment | ''>('');
  const [departmentOther, setDepartmentOther] = useState('');
  const [role, setRole] = useState<RoleV4 | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  async function beginAssessment(): Promise<void> {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      setError('Enter a valid work email to begin.');
      return;
    }
    if (!department) {
      setError('Choose your department to begin.');
      return;
    }
    if (department === 'other' && departmentOther.trim().length < 2) {
      setError('Name the department when choosing Other.');
      return;
    }
    if (!role) {
      setError('Choose your role to begin.');
      return;
    }

    const response = await fetch(`/api/assessment/team/${token}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail }),
    });
    const data = (await response.json()) as StartResponse;
    if (!response.ok) {
      setError(data.error ?? 'Could not start the assessment.');
      return;
    }
    if (data.status === 'existing' && data.resultUrl) {
      setResultUrl(data.resultUrl);
      setStatus('existing');
      return;
    }
    setEmail(normalizedEmail);
    setStatus('questions');
  }

  useEffect(() => {
    if (!state.isComplete || submittedRef.current || status !== 'questions') return;
    submittedRef.current = true;
    setStatus('submitting');
    setError(null);

    void (async () => {
      try {
        const response = await fetch(`/api/assessment/team/${token}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            department,
            departmentOther,
            role,
            answers: state.answers,
            questionIds: state.selectedQuestions.map((q) => q.id),
          }),
        });
        const data = (await response.json()) as SubmitResponse;
        if (!response.ok || !data.resultUrl) {
          setError(data.error ?? 'Could not save your assessment.');
          setStatus('questions');
          submittedRef.current = false;
          return;
        }
        try {
          window.sessionStorage.removeItem(storageKey);
        } catch {
          // ignore
        }
        setResultUrl(data.resultUrl);
        setStatus(data.duplicate ? 'existing' : 'done');
      } catch {
        setError('Network error. Your answers are still saved on this device.');
        setStatus('questions');
        submittedRef.current = false;
      }
    })();
  }, [
    department,
    departmentOther,
    email,
    role,
    state.answers,
    state.isComplete,
    state.selectedQuestions,
    status,
    storageKey,
    token,
  ]);

  const question = state.selectedQuestions[state.currentQuestion];
  const intakeForm = (
    <div className="team-intake-form">
      <div className="form-heading">
        <p className="team-kicker">Participant intake</p>
        <h2>Start your assessment.</h2>
      </div>
      <label>
        Work email
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          placeholder="name@institution.com"
        />
      </label>
      <label>
        Department
        <select
          value={department}
          onChange={(event) => setDepartment(event.target.value as TeamDepartment | '')}
        >
          <option value="">Select department</option>
          {TEAM_DEPARTMENTS.map((id) => (
            <option key={id} value={id}>
              {TEAM_DEPARTMENT_LABELS[id]}
            </option>
          ))}
        </select>
      </label>
      {department === 'other' && (
        <label>
          Department name
          <input
            value={departmentOther}
            onChange={(event) => setDepartmentOther(event.target.value)}
            placeholder="Department"
          />
        </label>
      )}
      <label>
        Role
        <select value={role} onChange={(event) => setRole(event.target.value as RoleV4 | '')}>
          <option value="">Select role</option>
          {ROLES_V4.map((id) => (
            <option key={id} value={id}>
              {ROLE_V4_META[id].label}
            </option>
          ))}
        </select>
      </label>
      {error && <p role="alert" className="team-error">{error}</p>}
      <button type="button" onClick={beginAssessment}>
        Begin assessment
      </button>
    </div>
  );
  const reportPreview = (
    <aside className="team-report-preview" aria-label="What this assessment produces">
      <div className="report-preview-top">
        <span>Team report</span>
        <strong>Aggregate only</strong>
      </div>
      <div className="report-preview-bars" aria-hidden="true">
        <i style={{ width: '72%' }} />
        <i style={{ width: '54%' }} />
        <i style={{ width: '81%' }} />
        <i style={{ width: '43%' }} />
      </div>
      <dl>
        <div>
          <dt>Personal output</dt>
          <dd>Your full readiness report</dd>
        </div>
        <div>
          <dt>Team output</dt>
          <dd>Dimension, department, and role patterns</dd>
        </div>
        <div>
          <dt>Privacy rule</dt>
          <dd>No individual answers in the admin dashboard</dd>
        </div>
      </dl>
    </aside>
  );

  return (
    <div className="mockup-scope" style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header className="team-assessment-header">
        <Link href="/" aria-label="The AI Banking Institute home">
          <Wordmark variant="full" tone="dark" size={22} />
        </Link>
        <nav className="team-assessment-nav" aria-label="Assessment navigation">
          <Link href="/assessment/team">Overview</Link>
          <Link href="/resources">Resources</Link>
        </nav>
        <div className="team-assessment-header-meta">
          <span>{institutionName}</span>
          <span>{status === 'questions' ? `Question ${state.currentQuestion + 1} of ${state.questionCount}` : `${seatsPurchased} seats`}</span>
        </div>
      </header>
      <ProgressBar progress={status === 'questions' ? state.progress : status === 'submitting' || status === 'done' ? 1 : 0} />

      <main className="team-assessment-main">
        {status === 'intake' && (
          <>
            <section className="team-intake-hero" aria-labelledby="team-intake-heading">
              <div className="team-intake-copy">
                <p className="team-kicker">Paid team diagnostic</p>
                <h1 id="team-intake-heading">{institutionName} AI readiness intake.</h1>
                <p className="team-lede">
                  Complete the same in-depth diagnostic as every participant. Your
                  personal report is immediate; the team view opens only after enough
                  people complete it.
                </p>
                <div className="team-proof-strip" aria-label="Assessment details">
                  {intakeProof.map((item) => (
                    <div key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {intakeForm}
            </section>

            <section className="team-intake-workspace" aria-label="Begin assessment">
              <div className="team-intake-steps">
                {intakeSteps.map((step, index) => (
                  <div key={step.label}>
                    <span>{index + 1}</span>
                    <strong>{step.label}</strong>
                    <p>{step.detail}</p>
                  </div>
                ))}
              </div>

              {reportPreview}
            </section>
          </>
        )}

        {status === 'questions' && question && (
          <section aria-label="Team assessment question">
            <QuestionCard
              question={question}
              questionNumber={state.currentQuestion + 1}
              totalQuestions={state.questionCount}
              selectedPoints={state.answers[state.currentQuestion]}
              onAnswer={state.answer}
              onBack={state.goBack}
              canGoBack={state.currentQuestion > 0}
            />
            {error && <p role="alert" className="team-error team-error-centered">{error}</p>}
          </section>
        )}

        {status === 'submitting' && (
          <section className="team-status-panel" aria-live="polite">
            <p className="team-kicker">Saving</p>
            <h1>Building your personal report.</h1>
            <p>Your answers are being scored across the eight readiness dimensions.</p>
          </section>
        )}

        {(status === 'done' || status === 'existing') && resultUrl && (
          <section className="team-status-panel">
            <p className="team-kicker">{status === 'existing' ? 'Already complete' : 'Complete'}</p>
            <h1>Your personal report is ready.</h1>
            <p>
              Use the link below to view your report. Your individual answers stay
              separate from the admin dashboard.
            </p>
            <Link className="team-primary-link" href={resultUrl}>
              Open personal report
            </Link>
          </section>
        )}
      </main>

      <style jsx global>{`
        .team-assessment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 20px 28px;
          border-bottom: 1px solid var(--ink-a10);
          background: rgba(255, 252, 246, 0.9);
          backdrop-filter: blur(14px);
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .team-assessment-header-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          color: var(--slate-600);
          font-size: 13px;
          font-weight: 700;
        }
        .team-assessment-nav {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }
        .team-assessment-nav a {
          color: var(--ink);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-decoration: none;
          text-transform: uppercase;
        }
        .team-assessment-main {
          max-width: 1180px;
          margin: 0 auto;
          padding: 46px 24px 88px;
        }
        .team-intake-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(340px, 430px);
          gap: 46px;
          align-items: stretch;
          min-height: 430px;
        }
        .team-intake-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 34px 0;
        }
        .team-kicker {
          margin: 0 0 14px;
          color: var(--gold-deep);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .team-assessment-main h1 {
          margin: 0;
          color: var(--ink);
          max-width: 820px;
          font-size: clamp(46px, 6vw, 84px);
          line-height: 0.98;
          letter-spacing: 0;
        }
        .team-assessment-main h2 {
          margin: 0;
          color: var(--ink);
          font-size: 28px;
          line-height: 1.05;
          letter-spacing: 0;
        }
        .team-assessment-main p {
          color: var(--slate-600);
          font-size: 18px;
          line-height: 1.55;
          max-width: 58ch;
        }
        .team-lede {
          margin: 22px 0 0;
          font-size: 20px;
        }
        .team-proof-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1px;
          width: min(760px, 100%);
          overflow: hidden;
          margin-top: 34px;
          border: 1px solid var(--ink-a10);
          border-radius: 16px;
          background: var(--ink-a10);
        }
        .team-proof-strip div {
          min-height: 108px;
          background: #fff;
          padding: 20px;
        }
        .team-proof-strip strong,
        .team-proof-strip span {
          display: block;
        }
        .team-proof-strip strong {
          color: var(--ink);
          font-size: 40px;
          line-height: 1;
          letter-spacing: 0;
        }
        .team-proof-strip span {
          margin-top: 8px;
          color: var(--slate-600);
          font-size: 15px;
          font-weight: 800;
          line-height: 1.25;
        }
        .team-report-preview {
          display: grid;
          align-content: space-between;
          gap: 30px;
          border-radius: 20px;
          background: var(--ink);
          color: var(--cream);
          padding: 30px;
          box-shadow: 0 22px 70px rgba(7, 26, 47, 0.18);
        }
        .report-preview-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
        }
        .report-preview-top span,
        .report-preview-top strong {
          display: block;
        }
        .report-preview-top span {
          color: rgba(247, 243, 234, 0.74);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .report-preview-top strong {
          color: var(--gold);
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .report-preview-bars {
          display: grid;
          gap: 14px;
          padding: 26px 0;
        }
        .report-preview-bars i {
          display: block;
          height: 18px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--gold), rgba(247, 243, 234, 0.72));
        }
        .team-report-preview dl {
          display: grid;
          gap: 0;
          margin: 0;
          border-top: 1px solid rgba(247, 243, 234, 0.16);
        }
        .team-report-preview dl div {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 18px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(247, 243, 234, 0.16);
        }
        .team-report-preview dt {
          color: var(--gold);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .team-report-preview dd {
          margin: 0;
          color: rgba(247, 243, 234, 0.88);
          font-size: 15px;
          font-weight: 700;
          line-height: 1.4;
        }
        .team-intake-workspace {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(340px, 430px);
          gap: 46px;
          align-items: start;
          margin-top: 36px;
          padding-top: 34px;
          border-top: 1px solid var(--ink-a10);
        }
        .team-intake-steps {
          display: grid;
          gap: 18px;
        }
        .team-intake-steps div {
          display: grid;
          grid-template-columns: 48px minmax(120px, 160px) minmax(0, 1fr);
          gap: 18px;
          align-items: start;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--ink-a10);
        }
        .team-intake-steps span {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: var(--gold);
          color: var(--ink);
          font-size: 14px;
          font-weight: 900;
        }
        .team-intake-steps strong {
          color: var(--ink);
          font-size: 20px;
          line-height: 1.15;
        }
        .team-intake-steps p {
          margin: 0;
          font-size: 16px;
        }
        .team-intake-form {
          display: grid;
          gap: 16px;
          padding: 28px;
          background: #fff;
          border: 1px solid var(--ink-a10);
          border-radius: 20px;
          box-shadow: 0 18px 60px rgba(7, 26, 47, 0.08);
        }
        .form-heading {
          padding-bottom: 4px;
        }
        .form-heading .team-kicker {
          margin-bottom: 10px;
        }
        .team-assessment-main label {
          display: grid;
          gap: 8px;
          color: var(--ink);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .team-assessment-main input,
        .team-assessment-main select {
          width: 100%;
          border: 1px solid var(--ink-a15);
          border-radius: 12px;
          background: var(--cream);
          color: var(--ink);
          font: 600 16px/1.3 Inter, ui-sans-serif, system-ui, sans-serif;
          letter-spacing: 0;
          padding: 14px 14px;
          text-transform: none;
        }
        .team-assessment-main input:focus,
        .team-assessment-main select:focus {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }
        .team-assessment-main button,
        .team-assessment-main .team-primary-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 52px;
          border: 0;
          border-radius: 12px;
          background: var(--ink);
          color: var(--cream);
          padding: 0 24px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
        }
        .team-assessment-main button:hover,
        .team-assessment-main .team-primary-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(7, 26, 47, 0.16);
        }
        .team-error {
          margin: 0;
          color: #9b2226;
          font-size: 14px;
          font-weight: 700;
        }
        .team-error-centered {
          max-width: 720px;
          margin: 24px auto 0;
        }
        .team-status-panel {
          max-width: 760px;
          padding-top: 8vh;
        }
        .team-status-panel .team-primary-link {
          margin-top: 18px;
          width: fit-content;
          background: var(--gold);
          color: var(--ink);
        }
        @media (max-width: 820px) {
          .team-assessment-header {
            align-items: flex-start;
            flex-direction: column;
            padding: 18px;
            position: static;
          }
          .team-assessment-nav {
            width: 100%;
            margin-left: 0;
            justify-content: space-between;
          }
          .team-assessment-header-meta {
            width: 100%;
            justify-content: space-between;
          }
          .team-assessment-main {
            padding: 36px 18px 72px;
          }
          .team-intake-hero,
          .team-intake-workspace {
            grid-template-columns: 1fr;
            gap: 28px;
            min-height: auto;
          }
          .team-assessment-main h1 {
            font-size: clamp(40px, 11vw, 58px);
          }
          .team-assessment-main p {
            font-size: 16px;
          }
          .team-lede {
            font-size: 17px;
          }
          .team-proof-strip {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin-top: 24px;
          }
          .team-proof-strip div {
            min-height: 82px;
            padding: 14px 10px;
          }
          .team-proof-strip strong {
            font-size: 30px;
          }
          .team-proof-strip span {
            font-size: 12px;
          }
          .team-report-preview {
            padding: 24px;
          }
          .team-report-preview dl div {
            grid-template-columns: 1fr;
            gap: 6px;
          }
          .team-intake-steps div {
            grid-template-columns: 38px 1fr;
            gap: 12px;
          }
          .team-intake-steps p {
            grid-column: 2;
          }
          .team-intake-form {
            padding: 20px;
            border-radius: 14px;
          }
        }
      `}</style>
    </div>
  );
}
