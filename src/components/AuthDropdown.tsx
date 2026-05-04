'use client';

// AuthDropdown — client island for the authenticated user menu in the header.
// Kept as a separate file to keep AuthButton (server component) under 100 lines.

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/supabase/auth';
import { trackEvent } from '@/lib/analytics/plausible';

interface Props {
  readonly email: string;
  readonly displayName: string;
}

const MENU_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/education', label: 'Education' },
] as const;

export function AuthDropdown({ email, displayName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    trackEvent('signout');
    router.push('/');
    router.refresh();
  }

  // Initials avatar — first letter of display name, max 2 chars
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${displayName}`}
        className="flex items-center gap-2 group"
      >
        {/* Avatar circle */}
        <span className="h-8 w-8 rounded-full bg-[color:var(--color-terra)] text-[color:var(--color-linen)] flex items-center justify-center font-sans text-xs font-semibold select-none group-hover:bg-[color:var(--color-terra-light)] transition-colors">
          {initials}
        </span>
        {/* Display name — hidden on small screens */}
        <span className="hidden md:inline font-sans text-sm text-[color:var(--color-ink)]/75 group-hover:text-[color:var(--color-ink)] transition-colors max-w-[120px] truncate">
          {displayName}
        </span>
        {/* Chevron */}
        <svg
          aria-hidden="true"
          className={`w-3.5 h-3.5 text-[color:var(--color-ink)]/40 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/12 rounded-[2px] shadow-lg py-1 z-50"
        >
          {/* Identity row */}
          <div className="px-3 py-2 border-b border-[color:var(--color-ink)]/10">
            <p className="font-sans text-xs font-semibold text-[color:var(--color-ink)] truncate">
              {displayName}
            </p>
            <p className="font-sans text-xs text-[color:var(--color-slate)] truncate">{email}</p>
          </div>

          {/* Nav links */}
          {MENU_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 font-sans text-sm text-[color:var(--color-ink)]/80 hover:text-[color:var(--color-terra)] hover:bg-[color:var(--color-parch-dark)] transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {/* Sign out */}
          <div className="border-t border-[color:var(--color-ink)]/10 mt-1 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full text-left px-3 py-2 font-sans text-sm text-[color:var(--color-ink)]/60 hover:text-[color:var(--color-error)] hover:bg-[color:var(--color-parch-dark)] transition-colors disabled:opacity-50"
            >
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
