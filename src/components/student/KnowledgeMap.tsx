'use client';

import { useEffect, useState, useCallback } from 'react';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import type { KnowledgeUnitItem, MasteryColor } from '@/types/api';
import { RichContentView } from '@/components/student/RichContentView';

// ── 类型 ─────────────────────────────────────────────────────────────

export type SortMode = 'textbook' | 'topic' | 'mastery' | 'difficulty' | 'exam_freq' | 'prereq';

const SORT_OPTS: { key: SortMode; label: string }[] = [
  { key: 'textbook',   label: '教材' },
  { key: 'topic',      label: '主题' },
  { key: 'mastery',    label: '掌握度' },
  { key: 'difficulty', label: '难度' },
  { key: 'exam_freq',  label: '考频' },
  { key: 'prereq',     label: '路径' },
];

export interface KnowledgeMapProps {
  subject: string;
  title: string;
  textbookId?: string;
  onBack?: () => void;
  onJumpPractice: (kuId: string) => void;
  onJumpReader: (fileId: string) => void;
  onStartSocratic?: (ku: KnowledgeUnitItem) => void;
}

// ── 掌握度 ────────────────────────────────────────────────────────────

const MASTERY_DOT: Record<MasteryColor, { bg: string; label: string }> = {
  green:   { bg: '#34c759', label: '已掌握' },
  yellow:  { bg: '#ff9500', label: '学习中' },
  red:     { bg: '#ff3b30', label: '待加强' },
  unknown: { bg: '#c7c7cc', label: '未学习' },
};

// ── 教材树类型 ────────────────────────────────────────────────────────

interface TextbookLeaf {
  textbookId: string;
  bookName: string;
  kus: KnowledgeUnitItem[];
}
interface GradeNode {
  grade: string;
  gradeLabel: string;
  textbooks: TextbookLeaf[];
}
interface StageNode {
  stage: string;
  grades: GradeNode[];
}

// ── 工具函数 ─────────────────────────────────────────────────────────

function gradeNum(grade: string): number {
  const m = grade.match(/^G(\d+)$/);
  if (m) return parseInt(m[1]);
  if (grade.startsWith('高一')) return 10;
  if (grade.startsWith('高二')) return 11;
  if (grade.startsWith('高三')) return 12;
  if (grade.startsWith('初一')) return 7;
  if (grade.startsWith('初二')) return 8;
  if (grade.startsWith('初三')) return 9;
  return 99;
}

function stageOf(grade: string): string {
  const n = gradeNum(grade);
  if (n <= 6) return '小学';
  if (n <= 9) return '初中';
  return '高中';
}

const GRADE_LABEL: Record<string, string> = {
  G1: '一年级', G2: '二年级', G3: '三年级', G4: '四年级',
  G5: '五年级', G6: '六年级', G7: '七年级', G8: '八年级', G9: '九年级',
  G10: '高一', G11: '高二', G12: '高三',
};

function gradeLabel(grade: string): string {
  if (GRADE_LABEL[grade]) return GRADE_LABEL[grade];
  if (grade.startsWith('高') || grade.startsWith('初')) return grade;
  return grade;
}

function buildTextbookTree(kus: KnowledgeUnitItem[]): StageNode[] {
  const sorted = [...kus].sort((a, b) => {
    const gd = gradeNum(a.grade) - gradeNum(b.grade);
    if (gd !== 0) return gd;
    const td = a.textbook_id.toLowerCase().localeCompare(b.textbook_id.toLowerCase());
    if (td !== 0) return td;
    return a.id.localeCompare(b.id);
  });

  // stage → grade → textbookId → leaf
  const stageMap = new Map<string, Map<string, Map<string, TextbookLeaf>>>();

  for (const ku of sorted) {
    const stage = stageOf(ku.grade);
    const gl = gradeLabel(ku.grade);
    const gradeKey = `${String(gradeNum(ku.grade)).padStart(2, '0')}|${ku.grade}|${gl}`;

    if (!stageMap.has(stage)) stageMap.set(stage, new Map());
    const gradeMap = stageMap.get(stage)!;
    if (!gradeMap.has(gradeKey)) gradeMap.set(gradeKey, new Map());
    const tbMap = gradeMap.get(gradeKey)!;
    if (!tbMap.has(ku.textbook_id)) {
      tbMap.set(ku.textbook_id, { textbookId: ku.textbook_id, bookName: ku.book_name, kus: [] });
    }
    tbMap.get(ku.textbook_id)!.kus.push(ku);
  }

  return ['小学', '初中', '高中']
    .filter(s => stageMap.has(s))
    .map(stage => ({
      stage,
      grades: [...stageMap.get(stage)!.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([gradeKey, tbMap]) => ({
          grade: gradeKey.split('|')[1],
          gradeLabel: gradeKey.split('|')[2],
          textbooks: [...tbMap.values()],
        })),
    }));
}

interface FlatGroup { label: string; kus: KnowledgeUnitItem[] }

function topoSort(kus: KnowledgeUnitItem[]): KnowledgeUnitItem[] {
  const idMap  = new Map(kus.map(k => [k.id, k]));
  const inDeg  = new Map(kus.map(k => [k.id, 0]));
  const adj    = new Map<string, string[]>(kus.map(k => [k.id, []]));
  for (const ku of kus) {
    for (const p of ku.prerequisites) {
      if (idMap.has(p)) {
        inDeg.set(ku.id, (inDeg.get(ku.id) ?? 0) + 1);
        adj.get(p)!.push(ku.id);
      }
    }
  }
  const queue = kus.filter(k => inDeg.get(k.id) === 0);
  const result: KnowledgeUnitItem[] = [];
  while (queue.length) {
    const ku = queue.shift()!;
    result.push(ku);
    for (const succ of adj.get(ku.id) ?? []) {
      const d = (inDeg.get(succ) ?? 0) - 1;
      inDeg.set(succ, d);
      if (d === 0) queue.push(idMap.get(succ)!);
    }
  }
  const seen = new Set(result.map(k => k.id));
  result.push(...kus.filter(k => !seen.has(k.id)));
  return result;
}

function buildFlatGroups(kus: KnowledgeUnitItem[], sort: SortMode): FlatGroup[] {
  if (sort === 'topic') {
    const clusterMap = new Map<string, { order: number; name: string; kus: KnowledgeUnitItem[] }>();
    for (const ku of kus) {
      if (!clusterMap.has(ku.cluster_id)) {
        clusterMap.set(ku.cluster_id, { order: ku.cluster_order, name: ku.cluster_name, kus: [] });
      }
      clusterMap.get(ku.cluster_id)!.kus.push(ku);
    }
    return [...clusterMap.values()]
      .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
      .map(e => ({ label: e.name, kus: e.kus }));
  }

  if (sort === 'mastery') {
    const ORDER: MasteryColor[] = ['red', 'yellow', 'unknown', 'green'];
    const LABEL: Record<MasteryColor, string> = {
      red: '待加强', yellow: '学习中', unknown: '未学习', green: '已掌握',
    };
    const sorted = [...kus].sort((a, b) => {
      const ao = ORDER.indexOf(a.mastery_color), bo = ORDER.indexOf(b.mastery_color);
      if (ao !== bo) return ao - bo;
      return (a.p_mastery ?? -1) - (b.p_mastery ?? -1);
    });
    const groups = new Map<MasteryColor, KnowledgeUnitItem[]>();
    for (const ku of sorted) {
      if (!groups.has(ku.mastery_color)) groups.set(ku.mastery_color, []);
      groups.get(ku.mastery_color)!.push(ku);
    }
    return ORDER.filter(c => groups.has(c)).map(c => ({ label: LABEL[c], kus: groups.get(c)! }));
  }

  if (sort === 'difficulty') {
    const sorted = [...kus].sort((a, b) => a.difficulty - b.difficulty);
    const buckets: FlatGroup[] = [
      { label: '易（0~0.4）', kus: [] },
      { label: '中（0.4~0.7）', kus: [] },
      { label: '难（0.7+）', kus: [] },
    ];
    for (const ku of sorted) {
      buckets[ku.difficulty < 0.4 ? 0 : ku.difficulty < 0.7 ? 1 : 2].kus.push(ku);
    }
    return buckets.filter(g => g.kus.length > 0);
  }

  if (sort === 'exam_freq') {
    const RANK: Record<string, number> = { high: 2, mid: 1, low: 0 };
    const LABEL: Record<string, string> = { high: '高频', mid: '中频', low: '低频' };
    const sorted = [...kus].sort((a, b) => (RANK[b.exam_frequency] ?? 1) - (RANK[a.exam_frequency] ?? 1));
    const groups = new Map<string, KnowledgeUnitItem[]>();
    for (const ku of sorted) {
      if (!groups.has(ku.exam_frequency)) groups.set(ku.exam_frequency, []);
      groups.get(ku.exam_frequency)!.push(ku);
    }
    return ['high', 'mid', 'low']
      .filter(k => groups.has(k))
      .map(k => ({ label: LABEL[k], kus: groups.get(k)! }));
  }

  // prereq
  return [{ label: '学习路径', kus: topoSort(kus) }];
}

// ── DifficultyBadge ────────────────────────────────────────────────

function DifficultyBadge({ d }: { d: number }) {
  const label = d < 0.4 ? '易' : d < 0.7 ? '中' : '难';
  const color = d < 0.4 ? 'var(--mn-green)' : d < 0.7 ? 'var(--mn-orange)' : 'var(--mn-red)';
  return (
    <span style={{
      fontSize: '10px', fontWeight: 700,
      padding: '1px 6px', borderRadius: '99px',
      background: `${color}22`, color, flexShrink: 0,
    }}>{label}</span>
  );
}

// ── KuRow ─────────────────────────────────────────────────────────────

function KuRow({ ku, selected, sort, indent, onSelect }: {
  ku: KnowledgeUnitItem; selected: boolean; sort: SortMode;
  indent?: number; onSelect: () => void;
}) {
  const dot = MASTERY_DOT[ku.mastery_color];
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: `10px 16px 10px ${indent ?? 16}px`,
        background: selected ? 'var(--mn-blue-dim)' : 'transparent',
        borderLeft: selected ? '3px solid var(--mn-blue)' : '3px solid transparent',
        cursor: 'pointer', transition: 'background 0.15s',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: dot.bg }} />
      <span style={{
        flex: 1, fontSize: '13px', color: 'var(--mn-ink)',
        lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{ku.name}</span>
      {(sort === 'textbook' || sort === 'topic' || sort === 'prereq') && <DifficultyBadge d={ku.difficulty} />}
      {sort === 'exam_freq' && (
        <span style={{ fontSize: '10px', color: 'var(--mn-ink-3)', flexShrink: 0 }}>
          {{ low: '低', mid: '中', high: '高' }[ku.exam_frequency] ?? ''}
        </span>
      )}
    </div>
  );
}

// ── 教材三层组件 ────────────────────────────────────────────────────

function TextbookSection({ tb, selectedId, sort, onSelect }: {
  tb: TextbookLeaf; selectedId: string | null; sort: SortMode;
  onSelect: (ku: KnowledgeUnitItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const green = tb.kus.filter(k => k.mastery_color === 'green').length;
  return (
    <div>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px 8px 40px',
          cursor: 'pointer', background: 'var(--mn-surface)',
          borderBottom: '1px solid var(--mn-border)',
        }}
      >
        <span style={{
          fontSize: '11px', color: 'var(--mn-ink-3)', transition: 'transform 0.2s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block',
        }}>▾</span>
        <span style={{ flex: 1, fontSize: '12px', color: 'var(--mn-ink)', lineHeight: 1.4 }}>
          {tb.bookName}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--mn-ink-3)', flexShrink: 0 }}>
          {green}/{tb.kus.length}
        </span>
      </div>
      {open && tb.kus.map(ku => (
        <KuRow
          key={ku.id} ku={ku} selected={selectedId === ku.id}
          sort={sort} indent={56} onSelect={() => onSelect(ku)}
        />
      ))}
    </div>
  );
}

function GradeSection({ grade, selectedId, sort, onSelect }: {
  grade: GradeNode; selectedId: string | null; sort: SortMode;
  onSelect: (ku: KnowledgeUnitItem) => void;
}) {
  const [open, setOpen] = useState(true);
  const total = grade.textbooks.reduce((n, t) => n + t.kus.length, 0);
  const green = grade.textbooks.reduce((n, t) => n + t.kus.filter(k => k.mastery_color === 'green').length, 0);
  return (
    <div>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 16px 9px 24px',
          cursor: 'pointer', background: 'var(--mn-paper)',
          borderBottom: '1px solid var(--mn-border)',
          position: 'sticky', top: '40px', zIndex: 4,
        }}
      >
        <span style={{
          fontSize: '11px', color: 'var(--mn-ink-3)', transition: 'transform 0.2s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block',
        }}>▾</span>
        <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink)' }}>
          {grade.gradeLabel}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--mn-ink-3)', flexShrink: 0 }}>
          {green}/{total}
        </span>
      </div>
      {open && grade.textbooks.map(tb => (
        <TextbookSection
          key={tb.textbookId} tb={tb} selectedId={selectedId}
          sort={sort} onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function StageSection({ stage, selectedId, sort, onSelect }: {
  stage: StageNode; selectedId: string | null; sort: SortMode;
  onSelect: (ku: KnowledgeUnitItem) => void;
}) {
  const [open, setOpen] = useState(true);
  const total = stage.grades.reduce((n, g) => n + g.textbooks.reduce((m, t) => m + t.kus.length, 0), 0);
  return (
    <div style={{ borderBottom: '2px solid var(--mn-border)' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px',
          cursor: 'pointer', background: 'var(--mn-surface)',
          position: 'sticky', top: 0, zIndex: 5,
        }}
      >
        <span style={{
          fontSize: '12px', color: 'var(--mn-blue)', transition: 'transform 0.2s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block',
        }}>▼</span>
        <span style={{ flex: 1, fontSize: '14px', fontWeight: 800, color: 'var(--mn-ink)' }}>
          {stage.stage}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)' }}>{total} 个</span>
      </div>
      {open && stage.grades.map(g => (
        <GradeSection
          key={g.grade} grade={g} selectedId={selectedId}
          sort={sort} onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ── 平铺分组 (topic/mastery/difficulty/exam_freq/prereq) ─────────────

function GroupSection({ label, kus, sort, selectedId, onSelect, defaultOpen = true }: {
  label: string; kus: KnowledgeUnitItem[]; sort: SortMode;
  selectedId: string | null; onSelect: (ku: KnowledgeUnitItem) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const green = kus.filter(k => k.mastery_color === 'green').length;
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
        <span style={{
          fontSize: '12px', color: 'var(--mn-ink-3)', transition: 'transform 0.2s',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block',
        }}>▼</span>
        <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink)' }}>{label}</span>
        <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)' }}>
          {sort === 'mastery' ? `${kus.length}个` : `${green}/${kus.length}`}
        </span>
      </div>
      {open && kus.map(ku => (
        <KuRow key={ku.id} ku={ku} selected={selectedId === ku.id} sort={sort} onSelect={() => onSelect(ku)} />
      ))}
    </div>
  );
}

// ── KuDetailPanel ────────────────────────────────────────────────────

function KuDetailPanel({ ku, onClose, onJumpPractice, onJumpReader, onStartSocratic }: {
  ku: KnowledgeUnitItem;
  onClose: () => void;
  onJumpPractice: (kuId: string) => void;
  onJumpReader: (fileId: string) => void;
  onStartSocratic?: (ku: KnowledgeUnitItem) => void;
}) {
  const dot = MASTERY_DOT[ku.mastery_color];
  const masteryPct = ku.p_mastery !== null ? Math.round((ku.p_mastery ?? 0) * 100) : null;
  const [richContent, setRichContent] = useState<Record<string, string | string[]> | null>(null);

  useEffect(() => {
    const uid = getUserId() ?? undefined;
    api.getKnowledgePoint(ku.id, uid)
      .then(d => { if (d.ok && d.data.rich_content) setRichContent(d.data.rich_content as Record<string, string | string[]>); })
      .catch(() => {});
  }, [ku.id]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--mn-paper)' }}>
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
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--mn-ink)', lineHeight: 1.3 }}>{ku.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
              {ku.book_name}
            </div>
          </div>
        </div>
        <div style={{
          marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 12px', borderRadius: '10px',
          background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: dot.bg, flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink)', flex: 1 }}>{dot.label}</span>
          {masteryPct !== null && (
            <span style={{ fontSize: '13px', color: 'var(--mn-ink-3)' }}>{masteryPct}%</span>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {ku.description && (
          <section>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mn-ink-3)', letterSpacing: '0.05em', marginBottom: '6px' }}>学习目标</div>
            <div style={{ fontSize: '13px', color: 'var(--mn-ink)', lineHeight: 1.7 }}>{ku.description}</div>
          </section>
        )}

        <section>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { label: '难度', value: ku.difficulty < 0.4 ? '容易' : ku.difficulty < 0.7 ? '适中' : '较难',
                sub: `(${Math.round(ku.difficulty * 10) / 10})` },
              { label: '考试频率', value: ({ low: '低频', mid: '中频', high: '高频' } as Record<string, string>)[ku.exam_frequency] ?? ku.exam_frequency, sub: '' },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{
                flex: 1, padding: '10px 12px', borderRadius: '10px',
                background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
              }}>
                <div style={{ fontSize: '10px', color: 'var(--mn-ink-3)', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink)', marginTop: 2 }}>
                  {value}
                  {sub && <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--mn-ink-3)', marginLeft: 4 }}>{sub}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {ku.prerequisites.length > 0 && (
          <section>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mn-ink-3)', letterSpacing: '0.05em', marginBottom: '6px' }}>前置知识</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {ku.prereq_mastery?.map(p => (
                <span key={p.ku_id} style={{
                  padding: '4px 10px', borderRadius: '99px', fontSize: '12px',
                  background: `${MASTERY_DOT[p.mastery_color].bg}22`,
                  color: MASTERY_DOT[p.mastery_color].bg,
                  border: `1px solid ${MASTERY_DOT[p.mastery_color].bg}44`,
                }}>
                  {p.ku_id}
                  <span style={{ fontSize: '10px', marginLeft: 4, opacity: 0.7 }}>{MASTERY_DOT[p.mastery_color].label}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {richContent && (
          <section>
            <RichContentView kuType={ku.ku_type} richContent={richContent} />
          </section>
        )}

        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 4 }}>
          {ku.textbook_file_id && (
            <button onClick={() => onJumpReader(ku.textbook_file_id!)} style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
              fontSize: '14px', color: 'var(--mn-ink)', fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>📖</span>
              查看教材原文
              <span style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginLeft: 'auto' }}>›</span>
            </button>
          )}

          {onStartSocratic && (
            <button onClick={() => onStartSocratic(ku)} style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              background: 'var(--mn-blue-dim)', border: '1px solid var(--mn-blue)',
              fontSize: '14px', color: 'var(--mn-blue)', fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>💡</span>
              不懂问一问
              <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: 'auto' }}>›</span>
            </button>
          )}

          <button onClick={() => onJumpPractice(ku.id)} style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            background: 'var(--mn-green)', border: 'none',
            fontSize: '14px', color: '#fff', fontWeight: 700,
            cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>✏️</span>
            做几道题
            <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: 'auto' }}>›</span>
          </button>
        </section>
      </div>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────────

export default function KnowledgeMap({
  subject, title, textbookId, onBack, onJumpPractice, onJumpReader, onStartSocratic,
}: KnowledgeMapProps) {
  const [kus,        setKus]      = useState<KnowledgeUnitItem[]>([]);
  const [loading,    setLoading]  = useState(true);
  const [selected,   setSelected] = useState<KnowledgeUnitItem | null>(null);
  const [sort,       setSort]     = useState<SortMode>('textbook');
  const [socLoading, setSocLoading] = useState(false);

  const studentId = getUserId();

  useEffect(() => {
    setLoading(true);
    api.listKnowledgePoints({
      subject,
      textbook_id: textbookId,
      student_id: studentId ?? undefined,
    }).then(res => { if (res.ok) setKus(res.data); })
      .finally(() => setLoading(false));
  }, [subject, textbookId, studentId]);

  const handleStartSocratic = useCallback(async (ku: KnowledgeUnitItem) => {
    if (!onStartSocratic) return;
    setSocLoading(true);
    try { await onStartSocratic(ku); }
    finally { setSocLoading(false); }
  }, [onStartSocratic]);

  const textbookTree = sort === 'textbook' ? buildTextbookTree(kus) : null;
  const flatGroups   = sort !== 'textbook' ? buildFlatGroups(kus, sort) : null;

  if (loading) {
    return (
      <div style={{ height: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--mn-ink-3)' }}>加载知识点地图…</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--mn-paper)', overflow: 'hidden' }}>

      {/* Top bar */}
      <header style={{
        flexShrink: 0, background: 'rgba(248,246,242,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--mn-border)', zIndex: 30,
      }}>
        <div style={{ height: '48px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px' }}>
          {onBack && (
            <button onClick={onBack} style={{
              fontSize: '20px', color: 'var(--mn-blue)', background: 'none',
              border: 'none', cursor: 'pointer', lineHeight: 1, padding: '4px 0',
            }}>‹</button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--mn-ink)' }}>{title}</div>
            <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)' }}>{kus.length} 个知识单元</div>
          </div>
        </div>

        {/* Sort tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '0 16px 10px',
          overflowX: 'auto', WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
        }}>
          {SORT_OPTS.map(opt => (
            <button
              key={opt.key}
              onClick={() => { setSort(opt.key); setSelected(null); }}
              style={{
                padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                background: sort === opt.key ? 'var(--mn-blue)' : 'var(--mn-border)',
                color: sort === opt.key ? '#fff' : 'var(--mn-ink-2)',
                transition: 'background 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* KU list */}
        <div
          className="ku-list-panel"
          style={{ width: selected ? '280px' : '100%', flexShrink: 0, overflowY: 'auto',
            borderRight: selected ? '1px solid var(--mn-border)' : 'none', transition: 'width 0.2s' }}
        >
          {kus.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--mn-ink-3)', fontSize: '14px' }}>
              暂无{title}数据
            </div>
          ) : sort === 'textbook' && textbookTree ? (
            textbookTree.map(stage => (
              <StageSection
                key={stage.stage} stage={stage} selectedId={selected?.id ?? null}
                sort={sort} onSelect={ku => setSelected(ku)}
              />
            ))
          ) : flatGroups ? (
            flatGroups.map((g, i) => (
              <GroupSection
                key={g.label + i} label={g.label} kus={g.kus} sort={sort}
                selectedId={selected?.id ?? null}
                onSelect={ku => setSelected(ku)}
                defaultOpen={sort === 'prereq' || i < 3}
              />
            ))
          ) : null}
        </div>

        {/* Detail panel (desktop) */}
        {selected && (
          <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
            <KuDetailPanel
              ku={selected}
              onClose={() => setSelected(null)}
              onJumpPractice={onJumpPractice}
              onJumpReader={onJumpReader}
              onStartSocratic={onStartSocratic ? handleStartSocratic : undefined}
            />
          </div>
        )}
      </div>

      {/* Detail panel (mobile overlay) */}
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
            onClose={() => setSelected(null)}
            onJumpPractice={onJumpPractice}
            onJumpReader={onJumpReader}
            onStartSocratic={onStartSocratic ? handleStartSocratic : undefined}
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
