'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import * as api from '@/lib/api-client';
import { MasteryRing } from '@/components/shared/MasteryRing';
import { MathRender } from '@/components/shared/MathRender';
import type { PracticeItem } from '@/types/api';

function PracticePageContent() {
  const params  = useSearchParams();
  const kcId    = params?.get('kc')   ?? 'GDMATH-CONIC-01';
  const kcName  = params?.get('name') ?? '椭圆';

  const [items,   setItems]      = useState<PracticeItem[]>([]);
  const [idx,     setIdx]        = useState(0);
  const [showAns, setShowAns]    = useState(false);
  const [loading, setLoading]    = useState(true);
  const [error,   setError]      = useState('');
  const [allDone, setAllDone]    = useState(false);
  const [score,   setScore]      = useState({ correct: 0, total: 0 });
  const [pressing, setPressing]  = useState<'correct' | 'wrong' | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    setIdx(0); setShowAns(false); setAllDone(false); setScore({ correct: 0, total: 0 });
    const res = await api.generatePractice(kcId, 3, 0.5);
    setLoading(false);
    if (res.ok) setItems(res.data.items);
    else setError(res.error);
  };

  useEffect(() => { void load(); }, [kcId]);

  const next = async (isCorrect: boolean) => {
    setPressing(isCorrect ? 'correct' : 'wrong');
    await new Promise((r) => setTimeout(r, 140));
    setPressing(null);
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setShowAns(false);
    if (idx + 1 >= items.length) { setAllDone(true); return; }
    setIdx((i) => i + 1);
  };

  /* ── loading skeleton ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="mn-skeleton" style={{ height: '24px', width: '120px' }} />
      <div className="mn-skeleton" style={{ height: '200px', borderRadius: '16px' }} />
    </div>
  );

  /* ── error ── */
  if (error) return (
    <div className="mn-card" style={{ padding: '32px', textAlign: 'center' }}>
      <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginBottom: '16px' }}>{error}</div>
      <button type="button" className="mn-btn-secondary" onClick={load}>重试</button>
    </div>
  );

  /* ── all done ── */
  if (allDone) return (
    <div className="mn-card" style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <MasteryRing value={score.correct / score.total} size={80} strokeWidth={8} />
      <div>
        <div style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em', color: 'var(--mn-ink)', marginBottom: '4px' }}>
          {score.correct} / {score.total} 题答对
        </div>
        <div style={{ fontSize: '14px', color: 'var(--mn-ink-3)' }}>
          {score.correct === score.total ? '全对！太棒了 🎉' : score.correct >= score.total * 0.7 ? '不错，继续保持 💪' : '多加练习，你能行！'}
        </div>
      </div>
      <button type="button" className="mn-btn-primary" style={{ width: '100%', maxWidth: '240px' }} onClick={load}>
        再来一组
      </button>
    </div>
  );

  const item = items[idx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 进度 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--mn-ink)' }}>{kcName}</h1>
        <div style={{ display: 'flex', gap: '5px' }}>
          {items.map((_, i) => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: i < idx ? 'var(--mn-blue)' : i === idx ? 'var(--mn-blue)' : 'var(--mn-border-2)',
              opacity: i === idx ? 1 : i < idx ? 0.4 : 0.3,
              transition: 'background var(--mn-duration)',
            }} />
          ))}
        </div>
      </div>

      {/* 题目卡 */}
      <div className="mn-card" style={{ padding: '20px' }}>
        {item.kernel_verified && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '11px', fontWeight: 600, color: 'var(--mn-green)',
            padding: '2px 8px', borderRadius: '99px',
            background: 'var(--mn-green-dim)', marginBottom: '14px',
          }}>
            ✓ 内核验证
          </div>
        )}
        <div style={{ fontSize: '16px', lineHeight: 1.7 }}>
          <MathRender latex={item.question_latex} />
        </div>

        {!showAns ? (
          <button
            type="button"
            className="mn-btn-secondary"
            onClick={() => setShowAns(true)}
            style={{ width: '100%', marginTop: '20px' }}
          >
            查看答案
          </button>
        ) : (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 答案 */}
            <div style={{
              padding: '12px 14px', borderRadius: '12px',
              background: 'var(--mn-green-dim)',
              border: '1px solid rgba(26,122,64,.15)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mn-green)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                答案
              </div>
              <MathRender latex={item.answer} />
            </div>

            {/* 判断按钮 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => void next(true)}
                style={{
                  flex: 1, padding: '13px', borderRadius: '12px',
                  fontWeight: 700, fontSize: '15px',
                  background: pressing === 'correct' ? '#14632e' : 'var(--mn-green)',
                  color: 'white', border: 'none', cursor: 'pointer',
                  transform: pressing === 'correct' ? 'scale(0.96)' : 'scale(1)',
                  transition: 'all var(--mn-duration-fast) var(--mn-ease-out)',
                  boxShadow: '0 2px 6px rgba(26,122,64,.25)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                ✓ 做对了
              </button>
              <button
                type="button"
                onClick={() => void next(false)}
                style={{
                  flex: 1, padding: '13px', borderRadius: '12px',
                  fontWeight: 700, fontSize: '15px',
                  background: pressing === 'wrong' ? 'var(--mn-red)' : 'var(--mn-surface)',
                  color: pressing === 'wrong' ? 'white' : 'var(--mn-ink-2)',
                  border: '1.5px solid var(--mn-border-2)', cursor: 'pointer',
                  transform: pressing === 'wrong' ? 'scale(0.96)' : 'scale(1)',
                  transition: 'all var(--mn-duration-fast) var(--mn-ease-out)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                ✗ 没对
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">加载中…</div>}>
      <PracticePageContent />
    </Suspense>
  );
}
