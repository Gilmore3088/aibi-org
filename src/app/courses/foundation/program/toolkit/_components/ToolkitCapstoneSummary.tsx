import type { CSSProperties } from 'react';

const kickerStyle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

interface ToolkitCapstoneSummaryProps {
  readonly skillResponse?: Record<string, string>;
  readonly workflowResponse?: Record<string, string>;
}

export function ToolkitCapstoneSummary({
  skillResponse,
  workflowResponse,
}: ToolkitCapstoneSummaryProps) {
  const skillDraft = skillResponse?.artifact_draft?.trim();
  const skillReview = skillResponse?.review_note?.trim();
  const skillReuse = skillResponse?.first_use?.trim();
  const workflowPurpose = workflowResponse?.workflow_purpose?.trim();
  const workflowKit = workflowResponse?.prompt_or_skill?.trim();
  const workflowGate = workflowResponse?.checkpoint_and_escalation?.trim();
  const workflowTest = workflowResponse?.peer_test_plan?.trim();

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <p style={{ fontSize: '1rem', color: 'var(--slate-500)', lineHeight: 1.6, margin: 0 }}>
        Summary of your reusable skill and workflow evidence: what you tested,
        how you improved it, and the quality standard your final packet should meet.
      </p>

      {skillDraft && (
        <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
          <p style={{ ...kickerStyle, marginBottom: 4 }}>Reusable skill</p>
          <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
            {skillDraft}
            {skillReuse ? (
              <span style={{ color: 'var(--slate-500)' }}> — First reuse: {skillReuse}</span>
            ) : null}
          </p>
        </div>
      )}

      {workflowPurpose && (
        <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
          <p style={{ ...kickerStyle, marginBottom: 4 }}>Workflow kit</p>
          <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
            {workflowPurpose}
          </p>
        </div>
      )}

      {(workflowGate || workflowTest || skillReview || workflowKit) && (
        <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
          <p style={{ ...kickerStyle, marginBottom: 4 }}>Review evidence</p>
          <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
            {[workflowGate, workflowTest, skillReview, workflowKit]
              .filter(Boolean)
              .join(' ')}
          </p>
        </div>
      )}

      <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 14 }}>
        <p style={{ ...kickerStyle, marginBottom: 4 }}>Quality standard met</p>
        <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
          Five-dimension AiBI-Foundation rubric: Accuracy (hard gate), Completeness,
          Tone, Judgment, and Skill Quality.
        </p>
      </div>
    </div>
  );
}
