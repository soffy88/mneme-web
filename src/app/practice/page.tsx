'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import * as api from '@/lib/api-client';

type Topic = { ku_id: string; count: number };

function parseTopic(kuId: string) {
  const gm = kuId.match(/[gG](\d+)/);
  const gradeNum = gm ? parseInt(gm[1], 10) : 0;
  let label = kuId
    .replace(/^cmm-math-g\d+-/i, '')
    .replace(/^RENJIAO-G\d+-MATH-[A-Z]+-ku-/i, '')
    .replace(/^GDMATH-/i, '');
  if (!label || label === kuId) label = kuId.split('-').pop() ?? kuId;
  return { gradeNum, label };
}
function band(n: number) { return n >= 10 ? '高中' : n >= 7 ? '初中' : n >= 1 ? '小学' : '其它'; }
function gradeName(n: number) { return n >= 10 ? `高${n - 9}` : n >= 7 ? `初${n - 6}` : n >= 1 ? `${n}年级` : '其它'; }
const BANDS = ['初中', '高中', '小学'];

export default function PracticePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [bandSel, setBandSel] = useState('初中');

  useEffect(() => {
    api.listPracticeTopics('math').then((res) => {
      if (res.ok) setTopics(res.data.topics);
      setLoading(false);
    });
  }, []);

  const enriched = topics.map((t) => ({ ...t, ...parseTopic(t.ku_id) }));
  const inBand = enriched.filter((t) => band(t.gradeNum) === bandSel);
  const byGrade = new Map<number, typeof enriched>();
  inBand.forEach((t) => { const a = byGrade.get(t.gradeNum) ?? []; a.push(t); byGrade.set(t.gradeNum, a); });
  const grades = [...byGrade.keys()].sort((a, b) => a - b);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>专项练习</h1>
        <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>挑一个主题，做真题 · 即时判分 · 错题自动入本</p>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {BANDS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBandSel(b)}
            style={{
              padding: '7px 16px', borderRadius: '99px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              border: '1px solid ' + (bandSel === b ? 'var(--mn-blue)' : 'var(--mn-border)'),
              background: bandSel === b ? 'var(--mn-blue)' : 'var(--mn-surface)',
              color: bandSel === b ? 'white' : 'var(--mn-ink-2)',
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mn-skeleton" style={{ height: '200px', borderRadius: '16px' }} />
      ) : grades.length === 0 ? (
        <div className="mn-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--mn-ink-3)', fontSize: '14px' }}>
          这个学段的题库还在补充中，换一个学段试试 👆
        </div>
      ) : (
        grades.map((g) => (
          <div key={g}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink-2)', marginBottom: '10px' }}>{gradeName(g)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {byGrade.get(g)!.sort((a, b) => b.count - a.count).map((t) => (
                <Link
                  key={t.ku_id}
                  href={`/subjects/math/practice?ku_id=${encodeURIComponent(t.ku_id)}`}
                  className="mn-card"
                  style={{ padding: '16px', textDecoration: 'none', display: 'block' }}
                >
                  <div style={{
                    fontSize: '15px', fontWeight: 700, color: 'var(--mn-ink)', lineHeight: 1.3, marginBottom: '6px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>{t.count} 道真题 ›</div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
