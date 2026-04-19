import Link from 'next/link';
import { opsUnits } from '../../../../content/courses/aibi-s/ops';

export default function OpsTrackPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-wider text-[color:var(--color-cobalt)]">
          AiBI-S · Prototype · /Ops track
        </p>
        <h1 className="font-serif text-5xl">Operations Specialist</h1>
        <p className="text-lg italic">
          Deploy AI to your department. Measure it. Defend it.
        </p>
      </header>

      <section>
        <h2 className="font-serif text-2xl mb-4">Phase I — Foundation</h2>
        <ul className="space-y-3">
          {Object.entries(opsUnits).map(([id, unit]) => (
            <li key={id} className="border rounded p-4 hover:border-[color:var(--color-cobalt)] transition">
              <Link href={`/aibi-s-preview/ops/unit/${id}`} className="block">
                <p className="font-mono text-xs text-[color:var(--color-ink)]/60 mb-1">Unit {id}</p>
                <p className="font-serif text-xl">{unit.title}</p>
                <p className="text-sm mt-2">{unit.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <aside className="border-l-2 border-[color:var(--color-cobalt)] pl-4 text-sm italic text-[color:var(--color-ink)]/70">
        Prototype scope: one unit available. The full /Ops track will have ~6 units across three phases, plus a capstone.
      </aside>
    </main>
  );
}
