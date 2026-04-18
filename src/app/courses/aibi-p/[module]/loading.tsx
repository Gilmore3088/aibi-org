export default function ModuleLoading() {
  return (
    <div className="mx-auto px-8 lg:px-16 py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="h-32 bg-[color:var(--color-parch-dark)] rounded-sm mb-8" />

      {/* Content skeleton lines */}
      <div className="space-y-4">
        <div className="h-4 bg-[color:var(--color-parch-dark)] rounded-sm w-3/4" />
        <div className="h-4 bg-[color:var(--color-parch-dark)] rounded-sm w-full" />
        <div className="h-4 bg-[color:var(--color-parch-dark)] rounded-sm w-5/6" />
        <div className="h-4 bg-[color:var(--color-parch-dark)] rounded-sm w-2/3" />
      </div>

      {/* Table skeleton */}
      <div className="mt-12 h-48 bg-[color:var(--color-parch-dark)] rounded-sm" />

      {/* Activity skeleton */}
      <div className="mt-12 h-36 bg-[color:var(--color-parch-dark)] rounded-sm" />
    </div>
  );
}
