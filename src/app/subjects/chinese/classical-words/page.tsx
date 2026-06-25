'use client';

import { useEffect, useMemo, useState } from 'react';
import * as api from '@/lib/api-client';
import type { KnowledgeUnitItem } from '@/types/api';

// ── 描述解析 ──────────────────────────────────────────────────────────

interface Yixiang { pos: string; yi: string; liju: string; extra?: string }

function parseYixiangs(desc: string): Yixiang[] {
  if (!desc) return [];

  // 新格式: [多义项]: 块
  const multiIdx = desc.indexOf('[多义项]:');
  if (multiIdx !== -1) {
    const block = desc.slice(multiIdx + 7);
    const lines = block.split('\n').filter(l => /^义项\d+:/.test(l.trim()));
    const items = lines.map(line => {
      const body = line.replace(/^义项\d+:\s*/, '').trim();
      const segs = body.split('；').map(s => s.trim());
      const get = (prefix: string) => segs.find(s => s.startsWith(prefix))?.slice(prefix.length).trim() ?? '';
      return { pos: get('词性:'), yi: get('义项:'), liju: get('例句:'), extra: get('通假') };
    }).filter(x => x.yi || x.pos);
    if (items.length) return items;
  }

  // 002格式 fallback: 单 [文言]: 行
  const wenyanMatch = desc.match(/\[文言\]:\s*(.+)/);
  if (wenyanMatch) {
    const segs = wenyanMatch[1].split('；').map(s => s.trim());
    const get = (prefix: string) => segs.find(s => s.startsWith(prefix))?.slice(prefix.length).trim() ?? '';
    const pos = get('词性:'); const yi = get('义项:'); const liju = get('例句:');
    if (yi || pos) return [{ pos, yi, liju }];
  }

  // 旧格式: 【文言】
  const oldMatch = desc.match(/【文言】(.+)/);
  if (oldMatch) {
    const segs = oldMatch[1].split('；').map(s => s.trim());
    const get = (prefix: string) => segs.find(s => s.startsWith(prefix))?.slice(prefix.length).trim() ?? '';
    const pos = get('词性：'); const yi = get('义项：'); const liju = get('例句：');
    if (yi || pos) return [{ pos, yi, liju }];
  }

  return [];
}

function parseSource(desc: string): string {
  const m = desc.match(/来源:\s*(.+)/);
  return m?.[1]?.trim() ?? '';
}

// ── 卡片 ──────────────────────────────────────────────────────────────

function WenyanCard({ ku }: { ku: KnowledgeUnitItem }) {
  const [open, setOpen] = useState(false);
  const d = ku.description ?? '';
  const yixiangs = useMemo(() => parseYixiangs(d), [d]);
  const source = useMemo(() => parseSource(d), [d]);
  const word = ku.name.split('·')[0].trim();
  const n = yixiangs.length;
  const first = yixiangs[0];

  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        border: `1px solid ${open ? '#f59e0b' : '#fde68a'}`,
        borderRadius: 8, background: '#fff', cursor: 'pointer',
        overflow: 'hidden', transition: 'border-color 0.15s',
      }}
    >
      {/* 折叠行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#92400e', minWidth: 36, flexShrink: 0 }}>{word}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {first ? (
            <span style={{ fontSize: 12, color: '#78716c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {first.pos && <span style={{ color: '#d97706', marginRight: 4 }}>[{first.pos}]</span>}
              {first.yi}
              {first.liju && <span style={{ color: '#a8a29e', marginLeft: 6 }}>例：{first.liju}</span>}
            </span>
          ) : (
            <span style={{ fontSize: 12, color: '#a8a29e' }}>{d.slice(0, 40)}</span>
          )}
        </div>
        {n > 1 && (
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: '#fef3c7', color: '#d97706', fontWeight: 600, flexShrink: 0 }}>
            {n}义项
          </span>
        )}
        <span style={{ fontSize: 14, color: '#d97706', flexShrink: 0, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
      </div>

      {/* 展开区 */}
      {open && (
        <div style={{ borderTop: '1px solid #fef3c7', background: '#fffbeb' }}>
          {yixiangs.length > 0 ? (
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {yixiangs.map((yi, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  {yixiangs.length > 1 && (
                    <span style={{ fontSize: 11, color: '#92400e', fontWeight: 700, minWidth: 16, marginTop: 1 }}>
                      {'①②③④⑤⑥⑦⑧'[i] ?? `${i + 1}.`}
                    </span>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#1c1917', lineHeight: 1.5 }}>
                      {yi.pos && <span style={{ fontSize: 11, color: '#d97706', marginRight: 6, fontWeight: 600 }}>[{yi.pos}]</span>}
                      {yi.yi}
                      {yi.extra && <span style={{ fontSize: 11, color: '#a8a29e', marginLeft: 6 }}>（{yi.extra}）</span>}
                    </div>
                    {yi.liju && (
                      <div style={{ fontSize: 12, color: '#57534e', marginTop: 2, fontStyle: 'italic' }}>
                        例：{yi.liju}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '10px 14px', fontSize: 12, color: '#78716c', whiteSpace: 'pre-wrap' }}>
              {d.slice(0, 200)}
            </div>
          )}
          {source && (
            <div style={{ padding: '6px 14px', borderTop: '1px solid #fef3c7', fontSize: 11, color: '#a8a29e' }}>
              出处：{source}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 页面 ──────────────────────────────────────────────────────────────

export default function ClassicalWordsPage() {
  const [kus, setKus] = useState<KnowledgeUnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const [filterBook, setFilterBook] = useState('all');
  const [showMultiOnly, setShowMultiOnly] = useState(false);

  useEffect(() => {
    api.listKnowledgePoints({ subject: 'chinese' }).then(res => {
      if (res.ok) setKus(res.data.filter(k => k.ku_type === 'wenyan_word'));
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
    if (showMultiOnly) out = out.filter(k => parseYixiangs(k.description ?? '').length > 1);
    return out;
  }, [kus, filterBook, search, showMultiOnly]);

  const multiCount = useMemo(() => kus.filter(k => parseYixiangs(k.description ?? '').length > 1).length, [kus]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#78716c' }}>加载文言实词中…</div>;
  if (err) return <div style={{ padding: 24, color: '#dc2626' }}>{err}</div>;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#78350f', margin: 0 }}>文言实词本</h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            共 {kus.length} 条实词 · {multiCount} 条多义词
          </p>
        </div>
        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#fef3c7', color: '#d97706', fontWeight: 500, marginTop: 4 }}>{multiCount} 多义</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索词语或释义…"
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <button
          onClick={() => setShowMultiOnly(v => !v)}
          style={{
            fontSize: 12, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
            border: `1px solid ${showMultiOnly ? '#f59e0b' : '#d1d5db'}`,
            background: showMultiOnly ? '#fef3c7' : '#fff',
            color: showMultiOnly ? '#92400e' : '#6b7280', fontWeight: showMultiOnly ? 600 : 400,
          }}
        >
          仅多义词
        </button>
        <span style={{ fontSize: 12, color: '#a8a29e' }}>{filtered.length} 条</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(ku => <WenyanCard key={ku.id} ku={ku} />)}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#a8a29e', padding: '48px 0', fontSize: 14 }}>没有匹配的词语</div>
        )}
      </div>
    </div>
  );
}
