'use client';

// Institution context intake form. Shown on the post-purchase confirmation
// page so buyers can supply personalization context before they start the
// 48-question diagnostic. Saves via PATCH /api/assessment/in-depth/institution-context.
//
// Auth model: sessionId (Stripe success URL param) is the credential when the
// buyer is not yet signed in. The API validates the session against Stripe and
// resolves the profile by email.

import { useState, useCallback } from 'react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV',
  'NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN',
  'TX','UT','VT','VA','WA','WV','WI','WY','DC',
] as const;

const ASSET_BAND_OPTIONS = [
  { value: 'sub-300M', label: 'Under $300M' },
  { value: '300M-1B', label: '$300M – $1B' },
  { value: '1B-10B', label: '$1B – $10B' },
  { value: '10B-plus', label: 'Over $10B' },
] as const;

const REGULATOR_OPTIONS = [
  { value: 'OCC', label: 'OCC (National bank / federal savings)' },
  { value: 'FDIC', label: 'FDIC (State non-member bank)' },
  { value: 'FRB', label: 'Federal Reserve (State member bank)' },
  { value: 'NCUA', label: 'NCUA (Credit union)' },
  { value: 'state', label: 'State-chartered (other)' },
] as const;

interface Props {
  sessionId: string | null;
  profileId: string | null;
}

export function InstitutionContextForm({ sessionId, profileId }: Props): JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [assetBand, setAssetBand] = useState('');
  const [state, setState] = useState('');
  const [regulator, setRegulator] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('saving');

      const context: Record<string, string> = {};
      if (firstName.trim()) context.first_name = firstName.trim();
      if (lastName.trim()) context.last_name = lastName.trim();
      if (institutionName.trim()) context.institution_name = institutionName.trim();
      if (assetBand) context.asset_band = assetBand;
      if (state) context.state = state;
      if (regulator) context.regulator = regulator;

      try {
        const res = await fetch('/api/assessment/in-depth/institution-context', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(profileId ? { profileId } : { sessionId }),
            context,
          }),
        });
        setStatus(res.ok ? 'saved' : 'error');
      } catch {
        setStatus('error');
      }
    },
    [firstName, lastName, institutionName, assetBand, state, regulator, sessionId, profileId],
  );

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid var(--ink-a10)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: '0.9375rem',
    color: 'var(--ink)',
    background: '#fff',
    fontFamily: 'inherit',
    outline: 'none',
    appearance: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--slate-600)',
    marginBottom: 6,
    textTransform: 'uppercase',
  };

  if (status === 'saved') {
    return (
      <div
        style={{
          background: '#F0FAF4',
          border: '1px solid #34D399',
          borderRadius: 14,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ fontSize: '1.25rem' }} aria-hidden="true">✓</span>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#065F46', fontWeight: 600 }}>
          Saved. Your report will be personalized with this context.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label htmlFor="ictx-first-name" style={labelStyle}>First name</label>
          <input
            id="ictx-first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            maxLength={80}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="ictx-last-name" style={labelStyle}>Last name</label>
          <input
            id="ictx-last-name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Smith"
            maxLength={80}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="ictx-institution" style={labelStyle}>Institution name</label>
        <input
          id="ictx-institution"
          type="text"
          value={institutionName}
          onChange={(e) => setInstitutionName(e.target.value)}
          placeholder="First Community Bank"
          maxLength={120}
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label htmlFor="ictx-asset-band" style={labelStyle}>Asset size</label>
          <select
            id="ictx-asset-band"
            value={assetBand}
            onChange={(e) => setAssetBand(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Select…</option>
            {ASSET_BAND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ictx-state" style={labelStyle}>State</label>
          <select
            id="ictx-state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Select…</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ictx-regulator" style={labelStyle}>Primary regulator</label>
          <select
            id="ictx-regulator"
            value={regulator}
            onChange={(e) => setRegulator(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Select…</option>
            {REGULATOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={status === 'saving'}
          style={{
            background: 'var(--gold)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '11px 24px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: status === 'saving' ? 'not-allowed' : 'pointer',
            opacity: status === 'saving' ? 0.7 : 1,
            fontFamily: 'inherit',
          }}
        >
          {status === 'saving' ? 'Saving…' : 'Save context'}
        </button>
        {status === 'error' && (
          <p role="alert" style={{ margin: 0, fontSize: '0.8125rem', color: '#C0392B' }}>
            Could not save — check your connection and try again.
          </p>
        )}
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--slate-500)' }}>
          All fields optional. Used only to personalize your report.
        </p>
      </div>
    </form>
  );
}
