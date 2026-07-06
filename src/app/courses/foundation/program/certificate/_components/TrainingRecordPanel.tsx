// TrainingRecordPanel — documented-seat-time block on the certificate page.
//
// Institutions log staff training for internal records and exam evidence.
// This panel states the documented seat time and topics, and gives the
// learner a paste-ready training-log entry. The disclaimer is mandatory:
// this is documented seat time, not CPE credit, accreditation, or
// regulator-endorsed training.

import {
  getFoundationTrainingRecord,
} from '@content/courses/foundation-program/course-config';
import { CopyablePrompt } from '../../_components/CopyablePrompt';
import { formatDate } from '../_lib/formatDate';

const INTER_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const KICKER: React.CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

interface TrainingRecordPanelProps {
  readonly holderName: string;
  readonly issuedAt: string;
  readonly verificationUrl: string;
}

export function trainingLogEntryText({
  holderName,
  issuedAt,
  verificationUrl,
}: TrainingRecordPanelProps): string {
  const record = getFoundationTrainingRecord();
  const hoursLabel = Number.isInteger(record.hours)
    ? String(record.hours)
    : record.hours.toFixed(1);
  return [
    `Learner: ${holderName}`,
    'Institution: [Your institution]',
    'Course: AiBI-Foundation — The AI Banking Institute',
    `Documented seat time: ~${hoursLabel} hours (${record.moduleCount} self-paced modules)`,
    `Topics covered: ${record.topics.join(', ')}`,
    `Completed: ${formatDate(issuedAt)}`,
    `Verification: ${verificationUrl}`,
  ].join('\n');
}

export function TrainingRecordPanel(props: TrainingRecordPanelProps) {
  const record = getFoundationTrainingRecord();
  const hoursLabel = Number.isInteger(record.hours)
    ? String(record.hours)
    : record.hours.toFixed(1);

  return (
    <section
      aria-labelledby="training-record-heading"
      style={{
        marginTop: 28,
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        background: '#fff',
        padding: 22,
        boxShadow: '0 18px 48px rgba(7, 26, 47, 0.06)',
      }}
    >
      <p style={{ ...KICKER, marginBottom: 10 }}>Training record</p>
      <h2
        id="training-record-heading"
        style={{
          margin: 0,
          color: 'var(--ink)',
          fontFamily: INTER_STACK,
          fontSize: '1.625rem',
          lineHeight: 1.12,
        }}
      >
        For your institution&rsquo;s training log.
      </h2>
      <p
        style={{
          margin: '10px 0 18px',
          color: 'var(--slate-600)',
          fontFamily: INTER_STACK,
          fontSize: '0.875rem',
          lineHeight: 1.55,
        }}
      >
        This credential documents ~{hoursLabel} hours of seat time across{' '}
        {record.moduleCount} self-paced modules covering {record.topics.join(', ')}.
        Paste the entry below into your institution&rsquo;s training record — the
        verification link lets anyone confirm the certificate.
      </p>
      <CopyablePrompt text={trainingLogEntryText(props)} />
      <p
        style={{
          margin: '14px 0 0',
          color: 'var(--slate-600)',
          fontFamily: INTER_STACK,
          fontSize: '0.8125rem',
          lineHeight: 1.5,
        }}
      >
        Documented seat time is not CPE credit, accreditation, or
        regulator-endorsed training. Whether it counts toward your
        institution&rsquo;s internal training requirements is your
        institution&rsquo;s decision.
      </p>
    </section>
  );
}
