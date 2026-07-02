'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getUserId } from '@/lib/auth-store';
import * as api from '@/lib/api-client';
import type { SpeakingPracticeRes, SpeakingHistoryItem } from '@/types/api';

const PRESET_TOPICS = [
  { topic: 'Daily Routine',    sentences: 'I wake up at seven every morning. I have breakfast with my family. I go to school by bus.' },
  { topic: 'My Hobbies',      sentences: 'I enjoy reading books in my free time. I also like playing basketball with my friends. Music makes me happy.' },
  { topic: 'School Life',     sentences: 'My school starts at eight o\'clock. I have many interesting subjects. My favorite subject is English.' },
  { topic: 'Future Dreams',   sentences: 'I want to be a doctor in the future. I will work hard to achieve my dream. I hope to help many people.' },
];

const GRADES = ['初一', '初二', '初三', '高一', '高二', '高三'] as const;

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'var(--mn-green)' : pct >= 60 ? 'var(--mn-blue)' : 'var(--mn-amber)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--mn-ink-2)', marginBottom: '5px' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
      </div>
      <div style={{ height: '6px', borderRadius: '99px', background: 'var(--mn-border-2)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '99px',
          width: `${pct}%`, background: color,
          transition: 'width 0.6s var(--mn-ease-out)',
        }} />
      </div>
    </div>
  );
}

function HistoryList({ history }: { history: SpeakingHistoryItem[] }) {
  if (history.length === 0) return null;

  const maxPts = history.map((h) => ({ x: history.indexOf(h), y: h.overall_progress }));
  const W = 280, H = 80, PAD = 12;
  const xs = maxPts.map((p, i) => PAD + i * ((W - 2 * PAD) / Math.max(maxPts.length - 1, 1)));
  const ys = maxPts.map((p) => PAD + (1 - p.y) * (H - 2 * PAD));
  const pathD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ');

  return (
    <div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)', marginBottom: '10px' }}>历史记录</div>
      <div className="mn-card" style={{ padding: '16px' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', marginBottom: '12px' }}>
          <defs>
            <linearGradient id="sp-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--mn-blue)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--mn-blue)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {maxPts.length > 1 && (
            <path d={`${pathD} L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`} fill="url(#sp-grad)" />
          )}
          <path d={pathD} fill="none" stroke="var(--mn-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {xs.map((x, i) => (
            <circle key={i} cx={x} cy={ys[i]} r="3.5" fill="var(--mn-blue)" />
          ))}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map((h) => (
            <div key={h.session_id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0', borderBottom: '1px solid var(--mn-border)',
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mn-ink)' }}>{h.topic}</div>
                <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>
                  {new Date(h.created_at).toLocaleDateString('zh-CN')}
                </div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--mn-blue)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(h.overall_progress * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SpeakingPage() {
  const router   = useRouter();
  const [grade,     setGrade]     = useState('高三');
  const [topic,     setTopic]     = useState(PRESET_TOPICS[0].topic);
  const [sentences, setSentences] = useState(PRESET_TOPICS[0].sentences);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<SpeakingPracticeRes | null>(null);
  const [history,   setHistory]   = useState<SpeakingHistoryItem[]>([]);
  const [error,     setError]     = useState('');
  const [micActive, setMicActive] = useState(false);

  useEffect(() => {
    const sid = getUserId();
    if (!sid) { router.push('/login'); return; }
    // 年级默认值取登录用户档案
    const g = getUser()?.grade;
    if (g && (GRADES as readonly string[]).includes(g)) setGrade(g);
    api.getSpeakingHistory(sid).then((r) => { if (r.ok) setHistory(r.data); });
  }, []);

  const onPresetChange = (idx: number) => {
    const p = PRESET_TOPICS[idx];
    if (!p) return;
    setTopic(p.topic);
    setSentences(p.sentences);
    setResult(null);
  };

  const handleMicClick = async () => {
    // Request mic permission to satisfy UX requirement; actual audio not sent in current backend
    if (micActive) { setMicActive(false); return; }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('请允许麦克风权限后重试');
      return;
    }
    setMicActive(true);
  };

  const submit = async () => {
    setLoading(true); setError('');
    const res = await api.postSpeakingPractice({ topic, target_sentences: sentences, grade });
    setLoading(false);
    if (res.ok) {
      setResult(res.data);
      setMicActive(false);
      const sid = getUserId();
      if (sid) {
        const hist = await api.getSpeakingHistory(sid);
        if (hist.ok) setHistory(hist.data);
      }
    } else {
      setError(res.error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* 诚信提示：发音评测尚未接入真实音频，分数仅为示例 */}
      <div style={{
        padding: '12px 16px', borderRadius: '10px',
        background: 'var(--mn-orange-dim)', border: '1px solid var(--mn-orange)',
        fontSize: '13px', color: 'var(--mn-orange)', lineHeight: 1.6, fontWeight: 600,
      }}>
        ⚠️ 发音评测功能建设中，当前评分仅为示例，不代表真实发音水平。
      </div>

      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)', lineHeight: 1.2 }}>
          英语口语陪练
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
          跟 AI 一起练口语，稳步提升发音
        </p>
      </div>

      {/* 设置卡片 */}
      <div className="mn-card" style={{ padding: '18px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mn-ink-2)', display: 'block', marginBottom: '6px' }}>年级</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid var(--mn-border)', background: 'var(--mn-surface)', fontSize: '14px', color: 'var(--mn-ink)', appearance: 'none' }}
            >
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mn-ink-2)', display: 'block', marginBottom: '6px' }}>话题</label>
            <select
              onChange={(e) => onPresetChange(Number(e.target.value))}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid var(--mn-border)', background: 'var(--mn-surface)', fontSize: '14px', color: 'var(--mn-ink)', appearance: 'none' }}
            >
              {PRESET_TOPICS.map((p, i) => <option key={i} value={i}>{p.topic}</option>)}
            </select>
          </div>
        </div>

        {/* 目标句子展示 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mn-ink-2)', marginBottom: '8px' }}>练习句子</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sentences.split('. ').filter(Boolean).map((s, i) => (
              <div key={i} style={{
                padding: '10px 14px', borderRadius: '10px',
                background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
                fontSize: '15px', color: 'var(--mn-ink)', lineHeight: 1.5,
                fontStyle: 'italic',
              }}>
                {s.endsWith('.') ? s : `${s}.`}
              </div>
            ))}
          </div>
        </div>

        {/* 录音按钮 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={() => void handleMicClick()}
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: micActive ? '#fee2e2' : 'var(--mn-blue-dim)',
              border: `3px solid ${micActive ? 'var(--mn-red)' : 'var(--mn-blue)'}`,
              fontSize: '28px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--mn-duration)',
              transform: micActive ? 'scale(1.05)' : 'scale(1)',
              boxShadow: micActive ? '0 0 0 8px rgba(185,28,28,0.12)' : '0 2px 8px rgba(30,58,95,.15)',
            }}
            aria-label={micActive ? '停止录音' : '开始录音'}
          >
            {micActive ? '⏹' : '🎙'}
          </button>
          <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>
            {micActive ? '录音中…点击停止' : '点击麦克风开始'}
          </div>
        </div>

        <button
          type="button"
          className="mn-btn-primary"
          disabled={loading}
          onClick={() => void submit()}
          style={{ width: '100%' }}
        >
          {loading ? '评测中…' : '开始陪练'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fff7ed', border: '1px solid #fed7aa', fontSize: '13px', color: 'var(--mn-orange)' }}>
          {error}
        </div>
      )}

      {/* 评分结果 */}
      {result && (
        <div className="mn-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)' }}>本次练习成绩</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--mn-orange, #c2550d)', background: 'var(--mn-orange-dim, #fff7ed)', padding: '1px 6px', borderRadius: '4px' }}>示例</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--mn-ink-3)', margin: '0 0 12px', lineHeight: 1.6 }}>
            以下分数为示例数据，未接入真实发音评测引擎，不代表实际发音水平，仅用于演示界面。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.7 }}>
            <ScoreBar label="综合（示例）" value={result.overall_progress} />
            {result.pronunciation_scores[0] && (
              <>
                <ScoreBar label="流利度（示例）" value={result.pronunciation_scores[0].fluency_score} />
                <ScoreBar label="准确度（示例）" value={result.pronunciation_scores[0].accuracy_score} />
              </>
            )}
          </div>
          {result.turns.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink-2)', marginBottom: '8px' }}>对话记录</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(result.turns as Array<{ role: string; text: string }>).map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: t.role === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      maxWidth: '80%', padding: '9px 13px', borderRadius: '12px',
                      fontSize: '14px', lineHeight: 1.5,
                      background: t.role === 'user' ? 'var(--mn-blue)' : 'var(--mn-surface)',
                      color: t.role === 'user' ? 'white' : 'var(--mn-ink)',
                      border: t.role === 'user' ? 'none' : '1px solid var(--mn-border)',
                    }}>
                      {t.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 历史记录 */}
      <HistoryList history={history} />

    </div>
  );
}
