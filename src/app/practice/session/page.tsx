'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import { enqueuePractice, isOffline } from '@/lib/offlineQueue';
import { RichText } from '@/components/shared/RichText';
import type { QuestionBankItem, PracticeSubmitRes, MasteryColor } from '@/types/api';

// 非数学"跳到具体知识点做题"通用引擎（V.1 后续）。复制自
// src/app/subjects/math/practice/page.tsx 并泛化——数学页面保持不动，独立演进；
// 这份服务物理/语文/英语（英语目前 knowledge_units 无数据，会落"该知识点暂无练习题"
// 空态，符合已知的 N.2 阻塞现状，不是本页 bug）。判分/掌握度更新/题库接口均已验证
// subject-agnostic，直接复用同一套 UI 逻辑。

// 知识点地图页按学科区分；英语暂无对应地图页
const LESSON_MAP_HREF: Record<string, string> = {
  math: '/subjects/math/lesson',
  physics: '/subjects/physics/lesson',
  chinese: '/subjects/chinese/lesson',
};

// ── 掌握度颜色 ─────────────────────────────────────────────────
const MASTERY_COLOR_MAP: Record<MasteryColor, string> = {
  green: '#34c759', yellow: '#ff9500', red: '#ff3b30', unknown: '#c7c7cc',
};

// JOL 把握度自评（三档，映射 0.3/0.6/0.9），随提交发 predicted_confidence；不选不发
const JOL_OPTIONS = [
  { label: '没把握',   value: 0.3 },
  { label: '一般',     value: 0.6 },
  { label: '很有把握', value: 0.9 },
] as const;

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
        {result.growth_message && (
          <div style={{ fontSize: '12.5px', color: 'var(--mn-ink-2)', marginTop: '6px', lineHeight: 1.5 }}>
            {result.growth_message}
          </div>
        )}
        {result.step_analysis && result.step_analysis.first_wrong_step != null && (
          <div style={{ fontSize: '12px', color: '#c26a06', marginTop: '4px' }}>
            ✎ 第 {result.step_analysis.first_wrong_step + 1} 步开始出问题，回看这一步。
          </div>
        )}
        {result.misconception && (
          <div style={{
            marginTop: '8px', padding: '8px 10px', borderRadius: '8px',
            background: 'rgba(140,90,200,0.08)', border: '1px solid rgba(140,90,200,0.22)',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7a4bbf' }}>
              🧩 易混点：{result.misconception.label}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--mn-ink-2)', marginTop: '3px', lineHeight: 1.5 }}>
              重建方向：{result.misconception.remediation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 练习主体 ──────────────────────────────────────────────────
type Phase = 'answering' | 'reveal' | 'submitted' | 'done';

function PracticeBody({ kuId, subject }: { kuId: string; subject: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [idx,       setIdx]       = useState(0);
  const [phase,     setPhase]     = useState<Phase>('answering');
  const [answer,    setAnswer]    = useState('');
  const [selfExpl,  setSelfExpl]  = useState('');  // 自我解释(04)
  const [feedback,  setFeedback]  = useState<PracticeSubmitRes | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results,   setResults]   = useState<PracticeSubmitRes[]>([]);
  const [asking,    setAsking]    = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [jol,       setJol]       = useState<number | null>(null);
  const [workedExample, setWorkedExample] = useState<Record<string, string | string[]> | null>(null);
  const [showWE,    setShowWE]    = useState(false);

  const getStudentId = useCallback(() => getUserId(), []);

  useEffect(() => {
    api.listQuestionBank({ subject, ku_id: kuId, needs_image: false, limit: 16 })
      .then(res => {
        if (res.ok) setQuestions(res.data.items.filter(q => !missingImage(q)).slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, [kuId, subject]);

  // L2 教学引擎：新知阶段(worked_example)+flag开→先给完整样例(讲透)再做题；flag关(默认)不出样例。
  useEffect(() => {
    const sid = getUserId();
    if (!sid) return;
    api.getTeachingPolicy(sid, kuId, 'system_taught').then(pr => {
      if (pr.ok && pr.data.mode === 'full_example' && pr.data.allow_worked_example) {
        api.getKnowledgePoint(kuId, sid).then(kr => {
          if (kr.ok && kr.data.rich_content) {
            setWorkedExample(kr.data.rich_content as Record<string, string | string[]>);
            setShowWE(true);
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [kuId]);

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
      ...(jol !== null ? { predicted_confidence: jol } : {}),
      ...(selfExpl.trim() ? { self_explanation: selfExpl.trim() } : {}),
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
    } else if (isOffline()) {
      // 离线：选择题就地判，入队待联网自动回传
      const ca = (currentQ.correct_answer || '').trim().toUpperCase();
      const isCorrect = /^[A-D]$/.test(ca) ? answer.trim().toUpperCase() === ca : undefined;
      enqueuePractice({ question_id: currentQ.id, student_id: studentId, student_answer: answer, ku_id: kuId, is_correct: isCorrect, ...(jol !== null ? { predicted_confidence: jol } : {}) });
      setOfflineSaved(true);
    }
  }, [currentQ, answer, kuId, jol, selfExpl, getStudentId, router]);

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
      ...(jol !== null ? { predicted_confidence: jol } : {}),
      ...(selfExpl.trim() ? { self_explanation: selfExpl.trim() } : {}),
    });
    setSubmitting(false);

    if (res.ok) {
      setFeedback(res.data);
      setResults(prev => [...prev, res.data]);
      setPhase('submitted');
    } else if (isOffline()) {
      enqueuePractice({ question_id: currentQ.id, student_id: studentId, student_answer: answer, is_correct: isCorrect, ku_id: kuId, ...(jol !== null ? { predicted_confidence: jol } : {}) });
      setOfflineSaved(true);
    }
  }, [currentQ, answer, kuId, jol, selfExpl, getStudentId, router]);

  const handleNext = useCallback(() => {
    setOfflineSaved(false);
    setJol(null);
    if (idx + 1 >= questions.length) {
      setPhase('done');
    } else {
      setIdx(i => i + 1);
      setPhase('answering');
      setAnswer('');
      setSelfExpl('');
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
          <button onClick={() => { setIdx(0); setPhase('answering'); setAnswer(''); setFeedback(null); setResults([]); setJol(null); }} style={{
            padding: '10px 20px', borderRadius: '99px',
            background: 'var(--mn-blue)', color: '#fff',
            border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}>再练一遍</button>
        </div>
      </div>
    );
  }

  if (showWE && workedExample) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--mn-blue)' }}>📖 先看一个例子（新知识点先学后练）</div>
        <div style={{ background: 'var(--mn-surface)', border: '1px solid var(--mn-border)', borderRadius: 12, padding: 16, fontSize: 14, lineHeight: 1.8, color: 'var(--mn-ink)' }}>
          {Object.entries(workedExample).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--mn-ink-3)', marginBottom: 4 }}>{k}</div>
              <div><RichText>{Array.isArray(v) ? v.join('\n') : String(v)}</RichText></div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>想一想：这个例子的关键一步为什么可以这样做？</div>
        <button onClick={() => setShowWE(false)} style={{ padding: 14, borderRadius: 12, background: 'var(--mn-blue)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          我看懂了，开始做题
        </button>
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
      {phase === 'answering' && offlineSaved && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 0' }}>
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--mn-orange-dim)', color: 'var(--mn-orange)', fontSize: 14, fontWeight: 700 }}>
            📡 离线已保存 · 联网后自动提交并计入错题/掌握度
          </div>
          <button onClick={handleNext} style={{ padding: 14, borderRadius: 12, background: 'var(--mn-blue)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            {idx + 1 >= questions.length ? '查看结果' : '下一题 →'}
          </button>
        </div>
      )}
      {phase === 'answering' && !offlineSaved && (
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
          {/* 自我解释（教育理念04·Chi 效应，选填）：讲清"为什么"最长脑子 */}
          <textarea
            value={selfExpl}
            onChange={e => setSelfExpl(e.target.value)}
            placeholder="用一句话说说你的思路（选填）——讲清为什么最长脑子"
            rows={2}
            style={{
              width: '100%', padding: '8px 10px', borderRadius: '10px',
              border: '1px solid var(--mn-border)', background: 'var(--mn-surface)',
              fontSize: '13px', color: 'var(--mn-ink)', resize: 'vertical', fontFamily: 'inherit',
            }}
          />
          {/* JOL 把握度自评（可选）：作答后提交前一行 chips，不选也能提交 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>做对的把握？</span>
            {JOL_OPTIONS.map(o => (
              <button key={o.value} type="button" onClick={() => setJol(jol === o.value ? null : o.value)}
                style={{
                  padding: '5px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  border: jol === o.value ? '1.5px solid var(--mn-blue)' : '1px solid var(--mn-border)',
                  background: jol === o.value ? 'var(--mn-blue-dim, #eff6ff)' : 'var(--mn-surface)',
                  color: jol === o.value ? 'var(--mn-blue)' : 'var(--mn-ink-3)',
                }}>{o.label}</button>
            ))}
          </div>
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
            <>
              <button onClick={askAI} disabled={asking} style={{
                width: '100%', padding: '13px', borderRadius: '12px',
                background: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: asking ? 0.6 : 1,
              }}>
                {asking ? '连接中…' : '🤔 没搞懂？让 AI 一步步引导你（不直接给答案）'}
              </button>
              {/* 讲解页入口：内核产出分步解析+图示（/v1/lesson 接 WrongQuestion id） */}
              <button
                onClick={() => router.push(`/lesson?q=${encodeURIComponent(feedback.wrong_question_id ?? currentQ?.id ?? '')}`)}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px',
                  background: 'var(--mn-blue-dim)', color: 'var(--mn-blue)', border: '1px solid var(--mn-border)',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                }}>
                📐 看讲解（分步解析 + 图示）
              </button>
            </>
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
function PracticeHeader({ kuId, kuName, subject }: { kuId: string; kuName?: string | null; subject: string }) {
  const router = useRouter();
  const lessonHref = LESSON_MAP_HREF[subject];
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
          {kuName || kuId}
        </div>
      </div>
      {lessonHref && (
        <button
          onClick={() => router.push(lessonHref)}
          style={{
            fontSize: '12px', color: 'var(--mn-blue)', background: 'var(--mn-blue-dim)',
            border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
          }}
        >知识点地图</button>
      )}
    </header>
  );
}

// ── Page wrapper (needs Suspense for useSearchParams) ─────────
function PracticeSessionPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const kuId = searchParams.get('ku_id');
  const kuName = searchParams.get('name');   // 选题页透传的 KU 人名（缺省回退显示 kuId）
  const subject = searchParams.get('subject');

  if (!kuId || !subject) {
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
      <PracticeHeader kuId={kuId} kuName={kuName} subject={subject} />
      <PracticeBody kuId={kuId} subject={subject} />
    </div>
  );
}

export default function PracticeSessionPage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '14px', color: 'var(--mn-ink-3)' }}>加载中…</div>
      </div>
    }>
      <PracticeSessionPageInner />
    </Suspense>
  );
}
