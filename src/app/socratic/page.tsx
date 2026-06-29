'use client';

import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import * as api from '@/lib/api-client';
import type { SocraticOutcome } from '@/types/api';

interface Msg { role: 'ai' | 'user'; text: string; streaming?: boolean }

const EMOTION_HINT: Record<string, { text: string; color: string }> = {
  anxious: { text: '😊 不用担心，慢慢来，每次思考都是进步。', color: 'var(--mn-blue)' },
  crisis:  { text: '🌙 今天已经很努力了，要不要先看看答案思路？', color: 'var(--mn-orange)' },
  angry:   { text: '🤝 题目确实有挑战性，一步一步来。', color: 'var(--mn-blue)' },
};

function SocraticPageInner() {
  const searchParams = useSearchParams();
  const [sessionId] = useState<string | null>(searchParams.get('session_id'));
  const initFirstQ = searchParams.get('first_q');
  const [msgs,      setMsgs]      = useState<Msg[]>(
    sessionId && initFirstQ ? [{ role: 'ai', text: initFirstQ }] : []
  );
  const [input,     setInput]     = useState('');
  const [streaming, setStreaming] = useState(false);
  const [emotion,   setEmotion]   = useState<string | null>(null);
  const [outcome,   setOutcome]   = useState<SocraticOutcome>(null);
  const [escape,    setEscape]    = useState<string | null>(null);
  const [started]                 = useState(!!(sessionId && initFirstQ));
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef     = useRef<HTMLTextAreaElement>(null);

  const scrollBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  const send = useCallback(async () => {
    if (!input.trim() || streaming || !sessionId) return;
    const text = input.trim();
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text }, { role: 'ai', text: '', streaming: true }]);
    setStreaming(true);
    scrollBottom();
    let ai = '';
    try {
      await api.socraticStream(sessionId, text,
        (delta) => {
          ai += delta;
          setMsgs((m) => m.map((it, i) => i === m.length - 1 ? { ...it, text: ai } : it));
          scrollBottom();
        },
        (emo, out) => { setEmotion(emo); setOutcome(out as SocraticOutcome); }
      );
      setMsgs((m) => m.map((it, i) => i === m.length - 1 ? { ...it, streaming: false } : it));
    } catch {
      setMsgs((m) => m.map((it, i) => i === m.length - 1 ? { ...it, text: ai ? ai + '\n\n⚠️ 连接中断，请重试' : '⚠️ 连接中断，请重试', streaming: false } : it));
    } finally {
      setStreaming(false);
      taRef.current?.focus();
    }
  }, [input, streaming, sessionId]);

  const onEscape = async () => {
    if (!sessionId) return;
    const r = await api.escapeSocratic(sessionId);
    if (r.ok) setEscape(r.data.answer_outline);
  };

  /* ── start screen ── */
  if (!started) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '48px', textAlign: 'center' }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'var(--mn-blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '36px',
      }}>◌</div>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)', marginBottom: '8px' }}>
          苏格拉底模式
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--mn-ink-3)', maxWidth: '280px', lineHeight: 1.6 }}>
          AI 不直接给答案，而是通过提问帮你自己想通。每次对话都是真正的理解。
        </p>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)' }}>从一道具体的题开始 ——</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/error-journal" className="mn-btn-primary" style={{ minWidth: '140px', textDecoration: 'none' }}>
          找一道错题讨论
        </Link>
        <Link href="/practice" className="mn-btn-secondary" style={{ minWidth: '140px', textDecoration: 'none' }}>
          去做练习
        </Link>
      </div>
    </div>
  );

  /* ── chat ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100svh - 130px)', gap: '12px' }}>

      {/* messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
        {msgs.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%',
              padding: msg.role === 'ai' ? '12px 14px' : '10px 14px',
              borderRadius: msg.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
              background: msg.role === 'ai' ? 'var(--mn-surface)' : 'var(--mn-blue)',
              color: msg.role === 'ai' ? 'var(--mn-ink)' : 'white',
              border: msg.role === 'ai' ? '1px solid var(--mn-border)' : 'none',
              fontSize: '15px', lineHeight: 1.55,
              boxShadow: msg.role === 'ai' ? 'var(--mn-shadow-xs)' : '0 2px 8px rgba(30,58,95,.25)',
            }}>
              {msg.text}
              {msg.streaming && <span style={{ display: 'inline-block', width: '2px', height: '14px', background: 'currentColor', marginLeft: '2px', animation: 'blink 1s steps(1) infinite', verticalAlign: 'text-bottom' }} />}
            </div>
          </div>
        ))}
        {emotion && EMOTION_HINT[emotion] && (
          <div style={{ textAlign: 'center', padding: '6px 16px' }}>
            <span style={{ fontSize: '13px', color: EMOTION_HINT[emotion].color, background: 'var(--mn-surface)', padding: '4px 12px', borderRadius: '99px', border: '1px solid var(--mn-border)' }}>
              {EMOTION_HINT[emotion].text}
            </span>
          </div>
        )}
        {escape && (
          <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--mn-amber-dim)', border: '1px solid #f5c060', fontSize: '14px', color: 'var(--mn-ink)', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, color: 'var(--mn-amber)', marginBottom: '5px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>答案思路</div>
            {escape}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>

      {/* input */}
      {outcome ? (
        <div style={{ textAlign: 'center', padding: '12px', fontSize: '13px', color: 'var(--mn-ink-3)', background: 'var(--mn-surface)', borderRadius: '12px', border: '1px solid var(--mn-border)' }}>
          对话结束 · {outcome === 'success' ? '🎉 你想通了！' : outcome === 'partial' ? '💪 有进步！' : '继续加油'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
              rows={2}
              disabled={streaming}
              placeholder="输入你的想法…（Enter 发送）"
              style={{
                flex: 1, padding: '11px 14px', borderRadius: '14px', fontSize: '15px',
                border: '1.5px solid var(--mn-border-2)', background: 'var(--mn-surface)',
                color: 'var(--mn-ink)', resize: 'none', outline: 'none', lineHeight: 1.5,
                transition: 'border-color var(--mn-duration-fast)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--mn-blue)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'var(--mn-border-2)'; }}
            />
            <button type="button" className="mn-btn-primary"
              disabled={streaming || !input.trim()}
              onClick={() => void send()}
              style={{ padding: '11px 18px', alignSelf: 'flex-end', borderRadius: '14px' }}>
              {streaming ? '…' : '发送'}
            </button>
          </div>
          <button type="button" onClick={onEscape}
            style={{ fontSize: '12px', color: 'var(--mn-ink-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
            想不出来？看答案思路
          </button>
        </div>
      )}
    </div>
  );
}

export default function SocraticPage() {
  return (
    <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: 'var(--mn-ink-3)' }}>加载中…</div>}>
      <SocraticPageInner />
    </Suspense>
  );
}
