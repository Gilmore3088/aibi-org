'use client';

// DownloadSkillButton — client component that reconstructs and triggers a .md download
// from skill field data stored in the activity response.
// Used on the toolkit page where the Server Component cannot trigger browser downloads.

interface DownloadSkillButtonProps {
  readonly mdContent: string;
  readonly filename: string;
  readonly label?: string;
}

export function DownloadSkillButton({
  mdContent,
  filename,
  label = 'Download',
}: DownloadSkillButtonProps) {
  function handleDownload() {
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        border: '1px solid var(--ink-a10)',
        background: 'var(--cream)',
        color: 'var(--ink)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'background-color var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease)',
      }}
      aria-label={`Download ${filename}`}
    >
      <svg style={{ width: 12, height: 12 }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
      {label.toUpperCase()}
    </button>
  );
}
