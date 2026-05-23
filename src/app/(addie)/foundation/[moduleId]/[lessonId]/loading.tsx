// Lesson loading skeleton — bare hairlines, no shimmer (motion §4.4).

export default function LessonLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="h-3 w-40 bg-[var(--ledger-parch)] rounded-[2px] mb-3" />
      <div className="h-8 w-3/4 bg-[var(--ledger-parch)] rounded-[2px] mb-5" />
      <div className="h-px bg-[var(--ledger-rule)] mb-6" />
      <div className="space-y-3">
        <div className="h-4 bg-[var(--ledger-parch)] rounded-[2px]" />
        <div className="h-4 bg-[var(--ledger-parch)] rounded-[2px] w-5/6" />
        <div className="h-4 bg-[var(--ledger-parch)] rounded-[2px] w-2/3" />
      </div>
    </div>
  );
}
