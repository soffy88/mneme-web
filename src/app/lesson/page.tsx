'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import * as api from '@/lib/api-client';
import { MathRender } from '@/components/shared/MathRender';
import { KernelPlot } from '@/components/shared/KernelPlot';
import type { LessonRes } from '@/types/api';

function LessonPageContent() {
  const params = useSearchParams();
  const qid = params?.get('q') ?? '';
  const [lesson,  setLesson]  = useState<LessonRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    if (!qid) { setLoading(false); return; }
    setLoading(true); setError('');
    const res = await api.getLesson(qid);
    setLoading(false);
    if (res.ok) setLesson(res.data);
    else setError(res.error);
  };
  useEffect(() => { void load(); }, [qid]);

  if (!qid) return (
    <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '13px', color: 'var(--mn-ink-3)' }}>
      请从题目或知识点进入讲解页
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="mn-skeleton" style={{ height: '20px', width: '40%' }} />
      <div className="mn-skeleton" style={{ height: '80px', borderRadius: '16px' }} />
      <div className="mn-skeleton" style={{ height: '160px', borderRadius: '16px' }} />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '13px', color: 'var(--mn-ink-3)' }}>
      {error} — <button type="button" onClick={load} style={{ color: 'var(--mn-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>重试</button>
    </div>
  );

  if (!lesson) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--mn-ink)', marginBottom: '10px' }}>
          题目讲解
        </h1>
        <div className="mn-card" style={{ padding: '16px 18px', fontSize: '15px', lineHeight: 1.7, color: 'var(--mn-ink)' }}>
          {lesson.question_text}
        </div>
      </div>

      {/* 内核图示（item 14）：确定性内核产出，Mafs 渲染 */}
      {lesson.plot_data && lesson.plot_data.traces.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <KernelPlot data={lesson.plot_data} />
          <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', textAlign: 'center' }}>
            图示（{lesson.plot_data.kc_type}）· 数值由确定性内核产出
            {!lesson.self_check_passed && (
              <span style={{ color: 'var(--mn-orange)' }}> · ⚠ 仅供参考</span>
            )}
          </div>
        </div>
      )}

      {/* 分步解析 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          解题过程
        </div>
        {lesson.solution_steps.map((step, i) => (
          <button
            key={step.step_no}
            type="button"
            className="mn-card-interactive"
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left',
              background: expanded === i ? 'var(--mn-blue-dim)' : 'var(--mn-surface)',
              border: `1px solid ${expanded === i ? 'rgba(30,58,95,.2)' : 'var(--mn-border)'}`,
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              transition: 'all var(--mn-duration-fast) var(--mn-ease-out)',
            }}
          >
            <span style={{
              flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: expanded === i ? 'var(--mn-blue)' : 'var(--mn-border)',
              color: expanded === i ? 'white' : 'var(--mn-ink-2)',
              fontSize: '12px', fontWeight: 700,
              transition: 'all var(--mn-duration-fast)',
            }}>
              {step.step_no}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', color: 'var(--mn-ink-2)', marginBottom: '4px' }}>{step.description}</div>
              <div style={{ fontSize: '15px', overflow: expanded === i ? 'visible' : 'hidden' }}>
                <MathRender latex={step.latex} />
              </div>
            </div>
            <span style={{ color: 'var(--mn-border-2)', fontSize: '14px', transition: 'transform var(--mn-duration)', transform: expanded === i ? 'rotate(90deg)' : 'none' }}>›</span>
          </button>
        ))}
      </div>

      {/* 答案 */}
      <div style={{
        padding: '16px 18px', borderRadius: '14px',
        background: 'var(--mn-green-dim)',
        border: '1px solid rgba(26,122,64,.2)',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mn-green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          ✓ 最终答案
        </div>
        <div style={{ fontSize: '18px' }}>
          <MathRender latex={lesson.answer} block />
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">加载中…</div>}>
      <LessonPageContent />
    </Suspense>
  );
}
