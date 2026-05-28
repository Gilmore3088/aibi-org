// Role-aware banner shown when the visitor arrives from a
// /playbooks/<role> CTA. Honest framing: names the source playbook
// and the modules that carry that role's weight inside the course.

import type { RoleBannerCopy } from './purchaseConstants';

export function RoleBanner({ banner }: { readonly banner: RoleBannerCopy }) {
  return (
    <aside
      aria-label={`Coming from the ${banner.label} playbook`}
      style={{
        marginBottom: 24,
        background: 'var(--cream-2)',
        borderLeft: '3px solid var(--gold)',
        borderRadius: 12,
        padding: '14px 18px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
        }}
      >
        From the {banner.label} playbook
      </p>
      <p
        style={{
          margin: '4px 0 0',
          color: 'var(--ink)',
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        {banner.lede}
      </p>
    </aside>
  );
}
