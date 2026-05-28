import Link from 'next/link';
import { SectionCard } from './SectionCard';
import { PLATFORM_LABELS, ACCESS_LABELS } from './toolkitConstants';

export function SubscriptionInventoryDetail({
  inventoryResponse,
}: {
  readonly inventoryResponse: Record<string, string>;
}) {
  return (
    <SectionCard title="Subscription inventory detail" label="Module 2 baseline">
      <p
        style={{
          fontSize: 13,
          color: 'var(--slate-500)',
          marginBottom: 16,
          lineHeight: 1.55,
        }}
      >
        Recorded during Module 2. Update by revisiting{' '}
        <Link
          href="/courses/foundation/program/2"
          style={{
            color: 'var(--ink)',
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          Module 2
        </Link>
        .
      </p>
      <div style={{ display: 'grid', gap: 0 }}>
        {Object.entries(PLATFORM_LABELS).map(([fieldId, platformName], i, arr) => {
          const rawValue = inventoryResponse[fieldId] ?? '';
          const displayValue = ACCESS_LABELS[rawValue] ?? rawValue;
          return (
            <div
              key={fieldId}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                padding: '10px 0',
                borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--ink-a10)',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  flex: '0 0 220px',
                }}
              >
                {platformName}
              </span>
              <span style={{ fontSize: 14, color: 'var(--slate-500)' }}>
                {displayValue || 'No selection recorded'}
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
