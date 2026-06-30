'use client';

import { useMemo, useState } from 'react';
import { LISTENING_EXERCISES, type ListeningExercise } from './listening.data';

function speak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return; }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    if (onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  } catch { onEnd?.(); }
}

function Player({ ex, onBack }: { ex: ListeningExercise; onBack: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showText, setShowText] = useState(false);

  const play = () => {
    setPlaying(true);
    speak(ex.transcript, () => setPlaying(false));
  };
  const score = ex.questions.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
      <button onClick={() => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); onBack(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#3b82f6', marginBottom: 16 }}>← 返回列表</button>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f', margin: '0 0 4px' }}>{ex.title}</h1>
      <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px' }}>{ex.level} · 听录音回答问题</p>

      <button onClick={play}
        style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: playing ? '#93c5fd' : '#3b82f6', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 18 }}>
        {playing ? '🔊 播放中…' : '▶️ 播放录音'}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ex.questions.map((q, qi) => (
          <div key={qi}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: '0 0 8px' }}>{qi + 1}. {q.q}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi;
                const correct = submitted && oi === q.answer;
                const wrong = submitted && chosen && oi !== q.answer;
                return (
                  <button key={oi} disabled={submitted}
                    onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                    style={{
                      textAlign: 'left', padding: '10px 12px', borderRadius: 8, fontSize: 13, cursor: submitted ? 'default' : 'pointer',
                      border: `1.5px solid ${correct ? '#16a34a' : wrong ? '#dc2626' : chosen ? '#3b82f6' : '#e5e7eb'}`,
                      background: correct ? '#f0fdf4' : wrong ? '#fef2f2' : chosen ? '#eff6ff' : '#fff',
                      color: correct ? '#15803d' : wrong ? '#dc2626' : '#374151',
                    }}>
                    {String.fromCharCode(65 + oi)}. {opt}{correct ? ' ✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < ex.questions.length}
          style={{ width: '100%', marginTop: 18, padding: 14, borderRadius: 12, border: 'none', background: '#16a34a', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: Object.keys(answers).length < ex.questions.length ? 0.5 : 1 }}>
          提交答案
        </button>
      ) : (
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#1e3a5f' }}>
            答对 {score}/{ex.questions.length}
          </div>
          <button onClick={() => setShowText(s => !s)}
            style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer' }}>
            {showText ? '隐藏原文' : '查看听力原文'}
          </button>
          {showText && (
            <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e5e7eb', fontSize: 14, color: '#334155', lineHeight: 1.8 }}>
              {ex.transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ListeningPage() {
  const [active, setActive] = useState<ListeningExercise | null>(null);
  const byLevel = useMemo(() => {
    const m = new Map<string, ListeningExercise[]>();
    for (const e of LISTENING_EXERCISES) { if (!m.has(e.level)) m.set(e.level, []); m.get(e.level)!.push(e); }
    return [...m.entries()];
  }, []);

  if (active) return <Player ex={active} onBack={() => setActive(null)} />;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>听力练习</h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>共 {LISTENING_EXERCISES.length} 篇 · 浏览器合成发音，可反复播放</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {byLevel.map(([level, list]) => (
          <div key={level}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', letterSpacing: '0.05em', margin: '0 0 8px 4px' }}>{level}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {list.map((e, i) => (
                <button key={i} onClick={() => setActive(e)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', padding: '14px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{e.title}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{e.questions.length} 题 ›</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 28 }}>
        录音由浏览器语音合成播放，效果因设备而异
      </p>
    </div>
  );
}
