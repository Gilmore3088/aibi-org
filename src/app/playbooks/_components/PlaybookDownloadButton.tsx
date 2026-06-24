import { FreeResourceDownloadGate } from '@/components/resources/FreeResourceDownloadGate';

export interface PlaybookDownloadButtonProps {
  readonly role: string;
  readonly roleTitle: string;
}

export function PlaybookDownloadButton({
  role,
  roleTitle,
}: PlaybookDownloadButtonProps) {
  return (
    <FreeResourceDownloadGate
      title={`${roleTitle} Playbook`}
      href={`/api/resources/${role}-playbook/download`}
      slug={`${role}-playbook`}
      source="playbook-page"
      actionLabel="Get PDF"
      capturedLabel="Download PDF"
      buttonClassName="mk-btn mk-btn-ghost-dark mk-btn-lg"
    >
      Download {roleTitle} PDF
    </FreeResourceDownloadGate>
  );
}
