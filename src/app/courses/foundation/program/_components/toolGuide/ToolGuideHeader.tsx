import { KICKER } from './toolGuideTokens';

export function ToolGuideHeader({
  platformLabel,
  colorVar,
  url,
  tagline,
}: {
  readonly platformLabel: string;
  readonly colorVar: string;
  readonly url: string;
  readonly tagline: string;
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--ink-a10)',
        borderRadius: 'var(--r-lg)',
        padding: 24,
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span
              style={{
                ...KICKER,
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: 999,
                background: colorVar,
                color: '#FFFFFF',
              }}
            >
              {platformLabel}
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...KICKER, color: 'var(--slate-500)', textDecoration: 'none' }}
            >
              {url.replace(/^https?:\/\//, '')} ↗
            </a>
          </div>
          <p
            style={{
              fontSize: 16,
              color: 'var(--ink)',
              fontWeight: 500,
              lineHeight: 1.4,
              maxWidth: '60ch',
              margin: 0,
            }}
          >
            {tagline}
          </p>
        </div>
      </div>
    </div>
  );
}
