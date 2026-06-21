'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api-client';

interface Msg { role: 'ai' | 'user'; text: string; streaming?: boolean }

export default function ChineseReadingPage() {
  const router = useRouter();

  const [articleText,    setArticleText]   = useState('');
  const [question,       setQuestion]      = useState('');
  const [sessionId,      setSessionId]     = useState<string | null>(null);
  const [msgs,           setMsgs]          = useState<Msg[]>([]);
  const [input,          setInput]         = useState('');
  const [streaming,      setStreaming]      = useState(false);
  const [loading,        setLoading]       = useState(false);
  const [locatedPassage, setLocatedPassage] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef     = useRef<HTMLTextAreaElement>(null);

  const scroll = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  const startSession = async () => {
    if (!articleText.trim() || !question.trim()) return;
    setLoading(true);
    const res = await api.startReadingGuide({ article_text: articleText.trim(), question: question.trim(), subject: 'chinese' });
    setLoading(false);
    if (!res.ok) return;
    setSessionId(res.data.session_id);
    setMsgs([{ role: 'ai', text: res.data.first_question }]);
    scroll();
  };

  const send = useCallback(async () => {
    if (!input.trim() || streaming || !sessionId) return;
    const text = input.trim();
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text }, { role: 'ai', text: '', streaming: true }]);
    setStreaming(true);
    scroll();
    await api.readingGuideStream(sessionId, text, (reply, located) => {
      setMsgs((m) => m.map((it, i) => i === m.length - 1 ? { ...it, text: reply } : it));
      if (located) setLocatedPassage(true);
      scroll();
    });
    setMsgs((m) => m.map((it, i) => i === m.length - 1 ? { ...it, streaming: false } : it));
    setStreaming(false);
    taRef.current?.focus();
  }, [input, streaming, sessionId]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const cs: React.CSSProperties = { fontFamily: 'var(--mn-font-body)', background: 'var(--mn-surface)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' };

  if (!sessionId) {
    return (
      <div style={{ ...cs, alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--mn-ink-2)', cursor: 'pointer', fontSize: '14px', marginBottom: '24px' }}>
            ← 返回
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--mn-ink)', margin: '0 0 8px' }}>语文阅读理解引导</h1>
          <p style={{ fontSize: '14px', color: 'var(--mn-ink-2)', margin: '0 0 20px' }}>
            粘贴阅读材料和题目，老师引导你定位原文、提炼要素，绝不直接给答案。
          </p>
          <textarea value={articleText} onChange={(e) => setArticleText(e.target.value)} placeholder="在这里粘贴阅读材料全文…" rows={6}
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1.5px solid var(--mn-border)', borderRadius: '10px', fontFamily: 'inherit', fontSize: '14px', resize: 'vertical', outline: 'none', background: 'var(--mn-canvas)', color: 'var(--mn-ink)', lineHeight: 1.6, marginBottom: '10px' }} />
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="在这里输入题目…" rows={2}
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: '1.5px solid var(--mn-border)', borderRadius: '10px', fontFamily: 'inherit', fontSize: '14px', resize: 'none', outline: 'none', background: 'var(--mn-canvas)', color: 'var(--mn-ink)', lineHeight: 1.6 }} />
          <button onClick={startSession} disabled={loading || !articleText.trim() || !question.trim()}
            style={{ marginTop: '12px', width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: loading || !articleText.trim() || !question.trim() ? 'var(--mn-border)' : 'var(--mn-blue)', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? '正在启动…' : '开始引导'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={cs}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--mn-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--mn-ink-2)', cursor: 'pointer', fontSize: '14px' }}>←</button>
        <span style={{ fontWeight: 600, color: 'var(--mn-ink)' }}>语文阅读理解引导</span>
        {locatedPassage && (
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--mn-green)', background: '#f0fdf4', padding: '2px 8px', borderRadius: '99px' }}>已定位原文段落</span>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', textAlign: 'center', padding: '4px 12px', background: 'var(--mn-border-2)', borderRadius: '8px', alignSelf: 'center', maxWidth: '80%' }}>
          题目：{question.length > 50 ? question.slice(0, 50) + '…' : question}
        </div>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: m.role === 'user' ? 'var(--mn-blue)' : 'var(--mn-canvas)', color: m.role === 'user' ? '#fff' : 'var(--mn-ink)', fontSize: '15px', lineHeight: 1.6, border: m.role === 'ai' ? '1px solid var(--mn-border)' : 'none' }}>
              {m.text || (m.streaming ? '…' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--mn-border)', display: 'flex', gap: '8px' }}>
        <textarea ref={taRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="输入你的想法，按 Enter 发送…" rows={2}
          style={{ flex: 1, padding: '10px 12px', border: '1.5px solid var(--mn-border)', borderRadius: '10px', fontFamily: 'inherit', fontSize: '15px', resize: 'none', outline: 'none', background: 'var(--mn-canvas)', color: 'var(--mn-ink)', lineHeight: 1.5 }} />
        <button onClick={send} disabled={streaming || !input.trim()}
          style={{ padding: '0 16px', border: 'none', borderRadius: '10px', background: streaming || !input.trim() ? 'var(--mn-border)' : 'var(--mn-blue)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: streaming ? 'wait' : 'pointer', alignSelf: 'flex-end' }}>
          {streaming ? '…' : '发送'}
        </button>
      </div>
    </div>
  );
}
