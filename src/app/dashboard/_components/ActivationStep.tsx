import Link from 'next/link';

export function ActivationStep({
  n,
  done,
  now,
  text,
  meta,
  href,
}: {
  readonly n: number;
  readonly done: boolean;
  readonly now: boolean;
  readonly text: React.ReactNode;
  readonly meta: string;
  readonly href?: string;
}) {
  const cls = done ? 'step done' : now ? 'step now' : 'step locked';
  const body = (
    <>
      <span className="pn">{done ? '✓' : n}</span>
      <span className="t">{text}</span>
      <span className="meta">{meta}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {body}
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}
