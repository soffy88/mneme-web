'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import type { KnowledgeUnitItem } from '@/types/api';

// 解析 description：正文 +【来源】+【轨道】
function parseDesc(desc: string): { body: string; source: string } {
  if (!desc) return { body: '', source: '' };
  const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
  const body = lines.filter(l => !l.startsWith('【')).join(' ');
  const source = lines.find(l => l.startsWith('【来源】'))?.replace('【来源】', '').trim() ?? '';
  return { body: body || desc.trim(), source };
}

type TabKey = 'zixing_ziyin' | 'wenhua_changshi';
const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: 'zixing_ziyin', label: '字音字形', hint: '易错字音、字形辨析' },
  { key: 'wenhua_changshi', label: '文化常识', hint: '作家作品、文学文化常识' },
];

function EntryCard({ ku }: { ku: KnowledgeUnitItem }) {
  const [open, setOpen] = useState(false);
  const { body, source } = useMemo(() => parseDesc(ku.description ?? ''), [ku.description]);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{ border: `1px solid ${open ? '#16a34a' : '#dcfce7'}`, borderRadius: 8, background: '#fff', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#14532d', margin: 0, lineHeight: 1.5 }}>{ku.name}</p>
          {!open && body && (
            <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{body}</p>
          )}
        </div>
        <span style={{ fontSize: 14, color: '#16a34a', flexShrink: 0, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid #dcfce7', background: '#f7fee7', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {body && <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{body}</div>}
          {source && <div style={{ fontSize: 11, color: '#9ca3af' }}>来源：{source}</div>}
        </div>
      )}
    </div>
  );
}

export default function DictionaryPage() {
  const router = useRouter();
  const [kus, setKus] = useState<KnowledgeUnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState<TabKey>('zixing_ziyin');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.listKnowledgePoints({ subject: 'chinese' }).then(res => {
      if (res.ok) setKus(res.data);
      else setErr(res.error);
    }).finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    zixing_ziyin: kus.filter(k => k.ku_type === 'zixing_ziyin').length,
    wenhua_changshi: kus.filter(k => k.ku_type === 'wenhua_changshi').length,
    chengyu: kus.filter(k => k.ku_type === 'chengyu').length,
  }), [kus]);

  const filtered = useMemo(() => {
    const q = search.trim();
    return kus.filter(k => k.ku_type === tab && (!q || k.name.includes(q) || (k.description ?? '').includes(q)));
  }, [kus, tab, search]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>加载字词典中…</div>;
  if (err) return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ fontSize: 14, color: '#dc2626', lineHeight: 1.6 }}>{err}</div>
      <button onClick={() => router.push('/subjects/chinese')} style={{ marginTop: 8, padding: '10px 28px', borderRadius: 10, background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>返回语文</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#14532d', margin: 0 }}>字词典</h1>
        <p style={{ fontSize: 12, color: '#6b7280', margin: '4px 0 0' }}>字音字形 {counts.zixing_ziyin} · 文化常识 {counts.wenhua_changshi} · 成语 {counts.chengyu}</p>
      </div>

      {/* tab 切换 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                fontSize: 13, padding: '6px 14px', borderRadius: 20,
                border: active ? '1.5px solid #16a34a' : '1px solid #d1d5db',
                background: active ? '#dcfce7' : '#fff',
                color: active ? '#15803d' : '#6b7280',
                fontWeight: active ? 700 : 400, cursor: 'pointer',
              }}
            >
              {t.label} {counts[t.key]}
            </button>
          );
        })}
        <button
          onClick={() => router.push('/subjects/chinese/idioms')}
          style={{ fontSize: 13, padding: '6px 14px', borderRadius: 20, border: '1px solid #d1d5db', background: '#fff', color: '#6b7280', cursor: 'pointer' }}
        >
          成语 {counts.chengyu} ›
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={`搜索${TABS.find(t => t.key === tab)?.label}…`}
        style={{ width: '100%', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
      />
      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>{filtered.length} 条 · {TABS.find(t => t.key === tab)?.hint}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map((ku, i) => <EntryCard key={`${ku.id}-${i}`} ku={ku} />)}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '48px 0', fontSize: 14 }}>没有匹配的条目</div>
        )}
      </div>
    </div>
  );
}
