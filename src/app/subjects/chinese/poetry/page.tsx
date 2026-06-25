'use client';

import { useEffect, useMemo, useState } from 'react';
import * as api from '@/lib/api-client';
import type { KnowledgeUnitItem } from '@/types/api';

function PoemCard({ ku }: { ku: KnowledgeUnitItem }) {
  const [show, setShow] = useState(false);
  const d = ku.description ?? '';
  const knowWhat = d.match(/know-what:\s*(.+)/)?.[1] ?? '';
  const source = d.match(/来源:\s*(.+)/)?.[1] ?? '';

  return (
    <div style={{ border: '1px solid #d9f99d', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '10px 14px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#1c1917', margin: 0, lineHeight: 1.6 }}>{ku.name}</p>
          {source && <p style={{ fontSize: 11, color: '#a8a29e', margin: '3px 0 0' }}>{source}</p>}
        </div>
        {knowWhat && knowWhat !== ku.name && (
          <button
            onClick={() => setShow(s => !s)}
            style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid #86efac', color: '#16a34a', background: 'transparent', cursor: 'pointer', flexShrink: 0 }}
          >
            {show ? '收起' : '释义'}
          </button>
        )}
      </div>
      {show && knowWhat && knowWhat !== ku.name && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid #f0fdf4', background: '#f7fee7', fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
          {knowWhat}
        </div>
      )}
    </div>
  );
}

export default function PoetryPage() {
  const [kus, setKus] = useState<KnowledgeUnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [filterBook, setFilterBook] = useState('all');

  useEffect(() => {
    api.listKnowledgePoints({ subject: 'chinese' }).then(res => {
      if (res.ok) setKus(res.data.filter(k => k.ku_type === 'mingpian'));
      else setErr(res.error);
    }).finally(() => setLoading(false));
  }, []);

  const books = useMemo(() => [...new Set(kus.map(k => k.book_name))].sort(), [kus]);

  const filtered = useMemo(
    () => filterBook === 'all' ? kus : kus.filter(k => k.book_name === filterBook),
    [kus, filterBook]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; order: number; kus: KnowledgeUnitItem[] }>();
    for (const ku of filtered) {
      if (!map.has(ku.cluster_id)) map.set(ku.cluster_id, { name: ku.cluster_name, order: ku.cluster_order, kus: [] });
      map.get(ku.cluster_id)!.kus.push(ku);
    }
    return [...map.values()].sort((a, b) => a.order - b.order);
  }, [filtered]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#78716c' }}>加载名篇名句中…</div>;
  if (err) return <div style={{ padding: 24, color: '#dc2626' }}>{err}</div>;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#14532d', margin: 0 }}>古诗文诵读</h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>共 {kus.length} 句名篇名句 · {grouped.length} 篇</p>
        </div>
        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#dcfce7', color: '#16a34a', fontWeight: 500, marginTop: 4 }}>建设中</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <select
          value={filterBook}
          onChange={e => setFilterBook(e.target.value)}
          style={{ fontSize: 12, border: '1px solid #d1d5db', borderRadius: 8, padding: '7px 10px', background: '#fff', color: '#374151' }}
        >
          <option value="all">全部教材</option>
          {books.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <span style={{ fontSize: 12, color: '#a8a29e', alignSelf: 'center' }}>{filtered.length} 句 · {grouped.length} 篇</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {grouped.map(g => (
          <div key={g.name}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 4px' }}>{g.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {g.kus.map(ku => <PoemCard key={ku.id} ku={ku} />)}
            </div>
          </div>
        ))}
        {grouped.length === 0 && <div style={{ textAlign: 'center', color: '#a8a29e', padding: '48px 0', fontSize: 14 }}>没有匹配的内容</div>}
      </div>
    </div>
  );
}
