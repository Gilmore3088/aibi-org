import { MOCKUP_FONT } from './moduleStyles';

export function SavedArtifactCard({
  keyOutput,
  isAlreadyCompleted,
}: {
  readonly keyOutput: string;
  readonly isAlreadyCompleted: boolean;
}) {
  return (
    <div
      style={{
        padding: '20px 22px',
        background: 'white',
        border: '1px solid var(--ink-a10, rgba(7,26,47,0.10))',
        borderRadius: 16,
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <p
        style={{
          fontFamily: MOCKUP_FONT,
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--ink)',
          margin: '0 0 6px',
          lineHeight: 1.5,
        }}
      >
        {keyOutput}
      </p>
      <p
        style={{
          fontFamily: MOCKUP_FONT,
          fontSize: 14,
          color: 'var(--slate-600)',
          margin: 0,
          lineHeight: 1.55,
        }}
      >
        {isAlreadyCompleted
          ? 'Saved to your library. Open the Submit step above to review or revise your response.'
          : 'Once you complete the Submit step above, your response is saved here as a reusable artifact in your library.'}
      </p>
    </div>
  );
}
