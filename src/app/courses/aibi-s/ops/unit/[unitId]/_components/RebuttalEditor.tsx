'use client';

export function RebuttalEditor({
  value,
  onChange,
  onSubmit,
  submitted,
}: {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly onSubmit: () => void;
  readonly submitted: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="block font-semibold">Your written rebuttal</label>
      <textarea
        disabled={submitted}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="w-full p-4 border rounded font-sans"
        placeholder="Address the three questions one at a time. Be specific."
      />
      {!submitted && (
        <button
          disabled={value.trim().length < 50}
          onClick={onSubmit}
          className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded disabled:opacity-40 hover:opacity-90"
        >
          Submit rebuttal — open the probe
        </button>
      )}
    </div>
  );
}
