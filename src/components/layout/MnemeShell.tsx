'use client';

import { type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { USE_MOCK } from '@/lib/env';

interface Tab { id: string; label: string; icon: string; href: string }

const STUDENT_TABS: Tab[] = [
  { id: 'home',          label: '今日',  icon: '◎', href: '/home' },
  { id: 'mastery',       label: '掌握',  icon: '◑', href: '/mastery' },
  { id: 'practice',      label: '练习',  icon: '✐', href: '/practice' },
  { id: 'error-journal', label: '错题',  icon: '◈', href: '/error-journal' },
  { id: 'essay',         label: '作文',  icon: '✎', href: '/essay' },
  { id: 'speaking',      label: '口语',  icon: '◉', href: '/speaking' },
  { id: 'socratic',      label: '对话',  icon: '◌', href: '/socratic' },
];

const PARENT_TABS: Tab[] = [
  { id: 'overview', label: '成长', icon: '◑', href: '/parent/overview' },
  { id: 'alerts',   label: '预警', icon: '◉', href: '/parent/alerts' },
];

function activeId(pathname: string, depth = 0) {
  return pathname.split('/').filter(Boolean)[depth] ?? '';
}

function Shell({
  children,
  tabs,
  title,
  depth = 0,
}: {
  children: ReactNode;
  tabs: Tab[];
  title: string;
  depth?: number;
}) {
  const router   = useRouter();
  const pathname = usePathname() ?? '/';
  const active   = activeId(pathname, depth);

  return (
    <div style={{ background: 'var(--mn-paper)', minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(248,246,242,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--mn-border)',
        padding: '0 16px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--mn-ink)' }}>
          {title}
        </span>
        {USE_MOCK && (
          <span style={{
            fontSize: '10px', fontWeight: 600, padding: '2px 7px',
            borderRadius: '99px', letterSpacing: '0.04em',
            background: 'var(--mn-amber-dim)',
            color: 'var(--mn-amber)',
            border: '1px solid #f5c060',
          }}>
            MOCK
          </span>
        )}
      </header>

      {/* Scrollable content */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <div style={{
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          padding: '20px 16px',
        }}>
          {children}
        </div>
      </main>

      {/* Bottom tab bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(248,246,242,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--mn-border)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 4px)',
      }}>
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => router.push(tab.href)}
              className={`mn-tab-btn${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

export function MnemeShell({ children }: { children: ReactNode }) {
  return <Shell tabs={STUDENT_TABS} title="学鉴" depth={0}>{children}</Shell>;
}

export function ParentShell({ children }: { children: ReactNode }) {
  return <Shell tabs={PARENT_TABS} title="学鉴 · 家长" depth={1}>{children}</Shell>;
}
