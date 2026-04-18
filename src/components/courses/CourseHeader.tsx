// CourseHeader — shared sticky colored header band for all course types
// Server Component: no interactivity needed

interface CourseHeaderMeta {
  readonly label: string;
  readonly value: string;
}

interface CourseHeaderProps {
  readonly unitLabel: string;
  readonly unitNumber: number;
  readonly title: string;
  readonly accentColor: string;
  readonly meta?: readonly CourseHeaderMeta[];
}

export function CourseHeader({
  unitLabel,
  unitNumber,
  title,
  accentColor,
  meta,
}: CourseHeaderProps) {
  const formattedNumber = String(unitNumber).padStart(2, '0');

  return (
    <header
      className="sticky top-[70px] z-40 w-full px-8 py-4"
      style={{ backgroundColor: accentColor }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">
            {unitLabel} {formattedNumber}
          </span>
          <h1 className="font-serif italic text-2xl lg:text-3xl text-white leading-tight">
            {title}
          </h1>
        </div>

        {meta && meta.length > 0 && (
          <div className="flex items-center gap-6">
            {meta.map((item) => (
              <span
                key={item.label}
                className="font-mono text-[10px] tracking-widest text-white/60 uppercase"
              >
                {item.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
