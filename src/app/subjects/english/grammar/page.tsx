'use client';

import { useMemo, useState } from 'react';
import { GRAMMAR_POINTS, type GrammarPoint } from './grammar.data';

const CATEGORIES = [...new Set(GRAMMAR_POINTS.map(g => g.category))];

function PointCard({ g }: { g: GrammarPoint }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o => !o)}
      style={{ border: `1px solid ${open ? '#3b82f6' : '#e5e7eb'}`, borderRadius: 8, background: '#fff', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f', margin: 0 }}>{g.point}</p>
          {!open && <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.explanation}</p>}
        </div>
        <span style={{ fontSize: 14, color: '#3b82f6', flexShrink: 0, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid #e5e7eb', background: '#f8fafc', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{g.explanation}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {g.examples.map((ex, i) => (
              <div key={i} style={{ padding: '8px 12px', borderRadius: 6, background: '#fff', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{ex.en}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{ex.zh}</div>
              </div>
            ))}
          </div>
          {g.tip && (
            <div style={{ padding: '8px 12px', borderRadius: 6, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
              💡 {g.tip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GrammarPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = search.trim();
    return GRAMMAR_POINTS.filter(g =>
      (cat === 'all' || g.category === cat) &&
      (!q || g.point.includes(q) || g.explanation.includes(q) || g.category.includes(q) ||
        g.examples.some(e => e.en.toLowerCase().includes(q.toLowerCase()) || e.zh.includes(q))),
    );
  }, [search, cat]);

  const grouped = useMemo(() => {
    const map = new Map<string, GrammarPoint[]>();
    for (const g of filtered) {
      if (!map.has(g.category)) map.set(g.category, []);
      map.get(g.category)!.push(g);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>语法讲解</h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>共 {GRAMMAR_POINTS.length} 个核心语法点 · {CATEGORIES.length} 个专题</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {['all', ...CATEGORIES].map(c => {
          const active = cat === c;
          return (
            <button key={c} onClick={() => setCat(c)}
              style={{
                fontSize: 12, padding: '5px 11px', borderRadius: 20,
                border: active ? '1.5px solid #3b82f6' : '1px solid #d1d5db',
                background: active ? '#eff6ff' : '#fff',
                color: active ? '#2563eb' : '#6b7280',
                fontWeight: active ? 700 : 400, cursor: 'pointer',
              }}>{c === 'all' ? '全部' : c}</button>
          );
        })}
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索语法点、例句…"
        style={{ width: '100%', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
      />
      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{filtered.length} 个语法点</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {grouped.map(([category, list]) => (
          <div key={category}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', letterSpacing: '0.05em', margin: '0 0 8px 4px' }}>{category}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {list.map((g, i) => <PointCard key={`${category}-${i}`} g={g} />)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0', fontSize: 14 }}>没有匹配的语法点</div>
        )}
      </div>
    </div>
  );
}
