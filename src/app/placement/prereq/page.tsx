'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as api from '@/lib/api-client';
import type {
  MathTopicBrief, PrereqAnswerRes, PrereqItem, PrereqReport, PrereqSession,
} from '@/types/api';

// 先修回溯诊断：选目标知识点 → 逐题作答（答错沿先修回溯）→ 薄弱根因 + 按年级学习路径。
// 诊断结论不是掌握度；自动判分的作答由后端逐题经 SubmitAnswer 写入学习档案。

const STORE = 'mn:prereqDiag';
const gradeName = (g: number) => (g >= 7 ? `初${g - 6}` : g >= 1 ? `${g}年级` : '—');
const STATUS: Record<string, { label: string; color: string }> = {
  weak: { label: '薄弱', color: 'var(--mn-red, #dc2626)' },
  shaky: { label: '不稳', color: 'var(--mn-orange, #ea580c)' },
  mastered: { label: '已掌握', color: 'var(--mn-green, #16a34a)' },
  unknown: { label: '待学', color: 'var(--mn-ink-3, #94a3b8)' },
};

type Saved = { session: PrereqSession; next: PrereqItem | null; report: PrereqReport; target: MathTopicBrief };

function card(extra: React.CSSProperties = {}): React.CSSProperties {
  return { padding: 16, display: 'flex', flexDirection: 'column', gap: 10, ...extra };
}

function PrereqInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<MathTopicBrief[]>([]);
  const [searching, setSearching] = useState(false);
  // 恢复未完成的诊断（会话只存在本机）
  const [state, setState] = useState<Saved | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORE);
      return raw ? (JSON.parse(raw) as Saved) : null;
    } catch { return null; }
  });
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [last, setLast] = useState<PrereqAnswerRes | null>(null);

  useEffect(() => {
    try {
      if (state) localStorage.setItem(STORE, JSON.stringify(state));
      else localStorage.removeItem(STORE);
    } catch { /* ignore */ }
  }, [state]);

  const fail = (e: string) => {
    if (e === 'UNAUTHORIZED') { router.push('/login'); return; }
    setErr(e);
  };

  async function search(text: string) {
    const t = text.trim();
    if (!t) { setHits([]); return; }
    setSearching(true); setErr(null);
    const r = await api.searchMathTopic(t, 12);
    setSearching(false);
    if (r.ok) setHits(r.data.topics); else fail(r.error);
  }

  async function start(target: MathTopicBrief) {
    setBusy(true); setErr(null); setLast(null); setAnswer('');
    const r = await api.startPrereqDiagnosis([target.ku_id]);
    setBusy(false);
    if (!r.ok) { fail(r.error); return; }
    setState({ session: r.data.session, next: r.data.next, report: r.data.report, target });
  }

  // ?target=cnmath:cnm_221 直接开诊断
  useEffect(() => {
    const t = params?.get('target');
    if (!t || state) return;
    api.searchMathTopic(t.replace(/^cnmath:/, ''), 1).then((r) => {
      if (r.ok && r.data.topics[0]) void start(r.data.topics[0]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function submit(result?: 'correct' | 'wrong' | 'skip') {
    if (!state) return;
    if (!result && !answer.trim()) return;
    setBusy(true); setErr(null);
    const r = await api.answerPrereqDiagnosis(state.session, result ? undefined : answer.trim(), result);
    setBusy(false);
    if (!r.ok) { fail(r.error); return; }
    setLast(r.data);
    if (r.data.needs_self_assessment) return; // 会话未推进：看参考答案后自评
    setAnswer('');
    setState({ ...state, session: r.data.session, next: r.data.next, report: r.data.report });
  }

  const report = state?.report;
  const pathByGrade = useMemo(() => {
    const m = new Map<number, PrereqReport['learning_path']>();
    for (const p of report?.learning_path ?? []) {
      const arr = m.get(p.grade) ?? [];
      arr.push(p);
      m.set(p.grade, arr);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [report]);

  const title = (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--mn-ink)', margin: 0 }}>先修诊断</h1>
      <p style={{ fontSize: 13, color: 'var(--mn-ink-3)', margin: '4px 0 0' }}>
        选一个要学的知识点，每个点最多 2 题；答错会往前追先修，帮你找到真正的薄弱根因。
      </p>
    </div>
  );

  // ── 选目标 ──
  if (!state) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {title}
        <form className="mn-card" style={card()} onSubmit={(e) => { e.preventDefault(); void search(q); }}>
          <label htmlFor="prereq-q" style={{ fontWeight: 600, color: 'var(--mn-ink)' }}>目标知识点（一—九年级）</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input id="prereq-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="例如：配方法、分数加减法"
              style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--mn-border)', fontSize: 15 }} />
            <button type="submit" className="mn-btn-primary" disabled={searching}>{searching ? '搜索中…' : '搜索'}</button>
          </div>
        </form>
        {err && <div style={{ color: 'var(--mn-red, #dc2626)', fontSize: 13 }}>{err}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hits.map((t) => (
            <button key={t.id} type="button" className="mn-card" disabled={busy} onClick={() => void start(t)}
              style={{ ...card({ gap: 4 }), textAlign: 'left', cursor: 'pointer', border: '1px solid var(--mn-border)' }}>
              <span style={{ fontWeight: 700, color: 'var(--mn-ink)' }}>{t.name}</span>
              <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>
                {gradeName(t.grade)}{t.semester ? `${t.semester}` : ''} · {t.chapter ?? t.domain ?? ''}
              </span>
            </button>
          ))}
          {!searching && q && hits.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--mn-ink-3)' }}>没有找到，换个说法试试</div>
          )}
        </div>
      </div>
    );
  }

  const item = state.next;
  const fb = last?.feedback;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {title}
      <div className="mn-card" style={card({ gap: 4 })}>
        <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>诊断目标</span>
        <span style={{ fontWeight: 700, color: 'var(--mn-ink)' }}>{state.target.name}（{gradeName(state.target.grade)}）</span>
        <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>已答 {report?.asked ?? 0} 题</span>
      </div>

      {fb && (
        <div className="mn-card" style={card({ gap: 4, borderLeft: '4px solid var(--mn-blue)' })}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mn-ink)' }}>
            {last?.needs_self_assessment ? '这题需要你对照参考答案自评' : '上一题'}
          </span>
          {fb.answer && <span style={{ fontSize: 13, color: 'var(--mn-ink-2)' }}>参考答案：{fb.answer}</span>}
          {fb.explanation && <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>{fb.explanation}</span>}
        </div>
      )}

      {item && !report?.finished && (
        <div className="mn-card" style={card()}>
          <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>
            {item.topic.name} · {gradeName(item.topic.grade)} · 第 {item.attempt} 题
          </span>
          <div style={{ fontSize: 16, color: 'var(--mn-ink)', whiteSpace: 'pre-wrap' }}>{item.question.prompt}</div>
          {last?.needs_self_assessment ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="mn-btn-primary" disabled={busy} onClick={() => void submit('correct')}>我答对了</button>
              <button type="button" className="mn-btn-secondary" disabled={busy} onClick={() => void submit('wrong')}>我答错了</button>
            </div>
          ) : item.question.type === 'choice' && item.question.choices ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.question.choices.map((c) => (
                <button key={c.key} type="button" disabled={busy}
                  onClick={() => setAnswer(c.key)}
                  style={{
                    textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 15,
                    border: '1px solid ' + (answer === c.key ? 'var(--mn-blue)' : 'var(--mn-border)'),
                    background: answer === c.key ? 'var(--mn-blue-dim, #eff6ff)' : 'var(--mn-surface)',
                    color: 'var(--mn-ink)',
                  }}>{c.key}. {c.text}</button>
              ))}
            </div>
          ) : item.question.type === 'self' ? (
            <div style={{ fontSize: 13, color: 'var(--mn-ink-3)' }}>这题请在纸上作答，然后自评。</div>
          ) : (
            <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="输入你的答案"
              onKeyDown={(e) => { if (e.key === 'Enter') void submit(); }}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--mn-border)', fontSize: 15 }} />
          )}
          {!last?.needs_self_assessment && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {item.question.type === 'self' ? (
                <>
                  <button type="button" className="mn-btn-primary" disabled={busy} onClick={() => void submit('correct')}>我会</button>
                  <button type="button" className="mn-btn-secondary" disabled={busy} onClick={() => void submit('wrong')}>我答错了</button>
                </>
              ) : (
                <button type="button" className="mn-btn-primary" disabled={busy || !answer.trim()} onClick={() => void submit()}>
                  {busy ? '提交中…' : '提交'}
                </button>
              )}
              <button type="button" className="mn-btn-secondary" disabled={busy} onClick={() => void submit('skip')}>不会</button>
            </div>
          )}
        </div>
      )}

      {err && <div style={{ color: 'var(--mn-red, #dc2626)', fontSize: 13 }}>{err}</div>}

      {report?.finished && (
        <>
          <div className="mn-card" style={card()}>
            <span style={{ fontWeight: 700, color: 'var(--mn-ink)' }}>薄弱根因</span>
            {report.weak_roots.length === 0 ? (
              <span style={{ fontSize: 14, color: 'var(--mn-ink-2)' }}>没有发现薄弱的先修知识点，可以直接学目标知识点。</span>
            ) : report.weak_roots.map((r) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontWeight: 600, color: STATUS.weak.color }}>{r.name}</span>
                <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>{gradeName(r.grade)}{r.semester ?? ''}</span>
              </div>
            ))}
            {report.limit_reached && (
              <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>已达题量上限，部分先修未测。</span>
            )}
          </div>
          <div className="mn-card" style={card()}>
            <span style={{ fontWeight: 700, color: 'var(--mn-ink)' }}>学习路径（按年级从低到高）</span>
            {pathByGrade.map(([g, items]) => (
              <div key={g} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mn-ink-3)' }}>{gradeName(g)}</span>
                {items.map((p, i) => {
                  const s = STATUS[p.status] ?? STATUS.unknown;
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 22, fontSize: 12, color: 'var(--mn-ink-3)' }}>{i + 1}.</span>
                      <span style={{ flex: 1, color: 'var(--mn-ink)', fontWeight: p.is_root || p.is_target ? 700 : 500 }}>
                        {p.name}{p.is_target ? '（目标）' : ''}{p.is_root ? '（根因）' : ''}
                      </span>
                      <span style={{ fontSize: 12, color: s.color }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>诊断结论只用于排学习顺序，不等于掌握度。</span>
        </>
      )}

      <button type="button" className="mn-btn-secondary" onClick={() => { setState(null); setLast(null); setAnswer(''); setErr(null); }}>
        {report?.finished ? '再诊断一个知识点' : '放弃，换一个知识点'}
      </button>
    </div>
  );
}

export default function PrereqDiagnosisPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--mn-ink-3)' }}>加载…</div>}>
      <PrereqInner />
    </Suspense>
  );
}
