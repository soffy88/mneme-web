'use client';

import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

interface Citation {
  citation: string;
  page: number | null;
  section: string | null;
  score: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export function TextbookChat({ fileId }: { fileId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [indexStatus, setIndexStatus] = useState<'pending' | 'indexing' | 'ready' | 'error'>('pending');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if file is indexed
  useEffect(() => {
    (async () => {
      const res = await apiFetch(`/v1/textbook-files/${fileId}/meta`);
      if (res.ok && res.data.index_status === 'ready') {
        setIndexStatus('ready');
      } else {
        // Automatically request index if not ready
        setIndexStatus('indexing');
        apiFetch(`/v1/textbook-kb/index/${fileId}`, { method: 'POST' }).then(() => {
          setIndexStatus('ready');
        }).catch(() => {
          setIndexStatus('error');
        });
      }
    })();
  }, [fileId]);

  const sendFirstQuestion = async (q: string) => {
    const res = await apiFetch(`/v1/textbook-files/${fileId}/qa`, {
      method: 'POST',
      body: JSON.stringify({ file_id: fileId, question: q }),
    });
    if (!res.ok) return;
    setSessionId(res.data.session_id);
    setMessages([
      { role: 'user', content: q },
      { role: 'assistant', content: res.data.answer, citations: res.data.citations }
    ]);
  };

  const sendFollowUp = async (q: string) => {
    if (!sessionId) return;
    
    // Add optimistic user message and empty assistant message
    setMessages(prev => [
      ...prev,
      { role: 'user', content: q },
      { role: 'assistant', content: '' }
    ]);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'}/v1/textbook-files/qa/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('mneme_token')}`
      },
      body: JSON.stringify({ message: q })
    });
    
    if (!response.body) return;
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') break;
          if (!dataStr) continue;
          
          try {
            const data = JSON.parse(dataStr);
            if (data.reply) {
              setMessages(prev => {
                const newMsgs = [...prev];
                const last = newMsgs[newMsgs.length - 1];
                last.content = data.reply;
                last.citations = data.citations;
                return newMsgs;
              });
            }
          } catch (e) {
            console.error('Failed to parse SSE', e);
          }
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    
    setInput('');
    setLoading(true);
    
    try {
      if (!sessionId) {
        await sendFirstQuestion(q);
      } else {
        await sendFollowUp(q);
      }
    } finally {
      setLoading(false);
    }
  };

  if (indexStatus !== 'ready') {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--mn-ink-3)', fontSize: '13px' }}>
        {indexStatus === 'indexing' ? '正在为教材构建知识检索索引，请稍候...' : '索引构建失败'}
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--mn-paper)' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--mn-ink-3)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mn-ink-2)' }}>课本向导已就绪</div>
            <div style={{ fontSize: '13px', marginTop: '6px' }}>可以问我教材里的任何概念，我会带你找到出处。</div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: '16px',
              borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
              borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
              background: msg.role === 'user' ? 'var(--mn-blue)' : 'white',
              color: msg.role === 'user' ? 'white' : 'var(--mn-ink)',
              fontSize: '14px',
              lineHeight: 1.6,
              boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
              border: msg.role === 'assistant' ? '1px solid var(--mn-border)' : 'none',
            }}>
              {msg.content}
            </div>
            
            {/* Citations */}
            {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
              <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '4px' }}>
                {msg.citations.map((cite, j) => (
                  <div key={j} style={{
                    fontSize: '11px', color: 'var(--mn-blue)', background: 'var(--mn-surface-2)',
                    padding: '2px 8px', borderRadius: '4px', cursor: 'pointer'
                  }} title={`相似度: ${cite.score}`}>
                    {cite.citation}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', paddingLeft: '16px' }}>思考中...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        padding: '12px 16px', background: 'white',
        borderTop: '1px solid var(--mn-border)'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="问问课本里的内容..."
            disabled={loading}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: '20px',
              border: '1px solid var(--mn-border)', fontSize: '14px',
              outline: 'none', background: 'var(--mn-surface)',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: input.trim() ? 'var(--mn-blue)' : 'var(--mn-border-2)',
              color: 'white', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}
