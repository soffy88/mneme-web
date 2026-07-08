'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import { RichText } from '@/components/shared/RichText';
import type { QuizDueRes, QuizItem, QuizSubmitRes } from '@/types/api';

type Phase = 'loading' | 'not-due' | 'active' | 'grading' | 'result';

// 选择题判定：题面含 ≥2 个形如「A.」「B、」的选项标记（同 review 页）
function isMCQ(q: string): boolean {
  return (q.match(/[ABCD][.、．]/g) ?? []).length >= 2;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function btn(bg: string): React.CSSProperties {
  return {
    marginTop: 12, padding: '12px 18px', borderRadius: 12, border: 'none',
    background: bg, color: bg === 'transparent' ? 'var(--mn-ink)' : '#fff',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  };
}

export default function QuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [notDueInfo, setNotDueInfo] = useState<{ next_due_date?: string; reason?: string }>({});

  const [quizId, setQuizId] = useState<string | null>(null);
  const [items, setItems] = useState<QuizItem[]>([]);
  const [timeLimit, setTimeLimit] = useState(0);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittingRef = useRef(false);

  const [result, setResult] = useState<QuizSubmitRes | null>(null);

  const load = useCallback(async () => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    const res = await api.getQuizDue(sid);
    if (!res.ok) { setNotDueInfo({ reason: '加载失败，请稍后重试' }); setPhase('not-due'); return; }
    const data: QuizDueRes = res.data;
    if (!data.due) {
      setNotDueInfo({ next_due_date: data.next_due_date, reason: data.reason });
      setPhase('not-due');
      return;
    }
    setQuizId(data.quiz_id);
    setItems(data.items);
    setTimeLimit(data.time_limit_seconds);
    setAnswers({});
    setIdx(0);
    setElapsed(0);
    setPhase('active');
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  const submit = useCallback(async () => {
    if (submittingRef.current || !quizId) return;
    submittingRef.current = true;
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('grading');
    const payload = items.map((it) => ({ question_id: it.question_id, student_answer: (answers[it.question_id] ?? '').trim() }));
    const res = await api.submitQuiz(quizId, sid, payload, elapsed);
    if (res.ok) setResult(res.data);
    else setResult({ error: res.error });
    setPhase('result');
  }, [quizId, items, answers, elapsed, router]);

  // 倒计时：减到 0 自动交卷
  useEffect(() => {
    if (phase !== 'active') return;
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  useEffect(() => {
    if (phase === 'active' && timeLimit > 0 && elapsed >= timeLimit) void submit();
  }, [phase, elapsed, timeLimit, submit]);

  if (phase === 'loading') {
    return <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--mn-ink-3)' }}>加载小测…</div>;
  }

  if (phase === 'not-due') {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 32 }}>⏱</div>
        <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: 'var(--mn-ink)' }}>今天没有限时小测</div>
        {notDueInfo.next_due_date && (
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--mn-ink-3)' }}>下次小测：{notDueInfo.next_due_date}</div>
        )}
        {notDueInfo.reason && (
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--mn-ink-3)' }}>{notDueInfo.reason}</div>
        )}
        <button onClick={() => router.push('/home')} style={btn('var(--mn-blue)')}>回首页</button>
      </div>
    );
  }

  if (phase === 'grading') {
    return <div style={{ padding: 60, textAlign: 'center', color: 'var(--mn-ink-3)' }}>判分中…</div>;
  }

  if (phase === 'result') {
    if (!result || 'error' in result) {
      return (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: 'var(--mn-ink)' }}>提交失败</div>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--mn-ink-3)' }}>{result?.error ?? '请稍后重试'}</div>
          <button onClick={() => router.push('/home')} style={btn('var(--mn-blue)')}>回首页</button>
        </div>
      );
    }
    const VERDICT_META: Record<string, { label: string; color: string; bg: string }> = {
      correct: { label: '✓ 答对了', color: '#16a34a', bg: '#f0fdf4' },
      wrong:   { label: '✗ 答错了', color: '#dc2626', bg: '#fef2f2' },
      unsure:  { label: '待确认',   color: 'var(--mn-ink-2)', bg: 'var(--mn-surface)' },
    };
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'var(--mn-surface)', border: '1px solid var(--mn-border)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--mn-ink-3)' }}>本次小测成绩</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--mn-orange)', margin: '6px 0' }}>
            {Math.round(result.score * 100)}<span style={{ fontSize: 18 }}> 分</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--mn-ink-2)' }}>用时 {fmtTime(elapsed)}</div>
        </div>

        {result.results.map((r, i) => {
          const item = items.find((it) => it.question_id === r.question_id);
          const meta = VERDICT_META[r.verdict] ?? VERDICT_META.unsure;
          return (
            <div key={r.question_id} style={{ background: 'var(--mn-surface)', border: '1px solid var(--mn-border)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--mn-ink-3)', fontWeight: 600 }}>第 {i + 1} 题</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: meta.color, background: meta.bg, padding: '2px 8px', borderRadius: 99 }}>{meta.label}</span>
              </div>
              {item && (
                <div style={{ fontSize: 14, color: 'var(--mn-ink)', lineHeight: 1.7, marginBottom: 8 }}>
                  <RichText>{item.question_text}</RichText>
                </div>
              )}
              <div style={{ fontSize: 13, color: 'var(--mn-ink-2)' }}>
                你的答案：{item && (answers[item.question_id] ?? '').trim()
                  ? answers[item.question_id]
                  : <span style={{ color: 'var(--mn-ink-3)' }}>（未作答）</span>}
              </div>
            </div>
          );
        })}

        <button onClick={() => router.push('/home')} className="mn-btn-primary"
          style={{ width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700 }}>回首页</button>
      </div>
    );
  }

  // active
  const q = items[idx];
  const remaining = Math.max(0, timeLimit - elapsed);
  const answeredCount = items.filter((it) => (answers[it.question_id] ?? '').trim()).length;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: '100svh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: remaining <= 30 ? 'var(--mn-red)' : 'var(--mn-ink)', fontVariantNumeric: 'tabular-nums' }}>⏱ {fmtTime(remaining)}</span>
        <span style={{ fontSize: 13, color: 'var(--mn-ink-3)' }}>已答 {answeredCount}/{items.length}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {items.map((it, i) => {
          const done = (answers[it.question_id] ?? '').trim();
          const cur = i === idx;
          return (
            <button key={it.question_id} onClick={() => setIdx(i)}
              style={{
                width: 30, height: 30, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: cur ? '2px solid var(--mn-orange)' : '1px solid var(--mn-border)',
                background: done ? 'var(--mn-orange)' : 'var(--mn-surface)',
                color: done ? '#fff' : 'var(--mn-ink-3)',
              }}>{i + 1}</button>
          );
        })}
      </div>

      <div style={{ background: 'var(--mn-surface)', border: '1px solid var(--mn-border)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--mn-ink-3)', marginBottom: 12, fontWeight: 600 }}>第 {idx + 1} 题 / 共 {items.length} 题</div>
        <div style={{ fontSize: 15, color: 'var(--mn-ink)', lineHeight: 1.8 }}>
          <RichText>{q.question_text}</RichText>
        </div>
      </div>

      {isMCQ(q.question_text) ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {['A', 'B', 'C', 'D'].map((L) => {
            const sel = answers[q.question_id] === L;
            return (
              <button key={L} type="button" onClick={() => setAnswers((a) => ({ ...a, [q.question_id]: L }))}
                style={{
                  padding: '14px 0', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  border: sel ? '2px solid var(--mn-orange)' : '1px solid var(--mn-border)',
                  background: sel ? 'var(--mn-orange-dim, #fff7ed)' : 'var(--mn-surface)',
                  color: sel ? 'var(--mn-orange)' : 'var(--mn-ink-2)',
                }}>{L}</button>
            );
          })}
        </div>
      ) : (
        <textarea
          value={answers[q.question_id] ?? ''}
          onChange={(e) => setAnswers((a) => ({ ...a, [q.question_id]: e.target.value }))}
          placeholder="在此写下你的答案…"
          rows={3}
          style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid var(--mn-border)', background: 'var(--mn-surface)', fontSize: 14, color: 'var(--mn-ink)', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}
          style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid var(--mn-border)', background: 'var(--mn-surface)', color: 'var(--mn-ink-2)', fontSize: 14, fontWeight: 600, cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.5 : 1 }}>上一题</button>
        {idx + 1 < items.length ? (
          <button onClick={() => setIdx((i) => i + 1)}
            style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: 'var(--mn-orange)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>下一题</button>
        ) : (
          <button onClick={() => void submit()}
            style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>交卷</button>
        )}
      </div>
      <button onClick={() => void submit()}
        style={{ padding: 10, borderRadius: 10, border: '1px dashed var(--mn-border)', background: 'transparent', color: 'var(--mn-ink-3)', fontSize: 13, cursor: 'pointer' }}>
        提前交卷（{answeredCount}/{items.length} 已答）
      </button>
    </div>
  );
}
