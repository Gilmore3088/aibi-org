'use client';

import type { CSSProperties } from 'react';
import {
  QUICK_WIN_TOOLS as TOOLS,
  QUICK_WIN_FREQUENCIES as FREQUENCIES,
  QUICK_WIN_TIME_OPTIONS as TIME_OPTIONS,
  type QuickWin,
} from '../../_lib/quickWinsData';

interface FormState {
  description: string;
  tool: string;
  skillName: string;
  frequency: string;
  timeSavedMinutes: number;
  department: string;
}

const fieldLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--slate-600)',
  marginBottom: 8,
};

const inputStyle: CSSProperties = {
  width: '100%',
  background: 'var(--cream)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 16,
  color: 'var(--ink)',
  outline: 'none',
  fontFamily: 'inherit',
};

interface WinsFormProps {
  readonly form: FormState;
  readonly submitting: boolean;
  readonly error: string | null;
  readonly successMsg: string | null;
  readonly onField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
}

function isFormValid(form: FormState): boolean {
  return (
    form.description.trim().length > 0 &&
    form.tool.length > 0 &&
    form.skillName.trim().length > 0 &&
    form.frequency.length > 0 &&
    form.timeSavedMinutes > 0 &&
    form.department.trim().length > 0
  );
}

export function WinsForm({ form, submitting, error, successMsg, onField, onSubmit }: WinsFormProps) {
  const valid = isFormValid(form);

  return (
    <section aria-labelledby="log-form-heading" style={{ marginBottom: 56 }}>
      <h2
        id="log-form-heading"
        style={{
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          margin: '0 0 6px',
        }}
      >
        Add a win
      </h2>
      <p
        style={{
          fontSize: 16,
          color: 'var(--slate-600)',
          lineHeight: 1.6,
          margin: '0 0 20px',
          maxWidth: '60ch',
        }}
      >
        What you automated · what it saved · which tool and skill you used.
      </p>

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            border: '1px solid var(--ink-a15)',
            background: 'var(--cream-2)',
            borderRadius: 12,
            fontSize: 16,
            color: 'var(--ink)',
          }}
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            border: '1px solid var(--emerald-700)',
            background: 'var(--cream-2)',
            borderRadius: 12,
            fontSize: 16,
            color: 'var(--emerald-800)',
          }}
        >
          {successMsg}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <div>
          <label htmlFor="qw-description" style={fieldLabelStyle}>
            What did you automate?
          </label>
          <input
            id="qw-description"
            type="text"
            required
            maxLength={200}
            placeholder='e.g. "Weekly exception report analysis"'
            value={form.description}
            onChange={(e) => onField('description', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          <div>
            <label htmlFor="qw-tool" style={fieldLabelStyle}>
              Which tool?
            </label>
            <select
              id="qw-tool"
              required
              value={form.tool}
              onChange={(e) => onField('tool', e.target.value)}
              style={inputStyle}
            >
              <option value="">Select tool</option>
              {TOOLS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="qw-skill" style={fieldLabelStyle}>
              Which skill?
            </label>
            <input
              id="qw-skill"
              type="text"
              required
              maxLength={100}
              placeholder='e.g. "RTFC Framework" or "custom workflow"'
              value={form.skillName}
              onChange={(e) => onField('skillName', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          <div>
            <label htmlFor="qw-frequency" style={fieldLabelStyle}>
              How often?
            </label>
            <select
              id="qw-frequency"
              required
              value={form.frequency}
              onChange={(e) => onField('frequency', e.target.value)}
              style={inputStyle}
            >
              <option value="">Select frequency</option>
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="qw-time" style={fieldLabelStyle}>
              Time saved per use
            </label>
            <select
              id="qw-time"
              required
              value={form.timeSavedMinutes || ''}
              onChange={(e) => onField('timeSavedMinutes', Number(e.target.value))}
              style={inputStyle}
            >
              <option value="">Select time</option>
              {TIME_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="qw-department" style={fieldLabelStyle}>
            Department
          </label>
          <input
            id="qw-department"
            type="text"
            required
            maxLength={100}
            placeholder='e.g. "Compliance" or "Lending"'
            value={form.department}
            onChange={(e) => onField('department', e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={!valid || submitting}
          style={{
            marginTop: 8,
            alignSelf: 'flex-start',
            padding: '14px 24px',
            background: 'var(--ink)',
            color: 'var(--cream-2)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            borderRadius: 12,
            border: 'none',
            cursor: !valid || submitting ? 'not-allowed' : 'pointer',
            opacity: !valid || submitting ? 0.4 : 1,
            transition: 'background-color var(--t-fast) var(--ease)',
          }}
          aria-busy={submitting}
        >
          {submitting ? 'LOGGING...' : 'LOG QUICK WIN'}
        </button>
      </form>
    </section>
  );
}

