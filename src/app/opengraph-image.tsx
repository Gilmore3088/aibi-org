import { ImageResponse } from 'next/og';

// Open Graph image — 1200×630, served at /opengraph-image (Next.js convention).
// Rendered via @vercel/og at the edge so it has zero static asset size.
//
// Ledger palette (matches src/styles/tokens-ledger.css):
//   --ledger-bg     #ECE9DF (linen)
//   --ledger-paper  #F4F1E7
//   --ledger-ink    #0E1B2D
//   --ledger-accent #B5862A (gold)
//   --ledger-muted  #5C6B82
//
// Rules:
//   - Wordmark only (no circular seal — retired 2026-05-09).
//   - Newsreader fallback to Georgia at edge runtime (no custom font load
//     to keep cold-start cheap).
//   - Drop the retired "A-B-C of AI Banking" tagline.
//   - Tagline "Turning Bankers into Builders" stays.

export const runtime = 'edge';
export const alt = 'The AI Banking Institute — Turning Bankers into Builders';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 84px',
          background: '#ECE9DF',
          color: '#0E1B2D',
          fontFamily: 'Georgia, "Newsreader", serif',
        }}
      >
        {/* Top: two-line wordmark + thin gold rule */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: 'system-ui, "Geist", -apple-system, sans-serif',
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 0,
              textTransform: 'uppercase',
              lineHeight: 1,
              color: '#0E1B2D',
            }}
          >
            THE AI BANKING
          </div>
          <div
            style={{
              fontFamily: 'system-ui, "Geist", -apple-system, sans-serif',
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 0,
              textTransform: 'uppercase',
              lineHeight: 1,
              color: '#8C95A8',
            }}
          >
            INSTITUTE
          </div>
        </div>

        {/* Middle: big serif statement with italic gold accent */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div
            style={{
              fontFamily: 'Georgia, "Newsreader", serif',
              fontWeight: 500,
              fontSize: 104,
              lineHeight: 1.0,
              letterSpacing: '-0.025em',
              color: '#0E1B2D',
              maxWidth: '88%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Turning Bankers</span>
            <span>
              into{' '}
              <span
                style={{
                  fontStyle: 'italic',
                  color: '#B5862A',
                }}
              >
                Builders.
              </span>
            </span>
          </div>
        </div>

        {/* Bottom: kicker + domain */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, monospace',
            fontSize: 18,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: '#5C6B82' }}>
            AI proficiency for community banks &amp; credit unions
          </span>
          <span style={{ color: '#B5862A' }}>aibankinginstitute.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
