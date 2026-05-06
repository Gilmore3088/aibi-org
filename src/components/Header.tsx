import Link from 'next/link';
import { AibiSeal } from './AibiSeal';
import { AuthButton } from './AuthButton';
import { MobileNav } from './MobileNav';

// Four-verb platform spine — each verb maps to its primary product surface.
// Replaces the previous "For Learners / For Institutions / Resources" model
// per the 2026-05-06 momentum-first restructure plan.
const NAV_LINKS = [
  { href: '/assessment', label: 'Assess' },
  { href: '/courses/aibi-p', label: 'Learn' },
  { href: '/dashboard/toolbox', label: 'Apply' },
  { href: '/for-institutions', label: 'Lead' },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)]/[0.97] backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          aria-label="The AI Banking Institute — Home"
          className="flex items-center gap-3 text-[color:var(--color-ink)] group"
        >
          <span className="text-[color:var(--color-ink)] group-hover:text-[color:var(--color-terra)] transition-colors">
            <AibiSeal size={40} />
          </span>
          <span className="font-serif-sc text-lg text-[color:var(--color-ink)] hidden sm:inline">
            The AI Banking Institute
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-3 lg:gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-serif-sc text-xs uppercase text-[color:var(--color-ink)]/75 hover:text-[color:var(--color-terra)] transition-colors hidden lg:inline"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/assessment"
            className="font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-4 py-2 hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all hidden xl:inline-block"
          >
            See where you stand
          </Link>
          <AuthButton />
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}
