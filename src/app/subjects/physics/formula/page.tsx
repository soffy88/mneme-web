'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import { RichText } from '@/components/shared/RichText';
import type { KnowledgeUnitItem } from '@/types/api';

// 解析 formula KU 的 description：正文公式 +【适用条件】
function parseFormula(desc: string): { body: string; condition: string } {
  if (!desc) return { body: '', condition: '' };
  const m = desc.split(/【适用条件】/);
  return { body: m[0].trim(), condition: (m[1] ?? '').trim() };
}

function FormulaCard({ ku }: { ku: KnowledgeUnitItem }) {
  const [open, setOpen] = useState(false);
  const { body, condition } = useMemo(() => parseFormula(ku.description ?? ''), [ku.description]);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{ border: `1px solid ${open ? '#3b82f6' : '#dbeafe'}`, borderRadius: 8, background: '#fff', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f', margin: 0, lineHeight: 1.5 }}>{ku.name}</p>
          {!open && body && (
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{body}</p>
          )}
        </div>
        <span style={{ fontSize: 14, color: '#3b82f6', flexShrink: 0, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid #dbeafe', background: '#f8fafc', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {body && (
            <div style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.8 }}>
              <RichText>{body}</RichText>
            </div>
          )}
          {condition && (
            <div style={{ padding: '8px 12px', borderRadius: 6, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', marginBottom: 3 }}>适用条件</div>
              <div style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.6 }}>{condition}</div>
            </div>
          )}
          {ku.book_name && <div style={{ fontSize: 11, color: '#94a3b8' }}>出处：{ku.book_name}</div>}
        </div>
      )}
    </div>
  );
}

export default function PhysicsFormulaPage() {
  const router = useRouter();
  const [kus, setKus] = useState<KnowledgeUnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.listKnowledgePoints({ subject: 'physics' }).then(res => {
      if (res.ok) setKus(res.data.filter(k => k.ku_type === 'formula'));
      else setErr(res.error);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return kus;
    return kus.filter(k => k.name.includes(q) || (k.description ?? '').includes(q) || (k.cluster_name ?? '').includes(q));
  }, [kus, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; name: string; order: number; kus: KnowledgeUnitItem[] }>();
    for (const ku of filtered) {
      if (!map.has(ku.cluster_id)) map.set(ku.cluster_id, { id: ku.cluster_id, name: ku.cluster_name, order: ku.cluster_order, kus: [] });
      map.get(ku.cluster_id)!.kus.push(ku);
    }
    return [...map.values()].sort((a, b) => a.order - b.order);
  }, [filtered]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>加载公式中…</div>;
  if (err) return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ fontSize: 14, color: '#dc2626', lineHeight: 1.6 }}>{err}</div>
      <button onClick={() => router.push('/subjects/physics')} style={{ marginTop: 8, padding: '10px 28px', borderRadius: 10, background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>返回物理</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>公式手册</h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>共 {kus.length} 个核心公式 · {grouped.length} 个专题</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索公式、专题…"
        style={{ width: '100%', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
      />
      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{filtered.length} 个公式</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {grouped.map(g => (
          <div key={g.id}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', letterSpacing: '0.05em', margin: '0 0 8px 4px' }}>{g.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {g.kus.map((ku, i) => <FormulaCard key={`${g.id}-${ku.id}-${i}`} ku={ku} />)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0', fontSize: 14 }}>没有匹配的公式</div>
        )}
      </div>
    </div>
  );
}
