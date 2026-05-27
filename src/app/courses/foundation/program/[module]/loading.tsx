// Module page loading skeleton — mockup design system (Wave 1, 2026-05-27).
// Mirrors the ported module page shape: kicker + headline, ribbon meta,
// content card, table, activity card. Uses cream/slate surfaces with the
// mockup radii (16/24px).

export default function ModuleLoading() {
  return (
    <div className="mx-auto px-8 lg:px-16 py-8 animate-pulse" aria-hidden="true">
      {/* Kicker line */}
      <div className="h-3 w-32 bg-[color:var(--slate-200)] rounded-xl mb-4" />

      {/* Headline */}
      <div className="h-10 bg-[color:var(--slate-200)] rounded-2xl w-3/4 mb-4" />

      {/* Lede */}
      <div className="h-4 bg-[color:var(--slate-100)] rounded-xl w-2/3 mb-8" />

      {/* Meta ribbon */}
      <div className="h-12 bg-[color:var(--cream-2)] rounded-2xl w-full mb-12" />

      {/* Content card */}
      <div className="rounded-3xl border border-[color:var(--ink-a10)] bg-white p-8 mb-12">
        <div className="space-y-4">
          <div className="h-4 bg-[color:var(--slate-100)] rounded-xl w-3/4" />
          <div className="h-4 bg-[color:var(--slate-100)] rounded-xl w-full" />
          <div className="h-4 bg-[color:var(--slate-100)] rounded-xl w-5/6" />
          <div className="h-4 bg-[color:var(--slate-100)] rounded-xl w-2/3" />
        </div>
      </div>

      {/* Table card */}
      <div className="h-48 bg-[color:var(--slate-100)] rounded-2xl mb-12" />

      {/* Activity card */}
      <div className="h-36 bg-[color:var(--cream-2)] rounded-3xl" />
    </div>
  );
}
