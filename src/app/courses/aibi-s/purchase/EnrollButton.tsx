import Link from 'next/link';

interface EnrollButtonProps {
  readonly userEmail?: string;
  readonly roleTrack?: string;
  readonly cohortId?: string;
}

export function EnrollButton(_props: EnrollButtonProps) {
  return (
    <Link
      href="/coming-soon?interest=specialist"
      className="inline-block w-full bg-[color:var(--color-cobalt)] text-[color:var(--color-linen)] px-8 py-4 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] text-center hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)] focus:ring-offset-2"
    >
      Join AiBI-S Waitlist
    </Link>
  );
}
