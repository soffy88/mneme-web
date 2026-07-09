'use client';

import { useMemo, useState } from 'react';
import { VOCAB_WORDS, type VocabWord } from './words.data';
import { rate, stats, buildQueue, speak, type Rating } from './srs';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';

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

function SpeakBtn({ word }: { word: string }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); speak(word); }}
      title="发音"
      style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#3b82f6', padding: '2px 4px' }}>
      🔊
    </button>
  );
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{w.w}</span>
        {w.ph && <span style={{ fontSize: 12, color: '#94a3b8' }}>/{w.ph}/</span>}
        <SpeakBtn word={w.w} />
        <Badges w={w} />
      </div>
      <div style={{ fontSize: 13, color: open ? '#374151' : '#64748b', marginTop: 4, lineHeight: 1.6,
        overflow: open ? 'visible' : 'hidden', textOverflow: 'ellipsis', whiteSpace: open ? 'normal' : 'nowrap' }}>
        {w.tr}
      </div>
    </div>
  );
}

const RATINGS: { label: string; value: Rating; color: string; bg: string }[] = [
  { label: '不认识', value: 'again', color: '#dc2626', bg: '#fef2f2' },
  { label: '模糊', value: 'hard', color: '#d97706', bg: '#fffbeb' },
  { label: '认识', value: 'good', color: '#16a34a', bg: '#f0fdf4' },
  { label: '熟记', value: 'easy', color: '#2563eb', bg: '#eff6ff' },
];

// ── 背诵卡（间隔重复）──
function ReciteCard({ word, index, total, onRate }: { word: VocabWord; index: number; total: number; onRate: (r: Rating) => void }) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e3a5f' }}>{word.w}</div>
          <SpeakBtn word={word.w} />
        </div>
        {word.ph && <div style={{ fontSize: 13, color: '#94a3b8' }}>/{word.ph}/</div>}
        {flipped
          ? <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>{word.tr}</div>
          : <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 8 }}>点击显示释义</div>}
      </div>
      {flipped ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {RATINGS.map(r => (
            <button key={r.value} onClick={() => onRate(r.value)}
              style={{ padding: '12px 0', borderRadius: 10, border: `1px solid ${r.color}`, background: r.bg, color: r.color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {r.label}
            </button>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>先回忆词义，再点卡片翻面——按记得牢的程度评分，系统安排下次复习</p>
      )}
    </div>
  );
}

export default function VocabularyPage() {
  const [scope, setScope] = useState<Scope>('zk');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<Mode>('browse');
  const [reciteList, setReciteList] = useState<VocabWord[]>([]);
  const [reciteIdx, setReciteIdx] = useState(0);
  const [statsTick, setStatsTick] = useState(0); // 触发 stats 重算

  const scopeWords = useMemo(() => VOCAB_WORDS.filter(w => inScope(w, scope)), [scope]);

  const srStats = useMemo(() => {
    void statsTick;
    return stats(scopeWords.map(w => w.w), Date.now());
  }, [scopeWords, statsTick]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopeWords.filter(w => !q || w.w.toLowerCase().includes(q) || w.tr.includes(q));
  }, [scopeWords, search]);

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
    const byWord = new Map(VOCAB_WORDS.map(w => [w.w, w]));
    const queue = buildQueue(scopeWords.map(w => w.w), Date.now(), 20)
      .map(w => byWord.get(w)).filter((x): x is VocabWord => !!x);
    if (queue.length === 0) return;
    setReciteList(queue);
    setReciteIdx(0);
    setMode('recite');
  };

  const onRate = (r: Rating) => {
    const w = reciteList[reciteIdx];
    if (w) {
      rate(w.w, r, Date.now());
      // L4·英语接内核：词=记忆单元，评分同步进后端 FSRS/永久档案（fire-and-forget）
      const sid = getUserId();
      if (sid) {
        void api.postInteraction({
          student_id: sid,
          ku_id: `EN-VOCAB-${w.w}`,
          is_correct: r !== 'again',
          struggled: r === 'hard',
          effortless: r === 'easy',
          source: 'review',
        });
      }
    }
    if (reciteIdx + 1 >= reciteList.length) { setStatsTick(t => t + 1); setMode('browse'); }
    else setReciteIdx(i => i + 1);
  };

  if (mode === 'recite' && reciteList.length > 0) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <button onClick={() => { setStatsTick(t => t + 1); setMode('browse'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#3b82f6', padding: 0 }}>‹</button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>背单词 · {scope === 'zk' ? '中考' : scope === 'gk' ? '高考' : '全部'}</h1>
        </div>
        <ReciteCard word={reciteList[reciteIdx]} index={reciteIdx} total={reciteList.length} onRate={onRate} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>单词本</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
            中考 {COUNTS.zk} · 高考 {COUNTS.gk} · 共 {COUNTS.all} 词
          </p>
          <p style={{ fontSize: 11, color: srStats.due > 0 ? '#dc2626' : '#94a3b8', margin: '3px 0 0', fontWeight: srStats.due > 0 ? 700 : 400 }}>
            {srStats.due > 0 ? `📅 ${srStats.due} 词到期待复习` : '今日无到期复习'} · 已学 {srStats.learned}
          </p>
        </div>
        <button onClick={startRecite}
          style={{ padding: '7px 14px', borderRadius: 10, background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
          {srStats.due > 0 ? '复习到期' : '开始背诵'}
        </button>
      </div>

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
        词库来源 ECDICT（MIT 许可证）· 间隔重复进度存于本机
      </p>
    </div>
  );
}
