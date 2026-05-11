'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LMS_PILLARS, type LMSModule, getModuleStatus } from './types';
import { ProgressDot } from './ProgressDot';

interface Props {
  readonly modules: readonly LMSModule[];
  readonly completed: readonly number[];
  readonly current: number;
  readonly learner?: {
    readonly name: string;
    readonly role: string;
  };
}

const NAV_SECTIONS = [
  { id: 'overview', label: 'Course overview', href: '/courses/foundation/program' },
  { id: 'toolbox', label: 'Your Toolbox', href: '/dashboard/toolbox' },
] as const;

const shellStyle: React.CSSProperties = {
  background: 'var(--ledger-paper)',
  borderRight: '1px solid var(--ledger-rule)',
  minHeight: '100vh',
  position: 'sticky',
  top: 0,
  alignSelf: 'start',
  display: 'flex',
  flexDirection: 'column',
};

const brandWrap: React.CSSProperties = {
  padding: '24px 22px 20px',
  borderBottom: '1px solid var(--ledger-rule)',
};

const brandLine: React.CSSProperties = {
  fontFamily: 'var(--ledger-sans)',
  fontWeight: 700,
  fontSize: 20,
  letterSpacing: '-0.005em',
  textTransform: 'uppercase',
  lineHeight: 1,
};

export function LMSSidebar({ modules, completed, current, learner }: Props) {
  const pathname = usePathname();
  const isOverview = pathname === '/courses/foundation/program' || pathname === '/courses/foundation/program/';

  return (
    <aside
      style={shellStyle}
      className="hidden md:flex"
      data-testid="lms-sidebar"
    >
      <div style={brandWrap}>
        <div style={{ ...brandLine, color: 'var(--ledger-ink)' }}>The AI Banking</div>
        <div style={{ ...brandLine, color: 'var(--ledger-slate)', marginTop: 2 }}>
          Institute
        </div>
      </div>

      <nav style={{ padding: '14px 0 8px' }}>
        {NAV_SECTIONS.map((section) => {
          const active =
            section.id === 'overview'
              ? isOverview
              : pathname.startsWith(section.href);
          return (
            <Link
              key={section.id}
              href={section.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                background: active ? 'var(--ledger-accent-soft)' : 'transparent',
                textAlign: 'left',
                padding: '9px 16px',
                color: active ? 'var(--ledger-accent)' : 'var(--ledger-ink)',
                fontFamily: 'var(--ledger-sans)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                borderLeft: active
                  ? '2px solid var(--ledger-accent)'
                  : '2px solid transparent',
                textDecoration: 'none',
              }}
            >
              {section.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid var(--ledger-rule)', marginTop: 6 }} />

      <div style={{ padding: '10px 0 24px', overflowY: 'auto', flex: 1 }}>
        <div
          style={{
            padding: '18px 22px 10px',
            fontFamily: 'var(--ledger-sans)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '-0.005em',
            textTransform: 'uppercase',
            color: 'var(--ledger-slate)',
            lineHeight: 1,
          }}
        >
          <span style={{ color: 'var(--ledger-ink)' }}>AiBI</span> Foundation
        </div>
        {LMS_PILLARS.map((pillar) => {
          const mods = modules.filter((m) => m.pillar === pillar.id);
          if (mods.length === 0) return null;
          return (
            <div key={pillar.id} style={{ marginBottom: 14 }}>
              <div
                style={{
                  padding: '6px 22px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 1,
                    background: pillar.color,
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--ledger-sans)',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '-0.005em',
                    textTransform: 'uppercase',
                    color: 'var(--ledger-ink)',
                    lineHeight: 1,
                  }}
                >
                  {pillar.label}
                </span>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {mods.map((m) => {
                  const status = getModuleStatus(m.num, completed, current);
                  const locked = status === 'locked';
                  const href = `/courses/foundation/program/${m.num}`;
                  const active = pathname === href;
                  const interior = (
                    <>
                      <ProgressDot status={status} size={9} />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--ledger-mono)',
                            fontSize: 10,
                            color: 'var(--ledger-muted)',
                            marginRight: 6,
                          }}
                        >
                          {String(m.num).padStart(2, '0')}
                        </span>
                        {m.title}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--ledger-mono)',
                          fontSize: 9.5,
                          color: 'var(--ledger-muted)',
                        }}
                      >
                        {m.mins}m
                      </span>
                    </>
                  );
                  const sharedStyle: React.CSSProperties = {
                    display: 'grid',
                    gridTemplateColumns: '14px 1fr auto',
                    gap: 10,
                    alignItems: 'center',
                    width: '100%',
                    background: active
                      ? 'var(--ledger-accent-soft)'
                      : 'transparent',
                    textAlign: 'left',
                    padding: '7px 22px',
                    color: locked
                      ? 'rgba(14,27,45,0.35)'
                      : active
                        ? 'var(--ledger-accent)'
                        : 'var(--ledger-ink-2)',
                    fontFamily: 'var(--ledger-sans)',
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 500,
                    opacity: locked ? 0.6 : 1,
                    borderLeft: active
                      ? '2px solid var(--ledger-accent)'
                      : '2px solid transparent',
                    textDecoration: 'none',
                  };
                  return (
                    <li key={m.num}>
                      {locked ? (
                        <span
                          aria-disabled
                          title={m.title}
                          style={{ ...sharedStyle, cursor: 'not-allowed' }}
                        >
                          {interior}
                        </span>
                      ) : (
                        <Link href={href} title={m.title} style={sharedStyle}>
                          {interior}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {learner ? (
        <div
          style={{
            borderTop: '1px solid var(--ledger-rule)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--ledger-parch-dark)',
              color: 'var(--ledger-ink)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--ledger-serif)',
              fontStyle: 'italic',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {learner.name
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--ledger-serif)',
                fontSize: 14,
                lineHeight: 1.1,
                fontWeight: 500,
              }}
            >
              {learner.name}
            </div>
            <div
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 9.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ledger-muted)',
                marginTop: 2,
              }}
            >
              {learner.role}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
