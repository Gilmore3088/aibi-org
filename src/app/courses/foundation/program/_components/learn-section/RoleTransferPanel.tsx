import type { FoundationRoleTransfer } from '@content/courses/foundation-program/lab-first';
import { eyebrowStyle } from './shared';

export function RoleTransferPanel({
  transfer,
  moduleNumber,
}: {
  readonly transfer: FoundationRoleTransfer;
  readonly moduleNumber: number;
}) {
  const roleDescriptor =
    transfer.roleLabel === 'IT / InfoSec' ? transfer.roleLabel : transfer.roleLabel.toLowerCase();
  const headline =
    transfer.roleLabel === 'Your role'
      ? 'Apply this to your work.'
      : `Apply this to ${roleDescriptor} work.`;
  const items = [
    {
      label: 'Use this on',
      body: transfer.roleContext,
    },
    {
      label: 'Do the move',
      body: transfer.transferMove,
    },
    {
      label: 'Proof to save',
      body: transfer.proofToSave,
    },
  ] as const;

  return (
    <section
      aria-labelledby={`m${moduleNumber}-role-transfer-heading`}
      data-testid="foundation-role-transfer"
      className="foundation-role-transfer"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 0.34fr) minmax(0, 1fr)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        style={{
          background: 'var(--cream-2)',
          borderRight: '1px solid var(--ink-a10)',
          padding: 'clamp(18px, 2.4vw, 24px)',
        }}
      >
        <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Role transfer</p>
        <h3
          id={`m${moduleNumber}-role-transfer-heading`}
          style={{
            margin: 0,
            color: 'var(--ink)',
            fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            fontWeight: 850,
          }}
        >
          {headline}
        </h3>
      </div>

      <div
        className="foundation-role-transfer__items"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.label}
            className="foundation-role-transfer__item"
            style={{
              display: 'grid',
              gridTemplateColumns: '132px minmax(0, 1fr)',
              gap: 18,
              alignItems: 'start',
              padding: 'clamp(18px, 2.2vw, 24px)',
              borderTop: index === 0 ? 'none' : '1px solid var(--ink-a10)',
            }}
          >
            <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 10 }}>
              {item.label}
            </p>
            <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.9375rem', lineHeight: 1.5, fontWeight: 725 }}>
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
