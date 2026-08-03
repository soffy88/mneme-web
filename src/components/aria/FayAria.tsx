'use client';

/**
 * Fay 数字人 — 照片驱动真人场景 + Fay 大脑对话。
 *
 * 渲染：全画面场景照片 + 真人图层叠加 + 音频驱动唇形动画
 * 对话：Fay WebSocket (LLM + edge-tts)
 * 音频：speakUrl() → activeAudio → getAudioTime() 共享追踪
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAudioTime, speakUrl } from './speech';
import { FayClient, type FayAudioMsg, type FayStateMsg } from '@/lib/fay-ws';
import { createPianoAmbience, TRACK_PRESETS, trackMeta } from './pianoAmbience';

type Scene = 'idle' | 'speaking' | 'thinking' | 'playing';

/** 场景背景图 */
const SCENE_BG: Record<Scene, string> = {
  idle: '/aria/dh/room_talk.jpg',
  speaking: '/aria/dh/room_talk.jpg',
  thinking: '/aria/dh/room_talk.jpg',
  playing: '/aria/dh/room_play.jpg',
};

/** 真人前景图层 */
const SCENE_FG: Record<Scene, string> = {
  idle: '/aria/dh/person_talk.png',
  speaking: '/aria/dh/person_talk.png',
  thinking: '/aria/dh/person_talk.png',
  playing: '/aria/dh/person_play.png',
};

/** 检测文字中是否有弹琴意图 */
const PIANO_KEYWORDS = ['弹钢琴', '弹琴', '弹一首', '月光', '钢琴', '来一首', '演奏', 'piano', 'play piano', 'moonlight', '弹个曲', '给你弹', '放松一下'];
function wantsPiano(text: string): boolean {
  const lower = text.toLowerCase();
  return PIANO_KEYWORDS.some(k => lower.includes(k));
}

/** 音频 URL 重写为公网代理 */
function rewriteAudioUrl(raw: string): string {
  const m = raw.match(/\/audio\/([^/?]+)/);
  if (!m) return raw;
  const file = m[1];
  if (typeof window !== 'undefined' && window.location.hostname.includes('sxueji.com')) {
    return `/fay-audio/${file}`;
  }
  return `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5001/audio/${file}`;
}

export function FayAria() {
  const [scene, setScene] = useState<Scene>('idle');
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState('连接 Fay…');
  const [connected, setConnected] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const [input, setInput] = useState('');
  const [pianoTrack, setPianoTrack] = useState('');
  const [pianoProgress, setPianoProgress] = useState(0);

  const fayRef = useRef<FayClient | null>(null);
  const audioQueueRef = useRef<FayAudioMsg[]>([]);
  const playingRef = useRef(false);
  const mouthRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const pianoRef = useRef<ReturnType<typeof createPianoAmbience> | null>(null);
  const pianoWantedRef = useRef(false);  // LLM said she'd play piano
  const pianoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 唇形动画：基于 audio time 驱动
  const animateMouth = useCallback(() => {
    if (!mouthRef.current) { animRef.current = requestAnimationFrame(animateMouth); return; }
    const at = getAudioTime();
    if (at >= 0 && playingRef.current) {
      tRef.current = at;
      const open = 0.3 + Math.abs(Math.sin(at * 14)) * 0.5 + Math.abs(Math.sin(at * 7.3)) * 0.2;
      const wide = 0.85 + Math.sin(at * 5.1) * 0.15;
      mouthRef.current.style.transform = `scaleY(${open}) scaleX(${wide})`;
      mouthRef.current.style.opacity = '0.5';
    } else {
      mouthRef.current.style.transform = 'scaleY(0.2) scaleX(0.7)';
      mouthRef.current.style.opacity = '0';
    }
    animRef.current = requestAnimationFrame(animateMouth);
  }, []);

  // 停止钢琴
  const stopPiano = useCallback(() => {
    if (pianoTimerRef.current) { clearInterval(pianoTimerRef.current); pianoTimerRef.current = null; }
    if (pianoRef.current) { pianoRef.current.stop(1500); pianoRef.current = null; }
    pianoWantedRef.current = false;
    setPianoTrack('');
    setPianoProgress(0);
    setScene((p) => (p === 'playing' ? 'idle' : p));
  }, []);

  // 开始钢琴演奏
  const startPiano = useCallback(() => {
    if (pianoRef.current) return; // already playing
    // Pick "月光" if the user asked for moonlight, otherwise random
    const wantMoonlight = pianoWantedRef.current; // flag was set by keyword detection
    const idx = 0; // Moonlight is track 0
    const piano = createPianoAmbience();
    piano.setTrack(idx);
    piano.start();
    pianoRef.current = piano;
    setPianoTrack(trackMeta(idx).title);
    setScene('playing');
    setStatus('🎹 Aria 正在弹琴…');

    // Progress update
    pianoTimerRef.current = setInterval(() => {
      if (pianoRef.current) {
        setPianoProgress(pianoRef.current.getProgress());
      }
    }, 200);

    // Auto-stop after 45 seconds of playing
    setTimeout(() => {
      if (pianoRef.current && !playingRef.current) {
        stopPiano();
      }
    }, 45000);
  }, [stopPiano]);

  const playNext = useCallback(() => {
    if (playingRef.current) return;
    const msg = audioQueueRef.current.shift();
    if (!msg) {
      setSpeaking(false);
      // 话说完了，如果之前检测到弹琴意图 → 开始弹琴
      if (pianoWantedRef.current) {
        setTimeout(() => startPiano(), 500);
      } else {
        setScene((p) => (p === 'speaking' ? 'idle' : p));
      }
      return;
    }

    playingRef.current = true;
    setSpeaking(true);
    // 如果正在弹琴，先停掉
    if (pianoRef.current) stopPiano();
    setScene('speaking');
    if (msg.text) {
      setSubtitle(msg.text);
      // 检测这段话里是否有弹琴意图
      if (wantsPiano(msg.text)) pianoWantedRef.current = true;
    }

    const url = rewriteAudioUrl(msg.audioUrl);
    speakUrl(url, () => {
      playingRef.current = false;
      setSubtitle('');
      setTimeout(() => playNext(), 150);
    });
  }, [startPiano, stopPiano]);

  // Fay 连接
  useEffect(() => {
    animRef.current = requestAnimationFrame(animateMouth);

    const fay = new FayClient({
      onAudio: (msg) => {
        audioQueueRef.current.push(msg);
        playNext();
        if (msg.action) {
          const code = msg.action.code.toLowerCase();
          if (code.includes('play') || code.includes('piano')) setScene('playing');
          else if (code.includes('think')) setScene('thinking');
        }
      },
      onState: (msg: FayStateMsg) => {
        if (msg.robot?.includes('Thinking')) setScene('thinking');
        else if (msg.robot?.includes('Speaking')) setScene('speaking');
        else if (!playingRef.current) setScene('idle');
        if (msg.log) setStatus(msg.log);
      },
      onQuestion: (text) => setSubtitle(text),
      onStatus: (s) => {
        setConnected(s === 'connected');
        setStatus(
          s === 'connected' ? 'Aria 在线'
            : s === 'error' ? 'Fay 连接失败'
            : '重连中…'
        );
      },
    });
    fayRef.current = fay;
    fay.connect();

    return () => {
      fay.dispose();
      cancelAnimationFrame(animRef.current);
      if (pianoRef.current) { pianoRef.current.dispose(); pianoRef.current = null; }
      if (pianoTimerRef.current) { clearInterval(pianoTimerRef.current); pianoTimerRef.current = null; }
    };
  }, [playNext, animateMouth]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || !fayRef.current?.connected) return;
    setInput('');
    setSubtitle('');
    pianoWantedRef.current = false;
    if (pianoRef.current) stopPiano();
    fayRef.current.sendText(text);
    setScene('thinking');
    setStatus('思考中…');
  }, [input, stopPiano]);

  const bgSrc = SCENE_BG[scene];
  const fgSrc = SCENE_FG[scene];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'min(85vh, 750px)',
      background: '#0a0806',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 场景容器 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* 背景层 — 房间 */}
        <img
          src={bgSrc}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            animation: 'aria-scene-breathe 6s ease-in-out infinite',
          }}
        />

        {/* 真人图层 — 叠加在背景上 */}
        <img
          key={fgSrc}
          src={fgSrc}
          alt="Aria"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            transition: 'opacity 0.6s ease',
          }}
        />

        {/* 唇形叠加层 — 嘴部区域 */}
        <div
          ref={mouthRef}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '30%',
            width: '8%',
            height: '2.5%',
            marginLeft: '-4%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(50,18,12,0.65) 0%, rgba(35,12,8,0.25) 70%, transparent 100%)',
            transform: 'scaleY(0.2) scaleX(0.7)',
            opacity: 0,
            transition: 'opacity 0.08s',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* 暗角遮罩 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center 40%, transparent 50%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* 状态指示 */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 99,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.85)',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: connected ? '#4ade80' : '#f87171',
            display: 'inline-block',
          }} />
          {status}
        </div>

        {/* 姿态标签 */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 4,
          padding: '4px 10px',
          borderRadius: 99,
          background: 'rgba(0,0,0,0.4)',
          fontSize: 11,
          color: 'rgba(255,255,255,0.6)',
        }}>
          {scene === 'idle' ? '🎵 待命' : scene === 'speaking' ? '💬 说话中' : scene === 'playing' ? '🎹 弹琴中' : '🤔 思考中'}
        </div>

        {/* 钢琴演奏指示器 */}
        {scene === 'playing' && pianoTrack && (
          <div style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '14px 24px',
            borderRadius: 16,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(201,166,107,0.3)',
          }}>
            <div style={{
              fontSize: 28,
              animation: 'aria-piano-bounce 1.2s ease-in-out infinite',
            }}>🎹</div>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#c9a66b',
              letterSpacing: '0.04em',
            }}>
              {pianoTrack}
            </div>
            <div style={{
              width: 120,
              height: 3,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.15)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${pianoProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #c9a66b, #e8d5a8)',
                borderRadius: 2,
                transition: 'width 0.2s linear',
              }} />
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
              发送消息可以打断
            </div>
          </div>
        )}

        {/* 字幕 */}
        {subtitle && (
          <div style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '80%',
            padding: '10px 18px',
            borderRadius: 12,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            fontSize: 15,
            lineHeight: 1.5,
            textAlign: 'center',
            zIndex: 4,
          }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* 底部输入 */}
      <div style={{
        padding: '12px 16px 16px',
        background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.9) 30%)',
        display: 'flex',
        gap: 8,
        position: 'relative',
        zIndex: 4,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) send(); }}
          placeholder={connected ? '跟 Aria 说话…' : '等待连接…'}
          disabled={!connected}
          style={{
            flex: 1,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            padding: '12px 14px',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={send}
          disabled={!connected || !input.trim()}
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            border: 'none',
            background: connected && input.trim() ? '#c9a66b' : 'rgba(255,255,255,0.1)',
            color: connected && input.trim() ? '#1a120c' : 'rgba(255,255,255,0.4)',
            fontWeight: 700,
            fontSize: 14,
            cursor: connected && input.trim() ? 'pointer' : 'default',
          }}
        >
          发送
        </button>
      </div>

      <style>{`
        @keyframes aria-scene-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.003); }
        }
        @keyframes aria-piano-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-2deg); }
          75% { transform: translateY(-3px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
