export function FeatureRow({
  svg,
  name,
  meta,
}: {
  readonly svg: React.ReactNode;
  readonly name: React.ReactNode;
  readonly meta: string;
}) {
  return (
    <div className="it">
      <div className="ico">{svg}</div>
      <span className="nm">{name}</span>
      <span className="n">{meta}</span>
    </div>
  );
}
