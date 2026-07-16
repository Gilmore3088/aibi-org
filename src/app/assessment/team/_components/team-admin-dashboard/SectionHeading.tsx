export function SectionHeading({
  id,
  eyebrow,
  title,
}: {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
}): JSX.Element {
  return (
    <div className="section-heading">
      <p className="kicker">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </div>
  );
}
