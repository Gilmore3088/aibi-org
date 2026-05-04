import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'The AI Banking Institute — AI proficiency for community banks and credit unions';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COLORS = {
  linen: '#f9f6f0',
  parch: '#f5f0e6',
  ink: '#1e1a14',
  terra: '#b5512e',
  inkSubtle: 'rgba(30, 26, 20, 0.65)',
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: COLORS.linen,
          color: COLORS.ink,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        <div style={{ height: 8, width: '100%', background: COLORS.terra }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '36px 60px',
            borderBottom: `1px solid ${COLORS.inkSubtle}`,
            opacity: 0.95,
          }}
        >
          <svg width="44" height="44" viewBox="0 0 64 64" style={{ marginRight: 16 }}>
            <circle cx="32" cy="32" r="30" fill="none" stroke={COLORS.ink} strokeWidth="1.5" />
            <circle cx="32" cy="32" r="25" fill="none" stroke={COLORS.ink} strokeWidth="0.5" />
            <text
              x="32"
              y="40"
              fontFamily="serif"
              fontSize="18"
              fontWeight="600"
              fill={COLORS.ink}
              textAnchor="middle"
            >
              AiBI
            </text>
          </svg>
          <span style={{ fontSize: 24, letterSpacing: -0.5 }}>The AI Banking Institute</span>
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'monospace',
              fontSize: 16,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: COLORS.inkSubtle,
            }}
          >
            Coming soon
          </span>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 60px',
          }}
        >
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 18,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: COLORS.terra,
              marginBottom: 28,
            }}
          >
            AI proficiency
          </div>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 1000,
              fontWeight: 400,
            }}
          >
            For community banks and credit unions.
          </div>
          <div
            style={{
              marginTop: 36,
              fontFamily: 'sans-serif',
              fontSize: 26,
              lineHeight: 1.45,
              color: COLORS.inkSubtle,
              maxWidth: 920,
            }}
          >
            Readiness assessment · practitioner education · enterprise rollout · advisory.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '32px 60px',
            borderTop: `1px solid ${COLORS.inkSubtle}`,
            fontFamily: 'monospace',
            fontSize: 16,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: COLORS.inkSubtle,
          }}
        >
          <span>AIBankingInstitute.com</span>
          <span>Get notified · /coming-soon</span>
        </div>

        <div style={{ height: 8, width: '100%', background: COLORS.terra }} />
      </div>
    ),
    size,
  );
}
