'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';

/**
 * JOL 自测校准（Judgment of Learning）：
 * 先预测把握 → 自己做 → 自评对错 → 对比预测与实际，给"高估/低估"反馈。
 * 训练元认知准度（知道自己哪里真会、哪里只是"感觉会"）。
 * 入口：/subjects/math/selftest?ku=<ku_id>&name=<显示名>
 */
type Phase = 'predict' | 'attempt' | 'done';

function feedbackFor(confidence: number, correct: boolean) {
  const c = confidence / 100;
  if (correct && c < 0.4) return { tone: 'green' as const, msg: '你没把握却做对了——其实你比自己想的更稳，别低估自己。' };
  if (correct) return { tone: 'green' as const, msg: '判断准确：有把握，也确实做对了。' };
  if (c >= 0.7) return { tone: 'red' as const, msg: '你很有把握却做错了——这是高估（『感觉会』≠真会）。这个点要重练，别跳过。' };
  if (c < 0.4) return { tone: 'amber' as const, msg: '判断准确：你也知道没把握。补一补就好。' };
  return { tone: 'amber' as const, msg: '有点高估——半懂状态最危险，回去把它弄透。' };
}

const TONE_STYLE = {
  green: { background: 'var(--mn-green-dim)', border: '1px solid var(--mn-green)', color: 'var(--mn-green)' },
  red:   { background: 'var(--mn-red-dim)',   border: '1px solid var(--mn-red)',   color: 'var(--mn-red)' },
  amber: { background: 'var(--mn-orange-dim)', border: '1px solid var(--mn-orange)', color: 'var(--mn-orange)' },
};

function SelfTestContent() {
  const params = useSearchParams();
  const router = useRouter();
  const kuId = params?.get('ku') ?? '';
  const name = params?.get('name') ?? '这个知识点';

  const [phase, setPhase] = useState<Phase>('predict');
  const [confidence, setConfidence] = useState(60); // 0..100
  const [result, setResult] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (isCorrect: boolean) => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    if (busy) return;
    setBusy(true); setError('');
    const res = await api.postInteraction({
      student_id: sid, ku_id: kuId, is_correct: isCorrect,
      predicted_confidence: confidence / 100, source: 'quick',
      struggled: confidence < 40,
    });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setResult(isCorrect);
    setPhase('done');
  };

  if (!kuId) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '13px', color: 'var(--mn-ink-3)' }}>
        缺少知识点参数——请从掌握度页进入。
      </div>
    );
  }

  const feedback = result === null ? null : feedbackFor(confidence, result);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--mn-ink)' }}>
          自测 · {name}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '3px' }}>
          先预测，再验证——练的是"知道自己会不会"的准度
        </p>
      </div>

      {error && <div style={{ fontSize: '12px', color: 'var(--mn-red)' }}>{error}</div>}

      {phase === 'predict' && (
        <div className="mn-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--mn-ink)' }}>
            动手前先预测：你有多大把握把「{name}」做对？
          </div>
          <input
            type="range" min={0} max={100} step={5} value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ textAlign: 'center', fontSize: '26px', fontWeight: 800, color: 'var(--mn-blue)', fontVariantNumeric: 'tabular-nums' }}>
            {confidence}%
          </div>
          <button
            type="button" onClick={() => setPhase('attempt')}
            style={{
              width: '100%', padding: '11px 0', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'var(--mn-blue)', color: '#fff', fontSize: '14px', fontWeight: 600,
            }}
          >
            记下预测，开始做题
          </button>
        </div>
      )}

      {phase === 'attempt' && (
        <div className="mn-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--mn-ink)' }}>
            现在在纸上把「{name}」自己做一遍（不要看讲解）。做完如实自评：
          </div>
          <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>你的预测把握：{confidence}%</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button" disabled={busy} onClick={() => void submit(true)}
              style={{
                flex: 1, padding: '11px 0', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: 'var(--mn-green)', color: '#fff', fontSize: '14px', fontWeight: 600,
                opacity: busy ? 0.5 : 1,
              }}
            >
              我做对了
            </button>
            <button
              type="button" disabled={busy} onClick={() => void submit(false)}
              style={{
                flex: 1, padding: '11px 0', borderRadius: '12px', cursor: 'pointer',
                border: '1px solid var(--mn-border)', background: 'var(--mn-surface)',
                color: 'var(--mn-ink)', fontSize: '14px', fontWeight: 600,
                opacity: busy ? 0.5 : 1,
              }}
            >
              我做错了
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && feedback && (
        <div style={{ borderRadius: '16px', padding: '20px', ...TONE_STYLE[feedback.tone] }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)', marginBottom: '6px' }}>
            预测 {confidence}% · 实际{result ? '做对' : '做错'}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--mn-ink)' }}>{feedback.msg}</p>
          <p style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '12px' }}>
            已记录——成长档案里能看到你的"判断准度"随时间变化。
          </p>
        </div>
      )}
    </div>
  );
}

export default function SelfTestPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground">加载中…</div>}>
      <SelfTestContent />
    </Suspense>
  );
}
