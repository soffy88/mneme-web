'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import type { KnowledgeUnitItem, MasteryColor } from '@/types/api';

// ── 掌握度颜色 ─────────────────────────────────────────────────
const MASTERY_DOT: Record<MasteryColor, { bg: string; label: string }> = {
  green:   { bg: '#34c759', label: '已掌握' },
  yellow:  { bg: '#ff9500', label: '学习中' },
  red:     { bg: '#ff3b30', label: '待加强' },
  unknown: { bg: '#c7c7cc', label: '未学习' },
};

// ── 难度标签 ──────────────────────────────────────────────────
function DifficultyBadge({ d }: { d: number }) {
  const label = d < 0.4 ? '易' : d < 0.7 ? '中' : '难';
  const color = d < 0.4 ? 'var(--mn-green)' : d < 0.7 ? 'var(--mn-orange)' : 'var(--mn-red)';
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700,
      padding: '1px 6px', borderRadius: '99px',
      background: `${color}22`, color,
      flexShrink: 0,
    }}>{label}</span>
  );
}

// ── 单个 KU 行 ────────────────────────────────────────────────
function KuRow({ ku, selected, onSelect }: {
  ku: KnowledgeUnitItem; selected: boolean; onSelect: () => void;
}) {
  const dot = MASTERY_DOT[ku.mastery_color];
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 16px',
        background: selected ? 'var(--mn-blue-dim)' : 'transparent',
        borderLeft: selected ? '3px solid var(--mn-blue)' : '3px solid transparent',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: dot.bg,
      }} />
      <span style={{
        flex: 1, fontSize: '13px', color: 'var(--mn-ink)',
        lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{ku.name}</span>
      <DifficultyBadge d={ku.difficulty} />
    </div>
  );
}

// ── 簇（章节）折叠块 ──────────────────────────────────────────
function ClusterSection({ name, kus, selectedId, onSelect }: {
  name: string; kus: KnowledgeUnitItem[];
  selectedId: string | null; onSelect: (ku: KnowledgeUnitItem) => void;
}) {
  const [open, setOpen] = useState(true);
  const green  = kus.filter(k => k.mastery_color === 'green').length;
  const total  = kus.length;
  return (
    <div style={{ borderBottom: '1px solid var(--mn-border)' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', cursor: 'pointer',
          background: 'var(--mn-surface)',
          position: 'sticky', top: 0, zIndex: 5,
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)', transition: 'transform 0.2s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block' }}>▼</span>
        <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink)' }}>{name}</span>
        <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)' }}>{green}/{total}</span>
      </div>
      {open && kus.map(ku => (
        <KuRow key={ku.id} ku={ku} selected={selectedId === ku.id} onSelect={() => onSelect(ku)} />
      ))}
    </div>
  );
}

// ── KU 详情面板 ───────────────────────────────────────────────
function KuDetailPanel({ ku, studentId, onClose, onJumpPractice, onJumpReader, onStartSocratic }: {
  ku: KnowledgeUnitItem; studentId: string | null;
  onClose: () => void;
  onJumpPractice: (kuId: string) => void;
  onJumpReader: (fileId: string) => void;
  onStartSocratic: (ku: KnowledgeUnitItem) => void;
}) {
  const dot = MASTERY_DOT[ku.mastery_color];
  const masteryPct = ku.p_mastery !== null ? Math.round((ku.p_mastery ?? 0) * 100) : null;

  return (
    <div style={{
      height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column',
      background: 'var(--mn-paper)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px', borderBottom: '1px solid var(--mn-border)',
        background: 'rgba(248,246,242,0.95)', backdropFilter: 'blur(8px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <button onClick={onClose} style={{
            fontSize: '18px', color: 'var(--mn-blue)', background: 'none', border: 'none',
            cursor: 'pointer', padding: '0 4px 0 0', lineHeight: 1, flexShrink: 0, marginTop: 2,
          }}>‹</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--mn-ink)', lineHeight: 1.3 }}>
              {ku.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
              {ku.book_name} · {ku.cluster_name}
            </div>
          </div>
        </div>

        {/* 掌握度 */}
        <div style={{
          marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 12px', borderRadius: '10px', background: 'var(--mn-surface)',
          border: '1px solid var(--mn-border)',
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: dot.bg, flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink)', flex: 1 }}>
            {dot.label}
          </span>
          {masteryPct !== null && (
            <span style={{ fontSize: '13px', color: 'var(--mn-ink-3)' }}>{masteryPct}%</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* 学习目标 */}
        {ku.description && (
          <section>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mn-ink-3)',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>学习目标</div>
            <div style={{ fontSize: '13px', color: 'var(--mn-ink)', lineHeight: 1.7 }}>
              {ku.description}
            </div>
          </section>
        )}

        {/* 难度 + 考频 */}
        <section>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{
              flex: 1, padding: '10px 12px', borderRadius: '10px',
              background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
              display: 'flex', flexDirection: 'column', gap: '2px',
            }}>
              <div style={{ fontSize: '10px', color: 'var(--mn-ink-3)', fontWeight: 600 }}>难度</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink)' }}>
                {ku.difficulty < 0.4 ? '容易' : ku.difficulty < 0.7 ? '适中' : '较难'}
                <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--mn-ink-3)', marginLeft: 4 }}>
                  ({Math.round(ku.difficulty * 10) / 10})
                </span>
              </div>
            </div>
            <div style={{
              flex: 1, padding: '10px 12px', borderRadius: '10px',
              background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
              display: 'flex', flexDirection: 'column', gap: '2px',
            }}>
              <div style={{ fontSize: '10px', color: 'var(--mn-ink-3)', fontWeight: 600 }}>考试频率</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink)' }}>
                {{ low: '低频', mid: '中频', high: '高频' }[ku.exam_frequency] ?? ku.exam_frequency}
              </div>
            </div>
          </div>
        </section>

        {/* 前置知识 */}
        {ku.prerequisites.length > 0 && (
          <section>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mn-ink-3)',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>前置知识</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ku.prereq_mastery?.map(p => (
                <span key={p.ku_id} style={{
                  padding: '4px 10px', borderRadius: '99px', fontSize: '12px',
                  background: `${MASTERY_DOT[p.mastery_color].bg}22`,
                  color: MASTERY_DOT[p.mastery_color].bg,
                  border: `1px solid ${MASTERY_DOT[p.mastery_color].bg}44`,
                  cursor: 'default',
                }}>
                  {p.ku_id}
                  <span style={{ fontSize: '10px', marginLeft: 4, opacity: 0.7 }}>
                    {MASTERY_DOT[p.mastery_color].label}
                  </span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 操作按钮 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 4 }}>
          {ku.textbook_file_id && (
            <button
              onClick={() => onJumpReader(ku.textbook_file_id!)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
                fontSize: '14px', color: 'var(--mn-ink)', fontWeight: 600,
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
              }}
            >
              <span style={{ fontSize: '18px' }}>📖</span>
              查看教材原文
              <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginLeft: 'auto' }}>›</span>
            </button>
          )}

          <button
            onClick={() => onStartSocratic(ku)}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              background: 'var(--mn-blue-dim)', border: '1px solid var(--mn-blue)',
              fontSize: '14px', color: 'var(--mn-blue)', fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ fontSize: '18px' }}>💡</span>
            不懂问一问
            <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: 'auto' }}>›</span>
          </button>

          <button
            onClick={() => onJumpPractice(ku.id)}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              background: 'var(--mn-green)', border: 'none',
              fontSize: '14px', color: '#fff', fontWeight: 700,
              cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ fontSize: '18px' }}>✏️</span>
            做几道题
            <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: 'auto' }}>›</span>
          </button>
        </section>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────

export default function MathLessonPage() {
  const router = useRouter();
  const [kus,      setKus]      = useState<KnowledgeUnitItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<KnowledgeUnitItem | null>(null);
  const [socLoading, setSocLoading] = useState(false);

  const getStudentId = useCallback(() => getUserId(), []);

  useEffect(() => {
    const studentId = getStudentId();
    api.listKnowledgePoints({ subject: 'math', student_id: studentId ?? undefined })
      .then(res => { if (res.ok) setKus(res.data); })
      .finally(() => setLoading(false));
  }, [getStudentId]);

  // 按簇分组
  const clusters = kus.reduce<Map<string, { name: string; order: number; kus: KnowledgeUnitItem[] }>>(
    (map, ku) => {
      if (!map.has(ku.cluster_id)) {
        map.set(ku.cluster_id, { name: ku.cluster_name, order: ku.cluster_order, kus: [] });
      }
      map.get(ku.cluster_id)!.kus.push(ku);
      return map;
    }, new Map()
  );
  const sortedClusters = Array.from(clusters.entries()).sort(([, a], [, b]) => a.order - b.order);

  const handleJumpPractice = useCallback((kuId: string) => {
    router.push(`/subjects/math/practice?ku_id=${encodeURIComponent(kuId)}`);
  }, [router]);

  const handleJumpReader = useCallback((fileId: string) => {
    router.push(`/reader/${encodeURIComponent(fileId)}`);
  }, [router]);

  const handleStartSocratic = useCallback(async (ku: KnowledgeUnitItem) => {
    const studentId = getStudentId();
    if (!studentId) { router.push('/login'); return; }
    setSocLoading(true);
    const res = await api.startSocraticForKu(ku.id, studentId);
    setSocLoading(false);
    if (!res.ok) { alert('无法启动引导：' + res.error); return; }
    // 导航到苏格拉底页面，携带 session_id
    router.push(`/socratic?session_id=${res.data.session_id}&first_q=${encodeURIComponent(res.data.first_question)}`);
  }, [getStudentId, router]);

  if (loading) {
    return (
      <div style={{ height: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--mn-ink-3)' }}>加载知识点地图…</div>
      </div>
    );
  }

  const studentId = getStudentId();

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--mn-paper)', overflow: 'hidden' }}>

      {/* Top bar */}
      <header style={{
        height: '48px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0 16px',
        background: 'rgba(248,246,242,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--mn-border)', zIndex: 30,
      }}>
        <button onClick={() => router.back()} style={{
          fontSize: '20px', color: 'var(--mn-blue)', background: 'none',
          border: 'none', cursor: 'pointer', lineHeight: 1, padding: '4px 0',
        }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--mn-ink)' }}>数学知识点地图</div>
          <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)' }}>{kus.length} 个知识单元</div>
        </div>
      </header>

      {/* Body: desktop split, mobile list + slide panel */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* KU list */}
        <div style={{
          width: selected ? '280px' : '100%', flexShrink: 0,
          overflowY: 'auto',
          borderRight: selected ? '1px solid var(--mn-border)' : 'none',
          transition: 'width 0.2s',
        }}
          className="ku-list-panel"
        >
          {kus.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--mn-ink-3)', fontSize: '14px' }}>
              暂无数学知识点数据
            </div>
          ) : (
            sortedClusters.map(([cid, cluster]) => (
              <ClusterSection
                key={cid}
                name={cluster.name}
                kus={cluster.kus}
                selectedId={selected?.id ?? null}
                onSelect={ku => setSelected(ku)}
              />
            ))
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
            <KuDetailPanel
              ku={selected}
              studentId={studentId}
              onClose={() => setSelected(null)}
              onJumpPractice={handleJumpPractice}
              onJumpReader={handleJumpReader}
              onStartSocratic={handleStartSocratic}
            />
          </div>
        )}
      </div>

      {/* Mobile: detail as overlay */}
      {selected && (
        <div className="mobile-detail-overlay" style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'var(--mn-paper)', overflow: 'hidden',
        }}>
          {socLoading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'rgba(0,0,0,0.3)', zIndex: 60,
            }}>
              <div style={{ background: 'var(--mn-paper)', padding: '20px 32px', borderRadius: 12,
                fontSize: '14px', color: 'var(--mn-ink)' }}>启动引导中…</div>
            </div>
          )}
          <KuDetailPanel
            ku={selected}
            studentId={studentId}
            onClose={() => setSelected(null)}
            onJumpPractice={handleJumpPractice}
            onJumpReader={handleJumpReader}
            onStartSocratic={handleStartSocratic}
          />
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .mobile-detail-overlay { display: none !important; }
          .ku-list-panel { width: ${selected ? '280px' : '100%'} !important; }
        }
        @media (max-width: 767px) {
          .ku-list-panel { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
