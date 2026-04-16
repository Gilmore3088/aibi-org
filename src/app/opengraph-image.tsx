import { ImageResponse } from 'next/og';

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
          padding: '80px',
          background: '#f9f6f0',
          color: '#1e1a14',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: '2px solid #b5512e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: '#1e1a14',
              fontWeight: 600,
            }}
          >
            AiBI
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#b5512e',
              letterSpacing: 4,
              textTransform: 'uppercase',
            }}
          >
            The AI Banking Institute
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: '85%',
            }}
          >
            AI your people will actually use.
          </div>
          <div
            style={{
              fontSize: 44,
              color: '#b5512e',
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Turning Bankers into Builders
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 18,
            color: 'rgba(30, 26, 20, 0.55)',
            fontFamily: 'system-ui',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          <span>Accessible &nbsp;&middot;&nbsp; Boundary-Safe &nbsp;&middot;&nbsp; Capable</span>
          <span>aibankinginstitute.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
