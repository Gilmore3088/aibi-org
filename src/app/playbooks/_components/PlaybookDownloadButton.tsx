export interface PlaybookDownloadButtonProps {
  readonly role: string;
  readonly roleTitle: string;
}

export function PlaybookDownloadButton({
  role,
  roleTitle,
}: PlaybookDownloadButtonProps) {
  return (
    <a
      className="mk-btn mk-btn-ghost-dark mk-btn-lg"
      href={`/api/resources/${role}-playbook/download`}
    >
      Download {roleTitle} PDF
    </a>
  );
}
