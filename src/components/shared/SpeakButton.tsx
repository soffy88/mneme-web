'use client';

import { useEffect, useState } from 'react';
import { speakText, stopSpeaking } from '@/lib/voice';

/** 🔊 朗读按钮：文本（可含 LaTeX）交给 /v1/tts，服务端转口语中文并缓存。 */
export default function SpeakButton({ text, label = '朗读', size = 13 }: { text: string; label?: string; size?: number }) {
  const [st, setSt] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  useEffect(() => () => { if (st === 'playing') stopSpeaking(); }, [st]);
  if (!text?.trim()) return null;
  const onClick = async () => {
    if (st === 'playing') { stopSpeaking(); setSt('idle'); return; }
    setSt('loading');
    try {
      await speakText(text, () => setSt('idle'));
      setSt('playing');
    } catch {
      setSt('error');
      setTimeout(() => setSt('idle'), 2000);
    }
  };
  const txt = st === 'loading' ? '…' : st === 'playing' ? '停止' : st === 'error' ? '暂不可用' : label;
  return (
    <button type="button" onClick={() => void onClick()} aria-label={st === 'playing' ? '停止朗读' : '朗读'}
      data-testid="speak-btn"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start', fontSize: size,
        padding: '3px 10px', borderRadius: 999, border: '1px solid var(--mn-border, #e2e8f0)',
        background: st === 'playing' ? 'var(--mn-blue-dim, #eff6ff)' : 'var(--mn-surface, #fff)',
        color: 'var(--mn-ink-2, #334155)', cursor: 'pointer',
      }}>
      <span aria-hidden>{st === 'playing' ? '■' : '🔊'}</span>{txt}
    </button>
  );
}
