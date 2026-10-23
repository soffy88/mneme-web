'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth-store';
import { VoiceClient, type VoiceEvent, type VoiceMode } from '@/lib/voice';
import CompanionAvatar, { type Expression } from '@/components/student/CompanionAvatar';

// 语音辅导 / AI 陪学陪练：按住说话或开麦对话；伙伴只聊学习，判分只经后端工具（掌握度只经 SubmitAnswer）。
type Line = { who: 'me' | 'ai' | 'sys'; text: string };

const ENCOURAGE = /加油|别灰心|再想想|没关系|很接近|试试|提示/;

export default function VoicePage() {
  const router = useRouter();
  const [mode, setMode] = useState<VoiceMode>('companion');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'ready' | 'closed'>('idle');
  const [mic, setMic] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [name, setName] = useState('小智');
  const [expr, setExpr] = useState<Expression>('happy');
  const [level, setLevel] = useState(0);
  const [text, setText] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const client = useRef<VoiceClient | null>(null);
  const raf = useRef<number>(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!getToken()) router.push('/login?next=/placement/voice');
    return () => { client.current?.close(); cancelAnimationFrame(raf.current); };
  }, [router]);

  useEffect(() => { listRef.current?.scrollTo({ top: 1e9 }); }, [lines]);

  const add = (l: Line) => setLines((xs) => [...xs.slice(-60), l]);

  const onEvent = (e: VoiceEvent) => {
    switch (e.type) {
      case 'ready': setStatus('ready'); setName(String(e.companion_name ?? '小智')); break;
      case 'transcript': add({ who: 'me', text: String(e.text) }); setExpr('thinking'); break;
      case 'reply_start': setExpr('happy'); break;
      case 'reply_text': {
        const t = String(e.text);
        setExpr(ENCOURAGE.test(t) ? 'encouraging' : 'happy');
        setLines((xs) => {
          const last = xs[xs.length - 1];
          if (last && last.who === 'ai' && Number(e.index) > 0) return [...xs.slice(0, -1), { who: 'ai', text: last.text + t }];
          return [...xs.slice(-60), { who: 'ai', text: t }];
        });
        break;
      }
      case 'break_suggestion': setExpr('encouraging'); break;
      case 'limit': add({ who: 'sys', text: String(e.text ?? '时间到啦') }); break;
      case 'error': {
        const code = String(e.code);
        setErr(code === 'forbidden' ? '当前账号未开通语音陪学（家长账号需管理员授权）'
          : code === 'rate_limited' ? String(e.message ?? '说得太快啦')
          : code === 'already_connected' ? '已经在另一个页面打开了语音陪学'
          : code === 'unauthorized' ? '请先登录' : '语音服务暂时不可用');
        break;
      }
      default: break;
    }
  };

  const tick = () => {
    setLevel(client.current?.level() ?? 0);
    raf.current = requestAnimationFrame(tick);
  };

  async function connect() {
    setErr(null); setLines([]); setStatus('connecting');
    const c = new VoiceClient(mode);
    c.onEvent = onEvent;
    c.onClose = (code) => { setStatus('closed'); setMic(false); if (code === 4401) router.push('/login?next=/placement/voice'); };
    client.current = c;
    try {
      await c.connect();
      await c.unlockAudio();
      raf.current = requestAnimationFrame(tick);
    } catch { setStatus('closed'); setErr('连接失败，请稍后再试'); }
  }

  async function toggleMic() {
    const c = client.current;
    if (!c) return;
    if (mic) { c.stopMic(); setMic(false); return; }
    try { await c.startMic(); setMic(true); } catch { setErr('无法使用麦克风，请在浏览器里允许麦克风权限，或直接打字'); }
  }

  function hangup() { client.current?.close(); client.current = null; setStatus('closed'); setMic(false); cancelAnimationFrame(raf.current); setLevel(0); }

  function sendText() {
    const t = text.trim();
    if (!t || !client.current) return;
    add({ who: 'me', text: t }); setExpr('thinking'); setText('');
    client.current.sendText(t);
  }

  const live = status === 'ready';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--mn-ink)', margin: 0 }}>语音陪学</h1>
        <p style={{ fontSize: 13, color: 'var(--mn-ink-3)', margin: '4px 0 0' }}>
          和学习伙伴说说话：问数学题，或让它陪你练一练。它只聊学习，不需要你的任何个人信息。
        </p>
      </div>

      {!live && (
        <div className="mn-card" style={{ padding: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--mn-ink-2)' }}>模式：</span>
          {(['companion', 'tutor'] as VoiceMode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={mode === m ? 'mn-btn-primary' : 'mn-btn-secondary'}>
              {m === 'companion' ? '陪学陪练' : '语音辅导'}
            </button>
          ))}
          <button type="button" className="mn-btn-primary" disabled={status === 'connecting'} onClick={() => void connect()} style={{ marginLeft: 'auto' }}>
            {status === 'connecting' ? '连接中…' : '开始'}
          </button>
        </div>
      )}

      <div className="mn-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <CompanionAvatar level={level} expression={expr} name={mode === 'companion' ? name : '语音老师'} />
        {live && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" className={mic ? 'mn-btn-secondary' : 'mn-btn-primary'} onClick={() => void toggleMic()} data-testid="mic-btn">
              {mic ? '⏸ 关麦' : '🎤 开麦说话'}
            </button>
            {mode === 'companion' && (
              <button type="button" className="mn-btn-secondary" onClick={() => client.current?.startPractice()}>开始练习</button>
            )}
            <button type="button" className="mn-btn-secondary" onClick={() => client.current?.interrupt()}>打断</button>
            <button type="button" className="mn-btn-secondary" onClick={hangup}>结束</button>
          </div>
        )}
        {mic && <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>正在听…说完停一下就好；它说话时你开口就能打断。</span>}
      </div>

      {err && <div style={{ color: 'var(--mn-red, #dc2626)', fontSize: 13 }}>{err}</div>}

      <div ref={listRef} className="mn-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
        {lines.length === 0 && <span style={{ fontSize: 13, color: 'var(--mn-ink-3)' }}>对话会显示在这里。</span>}
        {lines.map((l, i) => (
          <div key={i} style={{
            alignSelf: l.who === 'me' ? 'flex-end' : l.who === 'sys' ? 'center' : 'flex-start',
            maxWidth: '85%', padding: '8px 12px', borderRadius: 12, fontSize: 14,
            background: l.who === 'me' ? 'var(--mn-blue-dim, #eff6ff)' : l.who === 'sys' ? 'transparent' : 'var(--mn-surface-2, #f8fafc)',
            color: l.who === 'sys' ? 'var(--mn-ink-3)' : 'var(--mn-ink)',
          }}>{l.text}</div>
        ))}
      </div>

      {live && (
        <form style={{ display: 'flex', gap: 8 }} onSubmit={(e) => { e.preventDefault(); sendText(); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="也可以打字问我"
            style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--mn-border)', fontSize: 15 }} />
          <button type="submit" className="mn-btn-primary" disabled={!text.trim()}>发送</button>
        </form>
      )}
      <span style={{ fontSize: 12, color: 'var(--mn-ink-3)' }}>对话记录家长可以查看；每天的使用时长由家长设置。</span>
    </div>
  );
}
