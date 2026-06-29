'use client';

import { useMemo, useState } from 'react';
import { VOCAB_WORDS, type VocabWord } from './words.data';

type Scope = 'all' | 'zk' | 'gk';
type Mode = 'browse' | 'recite';

const COUNTS = {
  all: VOCAB_WORDS.length,
  zk: VOCAB_WORDS.filter(w => w.zk).length,
  gk: VOCAB_WORDS.filter(w => w.gk).length,
};

function inScope(w: VocabWord, scope: Scope) {
  return scope === 'all' || (scope === 'zk' ? w.zk : w.gk);
}

function Badges({ w }: { w: VocabWord }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      {w.zk && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>中考</span>}
      {w.gk && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#dbeafe', color: '#2563eb', fontWeight: 700 }}>高考</span>}
    </span>
  );
}

function WordRow({ w }: { w: VocabWord }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o => !o)}
      style={{ border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', padding: '10px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{w.w}</span>
        {w.ph && <span style={{ fontSize: 12, color: '#94a3b8' }}>/{w.ph}/</span>}
        <Badges w={w} />
      </div>
      <div style={{ fontSize: 13, color: open ? '#374151' : '#64748b', marginTop: 4, lineHeight: 1.6,
        overflow: open ? 'visible' : 'hidden', textOverflow: 'ellipsis', whiteSpace: open ? 'normal' : 'nowrap' }}>
        {w.tr}
      </div>
    </div>
  );
}

// ── 背诵卡（本地，不持久化）──
function ReciteCard({ word, index, total, onNext }: { word: VocabWord; index: number; total: number; onNext: () => void }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#e2e8f0', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: '#3b82f6', width: `${(index / total) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 12, color: '#64748b' }}>{index + 1}/{total}</span>
      </div>
      <div onClick={() => setFlipped(f => !f)}
        style={{ minHeight: 200, borderRadius: 16, border: '2px solid #3b82f6', background: flipped ? '#eff6ff' : '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, cursor: 'pointer', textAlign: 'center', gap: 10 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f' }}>{word.w}</div>
        {word.ph && <div style={{ fontSize: 13, color: '#94a3b8' }}>/{word.ph}/</div>}
        {flipped
          ? <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>{word.tr}</div>
          : <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 8 }}>点击显示释义</div>}
      </div>
      <button onClick={onNext}
        style={{ padding: 14, borderRadius: 12, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        下一个 →
      </button>
    </div>
  );
}

export default function VocabularyPage() {
  const [scope, setScope] = useState<Scope>('zk');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<Mode>('browse');
  const [reciteList, setReciteList] = useState<VocabWord[]>([]);
  const [reciteIdx, setReciteIdx] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return VOCAB_WORDS.filter(w => inScope(w, scope) && (!q || w.w.toLowerCase().includes(q) || w.tr.includes(q)));
  }, [scope, search]);

  const byInitial = useMemo(() => {
    const map = new Map<string, VocabWord[]>();
    for (const w of filtered) {
      const ch = w.w[0].toUpperCase();
      if (!map.has(ch)) map.set(ch, []);
      map.get(ch)!.push(w);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const startRecite = () => {
    const pool = VOCAB_WORDS.filter(w => inScope(w, scope));
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 20);
    setReciteList(shuffled);
    setReciteIdx(0);
    setMode('recite');
  };

  const nextRecite = () => {
    if (reciteIdx + 1 >= reciteList.length) setMode('browse');
    else setReciteIdx(i => i + 1);
  };

  if (mode === 'recite' && reciteList.length > 0) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <button onClick={() => setMode('browse')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#3b82f6', padding: 0 }}>‹</button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>背单词 · {scope === 'zk' ? '中考' : scope === 'gk' ? '高考' : '全部'}</h1>
        </div>
        <ReciteCard word={reciteList[reciteIdx]} index={reciteIdx} total={reciteList.length} onNext={nextRecite} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>单词本</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>中考 {COUNTS.zk} · 高考 {COUNTS.gk} · 共 {COUNTS.all} 词</p>
        </div>
        <button onClick={startRecite}
          style={{ padding: '7px 14px', borderRadius: 10, background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          开始背诵
        </button>
      </div>

      {/* 范围筛选 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {(['zk', 'gk', 'all'] as Scope[]).map(s => {
          const active = scope === s;
          const label = s === 'zk' ? `中考 ${COUNTS.zk}` : s === 'gk' ? `高考 ${COUNTS.gk}` : `全部 ${COUNTS.all}`;
          return (
            <button key={s} onClick={() => setScope(s)}
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
        placeholder="搜索单词或释义…"
        style={{ width: '100%', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
      />
      <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{filtered.length} 词</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {byInitial.map(([initial, list]) => (
          <div key={initial}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.08em', marginBottom: 6, paddingLeft: 2 }}>{initial}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {list.map(w => <WordRow key={w.w} w={w} />)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0', fontSize: 14 }}>没有匹配的单词</div>
        )}
      </div>

      <p style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 28 }}>
        词库来源 ECDICT（MIT 许可证），仅供学习参考
      </p>
    </div>
  );
}
