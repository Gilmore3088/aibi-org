'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function normalizeCertificateId(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function VerifyLookupForm() {
  const router = useRouter();
  const [certificateId, setCertificateId] = useState('');
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeCertificateId(certificateId);

    if (normalized.length < 8) {
      setError('Enter the certificate ID printed on the credential.');
      return;
    }

    router.push(`/verify/${encodeURIComponent(normalized)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'grid',
        gap: 14,
        width: '100%',
        maxWidth: 520,
      }}
    >
      <label
        htmlFor="certificate-id"
        style={{
          display: 'grid',
          gap: 8,
          fontFamily: 'var(--font-inter)',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--ink)',
        }}
      >
        Certificate ID
        <input
          id="certificate-id"
          name="certificateId"
          autoComplete="off"
          value={certificateId}
          placeholder="AIBIP-2026-ABC234"
          onChange={(event) => {
            setCertificateId(event.target.value);
            setError(null);
          }}
          style={{
            minHeight: 52,
            border: '1px solid var(--ink-a10)',
            borderRadius: 12,
            padding: '0 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: 15,
            color: 'var(--ink)',
            background: '#fff',
            textTransform: 'uppercase',
          }}
        />
      </label>
      {error ? (
        <p
          role="alert"
          style={{
            margin: 0,
            color: '#B42318',
            fontFamily: 'var(--font-inter)',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        style={{
          minHeight: 52,
          border: 0,
          borderRadius: 12,
          background: 'var(--ink)',
          color: 'var(--cream)',
          fontFamily: 'var(--font-inter)',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Verify Certificate
      </button>
    </form>
  );
}
