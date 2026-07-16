import { SLATE_500 } from './constants';

export function Footer({ profileId, email }: { profileId: string; email: string }): JSX.Element {
  return (
    <div
      style={{
        padding: '24px 30px 60px',
        color: SLATE_500,
        fontSize: '0.75rem',
        textAlign: 'center',
      }}
    >
      Report for {email} · permalink:{' '}
      <code style={{ fontFamily: 'ui-monospace, monospace' }}>/{profileId.slice(0, 8)}</code> · The
      AI Banking Institute
    </div>
  );
}
