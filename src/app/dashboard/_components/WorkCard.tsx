import Link from 'next/link';

export function WorkCard({
  kicker,
  value,
  label,
  href,
  action,
}: {
  readonly kicker: string;
  readonly value: string;
  readonly label: string;
  readonly href: string;
  readonly action: string;
}) {
  return (
    <Link href={href} className="work-card">
      <span className="work-kicker">{kicker}</span>
      <span className="work-value">{value}</span>
      <span className="work-label">{label}</span>
      <span className="work-action">
        {action} <span className="arrow">→</span>
      </span>
    </Link>
  );
}
