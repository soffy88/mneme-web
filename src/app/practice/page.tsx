'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as api from '@/lib/api-client';

type Topic = { ku_id: string; count: number; ku_name?: string };

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

function PracticeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const subject = params?.get('subject') ?? 'math';
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [bandSel, setBandSel] = useState('初中');

  useEffect(() => {
    if (subject !== 'math') { setLoading(false); return; }
    api.listPracticeTopics('math').then((res) => {
      if (res.ok) setTopics(res.data.topics);
      setLoading(false);
    });
    // 按学生年级默认学段
    api.getMe().then((r) => {
      const g = r.ok ? r.data.grade : undefined;
      if (g) setBandSel(g.startsWith('高') ? '高中' : g.startsWith('初') ? '初中' : '小学');
    });
  }, [subject]);

  if (subject !== 'math') {
    const names: Record<string, string> = { physics: '物理', chinese: '语文', english: '英语' };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>专项练习</h1>
        <div className="mn-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚧</div>
          <div style={{ fontWeight: 600, color: 'var(--mn-ink)', marginBottom: '6px' }}>{names[subject] ?? subject}题库建设中</div>
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginBottom: '20px' }}>目前数学题库最完整，先去数学练练？</div>
          <button type="button" className="mn-btn-primary" onClick={() => router.push('/practice')}>去数学练习</button>
        </div>
      </div>
    );
  }

  const enriched = topics.map((t) => {
    const p = parseTopic(t.ku_id);
    return { ...t, gradeNum: p.gradeNum, label: (t.ku_name && t.ku_name !== t.ku_id) ? t.ku_name : p.label };
  });
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

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeInner />
    </Suspense>
  );
}
