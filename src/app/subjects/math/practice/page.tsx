'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import { RichText } from '@/components/shared/RichText';
import type { QuestionBankItem, PracticeSubmitRes, MasteryColor } from '@/types/api';

// ── 掌握度颜色 ─────────────────────────────────────────────────
const MASTERY_COLOR_MAP: Record<MasteryColor, string> = {
  green: '#34c759', yellow: '#ff9500', red: '#ff3b30', unknown: '#c7c7cc',
};

// 选择题：参考答案是单个字母 A-D（含全角）→ 给选项按钮，可自动判分
const MC_LETTERS = ['A', 'B', 'C', 'D'];
function mcAnswer(ans: string | null): string | null {
  const t = (ans ?? '').trim().toUpperCase().replace(/[ＡＢＣＤ]/g, c => MC_LETTERS[c.charCodeAt(0) - 0xff21]);
  return /^[A-D]$/.test(t) ? t : null;
}
// 题干引用图但无图片 → 无法作答，过滤掉
function missingImage(q: QuestionBankItem): boolean {
  if (q.needs_image) return false; // 需图但已知；此处只排"引用图却没图"
  return /下图|上图|如图|图中|右图|左图|看图|读图|<ImageHere>|根据.{0,4}图|图\(/.test(q.question_text);
}

// ── 题目展示 ──────────────────────────────────────────────────
function QuestionCard({ q, index, total }: { q: QuestionBankItem; index: number; total: number }) {
  return (
    <div style={{
      background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
      borderRadius: '14px', padding: '20px',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginBottom: '12px', fontWeight: 600 }}>
        第 {index + 1} 题 / 共 {total} 题
      </div>
      <div style={{ fontSize: '15px', color: 'var(--mn-ink)', lineHeight: 1.8 }}>
        <RichText>{q.question_text}</RichText>
      </div>
    </div>
  );
}

// ── 正确答案展示 ───────────────────────────────────────────────
function AnswerCard({ answer }: { answer: string | null }) {
  return (
    <div style={{
      background: '#f0faf4', border: '1.5px solid #34c759',
      borderRadius: '12px', padding: '16px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#34c759', marginBottom: '8px',
        letterSpacing: '0.05em', textTransform: 'uppercase' }}>参考答案</div>
      <div style={{ fontSize: '14px', color: 'var(--mn-ink)', lineHeight: 1.7 }}>
        {answer ? <RichText>{answer}</RichText> : '（暂无答案）'}
      </div>
    </div>
  );
}

function ExplanationCard({ text }: { text: string }) {
  if (!text || !text.trim()) return null;
  return (
    <div style={{ background: 'var(--mn-blue-dim)', border: '1px solid rgba(30,58,95,.12)', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mn-blue)', marginBottom: 8,
        letterSpacing: '0.05em', textTransform: 'uppercase' }}>解析</div>
      <div style={{ fontSize: 13, color: 'var(--mn-ink-2)', lineHeight: 1.75 }}>
        <RichText>{text}</RichText>
      </div>
    </div>
  );
}

// ── 反馈卡 ───────────────────────────────────────────────────
function FeedbackCard({ result }: { result: PracticeSubmitRes }) {
  const color = MASTERY_COLOR_MAP[result.mastery_color];
  const masteryPct = result.p_mastery !== null ? Math.round((result.p_mastery ?? 0) * 100) : null;
  return (
    <div style={{
      background: result.is_correct ? '#f0faf4' : '#fff3f3',
      border: `1.5px solid ${result.is_correct ? '#34c759' : '#ff3b30'}`,
      borderRadius: '12px', padding: '16px',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <span style={{ fontSize: '24px' }}>{result.is_correct ? '✅' : '❌'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)' }}>
          {result.is_correct ? '回答正确' : '答案有误，已记入错题本'}
        </div>
        {masteryPct !== null && (
          <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
            当前掌握度：
            <span style={{ fontWeight: 700, color }}>{masteryPct}%</span>
          </div>
        )}
        {result.feedback && (
          <div style={{ fontSize: '12px', color: 'var(--mn-blue)', marginTop: '4px' }}>
            {result.feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 练习主体 ──────────────────────────────────────────────────
type Phase = 'answering' | 'reveal' | 'submitted' | 'done';

function PracticeBody({ kuId, subject = 'math' }: { kuId: string; subject?: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [idx,       setIdx]       = useState(0);
  const [phase,     setPhase]     = useState<Phase>('answering');
  const [answer,    setAnswer]    = useState('');
  const [feedback,  setFeedback]  = useState<PracticeSubmitRes | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results,   setResults]   = useState<PracticeSubmitRes[]>([]);
  const [asking,    setAsking]    = useState(false);

  const getStudentId = useCallback(() => getUserId(), []);

  useEffect(() => {
    api.listQuestionBank({ subject, ku_id: kuId, needs_image: false, limit: 16 })
      .then(res => {
        if (res.ok) setQuestions(res.data.items.filter(q => !missingImage(q)).slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, [kuId, subject]);

  const currentQ = questions[idx] ?? null;

  // 答错→直接问理解引擎（苏格拉底引导，不直接给答案），把练习和理解在最该衔接处接上。
  const askAI = useCallback(async () => {
    if (!currentQ) return;
    const sid = getStudentId();
    if (!sid) { router.push('/login'); return; }
    setAsking(true);
    const res = await api.startSocratic(currentQ.id, sid);
    setAsking(false);
    if (res.ok) router.push(`/socratic?session_id=${res.data.session_id}&first_q=${encodeURIComponent(res.data.first_question)}`);
  }, [currentQ, getStudentId, router]);

  // 提交答案 → 后端自动判分；判不了(自由作答)才进自评
  const handleSubmit = useCallback(async () => {
    if (!currentQ) return;
    const studentId = getStudentId();
    if (!studentId) { router.push('/login'); return; }
    setSubmitting(true);
    const res = await api.submitPracticeAnswer({
      question_id: currentQ.id,
      student_id: studentId,
      student_answer: answer,
      ku_id: kuId,
    });
    setSubmitting(false);
    if (res.ok) {
      if (res.data.needs_self_grade) {
        setPhase('reveal');            // 自由作答 → 对照参考答案自评
      } else {
        setFeedback(res.data);
        setResults(prev => [...prev, res.data]);
        setPhase('submitted');
      }
    }
  }, [currentQ, answer, kuId, getStudentId, router]);

  const handleSelfGrade = useCallback(async (isCorrect: boolean) => {
    if (!currentQ) return;
    const studentId = getStudentId();
    if (!studentId) { router.push('/login'); return; }

    setSubmitting(true);
    const res = await api.submitPracticeAnswer({
      question_id: currentQ.id,
      student_id: studentId,
      student_answer: answer,
      is_correct: isCorrect,
      ku_id: kuId,
    });
    setSubmitting(false);

    if (res.ok) {
      setFeedback(res.data);
      setResults(prev => [...prev, res.data]);
      setPhase('submitted');
    }
  }, [currentQ, answer, kuId, getStudentId, router]);

  const handleNext = useCallback(() => {
    if (idx + 1 >= questions.length) {
      setPhase('done');
    } else {
      setIdx(i => i + 1);
      setPhase('answering');
      setAnswer('');
      setFeedback(null);
    }
  }, [idx, questions.length]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--mn-ink-3)' }}>加载题目中…</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '12px',
        padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', opacity: 0.3 }}>📭</div>
        <div style={{ fontSize: '15px', color: 'var(--mn-ink)' }}>该知识点暂无练习题</div>
        <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', lineHeight: 1.6 }}>
          题目匹配正在进行中，稍后再来看看
        </div>
        <button onClick={() => router.back()} style={{
          marginTop: '8px', padding: '10px 24px', borderRadius: '99px',
          background: 'var(--mn-blue)', color: '#fff', border: 'none',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer',
        }}>返回知识点</button>
      </div>
    );
  }

  if (phase === 'done') {
    const correct = results.filter(r => r.is_correct).length;
    const total   = results.length;
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
        padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px' }}>🎉</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--mn-ink)' }}>练习完成！</div>
        <div style={{ fontSize: '15px', color: 'var(--mn-ink-3)' }}>
          共 {total} 题，答对 <span style={{ fontWeight: 700, color: '#34c759' }}>{correct}</span> 题
        </div>
        {results[results.length - 1]?.p_mastery !== null && (
          <div style={{
            marginTop: '8px', padding: '12px 24px', borderRadius: '12px',
            background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
            fontSize: '14px', color: 'var(--mn-ink)',
          }}>
            最新掌握度：
            <span style={{ fontWeight: 700 }}>
              {Math.round((results[results.length - 1].p_mastery ?? 0) * 100)}%
            </span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button onClick={() => router.back()} style={{
            padding: '10px 20px', borderRadius: '99px',
            background: 'var(--mn-surface)', color: 'var(--mn-ink)',
            border: '1px solid var(--mn-border)', fontSize: '14px', cursor: 'pointer',
          }}>返回知识点</button>
          <button onClick={() => { setIdx(0); setPhase('answering'); setAnswer(''); setFeedback(null); setResults([]); }} style={{
            padding: '10px 20px', borderRadius: '99px',
            background: 'var(--mn-blue)', color: '#fff',
            border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}>再练一遍</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 进度条 */}
      <div style={{ height: 4, borderRadius: 2, background: 'var(--mn-border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2, background: 'var(--mn-blue)',
          width: `${((idx) / questions.length) * 100}%`, transition: 'width 0.3s',
        }} />
      </div>

      {currentQ && <QuestionCard q={currentQ} index={idx} total={questions.length} />}

      {/* 答题区 */}
      {phase === 'answering' && (
        <>
          {/* 检索练习约束（M-C）：先凭记忆作答，不翻答案 */}
          <div style={{ fontSize: '12px', color: 'var(--mn-blue)', background: 'var(--mn-blue-dim, #eff6ff)', borderRadius: '10px', padding: '10px 12px', lineHeight: 1.6 }}>
            🧠 先凭记忆自己作答——主动回忆（检索练习）比翻看答案记得牢约 50%。想不出来也先写下思路，再对照。
          </div>
          {currentQ && mcAnswer(currentQ.correct_answer) ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {MC_LETTERS.map(L => (
                <button key={L} type="button" onClick={() => setAnswer(L)}
                  style={{
                    padding: '14px 0', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                    border: answer === L ? '2px solid var(--mn-blue)' : '1px solid var(--mn-border)',
                    background: answer === L ? 'var(--mn-blue-dim, #eff6ff)' : 'var(--mn-surface)',
                    color: answer === L ? 'var(--mn-blue)' : 'var(--mn-ink-2)',
                  }}>{L}</button>
              ))}
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="在此写下你的解题过程或答案…"
              rows={4}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                border: '1.5px solid var(--mn-border)', background: 'var(--mn-surface)',
                fontSize: '14px', color: 'var(--mn-ink)', lineHeight: 1.6,
                resize: 'vertical', boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          )}
          <button onClick={handleSubmit} disabled={submitting || !answer.trim()} style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            background: 'var(--mn-blue)', color: '#fff', border: 'none',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            opacity: (submitting || !answer.trim()) ? 0.5 : 1,
          }}>{submitting ? '判分中…' : '提交答案'}</button>
        </>
      )}

      {/* 答案揭示 */}
      {(phase === 'reveal') && currentQ && (
        <>
          {answer && (
            <div style={{
              background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
              borderRadius: '12px', padding: '14px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginBottom: '6px', fontWeight: 600 }}>
                你的答案
              </div>
              <div style={{ fontSize: '14px', color: 'var(--mn-ink)', whiteSpace: 'pre-wrap' }}>{answer}</div>
            </div>
          )}
          <AnswerCard answer={currentQ.correct_answer} />
          {currentQ.explanation && <ExplanationCard text={currentQ.explanation} />}
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', textAlign: 'center', fontWeight: 600 }}>
            对比参考答案，你的答题情况如何？
          </div>
          <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', textAlign: 'center', lineHeight: 1.6 }}>
            如实评——没真正回忆出来就选「答错了」，会按「重来」更早安排复习；蒙对/看了答案不算掌握。
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleSelfGrade(false)}
              disabled={submitting}
              style={{
                flex: 1, padding: '14px', borderRadius: '12px',
                background: '#fff3f3', border: '1.5px solid #ff3b30',
                color: '#ff3b30', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', opacity: submitting ? 0.6 : 1,
              }}
            >答错了</button>
            <button
              onClick={() => handleSelfGrade(true)}
              disabled={submitting}
              style={{
                flex: 1, padding: '14px', borderRadius: '12px',
                background: '#f0faf4', border: '1.5px solid #34c759',
                color: '#34c759', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', opacity: submitting ? 0.6 : 1,
              }}
            >答对了</button>
          </div>
        </>
      )}

      {/* 提交结果 */}
      {phase === 'submitted' && feedback && (
        <>
          {answer && (
            <div style={{
              background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
              borderRadius: '12px', padding: '14px',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginBottom: '6px', fontWeight: 600 }}>你的答案</div>
              <div style={{ fontSize: '14px', color: 'var(--mn-ink)', whiteSpace: 'pre-wrap' }}>{answer}</div>
            </div>
          )}
          {currentQ && <AnswerCard answer={currentQ.correct_answer} />}
          {currentQ?.explanation && <ExplanationCard text={currentQ.explanation} />}
          <FeedbackCard result={feedback} />
          {feedback.is_correct === false && (
            <button onClick={askAI} disabled={asking} style={{
              width: '100%', padding: '13px', borderRadius: '12px',
              background: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: asking ? 0.6 : 1,
            }}>
              {asking ? '连接中…' : '🤔 没搞懂？让 AI 一步步引导你（不直接给答案）'}
            </button>
          )}
          <button onClick={handleNext} style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            background: 'var(--mn-blue)', color: '#fff', border: 'none',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          }}>
            {idx + 1 >= questions.length ? '查看结果' : '下一题 →'}
          </button>
        </>
      )}
    </div>
  );
}

// ── 知识点名称头部 ──────────────────────────────────────────────
function PracticeHeader({ kuId }: { kuId: string }) {
  const router = useRouter();
  return (
    <header style={{
      height: '48px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '12px',
      padding: '0 16px',
      background: 'rgba(248,246,242,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--mn-border)', zIndex: 30,
    }}>
      <button onClick={() => router.back()} style={{
        fontSize: '20px', color: 'var(--mn-blue)', background: 'none',
        border: 'none', cursor: 'pointer', lineHeight: 1, padding: '4px 0',
      }}>‹</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--mn-ink)' }}>专题练习</div>
        <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
          {kuId}
        </div>
      </div>
      <button
        onClick={() => router.push('/subjects/math/lesson')}
        style={{
          fontSize: '12px', color: 'var(--mn-blue)', background: 'var(--mn-blue-dim)',
          border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
        }}
      >知识点地图</button>
    </header>
  );
}

// ── Page wrapper (needs Suspense for useSearchParams) ─────────
function PracticePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const kuId = searchParams.get('ku_id');
  const subject = searchParams.get('subject') ?? 'math';

  if (!kuId) {
    return (
      <div style={{ height: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--mn-paper)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '12px', padding: '40px' }}>
          <div style={{ fontSize: '14px', color: 'var(--mn-ink-3)' }}>先选一个练习主题</div>
          <button onClick={() => router.push('/practice')} style={{
            padding: '10px 24px', borderRadius: '99px', background: 'var(--mn-blue)',
            color: '#fff', border: 'none', fontSize: '14px', cursor: 'pointer',
          }}>去选题</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--mn-paper)', overflow: 'hidden' }}>
      <PracticeHeader kuId={kuId} />
      <PracticeBody kuId={kuId} subject={subject} />
    </div>
  );
}

export default function MathPracticePage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--mn-ink-3)' }}>加载中…</div>
      </div>
    }>
      <PracticePageInner />
    </Suspense>
  );
}
