'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import type { KnowledgeUnitItem } from '@/types/api';

// ── 描述解析 ──────────────────────────────────────────────────

interface IdiomDesc {
  definition: string;  // 释义
  usage?: string;      // 用法/例句
  origin?: string;     // 典故/know-why
  source?: string;     // 出处课文
  knowWhat?: string;
}

function parseIdiomDesc(desc: string): IdiomDesc {
  if (!desc) return { definition: '' };
  const get = (prefix: string) =>
    desc.split('\n').map(l => l.trim()).find(l => l.startsWith(prefix))?.slice(prefix.length).trim() ?? '';

  // 002 格式
  if (desc.includes('know-what:')) {
    return {
      definition: get('know-what:'),
      usage: get('know-how:') || get('实例:'),
      origin: get('know-why:'),
      source: get('来源:'),
      knowWhat: get('know-what:'),
    };
  }
  // [declarative] 格式
  if (desc.includes('[declarative]')) {
    return {
      definition: get('know-what:'),
      usage: get('实例:'),
      source: get('来源:'),
    };
  }
  // 纯文本
  const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
  return {
    definition: lines[0] ?? '',
    source: lines.find(l => l.startsWith('来源:'))?.slice(3).trim() ?? '',
  };
}

// ── 浏览卡片 ──────────────────────────────────────────────────

function IdiomCard({ ku }: { ku: KnowledgeUnitItem }) {
  const [open, setOpen] = useState(false);
  const info = useMemo(() => parseIdiomDesc(ku.description ?? ''), [ku.description]);

  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        border: `1px solid ${open ? '#6366f1' : '#e0e7ff'}`,
        borderRadius: 8, background: '#fff', cursor: 'pointer',
        overflow: 'hidden', transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#3730a3', minWidth: 60, flexShrink: 0, lineHeight: 1.4 }}>
          {ku.name}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {info.definition.slice(0, 50)}
          </div>
          {info.source && (
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{info.source.slice(0, 30)}</div>
          )}
        </div>
        <span style={{ fontSize: 14, color: '#6366f1', flexShrink: 0, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #e0e7ff', background: '#f5f3ff', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {info.definition && (
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', marginRight: 6 }}>释义</span>
              <span style={{ fontSize: 13, color: '#1f2937' }}>{info.definition}</span>
            </div>
          )}
          {info.usage && (
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#0891b2', marginRight: 6 }}>例句</span>
              <span style={{ fontSize: 12, color: '#374151', fontStyle: 'italic' }}>{info.usage}</span>
            </div>
          )}
          {info.origin && (
            <div style={{ padding: '6px 10px', borderRadius: 6, background: '#ede9fe', border: '1px solid #c4b5fd' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', marginRight: 6 }}>★ 典故</span>
              <span style={{ fontSize: 12, color: '#4c1d95' }}>{info.origin}</span>
            </div>
          )}
          {info.source && (
            <div style={{ fontSize: 11, color: '#9ca3af' }}>出处：{info.source}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 背诵卡片（FSRS） ──────────────────────────────────────────

type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

interface ReviewCardProps {
  ku: KnowledgeUnitItem;
  onRate: (rating: ReviewRating) => void;
  total: number;
  index: number;
}

function ReviewCard({ ku, onRate, total, index }: ReviewCardProps) {
  const [flipped, setFlipped] = useState(false);
  const info = useMemo(() => parseIdiomDesc(ku.description ?? ''), [ku.description]);

  const RATINGS: { label: string; value: ReviewRating; color: string; bg: string }[] = [
    { label: '不会', value: 'again', color: '#dc2626', bg: '#fef2f2' },
    { label: '模糊', value: 'hard',  color: '#d97706', bg: '#fffbeb' },
    { label: '认识', value: 'good',  color: '#16a34a', bg: '#f0fdf4' },
    { label: '熟记', value: 'easy',  color: '#2563eb', bg: '#eff6ff' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 4px' }}>
      {/* 进度 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#e0e7ff', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: '#6366f1', width: `${(index / total) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 12, color: '#6b7280' }}>{index}/{total}</span>
      </div>

      {/* 卡片主体 */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        style={{
          minHeight: 200, borderRadius: 16, border: '2px solid #6366f1',
          background: flipped ? '#f5f3ff' : '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 32, cursor: flipped ? 'default' : 'pointer', transition: 'background 0.2s',
          textAlign: 'center', gap: 12,
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 700, color: '#3730a3', letterSpacing: 4 }}>{ku.name}</div>
        {!flipped ? (
          <div style={{ fontSize: 13, color: '#9ca3af' }}>点击翻面看释义</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            {info.definition && (
              <div style={{ fontSize: 15, color: '#1f2937', lineHeight: 1.6 }}>{info.definition}</div>
            )}
            {info.usage && (
              <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 4 }}>例：{info.usage}</div>
            )}
            {info.origin && (
              <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 4, padding: '6px 10px', background: '#ede9fe', borderRadius: 8 }}>
                典：{info.origin}
              </div>
            )}
            {info.source && (
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{info.source}</div>
            )}
          </div>
        )}
      </div>

      {/* 自评按钮（翻面后显示） */}
      {flipped && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {RATINGS.map(r => (
            <button
              key={r.value}
              onClick={() => onRate(r.value)}
              style={{
                padding: '10px 0', borderRadius: 10, border: `1px solid ${r.color}`,
                background: r.bg, color: r.color, fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 完成画面 ──────────────────────────────────────────────────

function ReviewDone({ total, onBack }: { total: number; onBack: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ fontSize: 48 }}>🎉</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#3730a3' }}>本轮完成！</div>
      <div style={{ fontSize: 14, color: '#6b7280' }}>共复习 {total} 条成语，已更新记忆曲线</div>
      <button
        onClick={onBack}
        style={{ marginTop: 8, padding: '10px 28px', borderRadius: 10, background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
      >
        返回成语本
      </button>
    </div>
  );
}

// ── 主页面 ───────────────────────────────────────────────────

type Mode = 'browse' | 'review';

export default function IdiomsPage() {
  const [kus, setKus] = useState<KnowledgeUnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [mode, setMode] = useState<Mode>('browse');
  const [search, setSearch] = useState('');
  const [filterBook, setFilterBook] = useState('all');

  // 背诵状态
  const [reviewQueue, setReviewQueue] = useState<KnowledgeUnitItem[]>([]);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    api.listKnowledgePoints({ subject: 'chinese' }).then(res => {
      if (res.ok) setKus(res.data.filter(k => k.ku_type === 'chengyu'));
      else setErr(res.error);
    }).finally(() => setLoading(false));
  }, []);

  const books = useMemo(() => [...new Set(kus.map(k => k.book_name))].sort(), [kus]);

  const filtered = useMemo(() => {
    let out = kus;
    if (filterBook !== 'all') out = out.filter(k => k.book_name === filterBook);
    if (search.trim()) {
      const q = search.trim();
      out = out.filter(k => k.name.includes(q) || (k.description ?? '').includes(q));
    }
    return out;
  }, [kus, filterBook, search]);

  // 按拼音首字母分组
  const byInitial = useMemo(() => {
    const map = new Map<string, KnowledgeUnitItem[]>();
    for (const k of filtered) {
      const ch = k.name[0] ?? '#';
      if (!map.has(ch)) map.set(ch, []);
      map.get(ch)!.push(k);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh'));
  }, [filtered]);

  const startReview = useCallback(() => {
    // 随机抽取当日批次 (20条) — 真实FSRS due-queue需后端支持chengyu变式
    // 目前：随机 shuffle 取20条新 (TODO: 接 /v1/review/due 当 chengyu variant 就绪)
    const shuffled = [...kus].sort(() => Math.random() - 0.5).slice(0, 20);
    setReviewQueue(shuffled);
    setReviewIdx(0);
    setReviewDone(false);
    setTodayCount(0);
    setMode('review');
  }, [kus]);

  const handleRate = useCallback(async (rating: ReviewRating) => {
    const ku = reviewQueue[reviewIdx];
    if (!ku || submitting) return;
    const sid = getUserId();
    if (!sid) return;

    setSubmitting(true);
    const isCorrect = rating === 'good' || rating === 'easy';
    const struggled  = rating === 'hard';
    const effortless = rating === 'easy';
    const usedAnswer = rating === 'again';
    try {
      await api.postInteraction({
        kc_id: ku.id,
        is_correct: isCorrect,
        struggled, effortless,
        used_answer: usedAnswer,
        source: 'review',
      });
    } catch (_) { /* non-blocking */ }
    setSubmitting(false);
    setTodayCount(c => c + 1);

    if (reviewIdx + 1 >= reviewQueue.length) {
      setReviewDone(true);
    } else {
      setReviewIdx(i => i + 1);
    }
  }, [reviewQueue, reviewIdx, submitting]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>加载成语中…</div>;
  if (err) return <div style={{ padding: 24, color: '#dc2626' }}>{err}</div>;

  // ── 背诵模式 ─────────────────────────────────────────────
  if (mode === 'review') {
    if (reviewDone) {
      return (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
          <ReviewDone total={todayCount} onBack={() => setMode('browse')} />
        </div>
      );
    }
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => setMode('browse')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#6366f1', padding: 0 }}
          >
            ‹
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#3730a3', margin: 0 }}>成语背诵</h1>
        </div>
        <ReviewCard
          ku={reviewQueue[reviewIdx]}
          onRate={handleRate}
          total={reviewQueue.length}
          index={reviewIdx}
        />
      </div>
    );
  }

  // ── 浏览模式 ─────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      {/* 标题栏 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#3730a3', margin: 0 }}>成语本</h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>共 {kus.length} 条 · 初中+高中全册</p>
        </div>
        <button
          onClick={startReview}
          style={{
            padding: '8px 18px', borderRadius: 10, background: '#6366f1', color: '#fff',
            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
          }}
        >
          开始背诵
        </button>
      </div>

      {/* 搜索 + 筛选 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索成语或释义…"
          style={{ flex: 1, fontSize: 13, border: '1px solid #d1d5db', borderRadius: 8, padding: '7px 12px', outline: 'none' }}
        />
        <select
          value={filterBook}
          onChange={e => setFilterBook(e.target.value)}
          style={{ fontSize: 12, border: '1px solid #d1d5db', borderRadius: 8, padding: '7px 10px', background: '#fff', color: '#374151' }}
        >
          <option value="all">全部教材</option>
          {books.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>{filtered.length} 条</p>

      {/* 成语列表（按首字分组） */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {byInitial.map(([initial, items]) => (
          <div key={initial}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', marginBottom: 6, paddingLeft: 2 }}>
              {initial}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {items.map(ku => <IdiomCard key={ku.id} ku={ku} />)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '48px 0', fontSize: 14 }}>没有匹配的成语</div>
        )}
      </div>
    </div>
  );
}
