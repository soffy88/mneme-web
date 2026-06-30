'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import type { ReviewDueItem, ReviewSubmitRes } from '@/types/api';

type Result = { verdict?: ReviewSubmitRes['verdict']; answer: string; recordedAgain: boolean };

export default function ReviewPage() {
  const router = useRouter();
  const sid = useCallback(() => getUserId(), []);

  const [items, setItems] = useState<ReviewDueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const s = sid();
    if (!s) { router.push('/login'); return; }
    api.getReviewDue(s).then((r) => {
      setLoading(false);
      if (r.ok) setItems(r.data);
    });
  }, [router, sid]);

  const cur = items[idx];

  const submit = async () => {
    const s = sid(); if (!s || !cur || !answer.trim()) return;
    setBusy(true);
    const r = await api.reviewSubmit(s, cur.kc_id, answer.trim());
    setBusy(false);
    if (r.ok) setResult({ verdict: r.data.verdict, answer: r.data.answer, recordedAgain: false });
  };

  const reveal = async () => {
    const s = sid(); if (!s || !cur) return;
    setBusy(true);
    const r = await api.reviewReveal(s, cur.kc_id);
    setBusy(false);
    if (r.ok) setResult({ answer: r.data.answer, recordedAgain: r.data.recorded_again });
  };

  const next = () => { setIdx((i) => i + 1); setAnswer(''); setResult(null); };

  if (loading) return <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--mn-ink-3)' }}>加载到期复习…</div>;

  if (items.length === 0) return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 32 }}>✅</div>
      <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: 'var(--mn-ink)' }}>今天没有到期复习</div>
      <div style={{ marginTop: 4, fontSize: 13, color: 'var(--mn-ink-3)' }}>遗忘曲线还稳，继续保持</div>
      <button onClick={() => router.push('/home')} style={btn('var(--mn-blue)')}>回首页</button>
    </div>
  );

  if (idx >= items.length) return (
    <div style={{ padding: '48px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 32 }}>🎯</div>
      <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: 'var(--mn-ink)' }}>复习完成</div>
      <div style={{ marginTop: 4, fontSize: 13, color: 'var(--mn-ink-3)' }}>共复习 {items.length} 个到期知识点</div>
      <button onClick={() => router.push('/home')} style={btn('var(--mn-blue)')}>回首页</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--mn-ink)' }}>到期复习</h1>
        <p style={{ fontSize: 12, color: 'var(--mn-ink-3)', marginTop: 4 }}>
          第 {idx + 1} / {items.length} · 先尝试回忆作答，<b>看答案视为没记住</b>
        </p>
      </div>

      <div className="mn-card" style={{ padding: '16px 18px', fontSize: 15, lineHeight: 1.7, color: 'var(--mn-ink)', whiteSpace: 'pre-wrap' }}>
        {cur.variant_question}
      </div>

      {!result && (
        <>
          <div style={{ fontSize: 11, color: 'var(--mn-blue)', background: 'var(--mn-blue-dim)', padding: '8px 12px', borderRadius: 10 }}>
            🧠 主动回忆：先把答案想出来再作答，检索本身就是最有效的记忆强化
          </div>
          {isMCQ(cur.variant_question) ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {['A', 'B', 'C', 'D'].map((L) => (
                <button key={L} type="button" onClick={() => setAnswer(L)}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 12, cursor: 'pointer', fontSize: 16, fontWeight: 700,
                    border: '1.5px solid ' + (answer === L ? 'var(--mn-blue)' : 'var(--mn-border)'),
                    background: answer === L ? 'var(--mn-blue)' : 'var(--mn-surface)',
                    color: answer === L ? '#fff' : 'var(--mn-ink)',
                  }}>{L}</button>
              ))}
            </div>
          ) : (
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="输入你的答案"
              style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid var(--mn-border)', fontSize: 15 }}
            />
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={submit} disabled={busy || !answer.trim()}
              style={{ ...btn('var(--mn-blue)'), flex: 1, opacity: (busy || !answer.trim()) ? 0.5 : 1 }}>
              {busy ? '判分中…' : '提交答案'}
            </button>
            <button onClick={reveal} disabled={busy}
              style={{ ...btn('transparent'), color: 'var(--mn-ink-3)', border: '1px solid var(--mn-border)', opacity: busy ? 0.6 : 1 }}>
              想不起来·看答案
            </button>
          </div>
        </>
      )}

      {result && (
        <>
          <div style={{
            padding: '12px 14px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            color: result.recordedAgain ? 'var(--mn-orange)' : result.verdict === 'correct' ? '#16a34a' : result.verdict === 'wrong' ? '#dc2626' : 'var(--mn-ink-2)',
            background: result.recordedAgain ? 'var(--mn-orange-dim)' : result.verdict === 'correct' ? '#f0fdf4' : result.verdict === 'wrong' ? '#fef2f2' : 'var(--mn-surface)',
          }}>
            {result.recordedAgain ? '👀 看了答案 · 已按「没记住」重排复习'
              : result.verdict === 'correct' ? '✓ 答对了 · 间隔已拉长'
              : result.verdict === 'wrong' ? '✗ 答错了 · 已重排复习'
              : '参考答案如下，请对照自评'}
          </div>
          <div className="mn-card" style={{ padding: '14px 16px', fontSize: 14, color: 'var(--mn-ink)' }}>
            <div style={{ fontSize: 11, color: 'var(--mn-ink-3)', marginBottom: 4 }}>参考答案</div>
            {result.answer || '（参考原题思路自行验证）'}
          </div>
          <button onClick={next} style={btn('var(--mn-blue)')}>
            {idx + 1 >= items.length ? '完成复习' : '下一个'}
          </button>
        </>
      )}
    </div>
  );
}

// 选择题判定：题面含 ≥2 个形如「A.」「B、」的选项标记
function isMCQ(q: string): boolean {
  return (q.match(/[ABCD][.、．]/g) ?? []).length >= 2;
}

function btn(bg: string): React.CSSProperties {
  return {
    marginTop: 12, padding: '12px 18px', borderRadius: 12, border: 'none',
    background: bg, color: bg === 'transparent' ? 'var(--mn-ink)' : '#fff',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  };
}
