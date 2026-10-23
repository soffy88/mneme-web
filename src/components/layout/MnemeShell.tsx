'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { USE_MOCK } from '@/lib/env';
import { getUser } from '@/lib/auth-store';

interface Tab { id: string; label: string; icon: string; href: string }

// 底栏精简到 5 个核心 tab（移动优先）。作文/口语收进「学科」，对话从错题/练习内进入。
const STUDENT_TABS: Tab[] = [
  { id: 'home',          label: '今日',  icon: '◎', href: '/home' },
  { id: 'practice',      label: '练习',  icon: '✐', href: '/practice' },
  { id: 'error-journal', label: '错题',  icon: '◈', href: '/error-journal' },
  { id: 'mastery',       label: '掌握',  icon: '◑', href: '/mastery' },
  { id: 'subjects',      label: '学科',  icon: '⊞', href: '/subjects' },
];

// 学习工作区（收编自 mneme-studio）：桌面侧栏单独一组，移动端从侧栏入口/活书内联进入。
const WORKSPACE_TABS: Tab[] = [
  { id: 'learn',     label: '学习',  icon: '◉', href: '/learn' },
  { id: 'solve',     label: '解题',  icon: '∑', href: '/solve' },
  { id: 'visualize', label: '图示',  icon: '▦', href: '/visualize' },
  { id: 'book',      label: '活书',  icon: '▤', href: '/book' },
];

const PARENT_TABS: Tab[] = [
  { id: 'overview', label: '成长', icon: '◑', href: '/parent/overview' },
  { id: 'alerts',   label: '预警', icon: '◉', href: '/parent/alerts' },
];

/** 桌面断点：≥1024px 用左侧栏全屏布局，否则保持移动端底部 Tab。 */
const DESKTOP_QUERY = '(min-width: 1024px)';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

function activeId(pathname: string, depth = 0) {
  return pathname.split('/').filter(Boolean)[depth] ?? '';
}

function Brand({ title }: { title: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="" style={{ height: '30px', width: 'auto', display: 'block', borderRadius: '7px' }} />
      <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--mn-ink)' }}>
        {title}
      </span>
    </span>
  );
}

function SideLink({ tab, active, onNavigate }: { tab: Tab; active: boolean; onNavigate: (href: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(tab.href)}
      className={`mn-side-link${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      <span style={{ fontSize: '17px', lineHeight: 1, width: '22px', textAlign: 'center' }}>{tab.icon}</span>
      <span>{tab.label}</span>
    </button>
  );
}

function Shell({
  children,
  tabs,
  title,
  depth = 0,
  showWorkspace = false,
}: {
  children: ReactNode;
  tabs: Tab[];
  title: string;
  depth?: number;
  showWorkspace?: boolean;
}) {
  const router   = useRouter();
  const pathname = usePathname() ?? '/';
  const active   = activeId(pathname, depth);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  // 家长身份给 /parent 入口（useEffect 读 localStorage，避免 SSR/hydration 不一致）
  const [isParent, setIsParent] = useState(false);
  useEffect(() => { setIsParent(getUser()?.role === 'parent'); }, []);

  const navigate = (href: string) => router.push(href);

  // ── 桌面：左侧栏 + 内容区 100% 宽 ────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ background: 'var(--mn-paper)', minHeight: '100svh', display: 'flex' }}>
        {/* Left sidebar（sticky 满高，桌面导航主入口） */}
        <aside style={{
          width: 232, flexShrink: 0,
          position: 'sticky', top: 0, height: '100svh',
          background: 'var(--mn-surface)',
          borderRight: '1px solid var(--mn-border)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '16px 18px 10px', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Brand title={title} />
          </div>

          <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tabs.map((tab) => (
              <SideLink key={tab.id} tab={tab} active={active === tab.id} onNavigate={navigate} />
            ))}

            {showWorkspace && (
              <>
                <div style={{
                  margin: '14px 10px 4px', fontSize: '11px', fontWeight: 600,
                  letterSpacing: '0.06em', color: 'var(--mn-ink-3)', textTransform: 'uppercase',
                }}>
                  学习工具
                </div>
                {WORKSPACE_TABS.map((tab) => (
                  <SideLink key={tab.id} tab={tab} active={active === tab.id} onNavigate={navigate} />
                ))}
              </>
            )}
          </nav>

          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--mn-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {USE_MOCK && (
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 7px', alignSelf: 'flex-start',
                borderRadius: '99px', letterSpacing: '0.04em',
                background: 'var(--mn-amber-dim)', color: 'var(--mn-amber)', border: '1px solid #f5c060',
              }}>
                MOCK
              </span>
            )}
            {isParent && !pathname.startsWith('/parent') && (
              <button
                type="button"
                onClick={() => navigate('/parent/overview')}
                style={{
                  fontSize: '13px', fontWeight: 600, padding: '8px 12px', width: '100%',
                  borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                  background: 'var(--mn-blue-dim)', color: 'var(--mn-blue)',
                  border: '1px solid var(--mn-border)',
                }}
              >
                家长端 ›
              </button>
            )}
          </div>
        </aside>

        {/* Content：真实 100% 宽，两侧只留呼吸边距 */}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <div style={{ width: '100%', padding: '24px 32px 48px' }}>
            {children}
          </div>
        </main>
      </div>
    );
  }

  // ── 移动端：顶栏 + 底部 Tab（保持原样，内容 100% 宽） ────────────────────
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
        <Brand title={title} />
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          {isParent && !pathname.startsWith('/parent') && (
            <button
              type="button"
              onClick={() => navigate('/parent/overview')}
              style={{
                fontSize: '12px', fontWeight: 600, padding: '4px 10px',
                borderRadius: '99px', cursor: 'pointer',
                background: 'var(--mn-blue-dim)', color: 'var(--mn-blue)',
                border: '1px solid var(--mn-border)',
              }}
            >
              家长端 ›
            </button>
          )}
        </span>
      </header>

      {/* Scrollable content */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <div style={{ width: '100%', padding: '20px 16px' }}>
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
              onClick={() => navigate(tab.href)}
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
  return <Shell tabs={STUDENT_TABS} title="善学记" depth={0} showWorkspace>{children}</Shell>;
}

export function ParentShell({ children }: { children: ReactNode }) {
  return <Shell tabs={PARENT_TABS} title="善学记 · 家长" depth={1}>{children}</Shell>;
}
