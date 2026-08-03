'use client';

/**
 * 交互式康奈尔笔记播放器。
 * 进度 localStorage + 可选云同步；自报 ✓ ≠ 系统掌握度（Master 红线）。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichText } from '@/components/shared/RichText';
import type { CornellContent, CornellState } from '@/lib/cornell/types';
import {
  deleteCloud,
  isAutoPushEnabled,
  pullAndMerge,
  pushState,
  setAutoPushEnabled,
} from '@/lib/cornell/cloud';
import { getUserId } from '@/lib/auth-store';
import {
  CornellMergeError,
  loadState,
  mergeCornellState,
  parseIncomingState,
  progressStats,
  resetState,
  saveState,
} from '@/lib/cornell/state';

type Props = {
  content: CornellContent;
};

const btnBase: React.CSSProperties = {
  fontSize: 13,
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid var(--mn-border)',
  background: 'var(--mn-surface)',
  color: 'var(--mn-ink-2)',
  cursor: 'pointer',
  fontWeight: 500,
};

const btnActive: React.CSSProperties = {
  ...btnBase,
  border: '1.5px solid var(--mn-blue-light)',
  background: 'var(--mn-blue-dim)',
  color: 'var(--mn-blue)',
  fontWeight: 700,
};

export default function CornellPlayer({ content }: Props) {
  const router = useRouter();
  const [state, setState] = useState<CornellState>(() =>
    loadState(content.topicId, content.version),
  );
  const [activeCue, setActiveCue] = useState<string | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [syncMsg, setSyncMsg] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [autoPush, setAutoPush] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAutoPush(isAutoPushEnabled());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = loadState(content.topicId, content.version);
      if (!cancelled) setState(local);
      // 登录则尝试拉云端并合并
      if (getUserId()) {
        const r = await pullAndMerge(local);
        if (!cancelled && r?.ok) setState(r.state);
      }
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [content.topicId, content.version]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 720px)');
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const cueIds = useMemo(() => content.cues.map((c) => c.id), [content.cues]);
  const stats = progressStats(state, cueIds);

  const scheduleAutoPush = useCallback((s: CornellState) => {
    if (!isAutoPushEnabled() || !getUserId()) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      void pushState(s).then((r) => {
        if (r.ok) setState(r.state);
      });
    }, 800);
  }, []);

  const persist = useCallback(
    (next: CornellState) => {
      const saved = saveState(next);
      setState(saved);
      scheduleAutoPush(saved);
    },
    [scheduleAutoPush],
  );

  const onCueClick = (cueId: string, mod: string) => {
    setActiveCue(cueId);
    // 展开目标模块
    if (state.collapsed[mod]) {
      const collapsed = { ...state.collapsed };
      delete collapsed[mod];
      persist({ ...state, collapsed });
    }
    if (typeof document !== 'undefined') {
      document.getElementById(mod)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const toggleMaster = (cueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const mastered = { ...state.mastered };
    if (mastered[cueId]) delete mastered[cueId];
    else mastered[cueId] = true;
    persist({ ...state, mastered });
  };

  const toggleCollapse = (modId: string) => {
    const collapsed = { ...state.collapsed };
    if (collapsed[modId]) delete collapsed[modId];
    else collapsed[modId] = true;
    persist({ ...state, collapsed });
  };

  const collapseAll = (collapse: boolean) => {
    if (!collapse) {
      persist({ ...state, collapsed: {} });
      return;
    }
    const collapsed: Record<string, boolean> = {};
    for (const m of content.modules) collapsed[m.id] = true;
    persist({ ...state, collapsed });
  };

  const clearHighlight = () => setActiveCue(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cornell_${content.topicId}_progress.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSyncMsg('已下载进度文件');
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
      setSyncMsg('已复制到剪贴板');
    } catch {
      setSyncMsg('复制失败，请改用导出文件');
    }
  };

  const doImport = () => {
    try {
      const incoming = parseIncomingState(importText);
      const merged = mergeCornellState(state, incoming);
      persist(merged);
      setSyncMsg('导入成功（并集合并）');
      setImportText('');
    } catch (err) {
      setSyncMsg(err instanceof CornellMergeError ? err.message : '导入失败');
    }
  };

  const doReset = () => {
    if (!confirm('确定清除本课题的本地进度？不可恢复（除非你已导出）。')) return;
    setState(resetState(content.topicId, content.version));
    setActiveCue(null);
    setSyncMsg('已重置本地进度');
  };

  const doCloudPull = async () => {
    setCloudBusy(true);
    setSyncMsg('');
    try {
      const r = await pullAndMerge(state);
      if (r === null) {
        setSyncMsg('云端暂无此课题进度');
      } else if (r.ok) {
        setState(r.state);
        setSyncMsg('已从云端拉取并合并到本地');
      } else {
        setSyncMsg(r.unauthorized ? '请先登录后再云同步' : `拉取失败：${r.error}`);
      }
    } finally {
      setCloudBusy(false);
    }
  };

  const doCloudPush = async () => {
    setCloudBusy(true);
    setSyncMsg('');
    try {
      const r = await pushState(state);
      if (r.ok) {
        setState(r.state);
        setSyncMsg('已推送到云端（并集合并）');
      } else {
        setSyncMsg(r.unauthorized ? '请先登录后再云同步' : `推送失败：${r.error}`);
      }
    } finally {
      setCloudBusy(false);
    }
  };

  const doCloudDelete = async () => {
    if (!confirm('删除云端进度？本机 localStorage 不受影响。')) return;
    setCloudBusy(true);
    setSyncMsg('');
    try {
      const r = await deleteCloud(content.topicId);
      setSyncMsg(r.ok ? '已删除云端进度' : `删除失败：${r.error}`);
    } finally {
      setCloudBusy(false);
    }
  };

  const toggleAutoPush = () => {
    const next = !autoPush;
    setAutoPush(next);
    setAutoPushEnabled(next);
    setSyncMsg(next ? '已开启自动推送（需登录）' : '已关闭自动推送');
  };

  const activeMod = activeCue
    ? content.cues.find((c) => c.id === activeCue)?.mod
    : null;

  if (!hydrated) {
    return (
      <div style={{ padding: 24, color: 'var(--mn-ink-3)', fontSize: 14 }}>加载中…</div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '16px 14px 48px',
        background: 'var(--mn-paper)',
        minHeight: '100%',
      }}
    >
      {/* 顶栏工具 */}
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => router.push('/subjects/math/cornell')}
          style={{ ...btnBase, marginBottom: 10, padding: '4px 10px', fontSize: 12 }}
        >
          ← 课题列表
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          <button
            type="button"
            style={state.selfTest ? btnActive : btnBase}
            onClick={() => persist({ ...state, selfTest: !state.selfTest })}
            title="隐藏笔记栏，闭卷回忆"
          >
            {state.selfTest ? '退出自测' : '自测模式'}
          </button>
          <button
            type="button"
            style={state.showAnswers ? btnActive : btnBase}
            onClick={() => persist({ ...state, showAnswers: !state.showAnswers })}
          >
            {state.showAnswers ? '隐藏提示' : '显示提示'}
          </button>
          <button type="button" style={btnBase} onClick={() => collapseAll(true)}>
            全部折叠
          </button>
          <button type="button" style={btnBase} onClick={() => collapseAll(false)}>
            全部展开
          </button>
          <button type="button" style={btnBase} onClick={clearHighlight}>
            清除高亮
          </button>
          <button type="button" style={btnBase} onClick={() => { setSyncOpen(true); setSyncMsg(''); }}>
            同步
          </button>
          <button type="button" style={btnBase} onClick={doReset}>
            重置
          </button>
        </div>

        {/* 进度条 */}
        <div style={{ marginBottom: 4, fontSize: 12, color: 'var(--mn-ink-2)' }}>
          自报进度 {stats.mastered} / {stats.total}
          <span style={{ color: 'var(--mn-ink-3)', marginLeft: 8 }}>
            （自认为能答出 · ≠ 系统掌握度）
          </span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 99,
            background: 'var(--mn-surface-2)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.round(stats.ratio * 100)}%`,
              background: 'linear-gradient(90deg, var(--mn-blue-light), var(--mn-green))',
              transition: 'width 200ms var(--mn-ease-out)',
            }}
          />
        </div>
      </div>

      {/* 标题卡 */}
      <header
        style={{
          background: 'var(--mn-surface)',
          border: '1px solid var(--mn-border)',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 12,
          boxShadow: 'var(--mn-shadow-xs)',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--mn-ink-3)', marginBottom: 4 }}>
          康奈尔笔记 · {content.dateLabel ?? '概念检索'}
          {content.subjectLabel ? ` · ${content.subjectLabel}` : ''}
          {content.grade ? ` · ${content.grade}` : ''}
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--mn-blue)' }}>
          {content.title}
        </h1>
        {content.subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--mn-ink-2)' }}>
            {content.subtitle}
          </p>
        )}
      </header>

      {/* 主区：线索 + 笔记 */}
      <div
        style={{
          display: 'grid',
          // 宽屏：线索栏固定宽 + 笔记；窄屏/自测单列
          gridTemplateColumns:
            state.selfTest || narrow ? '1fr' : 'minmax(220px, 280px) minmax(0, 1fr)',
          gap: 12,
          alignItems: 'start',
        }}
      >
        {/* 线索栏 */}
        <aside
          style={{
            background: 'var(--mn-surface)',
            border: '1px solid var(--mn-border)',
            borderRadius: 12,
            padding: '12px 10px',
            boxShadow: 'var(--mn-shadow-xs)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--mn-blue)',
              marginBottom: 8,
              padding: '0 4px',
            }}
          >
            线索栏 · 提问
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {content.cues.map((cue, i) => {
              const isActive = activeCue === cue.id;
              const isMastered = !!state.mastered[cue.id];
              return (
                <li key={cue.id} style={{ marginBottom: 6 }}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onCueClick(cue.id, cue.mod)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onCueClick(cue.id, cue.mod);
                      }
                    }}
                    style={{
                      display: 'flex',
                      gap: 6,
                      alignItems: 'flex-start',
                      padding: '8px 8px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: isActive ? 'var(--mn-blue-dim)' : 'transparent',
                      border: isActive
                        ? '1px solid var(--mn-blue-light)'
                        : '1px solid transparent',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--mn-ink-3)',
                        minWidth: 18,
                        marginTop: 2,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--mn-ink)', lineHeight: 1.45 }}>
                        <RichText>{cue.text}</RichText>
                      </div>
                      {state.showAnswers && cue.hint && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 12,
                            color: 'var(--mn-orange)',
                            lineHeight: 1.4,
                          }}
                        >
                          提示：<RichText>{cue.hint}</RichText>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={isMastered ? '取消掌握' : '标记掌握'}
                      onClick={(e) => toggleMaster(cue.id, e)}
                      style={{
                        flexShrink: 0,
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: isMastered
                          ? '1.5px solid var(--mn-green)'
                          : '1px solid var(--mn-border)',
                        background: isMastered ? 'var(--mn-green-dim)' : 'var(--mn-surface-2)',
                        color: isMastered ? 'var(--mn-green)' : 'var(--mn-ink-3)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: 14,
                      }}
                    >
                      ✓
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* 笔记栏 */}
        {!state.selfTest && (
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              // 宽屏时笔记栏吃满剩余列；auto-fit 下与线索等宽堆叠
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--mn-blue)',
                padding: '0 4px',
              }}
            >
              笔记栏 · 记录
            </div>
            {content.modules.map((mod) => {
              const collapsed = !!state.collapsed[mod.id];
              const dimmed = activeMod != null && activeMod !== mod.id;
              const highlight = activeMod === mod.id;
              return (
                <article
                  key={mod.id}
                  id={mod.id}
                  style={{
                    background: 'var(--mn-surface)',
                    borderRadius: 12,
                    border: highlight
                      ? '2px solid var(--mn-blue-light)'
                      : '1px solid var(--mn-border)',
                    boxShadow: highlight ? 'var(--mn-shadow-md)' : 'var(--mn-shadow-xs)',
                    opacity: dimmed ? 0.38 : 1,
                    transition: 'opacity 160ms var(--mn-ease-out), border-color 160ms',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleCollapse(mod.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '10px 14px',
                      border: 'none',
                      background: highlight ? 'var(--mn-blue-dim)' : 'var(--mn-surface-2)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mn-blue)' }}>
                      {mod.title}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>
                      {collapsed ? '展开 ▾' : '折叠 ▴'}
                    </span>
                  </button>
                  {!collapsed && (
                    <div style={{ padding: '12px 14px 14px' }}>
                      {mod.tags && mod.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                          {mod.tags.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 99,
                                background: 'var(--mn-amber-dim)',
                                color: 'var(--mn-orange)',
                                fontWeight: 600,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 14,
                          color: 'var(--mn-ink)',
                          lineHeight: 1.7,
                        }}
                      >
                        <RichText>{mod.body}</RichText>
                      </div>
                      {mod.svg && (
                        <div
                          style={{
                            marginTop: 12,
                            maxWidth: 220,
                            background: 'var(--mn-paper)',
                            borderRadius: 8,
                            padding: 8,
                            border: '1px solid var(--mn-border)',
                          }}
                          dangerouslySetInnerHTML={{ __html: mod.svg }}
                        />
                      )}
                      {mod.table && (
                        <div style={{ overflowX: 'auto', marginTop: 12 }}>
                          <table
                            style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              fontSize: 13,
                            }}
                          >
                            <thead>
                              <tr>
                                {mod.table.headers.map((h) => (
                                  <th
                                    key={h}
                                    style={{
                                      textAlign: 'left',
                                      padding: '6px 8px',
                                      borderBottom: '2px solid var(--mn-border)',
                                      color: 'var(--mn-blue)',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {mod.table.rows.map((row, ri) => (
                                <tr key={ri}>
                                  {row.map((cell, ci) => (
                                    <td
                                      key={ci}
                                      style={{
                                        padding: '6px 8px',
                                        borderBottom: '1px solid var(--mn-border)',
                                        color: 'var(--mn-ink-2)',
                                      }}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>

      {/* 总结栏 */}
      <footer
        style={{
          marginTop: 14,
          background: 'var(--mn-surface)',
          border: '1px solid var(--mn-border)',
          borderRadius: 12,
          padding: '14px 16px',
          boxShadow: 'var(--mn-shadow-xs)',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mn-blue)', marginBottom: 6 }}>
          总结栏 · 回顾
        </div>
        <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--mn-ink)', lineHeight: 1.65 }}>
          <RichText>{content.summary}</RichText>
        </p>
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            background: 'var(--mn-amber-dim)',
            border: '1px solid #f5d9a8',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--mn-ink)',
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: 'var(--mn-orange)', marginRight: 6 }}>一句话记忆</span>
          <RichText>{content.oneLiner}</RichText>
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            style={btnActive}
            onClick={() => router.push('/subjects/math/practice')}
          >
            去专题练习（真掌握度）
          </button>
          <button
            type="button"
            style={btnBase}
            onClick={() => router.push('/subjects/math/selftest')}
          >
            JOL 自测校准
          </button>
        </div>
      </footer>

      {/* 同步弹窗 */}
      {syncOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26,24,20,.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 16,
          }}
          onClick={() => setSyncOpen(false)}
        >
          <div
            style={{
              background: 'var(--mn-surface)',
              borderRadius: 12,
              padding: 18,
              maxWidth: 420,
              width: '100%',
              boxShadow: 'var(--mn-shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 8px', fontSize: 17, color: 'var(--mn-blue)' }}>
              进度同步
            </h2>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--mn-ink-3)' }}>
              本地 localStorage + 登录后云端并集合并。自报进度不是系统掌握度。
            </p>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mn-blue)', marginBottom: 6 }}>
              云端
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              <button type="button" style={btnBase} disabled={cloudBusy} onClick={() => void doCloudPull()}>
                从云端拉取
              </button>
              <button type="button" style={btnActive} disabled={cloudBusy} onClick={() => void doCloudPush()}>
                推送到云端
              </button>
              <button type="button" style={autoPush ? btnActive : btnBase} onClick={toggleAutoPush}>
                {autoPush ? '自动推送·开' : '自动推送·关'}
              </button>
              <button type="button" style={btnBase} disabled={cloudBusy} onClick={() => void doCloudDelete()}>
                删云端
              </button>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mn-blue)', marginBottom: 6 }}>
              文件
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              <button type="button" style={btnBase} onClick={exportJson}>
                导出文件
              </button>
              <button type="button" style={btnBase} onClick={copyJson}>
                复制 JSON
              </button>
            </div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="粘贴进度 JSON 后点导入…"
              rows={5}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                fontSize: 12,
                fontFamily: 'ui-monospace, monospace',
                border: '1px solid var(--mn-border)',
                borderRadius: 8,
                padding: 8,
                marginBottom: 8,
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" style={btnBase} onClick={() => setSyncOpen(false)}>
                关闭
              </button>
              <button type="button" style={btnActive} onClick={doImport}>
                导入合并
              </button>
            </div>
            {syncMsg && (
              <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--mn-green)' }}>
                {syncMsg}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
