'use client';

import { useMemo, useState } from 'react';
import { RichText } from '@/components/shared/RichText';
import { MATH_FORMULAS, type MathFormula } from './formulas.data';

function FormulaRow({ f }: { f: MathFormula }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', padding: '10px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e3a5f' }}>{f.name}</span>
        {f.section && f.section !== f.name && <span style={{ fontSize: 11, color: '#9ca3af' }}>{f.section}</span>}
      </div>
      <div style={{ fontSize: 15, color: '#0f172a', lineHeight: 1.7, overflowX: 'auto' }}>
        <RichText>{f.latex}</RichText>
      </div>
    </div>
  );
}

type StageFilter = 'all' | '高中' | '初中';

export default function MathFormulaPage() {
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<StageFilter>('all');

  const stageCounts = useMemo(() => ({
    all: MATH_FORMULAS.length,
    高中: MATH_FORMULAS.filter(f => f.stage === '高中').length,
    初中: MATH_FORMULAS.filter(f => f.stage === '初中').length,
  }), []);

  const filtered = useMemo(() => {
    const q = search.trim();
    return MATH_FORMULAS.filter(f =>
      (stage === 'all' || f.stage === stage) &&
      (!q || f.name.includes(q) || f.chapter.includes(q) || f.section.includes(q) || f.latex.includes(q)),
    );
  }, [search, stage]);

  const grouped = useMemo(() => {
    const map = new Map<string, MathFormula[]>();
    for (const f of filtered) {
      if (!map.has(f.chapter)) map.set(f.chapter, []);
      map.get(f.chapter)!.push(f);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>公式手册</h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>共 {MATH_FORMULAS.length} 条公式 · {grouped.length} 个章节</p>
      </div>

      {/* 学段筛选 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {(['all', '高中', '初中'] as StageFilter[]).map(s => {
          const active = stage === s;
          const label = s === 'all' ? `全部 ${stageCounts.all}` : `${s} ${stageCounts[s]}`;
          return (
            <button key={s} onClick={() => setStage(s)}
              style={{
                fontSize: 13, padding: '6px 14px', borderRadius: 20,
                border: active ? '1.5px solid #3b82f6' : '1px solid #d1d5db',
                background: active ? '#eff6ff' : '#fff',
                color: active ? '#2563eb' : '#6b7280',
                fontWeight: active ? 700 : 400, cursor: 'pointer',
              }}>{label}</button>
          );
        })}
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索公式名、章节、表达式…"
        style={{ width: '100%', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
      />
      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{filtered.length} 条</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {grouped.map(([chapter, list]) => (
          <div key={chapter}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', letterSpacing: '0.05em', margin: '0 0 8px 4px' }}>{chapter}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {list.map((f, i) => <FormulaRow key={`${chapter}-${f.name}-${i}`} f={f} />)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0', fontSize: 14 }}>没有匹配的公式</div>
        )}
      </div>

      <p style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 28 }}>
        公式数据整理自公开教辅，仅供学习参考
      </p>
    </div>
  );
}
