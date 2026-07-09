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
  const paramSubject = params?.get('subject') ?? undefined;
  // 底栏「练习」不带 subject 时，记住上次练的学科（默认数学）。
  const [subject, setSubject] = useState(
    () => paramSubject ?? (typeof window !== 'undefined' ? localStorage.getItem('mn:lastPracticeSubject') : null) ?? 'math',
  );
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [bandSel, setBandSel] = useState('初中');

  useEffect(() => { if (paramSubject) setSubject(paramSubject); }, [paramSubject]);
  useEffect(() => { try { localStorage.setItem('mn:lastPracticeSubject', subject); } catch { /* ignore */ } }, [subject]);

  useEffect(() => {
    setLoading(true);
    api.listPracticeTopics(subject).then((res) => {
      if (res.ok) setTopics(res.data.topics);
      setLoading(false);
    });
    // 按学生年级默认学段（仅数学按学段分组用）
    api.getMe().then((r) => {
      const g = r.ok ? r.data.grade : undefined;
      if (g) setBandSel(g.startsWith('高') ? '高中' : g.startsWith('初') ? '初中' : '小学');
    });
  }, [subject]);

  const names: Record<string, string> = { physics: '物理', chinese: '语文', english: '英语', math: '数学' };

  // 学科快切（从底栏「练习」也能一键换科）
  const subjectChips = (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
      {['math', 'physics', 'chinese', 'english'].map((s) => (
        <button key={s} type="button" onClick={() => router.push(`/practice?subject=${s}`)}
          style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            border: '1px solid ' + (subject === s ? 'var(--mn-blue)' : 'var(--mn-border)'),
            background: subject === s ? 'var(--mn-blue)' : 'var(--mn-surface)',
            color: subject === s ? '#fff' : 'var(--mn-ink-2)',
          }}>{names[s]}</button>
      ))}
    </div>
  );

  // 非数学：键不是 cmm-math-* 格式，无年级学段——直接列主题（题量降序）。
  if (subject !== 'math') {
    if (loading) return <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--mn-ink-3)' }}>加载题库…</div>;
    if (topics.length === 0) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--mn-ink)' }}>{names[subject] ?? subject}·专项练习</h1>
        <div className="mn-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🚧</div>
          <div style={{ fontWeight: 600, color: 'var(--mn-ink)', marginBottom: 6 }}>该科题库建设中</div>
          <button type="button" className="mn-btn-primary" onClick={() => router.push('/practice')}>去数学练习</button>
        </div>
      </div>
    );
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--mn-ink)' }}>{names[subject] ?? subject}·专项练习</h1>
          <p style={{ fontSize: 13, color: 'var(--mn-ink-3)', marginTop: 2 }}>挑一个主题，做真题 · 即时判分 · 错题自动入本</p>
        </div>
        {subjectChips}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...topics].sort((a, b) => b.count - a.count).map((t) => (
            <button key={t.ku_id} type="button" className="mn-card-interactive"
              onClick={() => router.push(`/practice/session?subject=${subject}&ku_id=${encodeURIComponent(t.ku_id)}&name=${encodeURIComponent(t.ku_name ?? t.ku_id)}`)}
              style={{ width: '100%', textAlign: 'left', background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
                borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--mn-ink)' }}>{t.ku_name ?? t.ku_id}</span>
              <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>{t.count} 题 ›</span>
            </button>
          ))}
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

      {subjectChips}

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
                  href={`/subjects/math/practice?ku_id=${encodeURIComponent(t.ku_id)}&name=${encodeURIComponent(t.label)}`}
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
