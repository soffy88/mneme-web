'use client';

import { useEffect, useMemo, useState } from 'react';
import * as api from '@/lib/api-client';
import type { KnowledgeUnitItem } from '@/types/api';

function WenyanCard({ ku }: { ku: KnowledgeUnitItem }) {
  const [open, setOpen] = useState(false);
  const d = ku.description ?? '';
  const knowWhat = d.match(/know-what:\s*(.+)/)?.[1] ?? '';
  const wenyan = d.match(/\[文言\]:\s*(.+)/)?.[1] ?? '';
  const source = d.match(/来源:\s*(.+)/)?.[1] ?? '';
  const pos = wenyan.match(/词性:([^；]+)/)?.[1] ?? '';
  const nameParts = ku.name.split('·');
  const word = nameParts[0]?.trim() ?? ku.name;
  const sense = nameParts.slice(1).join('·').trim();

  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{ border: `1px solid ${open ? '#f59e0b' : '#fde68a'}`, borderRadius: 8, background: '#fff', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#92400e', minWidth: 32 }}>{word}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {sense && <div style={{ fontSize: 12, color: '#78716c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sense}</div>}
          {knowWhat && <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{knowWhat}</div>}
        </div>
        {pos && <span style={{ fontSize: 11, color: '#d97706', flexShrink: 0 }}>{pos}</span>}
      </div>
      {open && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid #fef3c7', background: '#fffbeb' }}>
          {knowWhat && <p style={{ fontSize: 13, color: '#1c1917', margin: '0 0 6px' }}>{knowWhat}</p>}
          {wenyan && (
            <p style={{ fontSize: 12, color: '#78716c', margin: '0 0 4px' }}>
              {wenyan.split('；').map((s, i) => <span key={i} style={{ marginRight: 10 }}>{s}</span>)}
            </p>
          )}
          {source && <p style={{ fontSize: 11, color: '#a8a29e', margin: 0 }}>出处：{source}</p>}
        </div>
      )}
    </div>
  );
}

export default function ClassicalWordsPage() {
  const [kus, setKus] = useState<KnowledgeUnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [search, setSearch] = useState('');
  const [filterBook, setFilterBook] = useState('all');

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
    return out;
  }, [kus, filterBook, search]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#78716c' }}>加载文言实词中…</div>;
  if (err) return <div style={{ padding: 24, color: '#dc2626' }}>{err}</div>;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#78350f', margin: 0 }}>文言实词本</h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>共 {kus.length} 条实词 · 高考120实词+全册文言</p>
        </div>
        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#fef3c7', color: '#d97706', fontWeight: 500, marginTop: 4 }}>建设中</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索词语…"
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

      <p style={{ fontSize: 12, color: '#a8a29e', marginBottom: 12 }}>{filtered.length} 条</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(ku => <WenyanCard key={ku.id} ku={ku} />)}
        {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#a8a29e', padding: '48px 0', fontSize: 14 }}>没有匹配的词语</div>}
      </div>
    </div>
  );
}
