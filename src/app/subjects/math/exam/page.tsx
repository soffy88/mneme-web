'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import { RichText } from '@/components/shared/RichText';
import type { QuestionBankItem, PracticeSubmitRes } from '@/types/api';

type Phase = 'setup' | 'loading' | 'exam' | 'grading' | 'result';

const SIZES = [10, 15, 20];

function kuIdOf(q: QuestionBankItem): string {
  return Object.keys(q.knowledge_points ?? {})[0] ?? '';
}

const MC_LETTERS = ['A', 'B', 'C', 'D'];
function mcAnswer(ans: string | null): string | null {
  const t = (ans ?? '').trim().toUpperCase().replace(/[ＡＢＣＤ]/g, c => MC_LETTERS[c.charCodeAt(0) - 0xff21]);
  return /^[A-D]$/.test(t) ? t : null;
}
function missingImage(q: QuestionBankItem): boolean {
  if (q.needs_image) return false;
  return /下图|上图|如图|图中|右图|左图|看图|读图|<ImageHere>|根据.{0,4}图|图\(/.test(q.question_text);
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface GradeRow {
  q: QuestionBankItem;
  answer: string;
  res: PracticeSubmitRes | null;   // null = 提交失败
}

export default function MathExamPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('setup');
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);
  const [err, setErr] = useState('');

  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [rows, setRows] = useState<GradeRow[]>([]);

  // 可用题量
  useEffect(() => {
    api.listQuestionBank({ subject: 'math', needs_image: false, limit: 1 }).then(res => {
      if (res.ok) setTotal(res.data.total);
    });
  }, []);

  // 计时器
  useEffect(() => {
    if (phase === 'exam') {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase]);

  const startExam = useCallback(async () => {
    setPhase('loading'); setErr('');
    const totRes = await api.listQuestionBank({ subject: 'math', needs_image: false, limit: 1 });
    if (!totRes.ok) { setErr(totRes.error); setPhase('setup'); return; }
    const tot = totRes.data.total;
    const fetchN = size * 2 + 6; // 多取些，过滤掉"引用图却无图"的题后再截取
    const maxOffset = Math.max(0, tot - fetchN);
    const offset = Math.floor(Math.random() * (maxOffset + 1));
    const res = await api.listQuestionBank({ subject: 'math', needs_image: false, limit: fetchN, offset });
    if (!res.ok) { setErr(res.error); setPhase('setup'); return; }
    const usable = res.data.items.filter(q => !missingImage(q)).slice(0, size);
    if (usable.length === 0) { setErr('未取到题目，请重试'); setPhase('setup'); return; }
    setQuestions(usable);
    setAnswers({});
    setIdx(0);
    setSeconds(0);
    setPhase('exam');
  }, [size]);

  const submitExam = useCallback(async () => {
    const studentId = getUserId();
    if (!studentId) { router.push('/login'); return; }
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('grading');
    const graded = await Promise.all(questions.map(async (q): Promise<GradeRow> => {
      const answer = answers[q.id] ?? '';
      const res = await api.submitPracticeAnswer({
        question_id: q.id, student_id: studentId, student_answer: answer, ku_id: kuIdOf(q),
      });
      return { q, answer, res: res.ok ? res.data : null };
    }));
    setRows(graded);
    setPhase('result');
  }, [questions, answers, router]);

  const selfGrade = useCallback(async (rowIdx: number, isCorrect: boolean) => {
    const studentId = getUserId();
    if (!studentId) { router.push('/login'); return; }
    const row = rows[rowIdx];
    const res = await api.submitPracticeAnswer({
      question_id: row.q.id, student_id: studentId, student_answer: row.answer,
      is_correct: isCorrect, ku_id: kuIdOf(row.q),
    });
    if (res.ok) {
      setRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, res: res.data } : r));
    }
  }, [rows, router]);

  const answeredCount = useMemo(
    () => questions.filter(q => (answers[q.id] ?? '').trim()).length,
    [questions, answers],
  );

  // ── 成绩统计 ──
  const stats = useMemo(() => {
    let judged = 0, correct = 0, pending = 0;
    for (const r of rows) {
      if (!r.res) continue;
      if (r.res.needs_self_grade && r.res.is_correct === null) { pending++; continue; }
      if (r.res.is_correct === null) { pending++; continue; }
      judged++;
      if (r.res.is_correct) correct++;
    }
    return { judged, correct, pending };
  }, [rows]);

  // ── 渲染 ──
  if (phase === 'setup' || phase === 'loading') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--mn-ink)', margin: 0 }}>真题模考</h1>
        <p style={{ fontSize: 13, color: 'var(--mn-ink-3)', margin: '6px 0 24px' }}>
          从{total !== null ? ` ${total.toLocaleString()} ` : ' '}道真题随机组卷 · 计时作答 · 自动判分 · 错题自动入本
        </p>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mn-ink-2)', marginBottom: 10 }}>选择题量</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          {SIZES.map(s => (
            <button key={s} onClick={() => setSize(s)}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
                border: size === s ? '2px solid var(--mn-blue)' : '1px solid var(--mn-border)',
                background: size === s ? 'var(--mn-blue-dim, #eff6ff)' : 'var(--mn-surface)',
                color: size === s ? 'var(--mn-blue)' : 'var(--mn-ink-2)',
              }}>{s} 题</button>
          ))}
        </div>
        {err && <div style={{ fontSize: 13, color: 'var(--mn-red)', marginBottom: 16 }}>{err}</div>}
        <button onClick={startExam} disabled={phase === 'loading'} className="mn-btn-primary"
          style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 16, fontWeight: 700 }}>
          {phase === 'loading' ? '组卷中…' : '开始考试'}
        </button>
      </div>
    );
  }

  if (phase === 'exam') {
    const q = questions[idx];
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: '100svh' }}>
        {/* 顶栏：计时 + 进度 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--mn-ink)', fontVariantNumeric: 'tabular-nums' }}>⏱ {fmtTime(seconds)}</span>
          <span style={{ fontSize: 13, color: 'var(--mn-ink-3)' }}>已答 {answeredCount}/{questions.length}</span>
        </div>

        {/* 题号导航 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {questions.map((qq, i) => {
            const done = (answers[qq.id] ?? '').trim();
            const cur = i === idx;
            return (
              <button key={qq.id} onClick={() => setIdx(i)}
                style={{
                  width: 30, height: 30, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: cur ? '2px solid var(--mn-blue)' : '1px solid var(--mn-border)',
                  background: done ? 'var(--mn-blue)' : 'var(--mn-surface)',
                  color: done ? '#fff' : 'var(--mn-ink-3)',
                }}>{i + 1}</button>
            );
          })}
        </div>

        {/* 题目 */}
        <div style={{ background: 'var(--mn-surface)', border: '1px solid var(--mn-border)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--mn-ink-3)', marginBottom: 12, fontWeight: 600 }}>第 {idx + 1} 题 / 共 {questions.length} 题</div>
          <div style={{ fontSize: 15, color: 'var(--mn-ink)', lineHeight: 1.8 }}>
            <RichText>{q.question_text}</RichText>
          </div>
        </div>

        {mcAnswer(q.correct_answer) ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {MC_LETTERS.map(L => {
              const sel = answers[q.id] === L;
              return (
                <button key={L} type="button" onClick={() => setAnswers(a => ({ ...a, [q.id]: L }))}
                  style={{
                    padding: '14px 0', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer',
                    border: sel ? '2px solid var(--mn-blue)' : '1px solid var(--mn-border)',
                    background: sel ? 'var(--mn-blue-dim, #eff6ff)' : 'var(--mn-surface)',
                    color: sel ? 'var(--mn-blue)' : 'var(--mn-ink-2)',
                  }}>{L}</button>
              );
            })}
          </div>
        ) : (
          <textarea
            value={answers[q.id] ?? ''}
            onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
            placeholder="在此写下你的答案…"
            rows={3}
            style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid var(--mn-border)', background: 'var(--mn-surface)', fontSize: 14, color: 'var(--mn-ink)', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        )}

        {/* 翻页 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
            style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid var(--mn-border)', background: 'var(--mn-surface)', color: 'var(--mn-ink-2)', fontSize: 14, fontWeight: 600, cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.5 : 1 }}>上一题</button>
          {idx + 1 < questions.length ? (
            <button onClick={() => setIdx(i => i + 1)}
              style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: 'var(--mn-blue)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>下一题</button>
          ) : (
            <button onClick={submitExam}
              style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>交卷</button>
          )}
        </div>
        <button onClick={submitExam}
          style={{ padding: 10, borderRadius: 10, border: '1px dashed var(--mn-border)', background: 'transparent', color: 'var(--mn-ink-3)', fontSize: 13, cursor: 'pointer' }}>
          提前交卷（{answeredCount}/{questions.length} 已答）
        </button>
      </div>
    );
  }

  if (phase === 'grading') {
    return <div style={{ padding: 60, textAlign: 'center', color: 'var(--mn-ink-3)' }}>判分中…</div>;
  }

  // result
  const failed = rows.filter(r => !r.res).length;
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--mn-surface)', border: '1px solid var(--mn-border)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--mn-ink-3)' }}>本次成绩（已判 {stats.judged} 题）</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--mn-blue)', margin: '6px 0' }}>
          {stats.judged > 0 ? Math.round((stats.correct / stats.judged) * 100) : 0}
          <span style={{ fontSize: 18 }}> 分</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--mn-ink-2)' }}>
          答对 {stats.correct}/{stats.judged} · 用时 {fmtTime(seconds)}
          {stats.pending > 0 && ` · ${stats.pending} 题待自评`}
          {failed > 0 && ` · ${failed} 题提交失败`}
        </div>
        <div style={{ fontSize: 12, color: 'var(--mn-ink-3)', marginTop: 6 }}>错题已自动记入错题本</div>
      </div>

      {rows.map((r, i) => {
        const needSelf = r.res?.needs_self_grade && r.res.is_correct === null;
        return (
          <div key={r.q.id} style={{ background: 'var(--mn-surface)', border: '1px solid var(--mn-border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--mn-ink-3)', fontWeight: 600 }}>第 {i + 1} 题</span>
              {!r.res ? <span style={{ fontSize: 12, color: 'var(--mn-red)' }}>提交失败</span>
                : needSelf ? <span style={{ fontSize: 12, color: '#d97706' }}>待自评</span>
                : <span style={{ fontSize: 16 }}>{r.res.is_correct ? '✅' : '❌'}</span>}
            </div>
            <div style={{ fontSize: 14, color: 'var(--mn-ink)', lineHeight: 1.7, marginBottom: 8 }}>
              <RichText>{r.q.question_text}</RichText>
            </div>
            <div style={{ fontSize: 13, color: 'var(--mn-ink-2)' }}>
              你的答案：{r.answer.trim() ? r.answer : <span style={{ color: 'var(--mn-ink-3)' }}>（未作答）</span>}
            </div>
            {(r.res?.correct_answer || r.q.correct_answer) && (
              <div style={{ fontSize: 13, color: '#16a34a', marginTop: 4 }}>
                参考答案：<RichText>{r.res?.correct_answer || r.q.correct_answer || ''}</RichText>
              </div>
            )}
            {needSelf && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button onClick={() => selfGrade(i, false)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #ff3b30', background: '#fff3f3', color: '#ff3b30', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>答错了</button>
                <button onClick={() => selfGrade(i, true)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #34c759', background: '#f0faf4', color: '#34c759', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>答对了</button>
              </div>
            )}
          </div>
        );
      })}

      <button onClick={() => { setRows([]); setPhase('setup'); }} className="mn-btn-primary"
        style={{ width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700 }}>再考一套</button>
    </div>
  );
}
